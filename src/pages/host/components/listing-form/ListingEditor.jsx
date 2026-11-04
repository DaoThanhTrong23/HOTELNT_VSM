import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, generatePath, useLocation, useNavigate } from 'react-router-dom';
import { ErrorState } from '../../../../components/common/ErrorState';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { HOTEL_STATUS } from '../../../../constants/enums';
import { ROUTES } from '../../../../constants/routes';
import { formatDate } from '../../../../utils/formatters';
import {
  ApiError,
  createHostListing,
  getFilterOptions,
  getHostListingDetail,
  isCanceled,
  submitListingForReview,
  toPositiveInt,
  updateHostListing,
  withdrawListing,
} from '../../api/hostApi';
import { ConfirmDialog } from '../ConfirmDialog';
import { resolveAllowedActions } from '../listingActions';
import { Toast } from '../Toast';
import { useToast } from '../useToast';
import { BasicInfoStep } from './BasicInfoStep';
import { FormBanner } from './FormBanner';
import { ListingAccessState } from './ListingAccessState';
import { ListingStepper } from './ListingStepper';
import { MapStep } from './MapStep';
import { MediaStep } from './MediaStep';
import { PriceAmenitiesStep } from './PriceAmenitiesStep';
import { SubmitChecklist } from './SubmitChecklist';
import {
  CHECKLIST_ITEMS,
  STEPS,
  checklistKeysFromDetails,
  computeChecklist,
  emptyValues,
  fieldId,
  fieldPathFromServer,
  isDirty,
  resolveOptions,
  stepOfField,
  submitHint,
  toFormValues,
  toPayload,
  validateAll,
  validateStep,
} from './listingFormModel';

const ACCESS_ERROR_CODES = ['NOT_OWNER', 'LISTING_NOT_FOUND', 'NOT_FOUND'];
const SYSTEM_ERROR_CODES = ['NETWORK_ERROR', 'INTERNAL_ERROR', 'TIMEOUT'];
const SAVE_SYSTEM_ERROR = 'Không thể lưu thông tin cơ sở lưu trú. Vui lòng kiểm tra kết nối và thử lại.';
const SUBMITTED_TOAST = {
  type: 'success',
  title: 'Đã gửi kiểm duyệt',
  message: 'Cơ sở chuyển sang Chờ duyệt. Kết quả sẽ được gửi qua email.',
};
const APPROVED_SAVE_DIALOG = {
  variant: 'warning',
  title: 'Lưu thay đổi cho cơ sở đã duyệt?',
  description:
    'Nếu bạn lưu, cơ sở này sẽ chuyển về trạng thái Chờ duyệt và cần Quản trị viên duyệt lại trước khi hiển thị thông tin mới.',
  cancelLabel: 'Quay lại',
  confirmLabel: 'Vẫn lưu',
};
// Excel: uploading or deleting media of an approved listing also moves it back to PENDING.
const APPROVED_MEDIA_DIALOG = {
  variant: 'warning',
  title: 'Thay đổi ảnh/video của cơ sở đã duyệt?',
  description:
    'Nếu bạn tiếp tục, cơ sở này sẽ chuyển về trạng thái Chờ duyệt và cần Quản trị viên duyệt lại trước khi hiển thị thông tin mới.',
  cancelLabel: 'Quay lại',
  confirmLabel: 'Vẫn tiếp tục',
};
const WITHDRAW_DIALOG = {
  variant: 'warning',
  title: 'Rút lại yêu cầu kiểm duyệt?',
  description: 'Cơ sở sẽ chuyển về Bản nháp để bạn tiếp tục chỉnh sửa. Sau khi sửa xong, bạn cần gửi kiểm duyệt lại.',
  confirmLabel: 'Rút lại',
};

const PRIMARY_BUTTON =
  'min-h-[44px] px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer disabled:bg-[#CBD5E1] disabled:text-[#475569] disabled:cursor-not-allowed';
const SECONDARY_BUTTON =
  'min-h-[44px] px-5 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

const editPathOf = (id) => generatePath(ROUTES.HOST.EDIT_HOTEL, { id: String(id) });
const sortMedia = (media) => [...(Array.isArray(media) ? media : [])].sort((a, b) => (a.thuTu ?? 0) - (b.thuTu ?? 0));
const countMedia = (media, type) => media.filter((item) => item.type === type).length;
const clampStep = (value) => (Number.isInteger(value) && value >= 1 && value <= STEPS.length ? value : 1);

