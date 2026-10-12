import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES } from '../../constants/enums';

export const HostLoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Thay bằng api call: await authService.login({ identifier, password });
      setTimeout(() => {
        // Giả lập đăng nhập thành công
        login(
          {
            id: 'host-123',
            name: 'Nguyễn Văn Host',
            email: identifier.includes('@') ? identifier : 'host@hotelnt.com',
            phone: '0905123456',
            role: USER_ROLES.HOST,
          },
          'mock_jwt_token_host'
        );
        navigate(ROUTES.HOST.DASHBOARD);
      }, 500);
    } catch (err) {
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-black">Đăng Nhập Dành Cho Host</h2>
        <p className="text-xs text-[#64748B]">Quản lý và cập nhật thông tin cơ sở lưu trú của bạn</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#F4A9A9]/50 border border-[#DC2626] text-[#DC2626] text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* EMAIL / PHONE */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-black">Email hoặc Số điện thoại</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 text-[#64748B]" size={18} />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="host@example.com hoặc 0905..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-black">Mật khẩu</label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-[#64748B] hover:text-black hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-[#64748B]" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        {/* REMEMBER ME */}
        <div className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded-sm border-[#CBD5E1] accent-black"
          />
          <label htmlFor="rememberMe" className="text-[#64748B] cursor-pointer">
            Ghi nhớ đăng nhập trên thiết bị này
          </label>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-85 disabled:opacity-50 transition-all cursor-pointer"
        >
          <span>{loading ? 'Đang xác thực...' : 'Đăng nhập vào Portal'}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      {/* REGISTER LINK */}
      <div className="pt-4 border-t border-[#CBD5E1] text-center text-xs text-[#64748B]">
        Chưa có tài khoản đối tác?{' '}
        <Link to={ROUTES.REGISTER} className="font-bold text-black underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
