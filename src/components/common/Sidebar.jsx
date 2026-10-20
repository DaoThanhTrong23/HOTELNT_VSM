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
    { label: 'Quản lí cơ sở', path: ROUTES.HOST.DASHBOARD, icon: Hotel },
    { label: 'Thêm cơ sở mới', path: ROUTES.HOST.ADD_HOTEL, icon: PlusCircle },
    { label: 'Quản lí tài khoản', path: ROUTES.HOST.PROFILE, icon: UserCheck },
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
    <aside className="w-64 bg-white border-r border-[#CBD5E1] flex flex-col h-screen sticky top-0 z-40">
      {/* BRAND */}
      <div className="p-6 border-b border-[#CBD5E1]">
        {role === 'HOST' ? (
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">LOGO</h1>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Chào mừng! đã đến với trang dành cho chủ cơ sở
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
              <Building2 className="text-[#D97706]" size={22} />
            </div>
            <div>
              <h2 className="font-bold text-base text-black leading-tight">Admin Portal</h2>
              <span className="text-xs text-[#64748B]">Nha Trang Hotel</span>
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.HOST.DASHBOARD}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-[#CBD5E1] text-[#64748B] hover:text-black hover:border-black bg-white'
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
        <div className="flex items-center justify-between p-3 rounded-xl bg-black text-white shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'T'}
            </div>
            <div className="truncate text-xs">
              <p className="font-bold text-white truncate">{user?.name || 'Đào Thanh Trọng'}</p>
              <p className="text-[#CBD5E1] text-[11px] truncate">Chủ cơ sở</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-1.5 text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
