import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';

// Figma Frame 16: Top Bar on mobile
const MobileAdminTopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || user?.hoTen?.trim()?.[0]?.toUpperCase() || 'A';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN.LOGIN);
  };

  return (
    <header className="md:hidden shrink-0 h-14 px-4 flex items-center justify-between bg-white border-b border-[#CBD5E1] relative z-40">
      <Link to={ROUTES.ADMIN.MODERATION} className="text-xl font-black tracking-tight text-black">
        LOGO
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Thông báo"
          className="w-10 h-10 flex items-center justify-center text-black hover:bg-[#F8F4E8] rounded-full transition cursor-pointer"
        >
          <Bell size={20} />
        </button>

        <div className="relative">
          <button
            type="button"
            aria-label="Tài khoản Admin"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer hover:opacity-90 transition"
          >
            {initial}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#CBD5E1] py-1.5 z-50 animate-fade-in">
              <div className="px-3.5 py-2 border-b border-[#E2E8F0]">
                <p className="text-xs font-bold text-black truncate">{user?.name || user?.hoTen || 'Quản trị viên'}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'admin@hotelnt.vn'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 transition cursor-pointer"
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Figma Frame 16: Bottom tab bar on mobile (Kiểm duyệt - Host - Cấu hình)
const MobileAdminTabBar = () => {
  const { pathname } = useLocation();

  const isModeration = pathname.startsWith(ROUTES.ADMIN.MODERATION) || pathname === '/admin' || pathname === ROUTES.ADMIN.DASHBOARD;
  const isHosts = pathname.startsWith(ROUTES.ADMIN.HOST_MANAGEMENT);
  const isConfig = pathname.startsWith(ROUTES.ADMIN.SYSTEM_CONFIG);

  const tabs = [
    {
      label: 'Kiểm duyệt',
      to: ROUTES.ADMIN.MODERATION,
      icon: Home,
      isActive: isModeration,
    },
    {
      label: 'Host',
      to: ROUTES.ADMIN.HOST_MANAGEMENT,
      icon: Users,
      isActive: isHosts,
    },
    {
      label: 'Cấu hình',
      to: ROUTES.ADMIN.SYSTEM_CONFIG,
      icon: Settings,
      isActive: isConfig,
    },
  ];

  return (
    <nav
      aria-label="Điều hướng quản trị"
      className="md:hidden shrink-0 grid grid-cols-3 items-center bg-white border-t border-[#CBD5E1] px-2 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] z-40"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive;

        return (
          <div key={tab.to} className="flex justify-center items-center">
            {active ? (
              <Link
                to={tab.to}
                aria-current="page"
                className="bg-black text-white px-4 py-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold shadow-xs transition min-w-[72px]"
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </Link>
            ) : (
              <Link
                to={tab.to}
                className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-[#64748B] hover:text-black py-1.5 transition"
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export const AdminLayout = () => {
  return (
    <div className="flex h-dvh bg-[#F8F4E8] overflow-hidden">
      {/* Desktop only sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar role="ADMIN" pendingCount={12} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <MobileAdminTopBar />
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          <main className="flex-1 min-h-0 flex flex-col">
            <Outlet />
          </main>
        </div>
        <MobileAdminTabBar />
      </div>
    </div>
  );
};

export default AdminLayout;
