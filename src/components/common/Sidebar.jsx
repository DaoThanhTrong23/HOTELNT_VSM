import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Hotel,
  PlusCircle,
  UserCheck,
  ClipboardCheck,
  Users,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ role = 'HOST', pendingCount = 0 }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(role === 'ADMIN' ? ROUTES.ADMIN.LOGIN : ROUTES.LOGIN);
  };

  const hostNavItems = [
    { label: 'Tổng quan', path: ROUTES.HOST.DASHBOARD, icon: LayoutDashboard },
    { label: 'Cơ sở lưu trú', path: ROUTES.HOST.HOTELS, icon: Hotel },
    { label: 'Thêm mới', path: ROUTES.HOST.ADD_HOTEL, icon: PlusCircle },
    { label: 'Tài khoản', path: ROUTES.HOST.PROFILE, icon: UserCheck },
  ];

  const adminNavItems = [
    { label: 'Tổng quan', path: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    {
      label: 'Kiểm duyệt',
      path: ROUTES.ADMIN.MODERATION,
      icon: ClipboardCheck,
      badge: pendingCount,
    },
    { label: 'Quản lý Host', path: ROUTES.ADMIN.HOST_MANAGEMENT, icon: Users },
    { label: 'Cấu hình hệ thống', path: ROUTES.ADMIN.SYSTEM_CONFIG, icon: Settings },
  ];

  const items = role === 'ADMIN' ? adminNavItems : hostNavItems;

  return (
    <aside className="w-64 bg-white border-r border-[#CBD5E1] flex flex-col h-screen sticky top-0">
      {/* BRAND */}
      <div className="h-20 px-6 flex items-center gap-3 border-b border-[#CBD5E1]">
        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
          <Building2 className="text-[#D97706]" size={22} />
        </div>
        <div>
          <h2 className="font-bold text-base text-black leading-tight">
            {role === 'ADMIN' ? 'Admin Portal' : 'Host Portal'}
          </h2>
          <span className="text-xs text-[#64748B]">Nha Trang Hotel</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] px-3 mb-3">
          Menu Điều Hướng
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'text-[#64748B] hover:bg-[#F8F4E8] hover:text-black'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DC2626] text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER USER & LOGOUT */}
      <div className="p-4 border-t border-[#CBD5E1] bg-white">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8F4E8] mb-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-black truncate">{user?.name || 'Người dùng'}</p>
              <p className="text-[#64748B] truncate">{user?.email || 'user@hotelnt.com'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold text-[#DC2626] hover:bg-[#F4A9A9]/20 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
