import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, CreditCard, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { isValidPhoneNumber, isValidCCCD, isValidEmail, isStrongPassword } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const HostRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cccd: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // VALIDATION RULES THEO SRS (FR-11)
    if (!isValidPhoneNumber(formData.phone)) {
      return setError('Số điện thoại không đúng định dạng 10 chữ số Việt Nam.');
    }
    if (!isValidEmail(formData.email)) {
      return setError('Email không đúng định dạng.');
    }
    if (!isValidCCCD(formData.cccd)) {
      return setError('Số CCCD bắt buộc phải đủ 12 chữ số.');
    }
    if (!isStrongPassword(formData.password)) {
      return setError('Mật khẩu tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Xác nhận mật khẩu không khớp.');
    }

    setLoading(true);
    // TODO: Gọi authService.register(formData)
    setTimeout(() => {
      setLoading(false);
      // Chuyển sang màn hình xác thực Email OTP kèm email đã đăng ký
      navigate(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(formData.email)}`);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-black">Đăng Ký Tài Khoản Host</h2>
        <p className="text-xs text-[#64748B]">Điền đầy đủ thông tin để tham gia nền tảng</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#F4A9A9]/50 border border-[#DC2626] text-[#DC2626] text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* HỌ VÀ TÊN */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-black">Họ và tên chủ cơ sở</label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="w-full pl-10 pr-4 py-2 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* SỐ ĐIỆN THOẠI */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-black">Số điện thoại</label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="0905xxxxxx"
              className="w-full pl-10 pr-4 py-2 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-black">Email (Nhận mã OTP)</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="host@gmail.com"
              className="w-full pl-10 pr-4 py-2 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* CCCD (12 SỐ) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-black">Số Căn cước công dân (12 số)</label>
          <div className="relative flex items-center">
            <CreditCard className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              type="text"
              name="cccd"
              maxLength={12}
              required
              value={formData.cccd}
              onChange={handleChange}
              placeholder="056xxxxxxxx"
              className="w-full pl-10 pr-4 py-2 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* MẬT KHẨU */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-black">Mật khẩu</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Tối thiểu 8 ký tự..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-black">Xác nhận mật khẩu</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-[#64748B]" size={16} />
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-85 disabled:opacity-50 transition-all cursor-pointer"
        >
          <span>{loading ? 'Đang gửi mã OTP...' : 'Đăng ký & Nhận mã OTP'}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="pt-4 border-t border-[#CBD5E1] text-center text-xs text-[#64748B]">
        Đã có tài khoản?{' '}
        <Link to={ROUTES.LOGIN} className="font-bold text-black underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
