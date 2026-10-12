import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES } from '../../constants/enums';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // TODO: authService.adminLogin({ email, password })
    setTimeout(() => {
      login(
        {
          id: 'admin-01',
          name: 'Quản Trị Viên Hệ Thống',
          email,
          role: USER_ROLES.ADMIN,
        },
        'mock_jwt_token_admin'
      );
      navigate(ROUTES.ADMIN.DASHBOARD);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto">
          <ShieldAlert size={24} className="text-[#D97706]" />
        </div>
        <h2 className="text-2xl font-bold text-black">Cổng Quản Trị Viên</h2>
        <p className="text-xs text-[#64748B]">Dành riêng cho ban quản trị kiểm duyệt nội dung & cấu hình hệ thống</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#F4A9A9]/50 border border-[#DC2626] text-[#DC2626] text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-black">Email Quản trị</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 text-[#64748B]" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hotelnt.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-black">Mật khẩu</label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-85 disabled:opacity-50 transition-all cursor-pointer"
        >
          <span>{loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị'}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};
