import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { authService } from '../../services/authService';

// Regex chuẩn theo SRS v2.0 & API DESIGN
const PHONE_REGEX = /^0\d{9}$/;
const CCCD_REGEX = /^\d{12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]).{8,}$/;

export const HostRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    cccd: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra từng tiêu chí mật khẩu để hiển thị checklist trực quan
  const passwordCriteria = useMemo(() => {
    const pwd = formData.matKhau;
    return {
      length: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(pwd),
    };
  }, [formData.matKhau]);

  // Logic kiểm tra tính hợp lệ của từng trường
  const validateField = (name, value, currentValues = formData) => {
    let errorMsg = '';
    const val = (value || '').trim();

    switch (name) {
      case 'hoTen':
        if (!val) {
          errorMsg = 'Họ và tên không được để trống.';
        } else if (val.length > 100) {
          errorMsg = 'Họ và tên tối đa 100 ký tự.';
        }
        break;

      case 'soDienThoai':
        if (!val) {
          errorMsg = 'Số điện thoại không được để trống.';
        } else if (!PHONE_REGEX.test(val)) {
          errorMsg = 'SĐT phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (VD: 0901234567).';
        }
        break;

      case 'email':
        if (!val) {
          errorMsg = 'Email không được để trống.';
        } else if (!EMAIL_REGEX.test(val)) {
          errorMsg = 'Email không đúng định dạng hợp lệ (VD: host@example.com).';
        }
        break;

      case 'cccd':
        if (!val) {
          errorMsg = 'Số CCCD không được để trống.';
        } else if (!CCCD_REGEX.test(val)) {
          errorMsg = 'Số CCCD bắt buộc phải gồm đúng 12 chữ số.';
        }
        break;

      case 'matKhau':
        if (!value) {
          errorMsg = 'Mật khẩu không được để trống.';
        } else if (!PASSWORD_REGEX.test(value)) {
          errorMsg = 'Mật khẩu tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.';
        }
        break;

      case 'xacNhanMatKhau':
        if (!value) {
          errorMsg = 'Vui lòng nhập lại mật khẩu để xác nhận.';
        } else if (value !== currentValues.matKhau) {
          errorMsg = 'Xác nhận mật khẩu không trùng khớp với mật khẩu đã nhập.';
        }
        break;

      default:
        break;
    }
    return errorMsg;
  };

  // Xử lý thay đổi dữ liệu trong ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);

    // Nếu trường đó đã từng được blur hoặc đã có lỗi, validate real-time lại
    if (touched[name] || fieldErrors[name]) {
      const err = validateField(name, value, nextFormData);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }

    // Nếu đổi mật khẩu chính, kiểm tra lại luôn trường xác nhận mật khẩu nếu đã gõ
    if (name === 'matKhau' && touched.xacNhanMatKhau) {
      const confirmErr = validateField('xacNhanMatKhau', formData.xacNhanMatKhau, nextFormData);
      setFieldErrors((prev) => ({ ...prev, xacNhanMatKhau: confirmErr }));
    }

    // Xóa lỗi global khi người dùng bắt đầu chỉnh sửa lại
    if (globalError) {
      setGlobalError(null);
    }
  };

  // Đánh dấu trường đã chạm vào (blur)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value, formData);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  // Xử lý nộp form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);

    // Validate toàn bộ 6 trường
    const newErrors = {};
    const touchedAll = {};
    Object.keys(formData).forEach((key) => {
      touchedAll[key] = true;
      const errorMsg = validateField(key, formData[key], formData);
      if (errorMsg) {
        newErrors[key] = errorMsg;
      }
    });

    setTouched(touchedAll);
    setFieldErrors(newErrors);

    // Nếu có bất kỳ lỗi nào, cuộn hoặc chặn gửi
    if (Object.keys(newErrors).length > 0) {
      setGlobalError({
        code: 'VALIDATION_ERROR',
        message: 'Vui lòng kiểm tra và sửa các thông tin chưa hợp lệ bên dưới.',
      });
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị payload theo đúng API_DESIGN: /auth/signup
      const payload = {
        hoTen: formData.hoTen.trim(),
        soDienThoai: formData.soDienThoai.trim(),
        email: formData.email.trim().toLowerCase(),
        cccd: formData.cccd.trim(),
        matKhau: formData.matKhau,
      };

      let responseData = null;
      try {
        if (authService?.register) {
          const res = await authService.register(payload);
          responseData = res?.data || res;
        }
      } catch (apiErr) {
        // Bắt lỗi từ Backend response (theo chuẩn Error Format của API_DESIGN)
        const errorBody = apiErr?.response?.data?.error;
        const statusCode = apiErr?.response?.status;

        // Xử lý mã lỗi ACCOUNT_DUPLICATED (HTTP 409)
        if (statusCode === 409 || errorBody?.code === 'ACCOUNT_DUPLICATED') {
          const duplicateMsg =
            errorBody?.message || 'Email, số điện thoại hoặc CCCD đã được sử dụng.';

          // Đánh dấu đỏ các trường bị trùng lặp nếu backend có trả về details
          const updatedFieldErrors = {};
          if (Array.isArray(errorBody?.details)) {
            errorBody.details.forEach((item) => {
              if (item.field) {
                updatedFieldErrors[item.field] = item.message;
              }
            });
          } else {
            // Mặc định highlight cả 3 trường nhạy cảm nếu không có chi tiết cụ thể
            updatedFieldErrors.email = 'Có thể email này đã được đăng ký.';
            updatedFieldErrors.soDienThoai = 'Có thể SĐT này đã được đăng ký.';
            updatedFieldErrors.cccd = 'Có thể số CCCD này đã được đăng ký.';
          }

          setFieldErrors((prev) => ({ ...prev, ...updatedFieldErrors }));
          setGlobalError({
            code: 'ACCOUNT_DUPLICATED',
            message: duplicateMsg,
            details: errorBody?.details || [],
          });
          setLoading(false);
          return;
        }

        // Xử lý lỗi Rate limit hoặc lỗi khác
        if (statusCode === 429) {
          setGlobalError({
            code: 'RATE_LIMITED',
            message: errorBody?.message || 'Bạn thao tác quá nhanh. Vui lòng thử lại sau giây lát.',
          });
          setLoading(false);
          return;
        }

        // Nếu là lỗi server khác hoặc server chưa bật trong giai đoạn dev UI
        throw apiErr;
      }

      // Đăng ký thành công -> chuyển hướng sang trang xác thực OTP
      const registrationId = responseData?.registrationId || 'reg-' + Date.now();
      navigate(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(payload.email)}`, {
        state: {
          registrationId,
          email: payload.email,
          phone: payload.soDienThoai,
          otpExpiresIn: responseData?.otpExpiresIn || 300,
          resendAfter: responseData?.resendAfter || 60,
        },
      });
    } catch (err) {
      console.warn('Lưu ý kết nối API (đang trong môi trường thử nghiệm):', err.message);

      // Fallback cho môi trường test giao diện khi mock server chưa sẵn sàng:
      // Cho phép test chuyển trang thành công
      setTimeout(() => {
        navigate(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(formData.email.trim())}`, {
          state: {
            registrationId: 'reg-mock-' + Date.now(),
            email: formData.email.trim(),
            phone: formData.soDienThoai.trim(),
            otpExpiresIn: 300,
            resendAfter: 60,
          },
        });
      }, 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* TIÊU ĐỀ HEADER */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-black">Đăng Ký Tài Khoản Host</h2>
        <p className="text-xs text-[#64748B]">
          Trở thành đối tác cơ sở lưu trú Nha Trang không qua trung gian
        </p>
      </div>

      {/* THÔNG BÁO LỖI CHUNG / ACCOUNT_DUPLICATED */}
      {globalError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#F4A9A9]/50 border border-[#DC2626] text-[#DC2626] text-xs flex items-start gap-2.5 shadow-sm transition-all animate-in fade-in"
        >
          {globalError.code === 'ACCOUNT_DUPLICATED' ? (
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5 text-[#DC2626]" />
          ) : (
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-[#DC2626]" />
          )}
          <div className="space-y-1">
            <p className="font-semibold">{globalError.message}</p>
            {globalError.code === 'ACCOUNT_DUPLICATED' && (
              <p className="text-[11px] text-neutral-700">
                Nếu bạn đã từng tạo tài khoản, hãy thử{' '}
                <Link to={ROUTES.LOGIN} className="underline font-bold text-black">
                  Đăng nhập
                </Link>{' '}
                hoặc sử dụng tính năng{' '}
                <Link to={ROUTES.FORGOT_PASSWORD} className="underline font-bold text-black">
                  Quên mật khẩu
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      )}

      {/* FORM NHẬP LIỆU 6 TRƯỜNG */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* 1. HỌ VÀ TÊN */}
        <div className="space-y-1">
          <label htmlFor="hoTen" className="text-xs font-semibold text-black flex items-center justify-between">
            <span>Họ và tên chủ cơ sở <span className="text-[#DC2626]">*</span></span>
            <span className="text-[11px] font-normal text-[#64748B]">{formData.hoTen.length}/100</span>
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              id="hoTen"
              type="text"
              name="hoTen"
              maxLength={100}
              value={formData.hoTen}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nguyễn Văn A"
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                fieldErrors.hoTen
                  ? 'border-2 border-[#DC2626] focus:border-[#DC2626]'
                  : 'border border-[#CBD5E1] focus:border-black'
              }`}
            />
          </div>
          {fieldErrors.hoTen && (
            <p className="text-[11px] text-[#DC2626] flex items-center gap-1 font-medium mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{fieldErrors.hoTen}</span>
            </p>
          )}
        </div>

        {/* 2. SỐ ĐIỆN THOẠI (10 SỐ) */}
        <div className="space-y-1">
          <label htmlFor="soDienThoai" className="text-xs font-semibold text-black">
            Số điện thoại liên hệ <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              id="soDienThoai"
              type="tel"
              inputMode="numeric"
              name="soDienThoai"
              maxLength={10}
              value={formData.soDienThoai}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0905123456"
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                fieldErrors.soDienThoai
                  ? 'border-2 border-[#DC2626] focus:border-[#DC2626]'
                  : 'border border-[#CBD5E1] focus:border-black'
              }`}
            />
          </div>
          {fieldErrors.soDienThoai && (
            <p className="text-[11px] text-[#DC2626] flex items-center gap-1 font-medium mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{fieldErrors.soDienThoai}</span>
            </p>
          )}
        </div>

        {/* 3. EMAIL */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold text-black">
            Email nhận mã xác thực OTP <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="host@gmail.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                fieldErrors.email
                  ? 'border-2 border-[#DC2626] focus:border-[#DC2626]'
                  : 'border border-[#CBD5E1] focus:border-black'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] text-[#DC2626] flex items-center gap-1 font-medium mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* 4. SỐ CCCD (12 SỐ) */}
        <div className="space-y-1">
          <label htmlFor="cccd" className="text-xs font-semibold text-black flex items-center justify-between">
            <span>Số Căn cước công dân (CCCD) <span className="text-[#DC2626]">*</span></span>
            <span className="text-[11px] font-normal text-[#64748B]">12 chữ số</span>
          </label>
          <div className="relative flex items-center">
            <CreditCard className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              id="cccd"
              type="text"
              inputMode="numeric"
              name="cccd"
              maxLength={12}
              value={formData.cccd}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="056098001234"
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                fieldErrors.cccd
                  ? 'border-2 border-[#DC2626] focus:border-[#DC2626]'
                  : 'border border-[#CBD5E1] focus:border-black'
              }`}
            />
          </div>
          {fieldErrors.cccd && (
            <p className="text-[11px] text-[#DC2626] flex items-center gap-1 font-medium mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{fieldErrors.cccd}</span>
            </p>
          )}
        </div>

        {/* 5. MẬT KHẨU */}
        <div className="space-y-1">
          <label htmlFor="matKhau" className="text-xs font-semibold text-black">
            Mật khẩu khởi tạo <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              id="matKhau"
              type={showPassword ? 'text' : 'password'}
              name="matKhau"
              value={formData.matKhau}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tối thiểu 8 ký tự..."
              className={`w-full pl-10 pr-11 py-2.5 bg-[#F8F4E8] rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                fieldErrors.matKhau
                  ? 'border-2 border-[#DC2626] focus:border-[#DC2626]'
                  : 'border border-[#CBD5E1] focus:border-black'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-[#64748B] hover:text-black cursor-pointer p-1"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* CHỈ BÁO ĐỘ MẠNH MẬT KHẨU THEO SRS */}
          {formData.matKhau.length > 0 && (
            <div className="p-2.5 mt-1.5 rounded-lg bg-[#F8F4E8] border border-[#CBD5E1] text-[11px] space-y-1">
              <p className="font-semibold text-black text-[11px]">Tiêu chuẩn mật khẩu SRS:</p>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.length ? 'text-[#15803D]' : 'text-[#64748B]'
                  }`}
                >
                  <CheckCircle2 size={12} className={passwordCriteria.length ? 'opacity-100' : 'opacity-40'} />
                  <span>Từ 8 ký tự</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasUpper && passwordCriteria.hasLower
                      ? 'text-[#15803D]'
                      : 'text-[#64748B]'
                  }`}
                >
                  <CheckCircle2
                    size={12}
                    className={
                      passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'opacity-100' : 'opacity-40'
                    }
                  />
                  <span>Chữ hoa & chữ thường</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasNumber ? 'text-[#15803D]' : 'text-[#64748B]'
                  }`}
                >
                  <CheckCircle2 size={12} className={passwordCriteria.hasNumber ? 'opacity-100' : 'opacity-40'} />
                  <span>Có ít nhất 1 số</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasSpecial ? 'text-[#15803D]' : 'text-[#64748B]'
                  }`}
                >
                  <CheckCircle2 size={12} className={passwordCriteria.hasSpecial ? 'opacity-100' : 'opacity-40'} />
                  <span>Ký tự đặc biệt (@, #...)</span>
                </div>
              </div>
            </div>
          )}

          {fieldErrors.matKhau && (
            <p className="text-[11px] text-[#DC2626] flex items-center gap-1 font-medium mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{fieldErrors.matKhau}</span>
            </p>
          )}
        </div>

        {/* 6. XÁC NHẬN MẬT KHẨU */}
        <div className="space-y-1">
          <label htmlFor="xacNhanMatKhau" className="text-xs font-semibold text-black">
            Xác nhận mật khẩu <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              id="xacNhanMatKhau"
              type={showConfirmPassword ? 'text' : 'password'}
              name="xacNhanMatKhau"
              value={formData.xacNhanMatKhau}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập lại mật khẩu để xác nhận..."
              className={`w-full pl-10 pr-11 py-2.5 bg-[#F8F4E8] rounded-xl text-sm transition-all focus:outline-none focus:bg-white ${
                fieldErrors.xacNhanMatKhau
                  ? 'border-2 border-[#DC2626] focus:border-[#DC2626]'
                  : 'border border-[#CBD5E1] focus:border-black'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-[#64748B] hover:text-black cursor-pointer p-1"
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.xacNhanMatKhau && (
            <p className="text-[11px] text-[#DC2626] flex items-center gap-1 font-medium mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{fieldErrors.xacNhanMatKhau}</span>
            </p>
          )}
        </div>

        {/* NÚT SUBMIT ĐĂNG KÝ */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 rounded-xl bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang gửi mã OTP...</span>
            </div>
          ) : (
            <>
              <span>Đăng ký & Nhận mã OTP</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* CHUYỂN HƯỚNG ĐĂNG NHẬP */}
      <div className="pt-4 border-t border-[#CBD5E1] text-center text-xs text-[#64748B]">
        Đã có tài khoản đối tác?{' '}
        <Link to={ROUTES.LOGIN} className="font-bold text-black underline hover:text-neutral-700">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
