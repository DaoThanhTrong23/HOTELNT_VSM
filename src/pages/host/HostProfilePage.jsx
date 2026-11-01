import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { changeHostPassword, getFieldErrors, getHostProfile, isCanceled, updateHostProfile } from './api/hostApi';
import { Toast } from './components/Toast';
import { useToast } from './components/useToast';

const PHONE_PATTERN = /^0\d{9}$/;
const NAME_MAX_LENGTH = 100;
const SYSTEM_ERROR_CODES = ['INTERNAL_ERROR', 'NETWORK_ERROR', 'TIMEOUT'];
const PROFILE_SYSTEM_ERROR = 'Cập nhật thông tin không thành công do sự cố hệ thống. Vui lòng thử lại sau.';

const PASSWORD_CRITERIA = [
  { label: 'ít nhất 8 ký tự', test: (pwd) => pwd.length >= 8 },
  { label: 'chữ in hoa', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'chữ thường', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'chữ số', test: (pwd) => /[0-9]/.test(pwd) },
  { label: 'ký tự đặc biệt', test: (pwd) => /[^A-Za-z0-9\s]/.test(pwd) },
];

const ROLE_LABELS = { HOST: 'Host', ADMIN: 'Quản trị viên' };

const EMPTY_PASSWORDS = { oldPassword: '', newPassword: '', confirmPassword: '' };

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 bg-white border rounded-lg text-base sm:text-sm text-black min-h-[44px] focus:outline-none transition-colors ${
    hasError ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1] focus:border-black'
  }`;

const readOnlyClass =
  'w-full px-3.5 py-2.5 bg-[#CBD5E1] border border-[#CBD5E1] rounded-lg text-sm text-[#64748B] min-h-[44px] cursor-not-allowed';

const toProfileValues = (profile) => ({
  hoTen: profile?.hoTen ?? '',
  soDienThoai: profile?.soDienThoai ?? '',
});

const validateProfile = ({ hoTen, soDienThoai }) => {
  const errors = {};
  const name = hoTen.trim();
  if (!name) errors.hoTen = 'Vui lòng nhập họ và tên.';
  else if (name.length > NAME_MAX_LENGTH) errors.hoTen = `Họ và tên tối đa ${NAME_MAX_LENGTH} ký tự.`;
  if (!PHONE_PATTERN.test(soDienThoai)) errors.soDienThoai = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng số 0.';
  return errors;
};

const getAvatarInitial = (fullName) => {
  const words = (fullName || '').trim().split(/\s+/).filter(Boolean);
  return words.length ? words[words.length - 1].charAt(0).toUpperCase() : '?';
};

const FieldError = ({ id, message }) =>
  message ? (
    <p id={id} className="text-xs text-[#DC2626] flex items-center gap-1 mt-1">
      <AlertCircle size={13} className="shrink-0" />
      <span>{message}</span>
    </p>
  ) : null;

const FormBanner = ({ message }) =>
  message ? (
    <div
      role="alert"
      className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] text-sm flex items-start gap-2"
    >
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  ) : null;

const ProfileForm = ({ profile, onSaved }) => {
  const [serverValues, setServerValues] = useState(() => toProfileValues(profile));
  const [form, setForm] = useState(serverValues);
  const [serverErrors, setServerErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const changes = {};
  if (form.hoTen.trim() !== serverValues.hoTen) changes.hoTen = form.hoTen.trim();
  if (form.soDienThoai !== serverValues.soDienThoai) changes.soDienThoai = form.soDienThoai;
  const isDirty = Object.keys(changes).length > 0;

  const clientErrors = validateProfile(form);
  const fieldError = (field) => (form[field] !== serverValues[field] && clientErrors[field]) || serverErrors[field] || '';
  const hasClientErrors = Object.keys(clientErrors).some((field) => form[field] !== serverValues[field]);
  const canSave = isDirty && !hasClientErrors && !isSaving;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    setBanner('');
  };

  const handleReset = () => {
    setForm(serverValues);
    setServerErrors({});
    setBanner('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (savingRef.current || !canSave) return;
    savingRef.current = true;
    setIsSaving(true);
    setBanner('');
    try {
      const saved = await updateHostProfile(changes);
      const next = {
        hoTen: saved?.hoTen ?? changes.hoTen ?? serverValues.hoTen,
        soDienThoai: saved?.soDienThoai ?? changes.soDienThoai ?? serverValues.soDienThoai,
      };
      setServerValues(next);
      setForm(next);
      setServerErrors({});
      onSaved(next);
    } catch (err) {
      const detailErrors = getFieldErrors(err);
      if (err.code === 'ACCOUNT_DUPLICATED') {
        setServerErrors({ soDienThoai: detailErrors.soDienThoai || err.message });
      } else if (err.code === 'VALIDATION_ERROR' && Object.keys(detailErrors).length > 0) {
        setServerErrors({ hoTen: detailErrors.hoTen, soDienThoai: detailErrors.soDienThoai });
        const unknownFields = Object.keys(detailErrors).filter((field) => !['hoTen', 'soDienThoai'].includes(field));
        if (unknownFields.length) setBanner(err.message);
      } else if (SYSTEM_ERROR_CODES.includes(err.code)) {
        setBanner(PROFILE_SYSTEM_ERROR);
      } else {
        setBanner(err.message);
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const nameError = fieldError('hoTen');
  const phoneError = fieldError('soDienThoai');

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormBanner message={banner} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="profile-hoTen" className="text-xs font-medium text-black">
              Họ và tên
            </label>
            <input
              id="profile-hoTen"
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              value={form.hoTen}
              onChange={(event) => updateField('hoTen', event.target.value)}
              aria-invalid={nameError ? 'true' : 'false'}
              aria-describedby={nameError ? 'profile-hoTen-error' : undefined}
              className={inputClass(Boolean(nameError))}
            />
            <FieldError id="profile-hoTen-error" message={nameError} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-soDienThoai" className="text-xs font-medium text-black">
              Số điện thoại di động
            </label>
            <input
              id="profile-soDienThoai"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={form.soDienThoai}
              onChange={(event) => updateField('soDienThoai', event.target.value.replace(/\D/g, '').slice(0, 10))}
              aria-invalid={phoneError ? 'true' : 'false'}
              aria-describedby={phoneError ? 'profile-soDienThoai-error' : undefined}
              className={inputClass(Boolean(phoneError))}
            />
            <FieldError id="profile-soDienThoai-error" message={phoneError} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="profile-cccd" className="text-xs font-medium text-black">
              Căn cước công dân
            </label>
            <input
              id="profile-cccd"
              type="text"
              readOnly
              aria-readonly="true"
              aria-describedby="profile-identity-note"
              value={profile?.cccd ?? ''}
              className={readOnlyClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-email" className="text-xs font-medium text-black">
              Địa chỉ Email
            </label>
            <input
              id="profile-email"
              type="email"
              readOnly
              aria-readonly="true"
              aria-describedby="profile-identity-note"
              value={profile?.email ?? ''}
              className={readOnlyClass}
            />
          </div>
          <p id="profile-identity-note" className="text-[11px] text-[#64748B]">
            Email và CCCD là thông tin định danh, liên hệ Admin để thay đổi.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty || isSaving}
          className="min-h-[44px] px-6 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Hủy thay đổi
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="min-h-[44px] px-8 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </div>
    </form>
  );
};

const PasswordForm = ({ onChanged }) => {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [serverErrors, setServerErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const { oldPassword, newPassword, confirmPassword } = values;
  const missing = PASSWORD_CRITERIA.filter((rule) => !rule.test(newPassword)).map((rule) => rule.label);

  let newPasswordError = serverErrors.newPassword || '';
  if (newPassword && missing.length) newPasswordError = `Còn thiếu: ${missing.join(', ')}`;
  else if (newPassword && newPassword === oldPassword) newPasswordError = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  const confirmError =
    confirmPassword && confirmPassword !== newPassword ? 'Xác nhận mật khẩu mới không trùng khớp.' : '';
  const oldPasswordError = serverErrors.oldPassword || '';

  const canSubmit =
    Boolean(oldPassword && newPassword && confirmPassword) &&
    missing.length === 0 &&
    newPassword !== oldPassword &&
    !confirmError &&
    !isSubmitting;

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setServerErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    setBanner('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current || !canSubmit) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setBanner('');
    try {
      await changeHostPassword({ oldPassword, newPassword });
      setValues(EMPTY_PASSWORDS);
      setServerErrors({});
      onChanged();
    } catch (err) {
      if (err.code === 'OLD_PASSWORD_INCORRECT') setServerErrors({ oldPassword: err.message });
      else if (err.code === 'VALIDATION_ERROR') setServerErrors({ newPassword: err.message });
      else setBanner(err.message);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: 'oldPassword', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại', autoComplete: 'current-password', error: oldPasswordError },
    { name: 'newPassword', label: 'Mật khẩu mới', placeholder: 'Nhập mật khẩu mới', autoComplete: 'new-password', error: newPasswordError },
    { name: 'confirmPassword', label: 'Xác nhận mật khẩu mới', placeholder: 'Xác nhận mật khẩu mới', autoComplete: 'new-password', error: confirmError },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormBanner message={banner} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <label htmlFor={`password-${field.name}`} className="text-xs font-medium text-black">
              {field.label}
            </label>
            <input
              id={`password-${field.name}`}
              type="password"
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(event) => updateField(field.name, event.target.value)}
              aria-invalid={field.error ? 'true' : 'false'}
              aria-describedby={field.error ? `password-${field.name}-error` : undefined}
              className={inputClass(Boolean(field.error))}
            />
            <FieldError id={`password-${field.name}-error`} message={field.error} />
          </div>
        ))}
      </div>
      <div className="flex sm:justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto min-h-[44px] px-8 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </form>
  );
};

export const HostProfilePage = () => {
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { toast, showToast, dismissToast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  useEffect(() => {
    const controller = new AbortController();
    getHostProfile({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setProfile(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (controller.signal.aborted || isCanceled(err)) return;
        setLoadError(err);
        setStatus('error');
      });
    return () => controller.abort();
  }, [reloadKey]);

  const handleRetry = () => {
    setStatus('loading');
    setReloadKey((key) => key + 1);
  };

  if (status === 'loading') return <LoadingSpinner text="Đang tải hồ sơ..." />;

  if (status === 'error') {
    return (
      <ErrorState
        title="Không tải được hồ sơ"
        message={loadError?.message}
        onAction={loadError?.code === 'ACCOUNT_LOCKED' ? undefined : handleRetry}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toast toast={toast} onDismiss={dismissToast} />

      <section className="bg-white rounded-2xl border border-[#CBD5E1] p-5 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div
            data-testid="profile-avatar"
            aria-hidden="true"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-white flex items-center justify-center text-base font-semibold shrink-0"
          >
            {getAvatarInitial(profile?.hoTen)}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-black truncate">{profile?.hoTen}</p>
            <p className="text-xs text-[#64748B]">{ROLE_LABELS[profile?.vaiTro] ?? 'Host'}</p>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-black">Hồ sơ cá nhân</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Cập nhật thông tin tài khoản của bạn để nhận những ưu đãi cá nhân hóa
          </p>
        </div>

        <ProfileForm
          profile={profile}
          onSaved={(next) => {
            setProfile((prev) => ({ ...prev, ...next }));
            showToast({ type: 'success', message: 'Cập nhật thông tin thành công' });
          }}
        />
      </section>

      <section className="bg-white rounded-2xl border border-[#CBD5E1] p-5 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-black">Thay đổi mật khẩu</h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Bảo vệ tài khoản bằng cách thay đổi mật khẩu định kỳ
          </p>
        </div>
        <PasswordForm
          onChanged={() =>
            showToast({
              type: 'success',
              message: 'Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được đăng xuất.',
            })
          }
        />
      </section>

      {/* Figma mobile Hồ sơ: logout at the bottom of the page. Desktop keeps it in the sidebar. */}
      <button
        type="button"
        onClick={handleLogout}
        className="md:hidden w-full min-h-[44px] rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer"
      >
        Đăng xuất
      </button>
    </div>
  );
};