const setValueAt = (values, path, value) => {
  if (path.startsWith('lienHe.')) {
    return { ...values, lienHe: { ...values.lienHe, [path.slice('lienHe.'.length)]: value } };
  }
  return { ...values, [path]: value };
};

const sublineFor = (detail) => {
  if (!detail) return '';
  if (detail.trangThai === HOTEL_STATUS.PENDING) {
    return `Gửi kiểm duyệt ngày ${formatDate(detail.ngayGuiDuyet ?? detail.ngayCapNhat)}`;
  }
  if (detail.trangThai === HOTEL_STATUS.REJECTED) return `Từ chối ngày ${formatDate(detail.ngayCapNhat)}`;
  return `Cập nhật lần cuối: ${formatDate(detail.ngayCapNhat)}`;
};

// Shared 4-step form for "Thêm mới" (mode="create") and "Cập nhật" (mode="edit").
export const ListingEditor = ({ mode, maCSLT = null, initialStep = 1, onCreated, onStepChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreate = mode === 'create';

  const [listingId, setListingId] = useState(maCSLT);
  const [createdHere, setCreatedHere] = useState(false);
  const [optionsState, setOptionsState] = useState({ status: 'loading', data: null, error: null });
  const [optionsReloadKey, setOptionsReloadKey] = useState(0);
  const [detailState, setDetailState] = useState({ status: maCSLT ? 'loading' : 'idle', error: null });
  const [detailReloadKey, setDetailReloadKey] = useState(0);
  const [detail, setDetail] = useState(null);
  const [accessError, setAccessError] = useState(null);
  const [values, setValues] = useState(emptyValues);
  const [baseline, setBaseline] = useState(emptyValues);
  const [media, setMedia] = useState([]);
  const [mediaCounts, setMediaCounts] = useState({ soAnh: 0, soVideo: 0 });
  const [step, setStep] = useState(() => (maCSLT ? clampStep(initialStep) : 1));
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [checklistIssues, setChecklistIssues] = useState([]);
  const [busyAction, setBusyAction] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [dialog, setDialog] = useState(null);
  const busyRef = useRef(false);
  const dialogResolverRef = useRef(null);
  const mediaWarningAcceptedRef = useRef(false);
  const leavingRef = useRef(false);
  const { toast, showToast, dismissToast } = useToast(location.state?.toast ?? null);

  // A toast handed over by navigation is shown once; clear it so a reload does not show it again.
  useEffect(() => {
    if (location.state?.toast) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    getFilterOptions({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setOptionsState({ status: 'ready', data: resolveOptions(data), error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || isCanceled(error)) return;
        setOptionsState({ status: 'error', data: null, error });
      });
    return () => controller.abort();
  }, [optionsReloadKey]);

  useEffect(() => {
    if (!listingId) return undefined;
    const controller = new AbortController();
    getHostListingDetail(listingId, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        const formValues = toFormValues(data);
        const sortedMedia = sortMedia(data?.media);
        setDetail(data);
        setValues(formValues);
        setBaseline(formValues);
        setMedia(sortedMedia);
        setMediaCounts({
          soAnh: data?.soAnh ?? countMedia(sortedMedia, 'IMAGE'),
          soVideo: data?.soVideo ?? countMedia(sortedMedia, 'VIDEO'),
        });
        setDetailState({ status: 'ready', error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || isCanceled(error)) return;
        if (ACCESS_ERROR_CODES.includes(error.code)) setAccessError(error);
        else setDetailState({ status: 'error', error });
      });
    return () => controller.abort();
  }, [listingId, detailReloadKey]);

  // "Thêm mới" only continues drafts; anything else belongs to the edit screen.
  useEffect(() => {
    if (isCreate && detail && detail.trangThai !== HOTEL_STATUS.DRAFT && !leavingRef.current) {
      navigate(editPathOf(detail.maCSLT ?? listingId), { replace: true });
    }
  }, [isCreate, detail, listingId, navigate]);

  const options = useMemo(() => optionsState.data ?? resolveOptions(), [optionsState.data]);
  const status = detail?.trangThai ?? (listingId ? HOTEL_STATUS.DRAFT : null);
  const allowed = detail ? resolveAllowedActions(detail) : ['EDIT', 'SUBMIT'];
  const readOnly = isRemoved || status === HOTEL_STATUS.PENDING || !allowed.includes('EDIT');
  const dirty = isDirty(values, baseline);

  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const localChecklist = computeChecklist(values, mediaCounts, options);
  // Untouched form: trust the server checklist; media changes apply immediately, so that key stays local.
  const checklist =
    !dirty && detail?.checklistGuiDuyet
      ? { ...localChecklist, ...detail.checklistGuiDuyet, anhToiThieu3: localChecklist.anhToiThieu3 }
      : localChecklist;
  const missingKeys = checklistKeysFromDetails(checklistIssues);
  const completed = CHECKLIST_ITEMS.filter((item) => checklist[item.key] && !missingKeys.includes(item.key)).length;
  const checklistComplete = completed === CHECKLIST_ITEMS.length;

  const savedChecklist = computeChecklist(baseline, mediaCounts, options);
  const stepDone = {
    1: Boolean(listingId) && Object.keys(validateStep(1, baseline, options)).length === 0,
    2: savedChecklist.gia && savedChecklist.tienIchToiThieu1,
    3: savedChecklist.anhToiThieu3,
    4: savedChecklist.toaDo,
  };
  const stepStates = STEPS.map((item) => {
    if (item.id === step) return { ...item, state: 'active' };
    if (!listingId && item.id > 1) return { ...item, state: 'locked' };
    return { ...item, state: stepDone[item.id] ? 'done' : 'todo' };
  });

  const goToStep = (target) => {
    if (!listingId && target > 1) return;
    setStep(target);
    onStepChange?.(target);
  };

  const reloadDetail = () => {
    setDetailState((prev) => ({ ...prev, status: 'loading' }));
    setDetailReloadKey((key) => key + 1);
  };

  const retryLoading = () => {
    setOptionsState({ status: 'loading', data: null, error: null });
    setOptionsReloadKey((key) => key + 1);
    if (listingId) reloadDetail();
  };

  const askConfirm = (config) =>
    new Promise((resolve) => {
      dialogResolverRef.current = resolve;
      setDialog(config);
    });

  const settleDialog = (result) => {
    const resolve = dialogResolverRef.current;
    dialogResolverRef.current = null;
    setDialog(null);
    resolve?.(result);
  };

  const runExclusive = async (action, task) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusyAction(action);
    try {
      await task();
    } finally {
      busyRef.current = false;
      setBusyAction(null);
    }
  };

  const setField = (path, value) => {
    setValues((prev) => setValueAt(prev, path, value));
    const cleared = path === 'latitude' || path === 'longitude' ? [path, 'toaDo'] : [path];
    setFieldErrors((prev) => {
      if (!cleared.some((key) => prev[key])) return prev;
      const next = { ...prev };
      cleared.forEach((key) => delete next[key]);
      return next;
    });
    setChecklistIssues([]);
  };

  const focusField = (path) => {
    const element = document.getElementById(fieldId(path));
    element?.focus();
    element?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  };

  const showFieldErrors = (errors) => {
    const paths = Object.keys(errors);
    const firstStep = Math.min(...paths.map((path) => stepOfField(path) ?? step));
    const firstPath = paths.find((path) => (stepOfField(path) ?? step) === firstStep) ?? paths[0];
    setFieldErrors(errors);
    if (firstStep !== step) goToStep(firstStep);
    setBanner({
      variant: 'danger',
      title: `Chưa lưu được — có ${paths.length} trường cần sửa`,
      actionLabel: 'Đến trường cần sửa',
      onAction: () => focusField(firstPath),
    });
  };

  const handleActionError = (error) => {
    const details = Array.isArray(error.details) ? error.details : [];
    if (ACCESS_ERROR_CODES.includes(error.code)) {
      setAccessError(error);
    } else if (error.code === 'VALIDATION_ERROR' && details.length > 0) {
      const errors = {};
      details.forEach((detailItem) => {
        const { path } = fieldPathFromServer(detailItem?.field);
        if (path && !errors[path]) errors[path] = detailItem.message;
      });
      showFieldErrors(errors);
    } else if (error.code === 'LOCATION_OUT_OF_RANGE') {
      showFieldErrors({ toaDo: error.message });
    } else if (error.code === 'LISTING_LOCKED_PENDING' || error.code === 'INVALID_STATE_TRANSITION') {
      setBanner({ variant: 'danger', message: error.message });
      reloadDetail();
    } else if (error.code === 'LISTING_REMOVED') {
      setBanner({ variant: 'danger', message: error.message });
      setIsRemoved(true);
    } else if (SYSTEM_ERROR_CODES.includes(error.code)) {
      setBanner({ variant: 'danger', message: SAVE_SYSTEM_ERROR });
    } else {
      setBanner({ variant: 'danger', message: error.message });
    }
  };

  // Returns true when the values are stored on the server.
  const save = async ({ advance = false, reload = true, quiet = false } = {}) => {
    const errors = validateAll(values, options);
    if (Object.keys(errors).length > 0) {
      showFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    setBanner(null);

    if (!listingId) {
      try {
        const created = await createHostListing(toPayload(values, 'create'));
        const newId = toPositiveInt(created?.maCSLT);
        if (!newId) throw new ApiError({ code: 'INTERNAL_ERROR' });
        setBaseline(values);
        setCreatedHere(true);
        setDetailState({ status: 'loading', error: null });
        setListingId(newId);
        setStep(2);
        onCreated?.(newId);
        return true;
      } catch (error) {
        handleActionError(error);
        return false;
      }
    }

    try {
      const response = await updateHostListing(listingId, toPayload(values, 'update'));
      setBaseline(values);
      if (!quiet) {
        let message = response?.message || 'Đã lưu thay đổi';
        if (status === HOTEL_STATUS.APPROVED && !response?.thayDoiTrangThai) message = 'Không có thay đổi';
        showToast({ type: 'success', message });
      }
      if (advance) goToStep(Math.min(step + 1, STEPS.length));
      if (reload) reloadDetail();
      return true;
    } catch (error) {
      handleActionError(error);
      return false;
    }
  };

  const handleSave = async (saveOptions) => {
    if (status === HOTEL_STATUS.APPROVED) {
      if (!dirty) return;
      const confirmed = await askConfirm(APPROVED_SAVE_DIALOG);
      if (!confirmed) return;
    }
    await runExclusive('save', () => save(saveOptions));
  };

  const handleSubmit = () =>
    runExclusive('submit', async () => {
      if (!listingId || !checklistComplete) return;
      if (dirty) {
        const saved = await save({ reload: false, quiet: true });
        if (!saved) return;
      }
      try {
        await submitListingForReview(listingId);
        setChecklistIssues([]);
        setBanner(null);
        if (isCreate) {
          leavingRef.current = true;
          navigate(editPathOf(listingId), { replace: true, state: { toast: SUBMITTED_TOAST } });
        } else {
          showToast(SUBMITTED_TOAST);
          reloadDetail();
        }
      } catch (error) {
        if (error.code === 'CHECKLIST_INCOMPLETE') {
          setChecklistIssues(Array.isArray(error.details) ? error.details : []);
          setBanner({ variant: 'danger', message: error.message });
        } else {
          handleActionError(error);
        }
      }
    });

  const handleWithdraw = async () => {
    const confirmed = await askConfirm(WITHDRAW_DIALOG);
    if (!confirmed) return;
    await runExclusive('withdraw', async () => {
      try {
        await withdrawListing(listingId);
        setBanner(null);
        showToast({ type: 'success', message: 'Đã rút lại yêu cầu kiểm duyệt. Cơ sở đã về Bản nháp.' });
      } catch (error) {
        if (ACCESS_ERROR_CODES.includes(error.code)) {
          setAccessError(error);
          return;
        }
        setBanner({ variant: 'danger', message: error.message });
      }
      reloadDetail();
    });
  };

  const handleCancel = () => {
    if (dirty) {
      setValues(baseline);
      setFieldErrors({});
      setBanner(null);
      return;
    }
    navigate(ROUTES.HOST.DASHBOARD);
  };

  const beforeMediaChange = async () => {
    if (status !== HOTEL_STATUS.APPROVED || mediaWarningAcceptedRef.current) return true;
    const confirmed = await askConfirm(APPROVED_MEDIA_DIALOG);
    if (confirmed) mediaWarningAcceptedRef.current = true;
    return confirmed;
  };

  const mediaHandlers = {
    onUploaded: (uploaded) => {
      setMedia((prev) => [...prev, uploaded]);
      setMediaCounts((prev) => ({
        soAnh: uploaded?.soAnh ?? prev.soAnh + (uploaded?.type === 'IMAGE' ? 1 : 0),
        soVideo: uploaded?.soVideo ?? prev.soVideo + (uploaded?.type === 'VIDEO' ? 1 : 0),
      }));
      setChecklistIssues([]);
    },
    onDeleted: (mediaId, response) => {
      setMedia((prev) => prev.filter((item) => item.mediaId !== mediaId));
      setChecklistIssues([]);
      if (!response) {
        reloadDetail();
        return;
      }
      setMediaCounts((prev) => ({ soAnh: response.soAnh ?? prev.soAnh, soVideo: response.soVideo ?? prev.soVideo }));
      if (response.thayDoiTrangThai) reloadDetail();
    },
    onReorder: setMedia,
    onBlockingError: handleActionError,
    // The server moved an approved listing to PENDING; reload once the queue is done.
    onQueueIdle: () => {
      if (status === HOTEL_STATUS.APPROVED) reloadDetail();
    },
    onBeforeMediaChange: beforeMediaChange,
    onNotify: showToast,
  };

  if (accessError) {
    return <ListingAccessState variant={accessError.code === 'NOT_OWNER' ? 'forbidden' : 'not-found'} />;
  }

  const waitingForDetail = Boolean(listingId) && !detail && !createdHere;

  if (optionsState.status === 'loading' || (waitingForDetail && detailState.status === 'loading')) {
    return <LoadingSpinner text="Đang tải thông tin cơ sở..." />;
  }

  const loadError = optionsState.status === 'error' ? optionsState.error : waitingForDetail ? detailState.error : null;
  if (loadError) {
    return (
      <ErrorState
        title="Không tải được dữ liệu"
        message={loadError.message}
        onAction={loadError.code === 'ACCOUNT_LOCKED' ? undefined : retryLoading}
      />
    );
  }

  const title = listingId ? detail?.tenCSLT || baseline.tenCSLT || 'Cơ sở lưu trú' : 'Thêm cơ sở lưu trú';
  const subline = isCreate
    ? listingId
      ? 'Mã cơ sở đã được tạo — bạn có thể nhập tiếp các bước còn lại'
      : ''
    : sublineFor(detail);
  const canSubmit = allowed.includes('SUBMIT');
  const isSaving = busyAction === 'save';
  const isSubmitting = busyAction === 'submit';
  const reloadFailed = detailState.status === 'error' && detail ? detailState.error : null;

  // Bottom bar per status (Figma 12.x / 13.x). Plain data; the click handlers are looked up by key.
  const getActionBar = () => {
    const busy = Boolean(busyAction);
    if (isRemoved) return null;
    if (status === HOTEL_STATUS.PENDING) {
      if (!allowed.includes('WITHDRAW')) return null;
      return {
        hint: 'Rút lại yêu cầu để tiếp tục chỉnh sửa cơ sở',
        buttons: [
          { key: 'withdraw', label: busyAction === 'withdraw' ? 'Đang rút lại...' : 'Rút lại yêu cầu', primary: true, disabled: busy },
        ],
      };
    }
    if (readOnly) return null;
    if (status === HOTEL_STATUS.APPROVED) {
      return {
        hint: 'Lưu thay đổi sẽ đưa cơ sở về trạng thái Chờ duyệt',
        buttons: [
          { key: 'cancel', label: 'Hủy', disabled: busy },
          { key: 'save', label: isSaving ? 'Đang lưu...' : 'Lưu thay đổi', primary: true, disabled: !dirty || busy },
        ],
      };
    }
    if (status === HOTEL_STATUS.REJECTED || status === HOTEL_STATUS.HIDDEN) {
      return {
        hint: checklistComplete
          ? 'Sau khi gửi lại, cơ sở chuyển sang Chờ duyệt'
          : submitHint({ hasListing: true, completed, isSubmitting }),
        buttons: [
          { key: 'cancel', label: 'Hủy', disabled: busy },
          ...(dirty ? [{ key: 'save', label: isSaving ? 'Đang lưu...' : 'Lưu thay đổi', disabled: busy }] : []),
          ...(canSubmit
            ? [{ key: 'submit', label: isSubmitting ? 'Đang gửi…' : 'Gửi kiểm duyệt lại', primary: true, disabled: !checklistComplete || busy }]
            : []),
        ],
      };
    }
    return {
      hint: submitHint({ hasListing: Boolean(listingId), completed, isSubmitting }),
      buttons: [
        { key: 'save', label: isSaving ? 'Đang lưu...' : 'Lưu nháp', disabled: busy },
        ...(canSubmit
          ? [{ key: 'submit', label: isSubmitting ? 'Đang gửi…' : 'Gửi kiểm duyệt', primary: true, disabled: !listingId || !checklistComplete || busy }]
          : []),
      ],
    };
  };

  const actionBar = getActionBar();
  const actionHandlers = {
    withdraw: handleWithdraw,
    cancel: handleCancel,
    save: () => handleSave(),
    submit: handleSubmit,
  };

  // Create flow keeps a per-step button inside the card (Figma 12.1: "Lưu tạo mới").
  const renderStepFooter = () => {
    if (!isCreate || readOnly) return null;
    if (step === 1 && !listingId) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-5">
          <button type="button" onClick={() => handleSave()} disabled={Boolean(busyAction)} className={PRIMARY_BUTTON}>
            {isSaving ? 'Đang lưu...' : 'Lưu tạo mới'}
          </button>
          <p className="text-xs text-[#64748B]">Lưu để nhận mã cơ sở và mở khóa bước 2–4</p>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="pt-5">
          <button type="button" onClick={() => goToStep(4)} className={SECONDARY_BUTTON}>
            Tiếp tục
          </button>
        </div>
      );
    }
    if (step < STEPS.length) {
      return (
        <div className="pt-5">
          <button type="button" onClick={() => handleSave({ advance: true })} disabled={Boolean(busyAction)} className={PRIMARY_BUTTON}>
            {isSaving ? 'Đang lưu...' : 'Lưu & tiếp tục'}
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="text-xs text-[#64748B]">
          <Link to={ROUTES.HOST.DASHBOARD} className="hover:text-black">
            Cơ sở lưu trú
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{isCreate ? 'Thêm mới' : 'Cập nhật'}</span>
        </nav>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">{title}</h1>
          {status && <StatusBadge status={status} />}
        </div>
        {subline && <p className="text-xs sm:text-sm text-[#64748B]">{subline}</p>}
      </div>

      {status === HOTEL_STATUS.PENDING && (
        <FormBanner
          variant="warning"
          title="Cơ sở đang chờ duyệt"
          message="Bạn chưa thể chỉnh sửa cho đến khi Quản trị viên duyệt hoặc từ chối. Kết quả sẽ được gửi qua email."
        />
      )}
      {status === HOTEL_STATUS.REJECTED && (
        <FormBanner
          title="Quản trị viên đã từ chối cơ sở này"
          message={`Lý do: ${detail?.lyDoTuChoi || 'Không có ghi chú.'}`}
        />
      )}
      {status === HOTEL_STATUS.HIDDEN && (
        <FormBanner title="Quản trị viên đã ẩn cơ sở này" message={`Lý do: ${detail?.lyDoViPham || 'Không có ghi chú.'}`} />
      )}
      {banner && <FormBanner role="alert" {...banner} />}
      {reloadFailed && (
        <FormBanner
          role="alert"
          message={reloadFailed.message}
          actionLabel="Tải lại"
          onAction={reloadDetail}
        />
      )}

      <ListingStepper steps={stepStates} onSelect={goToStep} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
        <section
          aria-busy={detailState.status === 'loading' ? 'true' : 'false'}
          className="bg-white rounded-2xl border border-[#CBD5E1] p-5 sm:p-6"
        >
          {step === 1 && (
            <BasicInfoStep values={values} errors={fieldErrors} options={options} detail={detail} readOnly={readOnly} onChange={setField} />
          )}
          {step === 2 && (
            <PriceAmenitiesStep values={values} errors={fieldErrors} options={options} readOnly={readOnly} onChange={setField} />
          )}
          {/* Kept mounted so uploads continue while the host switches steps. */}
          {listingId && (
            <div hidden={step !== 3}>
              <MediaStep maCSLT={listingId} media={media} counts={mediaCounts} readOnly={readOnly} {...mediaHandlers} />
            </div>
          )}
          {step === 4 && (
            <MapStep
              latitude={values.latitude}
              longitude={values.longitude}
              error={fieldErrors.toaDo}
              bounds={options.mapBounds}
              readOnly={readOnly}
              onChange={(patch) => Object.entries(patch).forEach(([path, value]) => setField(path, value))}
            />
          )}
          {renderStepFooter()}
        </section>

        <SubmitChecklist checklist={checklist} missingKeys={missingKeys} serverIssues={checklistIssues} />
      </div>

      {actionBar && (
        <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-8 lg:-mx-10 -mb-5 sm:-mb-8 lg:-mb-10 px-4 sm:px-8 lg:px-10 py-3 bg-white border-t border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#475569]" aria-live="polite">
            {actionBar.hint}
          </p>
          <div className="flex gap-2 justify-end">
            {actionBar.buttons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={actionHandlers[button.key]}
                disabled={button.disabled}
                className={button.primary ? PRIMARY_BUTTON : SECONDARY_BUTTON}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(dialog)}
        {...(dialog ?? {})}
        onConfirm={() => settleDialog(true)}
        onCancel={() => settleDialog(false)}
      />
    </div>
  );
};
