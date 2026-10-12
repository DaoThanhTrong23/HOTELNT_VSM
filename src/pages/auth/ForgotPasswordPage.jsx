import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Theo quy tắc SRS (FR-13): Luôn hiển thị thông báo thành công để bảo mật,
    // bất kể email có tồn tại trên hệ thống hay không.
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-black">Quên Mật Khẩu</h2>
        <p className="text-xs text-[#64748B]">Nhập email đã đăng ký tài khoản Host để nhận mã OTP đặt lại mật khẩu</p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Nếu email <span className="font-semibold text-black">{email}</span> tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn và mã OTP khôi phục.
          </p>
          <button
            onClick={() => navigate(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(email)}`)}
            className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer"
          >
            Nhập mã OTP khôi phục
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Email tài khoản</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-[#64748B]" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="host@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-85 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{loading ? 'Đang gửi...' : 'Gửi mã khôi phục'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-[#CBD5E1] text-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-black font-semibold"
        >
          <ArrowLeft size={14} />
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
};
