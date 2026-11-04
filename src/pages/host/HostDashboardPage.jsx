import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, generatePath, useSearchParams } from 'react-router-dom';
import { Building2, ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { HOTEL_STATUS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { HOST_LISTINGS_PAGE_SIZE, deleteHostListing, getHostListings, isCanceled, withdrawListing } from './api/hostApi';
import { resolveAllowedActions } from './components/listingActions';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast } from './components/Toast';
import { useToast } from './components/useToast';

const LISTING_STATUSES = Object.values(HOTEL_STATUS);
const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: HOTEL_STATUS.DRAFT, label: 'Bản nháp' },
  { key: HOTEL_STATUS.PENDING, label: 'Chờ duyệt' },
  { key: HOTEL_STATUS.APPROVED, label: 'Đã duyệt' },
  { key: HOTEL_STATUS.REJECTED, label: 'Bị từ chối' },
  { key: HOTEL_STATUS.HIDDEN, label: 'Ẩn' },
];
const KEYWORD_MAX_LENGTH = 100;
const SEARCH_DEBOUNCE_MS = 400;
const PAGE_WINDOW = 5;

const ACTION_CLASS =
  'inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
const DANGER_ACTION_CLASS =
  'inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] rounded-lg border border-[#DC2626]/40 bg-white text-[#DC2626] text-xs font-medium hover:bg-[#FEF2F2] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

const readFilters = (searchParams) => {
  const status = searchParams.get('trangThai');
  const rawPage = searchParams.get('page');
  return {
    trangThai: LISTING_STATUSES.includes(status) ? status : 'ALL',
    keyword: (searchParams.get('keyword') ?? '').trim().slice(0, KEYWORD_MAX_LENGTH),
    page: rawPage && /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1,
  };
};

const toCount = (value) => (Number.isInteger(value) && value >= 0 ? value : null);

// Server-side list + per-status counts. Results are keyed by the query so a late
// response for an older query is never shown.
const useHostListings = ({ trangThai, keyword, page }) => {
  const [reloadKey, setReloadKey] = useState(0);
  const queryKey = JSON.stringify({ trangThai, keyword, page, reloadKey });
  const [result, setResult] = useState({ key: null, items: null, pagination: null, error: null });
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getHostListings({ trangThai, keyword, page, limit: HOST_LISTINGS_PAGE_SIZE }, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({
          key: queryKey,
          items: Array.isArray(data?.items) ? data.items : [],
          pagination: data?.pagination ?? null,
          error: null,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted || isCanceled(error)) return;
        setResult({ key: queryKey, items: null, pagination: null, error });
      });
    return () => controller.abort();
  }, [queryKey, trangThai, keyword, page]);

  // Counts are totals per status, independent of the keyword (no count API yet: one call per status).
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled(
      LISTING_STATUSES.map((status) =>
        getHostListings({ trangThai: status, page: 1, limit: 1 }, { signal: controller.signal }),
      ),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const next = {};
      results.forEach((outcome, index) => {
        next[LISTING_STATUSES[index]] =
          outcome.status === 'fulfilled' ? toCount(outcome.value?.pagination?.totalItems) : null;
      });
      setCounts(next);
    });
    return () => controller.abort();
  }, [reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
  const isLoading = result.key !== queryKey;

  return {
    items: result.items,
    pagination: result.pagination,
    counts,
    error: isLoading ? null : result.error,
    isInitialLoading: isLoading && result.items === null,
    isRefreshing: isLoading && result.items !== null,
    refetch,
  };
};

