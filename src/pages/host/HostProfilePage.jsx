import { useState } from 'react';
import {
  Lock,
  User,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const HostProfilePage = () => {
  const { user } = useAuth();

  // FORM 1: THÔNG TIN LIÊN LẠC
  const [name, setName] = useState(user?.name || 'Nguyễn Văn Quân');
  const [phone, setPhone] = useState(user?.phone || '0905123456');
  const [phoneError, setPhoneError] = useState('');
  const [profileToast, setProfileToast] = useState(null);

  // CÁC TRƯỜNG READ-ONLY THEO CHUẨN SRS (FR-13)
  const readonlyEmail = user?.email || 'quan.host@nhatranghotels.vn';
  const rawCccd = '056098765432'; // 12 số định danh pháp lý
  const [showCccd, setShowCccd] = useState(false);

  // FORM 2: ĐỔI MẬT KHẨU
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordToast, setPasswordToast] = useState(null);

  // Validate số điện thoại VN (10 chữ số, bắt đầu bằng số 0)
  const validatePhone = (value) => {
    const vnPhoneRegex = /^0\d{9}$/;
    if (!vnPhoneRegex.test(value)) {
      return 'Số điện thoại phải gồm 10 chữ số bắt đầu bằng số 0.';
    }
    return '';
  };

  // Đánh giá độ mạnh mật khẩu theo FR-11 (5 tiêu chí)
  const getPasswordCriteria = (pwd) => {
    return {
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const criteria = getPasswordCriteria(newPassword);
  const criteriaPassedCount = Object.values(criteria).filter(Boolean).length;

  let strengthLevel = 'weak';
  let strengthLabel = 'Yếu';
  let strengthColor = 'bg-[#DC2626]';
  let strengthTextColor = 'text-[#DC2626]';

  if (criteriaPassedCount >= 5) {
    strengthLevel = 'strong';
    strengthLabel = 'Rất mạnh';
    strengthColor = 'bg-[#15803D]';
    strengthTextColor = 'text-[#15803D]';
  } else if (criteriaPassedCount >= 3) {
    strengthLevel = 'medium';
    strengthLabel = 'Trung bình';
    strengthColor = 'bg-[#B45309]';
    strengthTextColor = 'text-[#B45309]';
  }

  const isProfileFilled = Boolean(name.trim() && phone.trim());
  const isPasswordFilled = Boolean(oldPassword.trim() && newPassword.trim() && confirmPassword.trim());

  // Handle Form 1: Lưu thông tin liên lạc
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!isProfileFilled) return;
    const error = validatePhone(phone);
    if (error) {
      setPhoneError(error);
      return;
    }
    setPhoneError('');
    setProfileToast({
      type: 'success',
      message: 'Cập nhật thông tin liên lạc thành công!',
    });
    setTimeout(() => setProfileToast(null), 3500);
  };

  // Handle Form 2: Cập nhật mật khẩu
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!isPasswordFilled) return;

    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    if (strengthLevel === 'weak') {
      setPasswordError('Mật khẩu mới chưa đạt độ mạnh yêu cầu (tối thiểu 8 ký tự, gồm hoa, thường, số, ký tự đặc biệt).');
      return;
    }

    setPasswordError('');
    setPasswordToast({
      type: 'success',
      message: 'Đổi mật khẩu thành công!',
    });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordToast(null), 3500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
          Quản Lý Tài Khoản Host
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Xem thông tin pháp lý định danh và cập nhật kênh liên lạc
        </p>
      </div>

      {/* DUAL RESPONSIVE GRID (1 COL ON MOBILE, 2 COLS ON DESKTOP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* FORM 1: THÔNG TIN LIÊN LẠC & ĐỊNH DANH PHÁP LÝ (FR-13) */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-[#CBD5E1] shadow-xs space-y-5"
        >
          {/* HEADER FORM 1 */}
          <div className="flex items-center gap-2 font-bold text-base text-black pb-3 border-b border-[#CBD5E1]">
            <User size={18} />
            <span>Thông tin liên lạc</span>
          </div>

          {/* TOAST FEEDBACK CHO PROFILE */}
          {profileToast && (
            <div
              data-testid="profile-feedback-toast"
              className="p-3.5 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/20 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200"
            >
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{profileToast.message}</span>
            </div>
          )}

          {/* HỌ VÀ TÊN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Họ và tên chủ cơ sở</label>
            <input
              type="text"
              data-testid="profile-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-base sm:text-sm text-black min-h-[44px] focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* SỐ ĐIỆN THOẠI */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Số điện thoại liên lạc</label>
            <input
              type="tel"
              inputMode="tel"
              data-testid="profile-phone-input"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError('');
              }}
              required
              className={`w-full px-4 py-2.5 bg-[#F8F4E8] border rounded-xl text-base sm:text-sm text-black min-h-[44px] focus:outline-none transition-colors ${
                phoneError ? 'border-[#DC2626] bg-[#F4A9A9]/20' : 'border-[#CBD5E1] focus:border-black'
              }`}
            />
            {phoneError && (
              <p className="text-xs text-[#DC2626] flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                <span>{phoneError}</span>
              </p>
            )}
          </div>

          {/* TRƯỜNG EMAIL READ-ONLY (FR-13) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#64748B]">
                Email định danh (Chỉ đọc)
              </label>
              <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium bg-[#CBD5E1]/30 px-2 py-0.5 rounded-md">
                <Lock size={12} data-testid="email-lock-icon" /> Bị khóa định danh
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                data-testid="readonly-email-input"
                readOnly
                value={readonlyEmail}
                className="w-full px-4 py-2.5 pr-10 bg-[#CBD5E1]/40 border border-[#CBD5E1] rounded-xl text-sm text-[#64748B] cursor-not-allowed select-none min-h-[44px]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                <Lock size={15} />
              </div>
            </div>
          </div>

          {/* TRƯỜNG CCCD READ-ONLY & MASKED (FR-13) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#64748B]">
                Số CCCD pháp lý (Chỉ đọc)
              </label>
              <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium bg-[#CBD5E1]/30 px-2 py-0.5 rounded-md">
                <Lock size={12} data-testid="cccd-lock-icon" /> Bảo mật pháp lý
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                data-testid="readonly-cccd-input"
                readOnly
                value={showCccd ? rawCccd : `${rawCccd.slice(0, 3)}******${rawCccd.slice(-3)}`}
                className="w-full px-4 py-2.5 pr-20 bg-[#CBD5E1]/40 border border-[#CBD5E1] rounded-xl text-sm text-[#64748B] font-mono cursor-not-allowed select-none min-h-[44px]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  data-testid="toggle-cccd-visibility-btn"
                  onClick={() => setShowCccd(!showCccd)}
                  title={showCccd ? 'Ẩn số CCCD' : 'Xem đầy đủ số CCCD'}
                  className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-[#64748B] hover:text-black hover:bg-black/5 transition-colors cursor-pointer flex items-center justify-center"
                >
                  {showCccd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              * Email và Số CCCD là thông tin định danh pháp lý, Host không được tự ý chỉnh sửa. Muốn thay đổi vui lòng liên hệ Admin.
            </p>
          </div>

          {/* SUBMIT BUTTON 1 */}
          <button
            type="submit"
            data-testid="save-profile-btn"
            disabled={!isProfileFilled}
            title={!isProfileFilled ? 'Vui lòng nhập đầy đủ họ tên và số điện thoại liên lạc' : ''}
            className="w-full min-h-[44px] rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:select-none"
          >
            <Save size={16} />
            <span>Lưu thông tin liên lạc</span>
          </button>
        </form>

        {/* FORM 2: ĐỔI MẬT KHẨU & ĐO ĐỘ MẠNH (FR-11) */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-[#CBD5E1] shadow-xs space-y-5 h-fit"
        >
          {/* HEADER FORM 2 */}
          <div className="flex items-center gap-2 font-bold text-base text-black pb-3 border-b border-[#CBD5E1]">
            <KeyRound size={18} />
            <span>Đổi mật khẩu</span>
          </div>

          {/* TOAST FEEDBACK CHO ĐỔI MẬT KHẨU */}
          {passwordToast && (
            <div
              data-testid="password-feedback-toast"
              className="p-3.5 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/20 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200"
            >
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{passwordToast.message}</span>
            </div>
          )}

          {/* MẬT KHẨU HIỆN TẠI */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                data-testid="old-password-input"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-12 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-base sm:text-sm text-black min-h-[44px] focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#64748B] hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* MẬT KHẨU MỚI */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                data-testid="new-password-input"
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Tối thiểu 8 ký tự..."
                className="w-full px-4 py-2.5 pr-12 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-base sm:text-sm text-black min-h-[44px] focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#64748B] hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* THANH ĐO ĐỘ MẠNH MẬT KHẨU (FR-11) */}
            <div
              data-testid="password-strength-meter"
              data-strength={newPassword ? strengthLevel : 'none'}
              className="pt-2 space-y-2 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Độ mạnh:</span>
                <span className={`font-bold ${newPassword ? strengthTextColor : 'text-[#64748B]'}`}>
                  {newPassword ? strengthLabel : 'Chưa nhập'}
                </span>
              </div>

              {/* PROGRESS BARS */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    criteriaPassedCount >= 1 ? strengthColor : 'bg-[#CBD5E1]'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    criteriaPassedCount >= 3 ? strengthColor : 'bg-[#CBD5E1]'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    criteriaPassedCount >= 4 ? strengthColor : 'bg-[#CBD5E1]'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    criteriaPassedCount >= 5 ? strengthColor : 'bg-[#CBD5E1]'
                  }`}
                />
              </div>

              {/* CRITERIA CHECKLIST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1 text-[#64748B]">
                <span className={`flex items-center gap-1 ${criteria.hasLength ? 'text-[#15803D]' : ''}`}>
                  {criteria.hasLength ? <Check size={12} /> : <X size={12} />} Ít nhất 8 ký tự
                </span>
                <span className={`flex items-center gap-1 ${criteria.hasUpper ? 'text-[#15803D]' : ''}`}>
                  {criteria.hasUpper ? <Check size={12} /> : <X size={12} />} Chữ in hoa (A-Z)
                </span>
                <span className={`flex items-center gap-1 ${criteria.hasLower ? 'text-[#15803D]' : ''}`}>
                  {criteria.hasLower ? <Check size={12} /> : <X size={12} />} Chữ thường (a-z)
                </span>
                <span className={`flex items-center gap-1 ${criteria.hasNumber ? 'text-[#15803D]' : ''}`}>
                  {criteria.hasNumber ? <Check size={12} /> : <X size={12} />} Chữ số (0-9)
                </span>
                <span className={`flex items-center gap-1 ${criteria.hasSpecial ? 'text-[#15803D]' : ''}`}>
                  {criteria.hasSpecial ? <Check size={12} /> : <X size={12} />} Ký tự đặc biệt (!@#...)
                </span>
              </div>
            </div>
          </div>

          {/* XÁC NHẬN MẬT KHẨU MỚI */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                data-testid="confirm-password-input"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className={`w-full px-4 py-2.5 pr-12 bg-[#F8F4E8] border rounded-xl text-base sm:text-sm text-black min-h-[44px] focus:outline-none transition-colors ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-[#DC2626] bg-[#F4A9A9]/20'
                    : 'border-[#CBD5E1] focus:border-black'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#64748B] hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* REALTIME MISMATCH ERROR */}
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-[#DC2626] flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle size={13} />
                <span>Xác nhận mật khẩu mới không trùng khớp.</span>
              </p>
            )}

            {passwordError && (
              <p className="text-xs text-[#DC2626] flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON 2 */}
          <button
            type="submit"
            data-testid="change-password-btn"
            disabled={!isPasswordFilled}
            title={!isPasswordFilled ? 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu' : ''}
            className="w-full min-h-[44px] rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:select-none"
          >
            <ShieldCheck size={16} />
            <span>Đổi mật khẩu</span>
          </button>
        </form>
      </div>
    </div>
  );
};
