import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, Plus, User } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';

const isAddPage = (path) => path.startsWith(ROUTES.HOST.ADD_HOTEL);

// Bottom tabs on phones (Figma M11–M13). Edit pages belong to "Quản lí cơ sở".
const MOBILE_TABS = [
  {
    label: 'Quản lí cơ sở',
    to: ROUTES.HOST.DASHBOARD,
    icon: Building2,
    isActive: (path) => path.startsWith(ROUTES.HOST.DASHBOARD) || (path.startsWith(ROUTES.HOST.HOTELS) && !isAddPage(path)),
  },
  { label: 'Thêm cơ sở', to: ROUTES.HOST.ADD_HOTEL, icon: Plus, isActive: isAddPage },
  { label: 'Tài khoản', to: ROUTES.HOST.PROFILE, icon: User, isActive: (path) => path.startsWith(ROUTES.HOST.PROFILE) },
];

// Figma M11: LOGO + avatar only. Logout on phones sits at the bottom of the Hồ sơ page.
const MobileTopBar = () => {
  const { user } = useAuth();
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || 'H';

  return (
    <header className="md:hidden shrink-0 h-14 px-4 flex items-center justify-between bg-white border-b border-[#CBD5E1]">
      <Link to={ROUTES.HOST.DASHBOARD} className="text-xl font-black tracking-tight text-black">
        LOGO
      </Link>
      <Link to={ROUTES.HOST.PROFILE} aria-label="Tài khoản của tôi" className="w-11 h-11 flex items-center justify-center">
        <span className="w-9 h-9 rounded-full bg-black text-white text-sm font-semibold flex items-center justify-center">
          {initial}
        </span>
      </Link>
    </header>
  );
};

const MobileTabBar = () => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Điều hướng chính"
      className="md:hidden shrink-0 grid grid-cols-3 bg-white border-t border-[#CBD5E1] pb-[env(safe-area-inset-bottom)]"
    >
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive(pathname);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 min-h-[60px] text-[11px] ${
              active ? 'text-black font-semibold' : 'text-[#64748B]'
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{tab.label}</span>
            <span aria-hidden="true" className={`h-0.5 w-8 rounded-full ${active ? 'bg-black' : 'bg-transparent'}`} />
          </Link>
        );
      })}
    </nav>
  );
};

export const HostLayout = () => {
  return (
    <div className="flex h-dvh bg-[#F8F4E8] overflow-hidden">
      {/* Desktop only: on a ~400px phone the 256px sidebar left the page about 146px. */}
      <div className="hidden md:flex shrink-0">
        <Sidebar role="HOST" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar />
        <div className="flex-1 overflow-y-auto">
          <main className="px-4 py-5 sm:p-8 lg:p-10">
            <Outlet />
          </main>
        </div>
        <MobileTabBar />
      </div>
    </div>
  );
};