const buildRowActions = (item) => {
  const allowed = resolveAllowedActions(item);
  const id = String(item.maCSLT);
  const editPath = generatePath(ROUTES.HOST.EDIT_HOTEL, { id });
  const canView = allowed.includes('PREVIEW');
  const canEdit = allowed.includes('EDIT');
  const actions = [];

  switch (item.trangThai) {
    case HOTEL_STATUS.APPROVED:
      if (canView) actions.push({ key: 'preview', label: 'Xem', to: generatePath(ROUTES.HOTEL_DETAIL, { id }) });
      if (canEdit) actions.push({ key: 'edit', label: 'Sửa', to: editPath });
      break;
    case HOTEL_STATUS.PENDING:
      // Pending listings open the edit page in read-only mode (Figma 13.3).
      if (canView || canEdit) actions.push({ key: 'preview', label: 'Xem', to: editPath });
      break;
    case HOTEL_STATUS.REJECTED:
      if (canView || canEdit) actions.push({ key: 'edit', label: 'Xem & sửa', to: editPath });
      break;
    case HOTEL_STATUS.HIDDEN:
      if (canEdit) actions.push({ key: 'edit', label: 'Sửa & gửi lại', to: editPath });
      else if (canView) actions.push({ key: 'preview', label: 'Xem', to: editPath });
      break;
    default:
      if (canEdit) actions.push({ key: 'edit', label: 'Sửa', to: editPath });
      else if (canView) actions.push({ key: 'preview', label: 'Xem', to: editPath });
  }

  if (allowed.includes('WITHDRAW')) actions.push({ key: 'withdraw', label: 'Rút lại' });
  if (allowed.includes('DELETE')) actions.push({ key: 'delete', label: 'Xóa', danger: true });
  return actions;
};

const RowActions = ({ item, testId, isPending, onWithdraw, onDelete }) => (
  <div data-testid={testId} aria-busy={isPending ? 'true' : undefined} className="flex items-center gap-1.5 flex-wrap">
    {buildRowActions(item).map((action) => {
      if (action.to) {
        return (
          <Link key={action.key} to={action.to} className={ACTION_CLASS}>
            {action.label}
          </Link>
        );
      }
      return (
        <button
          key={action.key}
          type="button"
          disabled={isPending}
          onClick={() => (action.key === 'delete' ? onDelete(item) : onWithdraw(item))}
          className={action.danger ? DANGER_ACTION_CLASS : ACTION_CLASS}
        >
          {action.label}
        </button>
      );
    })}
  </div>
);

const Thumbnail = ({ item, sizeClass }) =>
  item.duongDanAnh ? (
    <img
      src={item.duongDanAnh}
      alt={item.tenCSLT}
      loading="lazy"
      className={`${sizeClass} rounded-lg object-cover shrink-0 bg-[#CBD5E1]`}
    />
  ) : (
    <div data-testid="thumbnail-placeholder" aria-hidden="true" className={`${sizeClass} rounded-lg shrink-0 bg-[#CBD5E1]`} />
  );

const formatPrice = (gia) => (gia !== null && gia !== undefined ? formatCurrency(gia) : null);

const HeaderCheckbox = ({ checked, indeterminate, disabled, onChange }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="Chọn tất cả cơ sở trên trang"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer"
    />
  );
};

