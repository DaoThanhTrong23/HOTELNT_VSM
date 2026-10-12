import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES, AUTH_RULES } from '../../constants/enums';

export const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'bạn';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(AUTH_RULES.OTP_RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ĐỒNG HỒ ĐẾM NGƯỢC 60 GIÂY GỬI LẠI OTP (FR-11)
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus ô tiếp theo
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(AUTH_RULES.OTP_RESEND_COOLDOWN);
    setCanResend(false);
    setError('');
    // TODO: authService.resendOtp(email)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      return setError('Vui lòng nhập đủ 6 chữ số mã xác thực.');
    }

    setLoading(true);
    setError('');

    // TODO: authService.verifyOtp({ email, otp: fullOtp })
    setTimeout(() => {
      setLoading(false);
      // Xác thực thành công -> Login và vào Dashboard
      login(
        {
          id: 'host-123',
          name: 'Chủ Cơ Sở Mới',
          email,
          role: USER_ROLES.HOST,
        },
        'mock_jwt_token_verified'
      );
      navigate(ROUTES.HOST.DASHBOARD);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-2xl font-bold text-black">Xác Thực Mã OTP</h2>
        <p className="text-xs text-[#64748B] max-w-xs mx-auto">
          Mã xác thực 6 chữ số đã được gửi tới email <span className="font-semibold text-black">{email}</span>. Mã có hiệu lực trong 5 phút.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#F4A9A9]/50 border border-[#DC2626] text-[#DC2626] text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Ô INPUT OTP */}
        <div className="flex justify-between gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl focus:outline-hidden focus:border-black focus:bg-white"
            />
          ))}
        </div>

        {/* NÚT GỬI LẠI VỚI ĐỒNG HỒ ĐẾM NGƯỢC */}
        <div className="text-center text-xs">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="font-bold text-black flex items-center justify-center gap-1.5 mx-auto hover:underline cursor-pointer"
            >
              <RotateCcw size={14} />
              Gửi lại mã OTP mới
            </button>
          ) : (
            <span className="text-[#64748B]">
              Gửi lại mã sau <span className="font-bold text-black">{countdown}s</span>
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-85 disabled:opacity-50 transition-all cursor-pointer"
        >
          <span>{loading ? 'Đang kiểm tra...' : 'Xác thực & Bắt đầu'}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};