const pageNumbers = (current, total) => {
  let start = Math.max(1, current - Math.floor(PAGE_WINDOW / 2));
  const end = Math.min(total, start + PAGE_WINDOW - 1);
  start = Math.max(1, end - PAGE_WINDOW + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const Pagination = ({ itemCount, pagination, page, onChange }) => {
  const limit = pagination?.limit || HOST_LISTINGS_PAGE_SIZE;
  const currentPage = pagination?.currentPage || page;
  const totalItems = pagination?.totalItems ?? itemCount;
  const totalPages = Math.max(1, pagination?.totalPages || Math.ceil(totalItems / limit));
  const from = (currentPage - 1) * limit + 1;
  const to = from + itemCount - 1;
  const navClass =
    'w-8 h-8 flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="mt-3 md:mt-0 py-3 md:px-4 md:border-t border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
      <p>{`Hiển thị ${from}–${to} trên ${totalItems} cơ sở · ${limit} dòng mỗi trang`}</p>
      <nav aria-label="Phân trang" className="flex items-center gap-1.5">
        <button type="button" aria-label="Trang trước" disabled={currentPage <= 1} onClick={() => onChange(currentPage - 1)} className={navClass}>
          <ChevronLeft size={14} />
        </button>
        {pageNumbers(currentPage, totalPages).map((number) => (
          <button
            key={number}
            type="button"
            aria-label={`Trang ${number}`}
            aria-current={number === currentPage ? 'page' : undefined}
            onClick={() => onChange(number)}
            className={
              number === currentPage
                ? 'w-8 h-8 flex items-center justify-center rounded-lg bg-black text-white text-xs font-semibold'
                : navClass
            }
          >
            {number}
          </button>
        ))}
        <button type="button" aria-label="Trang sau" disabled={currentPage >= totalPages} onClick={() => onChange(currentPage + 1)} className={navClass}>
          <ChevronRight size={14} />
        </button>
      </nav>
    </div>
  );
};

const EmptyMessage = ({ title, description, children }) => (
  <div data-testid="host-empty-state" className="bg-white rounded-xl border border-[#CBD5E1] px-6 py-16 text-center space-y-3">
    <div className="w-16 h-16 rounded-full bg-[#F1F5F9] text-[#64748B] mx-auto flex items-center justify-center">
      <Building2 size={24} />
    </div>
    <h2 className="text-base font-semibold text-black">{title}</h2>
    {description && <p className="text-xs sm:text-sm text-[#64748B]">{description}</p>}
    <div className="pt-1">{children}</div>
  </div>
);

const deleteDialogCopy = (items, { bulk }) => {
  if (!bulk) {
    const [item] = items;
    const subject = item.trangThai === HOTEL_STATUS.DRAFT ? 'Bản nháp' : 'Cơ sở';
    return {
      title: `Xóa “${item.tenCSLT}”?`,
      description: `${subject} này cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này.`,
      mobileDescription: `${subject} cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Không thể hoàn tác.`,
      confirmLabel: 'Xóa cơ sở',
    };
  }
  return {
    title: `Xóa ${items.length} cơ sở?`,
    description: 'Các cơ sở đã chọn cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này.',
    mobileDescription: 'Các cơ sở đã chọn cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Không thể hoàn tác.',
    confirmLabel: `Xóa ${items.length} cơ sở`,
  };
};

export const HostDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const { trangThai, keyword, page } = filters;
  const { items, pagination, counts, error, isInitialLoading, isRefreshing, refetch } = useHostListings(filters);
  const { toast, showToast, dismissToast } = useToast();

  // Search box: local text, pushed to the URL after a pause. Follows the URL when it changes elsewhere (Back, clear filters).
  const [keywordInput, setKeywordInput] = useState(keyword);
  const [syncedKeyword, setSyncedKeyword] = useState(keyword);
  if (keyword !== syncedKeyword) {
    setSyncedKeyword(keyword);
    if (keywordInput.trim() !== keyword) setKeywordInput(keyword);
  }

  useEffect(() => {
    const nextKeyword = keywordInput.trim().slice(0, KEYWORD_MAX_LENGTH);
    if (nextKeyword === keyword) return undefined;
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextKeyword) next.set('keyword', nextKeyword);
          else next.delete('keyword');
          next.delete('page');
          return next;
        },
        { replace: true },
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keywordInput, keyword, setSearchParams]);

  // Selection belongs to one page + filter combination.
  const filterKey = `${trangThai}|${keyword}|${page}`;
  const [selection, setSelection] = useState({ key: filterKey, ids: [] });
  const selectedIds = selection.key === filterKey ? selection.ids : [];
  const rows = items ?? [];
  const selectedItems = rows.filter((item) => selectedIds.includes(item.maCSLT));
  const deletableSelected = selectedItems.filter((item) => resolveAllowedActions(item).includes('DELETE'));

  const [dialog, setDialog] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);
  const busyRef = useRef(false);

  const updateParams = (mutate, options) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      mutate(next);
      return next;
    }, options);
  };

  const selectStatus = (status) =>
    updateParams((next) => {
      if (status === 'ALL') next.delete('trangThai');
      else next.set('trangThai', status);
      next.delete('page');
    });

  const goToPage = (target) =>
    updateParams((next) => {
      if (target <= 1) next.delete('page');
      else next.set('page', String(target));
    });

  const clearFilters = () => {
    setKeywordInput('');
    setSearchParams({});
  };

  const clearKeyword = () => {
    setKeywordInput('');
    updateParams(
      (next) => {
        next.delete('keyword');
        next.delete('page');
      },
      { replace: true },
    );
  };

  const setSelectedIds = (ids) => setSelection({ key: filterKey, ids });

  const toggleRow = (id) =>
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);

  const toggleAll = () =>
    setSelectedIds(selectedItems.length === rows.length ? [] : rows.map((item) => item.maCSLT));

  // After removing rows: step back when the current page would be empty, then reload list and counts.
  const reloadAfterRemoval = (removedCount) => {
    if (page > 1 && removedCount > 0 && removedCount >= rows.length) goToPage(page - 1);
    refetch();
  };

  const deleteOne = async (item) => {
    try {
      const response = await deleteHostListing(item.maCSLT);
      showToast({ type: 'success', message: response?.message || 'Xóa cơ sở thành công' });
      reloadAfterRemoval(1);
    } catch (err) {
      showToast({ type: 'error', message: err.message });
      refetch();
    }
  };

  // Sequential on purpose: no bulk API, avoids RATE_LIMITED and keeps a clear result per listing.
  const deleteMany = async (targets) => {
    const failed = [];
    for (const item of targets) {
      try {
        await deleteHostListing(item.maCSLT);
      } catch {
        failed.push(item);
      }
    }
    const succeeded = targets.length - failed.length;
    setSelectedIds([]);
    if (failed.length === 0) {
      showToast({ type: 'success', message: `Đã xóa ${succeeded} cơ sở` });
    } else {
      showToast({
        type: 'error',
        message: `Đã xóa ${succeeded}/${targets.length} cơ sở. ${failed.length} cơ sở không xóa được: ${failed
          .map((item) => item.tenCSLT)
          .join(', ')}`,
      });
    }
    reloadAfterRemoval(succeeded);
  };

  const withdraw = async (item) => {
    try {
      await withdrawListing(item.maCSLT);
      showToast({ type: 'success', message: `Đã rút lại yêu cầu kiểm duyệt. “${item.tenCSLT}” đã về Bản nháp.` });
    } catch (err) {
      showToast({ type: 'error', message: err.message });
    }
    refetch();
  };

  const confirmDialog = async () => {
    if (!dialog || busyRef.current) return;
    busyRef.current = true;
    setIsBusy(true);
    setPendingIds(dialog.items.map((item) => item.maCSLT));
    try {
      if (dialog.type === 'withdraw') await withdraw(dialog.items[0]);
      else if (dialog.type === 'bulk-delete') await deleteMany(dialog.items);
      else await deleteOne(dialog.items[0]);
    } finally {
      busyRef.current = false;
      setIsBusy(false);
      setPendingIds([]);
      setDialog(null);
    }
  };

  const closeDialog = () => {
    if (!busyRef.current) setDialog(null);
  };

  const dialogProps = (() => {
    if (!dialog) return null;
    if (dialog.type === 'withdraw') {
      return {
        variant: 'warning',
        title: 'Rút lại yêu cầu kiểm duyệt?',
        description: `“${dialog.items[0].tenCSLT}” sẽ chuyển về Bản nháp để bạn tiếp tục chỉnh sửa. Sau khi sửa xong, bạn cần gửi kiểm duyệt lại.`,
        confirmLabel: 'Rút lại',
      };
    }
    return { variant: 'danger', ...deleteDialogCopy(dialog.items, { bulk: dialog.type === 'bulk-delete' }) };
  })();

  const hasFilters = trangThai !== 'ALL' || keyword !== '';
  const isEmpty = !isInitialLoading && !error && items !== null && rows.length === 0;
  const hasNoListings = isEmpty && !hasFilters && page === 1;
  const countTotal =
    counts && LISTING_STATUSES.every((status) => counts[status] !== null)
      ? LISTING_STATUSES.reduce((sum, status) => sum + counts[status], 0)
      : null;
  const countFor = (key) => {
    if (!counts) return '';
    const value = key === 'ALL' ? countTotal : counts[key];
    return value === null || value === undefined ? '—' : value;
  };
  const allSelected = rows.length > 0 && selectedItems.length === rows.length;

  const renderList = () => {
    if (isInitialLoading) {
      return (
        <div className="bg-white rounded-xl border border-[#CBD5E1]">
          <LoadingSpinner text="Đang tải danh sách cơ sở..." />
        </div>
      );
    }

    if (error) {
      return (
        <ErrorState
          title="Không tải được danh sách cơ sở"
          message={error.message}
          onAction={error.code === 'ACCOUNT_LOCKED' ? undefined : refetch}
        />
      );
    }

    if (isEmpty) {
      if (page > 1) {
        return (
          <EmptyMessage title="Trang này không còn dữ liệu">
            <button type="button" onClick={() => goToPage(1)} className={ACTION_CLASS}>
              Về trang đầu
            </button>
          </EmptyMessage>
        );
      }
      if (hasFilters) {
        return (
          <EmptyMessage
            title="Không tìm thấy cơ sở phù hợp"
            description="Hãy thử từ khóa khác hoặc chọn trạng thái khác."
          >
            <button type="button" onClick={clearFilters} className={ACTION_CLASS}>
              Xóa bộ lọc
            </button>
          </EmptyMessage>
        );
      }
      return (
        <EmptyMessage
          title="Bạn chưa có cơ sở lưu trú nào"
          description="Thêm cơ sở đầu tiên để khách du lịch tìm thấy bạn trên bản đồ."
        >
          <Link
            to={ROUTES.HOST.ADD_HOTEL}
            data-testid="empty-state-cta-button"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            <Plus size={14} />
            <span>Thêm cơ sở</span>
          </Link>
        </EmptyMessage>
      );
    }

    return (
      <div
        aria-busy={isRefreshing ? 'true' : 'false'}
        className={`flex flex-col md:bg-white md:rounded-xl md:border md:border-[#CBD5E1] md:overflow-hidden transition-opacity ${
          isRefreshing ? 'opacity-60' : ''
        }`}
      >
        {selectedItems.length > 0 && (
          <div className="sticky bottom-0 z-30 order-last mt-3 rounded-xl md:order-first md:static md:mt-0 md:rounded-none flex items-center justify-between gap-3 bg-black text-white px-4 py-3">
            <p className="text-xs sm:text-sm">
              {`Đã chọn ${selectedItems.length} cơ sở`}
              <span className="hidden md:inline"> · chỉ xóa được Bản nháp và Bị từ chối</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 min-h-[36px] rounded-lg border border-white/60 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                Bỏ chọn
              </button>
              <button
                type="button"
                disabled={deletableSelected.length === 0 || isBusy}
                aria-label={deletableSelected.length > 0 ? `Xóa ${deletableSelected.length} cơ sở` : 'Xóa'}
                onClick={() => setDialog({ type: 'bulk-delete', items: deletableSelected })}
                className="px-3 py-1.5 min-h-[36px] rounded-lg bg-[#DC2626] text-white text-xs font-medium hover:bg-[#B91C1C] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="md:hidden">Xóa</span>
                <span className="hidden md:inline">
                  {deletableSelected.length > 0 ? `Xóa ${deletableSelected.length} cơ sở` : 'Xóa'}
                </span>
              </button>
            </div>
          </div>
        )}

        <div data-testid="desktop-data-table" className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#64748B] border-b border-[#CBD5E1] bg-[#F8FAFC]">
              <tr>
                <th scope="col" className="py-3 px-4 w-28 font-medium">
                  <div className="flex items-center gap-3">
                    <HeaderCheckbox
                      checked={allSelected}
                      indeterminate={selectedItems.length > 0 && !allSelected}
                      disabled={rows.length === 0}
                      onChange={toggleAll}
                    />
                    <span>Ảnh</span>
                  </div>
                </th>
                <th scope="col" className="py-3 px-4 font-medium">Tên cơ sở</th>
                <th scope="col" className="py-3 px-4 font-medium">Phường/Xã</th>
                <th scope="col" className="py-3 px-4 font-medium">Giá tham khảo</th>
                <th scope="col" className="py-3 px-4 font-medium">Ngày tạo</th>
                <th scope="col" className="py-3 px-4 font-medium">Cập nhật</th>
                <th scope="col" className="py-3 px-4 font-medium">Trạng thái</th>
                <th scope="col" className="py-3 px-4 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]/60">
              {rows.map((item) => {
                const isSelected = selectedIds.includes(item.maCSLT);
                const price = formatPrice(item.gia);
                return (
                  <tr
                    key={item.maCSLT}
                    data-testid="desktop-table-row"
                    className={`transition-colors ${isSelected ? 'bg-[#F1F5F9]' : 'hover:bg-[#F8F4E8]/50'}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          aria-label={`Chọn ${item.tenCSLT}`}
                          checked={isSelected}
                          onChange={() => toggleRow(item.maCSLT)}
                          className="w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer"
                        />
                        <Thumbnail item={item} sizeClass="w-12 h-12" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-black text-sm">{item.tenCSLT}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{item.tenLoai}</p>
                    </td>
                    <td className="py-3 px-4 text-black text-sm whitespace-nowrap">{item.tenPhuong ?? '—'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {price ? (
                        <span className="text-black text-xs font-medium">{price}</span>
                      ) : (
                        <span className="text-[#64748B] text-xs">Chưa nhập giá</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">{formatDate(item.ngayTao)}</td>
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">{formatDate(item.ngayCapNhat)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.trangThai} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RowActions
                        item={item}
                        testId={`actions-${item.maCSLT}`}
                        isPending={pendingIds.includes(item.maCSLT)}
                        onDelete={(target) => setDialog({ type: 'delete', items: [target] })}
                        onWithdraw={(target) => setDialog({ type: 'withdraw', items: [target] })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul data-testid="mobile-hotel-list" className="md:hidden space-y-3">
          {rows.map((item) => {
            const isSelected = selectedIds.includes(item.maCSLT);
            const price = formatPrice(item.gia);
            return (
              <li
                key={item.maCSLT}
                data-testid="mobile-hotel-card"
                className={`bg-white rounded-xl border p-4 space-y-3 ${isSelected ? 'border-black' : 'border-[#CBD5E1]'}`}
              >
                <div className="flex gap-3 items-start">
                  <input
                    type="checkbox"
                    aria-label={`Chọn ${item.tenCSLT}`}
                    checked={isSelected}
                    onChange={() => toggleRow(item.maCSLT)}
                    className="mt-1 w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer"
                  />
                  <Thumbnail item={item} sizeClass="w-16 h-16" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black line-clamp-1">{item.tenCSLT}</p>
                    <p className="text-xs text-[#64748B]">
                      {item.tenPhuong ? `${item.tenLoai} · ${item.tenPhuong}` : item.tenLoai}
                    </p>
                    <p className={`text-xs mt-0.5 ${price ? 'text-black font-medium' : 'text-[#64748B]'}`}>
                      {price ?? 'Chưa nhập giá'}
                    </p>
                  </div>
                  <StatusBadge status={item.trangThai} />
                </div>
                <div className="pt-2 border-t border-[#CBD5E1]/60 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-[#64748B]">Cập nhật {formatDate(item.ngayCapNhat)}</span>
                  <RowActions
                    item={item}
                    testId={`mobile-actions-${item.maCSLT}`}
                    isPending={pendingIds.includes(item.maCSLT)}
                    onDelete={(target) => setDialog({ type: 'delete', items: [target] })}
                    onWithdraw={(target) => setDialog({ type: 'withdraw', items: [target] })}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <Pagination itemCount={rows.length} pagination={pagination} page={page} onChange={goToPage} />
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">Cơ sở lưu trú của tôi</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">Quản lý, cập nhật và gửi kiểm duyệt các cơ sở của bạn</p>
        </div>
        <Link
          to={ROUTES.HOST.ADD_HOTEL}
          data-testid="add-hotel-button"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-black text-white text-xs sm:text-sm font-medium hover:bg-neutral-800 transition-colors shrink-0"
        >
          <Plus size={16} />
          <span>Thêm cơ sở</span>
        </Link>
      </div>

      {!hasNoListings && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex overflow-x-auto gap-1 p-1 bg-white border border-[#CBD5E1] rounded-xl w-full md:w-auto">
            {STATUS_TABS.map((tab) => {
              const isSelected = trangThai === tab.key;
              const count = countFor(tab.key);
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={isSelected ? 'true' : 'false'}
                  data-testid={`filter-chip-${tab.key}`}
                  onClick={() => selectStatus(tab.key)}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-black text-white' : 'text-black hover:bg-[#F8F4E8]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count !== '' && (
                    <span
                      className={`text-[11px] min-w-5 px-1.5 rounded-full font-medium ${
                        isSelected ? 'bg-white text-black' : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" aria-hidden="true" />
            <input
              type="search"
              value={keywordInput}
              maxLength={KEYWORD_MAX_LENGTH}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="Tìm theo tên cơ sở"
              aria-label="Tìm theo tên cơ sở"
              className="w-full pl-10 pr-9 py-2.5 min-h-[44px] bg-white border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
            />
            {keywordInput && (
              <button
                type="button"
                onClick={clearKeyword}
                aria-label="Xóa từ khóa"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#64748B] hover:text-black cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {renderList()}

      <ConfirmDialog
        open={Boolean(dialogProps)}
        {...(dialogProps ?? {})}
        busy={isBusy}
        onConfirm={confirmDialog}
        onCancel={closeDialog}
      />
    </div>
  );
};
