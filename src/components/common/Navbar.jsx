import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, User, Menu, X, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useFilter } from '../../context/FilterContext';
import { useAuth } from '../../hooks/useAuth';
import { BrandLogo } from './BrandLogo';

const UserMenuContent = ({ isAuthenticated, isHost, isAdmin, user, onSelect, onLogout }) => {
  if (isAuthenticated) {
    return (
      <>
        <li className="px-3.5 py-2 border-b border-[#F1F5F9] mb-1">
          <p className="text-[11px] text-[#94A3B8]">Đang đăng nhập với quyền</p>
          <p className="text-xs font-bold text-black truncate">
            {isHost ? (user?.hoTen || user?.name || user?.soDienThoai || 'Host') : (user?.email || 'Quản trị viên')}
          </p>
        </li>
        {isHost && (
          <>
            <li>
              <Link
                to={ROUTES.HOST.DASHBOARD}
                onClick={onSelect}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-[#F8F4E8] text-xs font-semibold text-black transition-colors"
              >
                <LayoutDashboard size={14} />
                Quản lý cơ sở lưu trú
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.HOST.PROFILE}
                onClick={onSelect}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-[#F8F4E8] text-xs font-semibold text-black transition-colors"
              >
                <UserCheck size={14} />
                Hồ sơ cá nhân
              </Link>
            </li>
          </>
        )}
        {isAdmin && (
          <li>
            <Link
              to={ROUTES.ADMIN.DASHBOARD}
              onClick={onSelect}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-[#F8F4E8] text-xs font-semibold text-black transition-colors"
            >
              <LayoutDashboard size={14} />
              Trang quản trị (Admin)
            </Link>
          </li>
        )}
        <li className="pt-1 border-t border-[#F1F5F9] mt-1">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-[#FEF2F2] text-xs font-semibold text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <Link
          to={ROUTES.LOGIN}
          onClick={onSelect}
          className="block px-3.5 py-2.5 rounded-xl hover:bg-[#F8F4E8] text-xs sm:text-sm font-semibold text-black transition-colors"
        >
          Đăng nhập với quyền host
        </Link>
      </li>
      <li>
        <Link
          to={ROUTES.ADMIN.LOGIN}
          onClick={onSelect}
          className="block px-3.5 py-2.5 rounded-xl hover:bg-[#F8F4E8] text-xs sm:text-sm font-semibold text-black transition-colors"
        >
          Đăng nhập với quyền admin
        </Link>
      </li>
    </>
  );
};

/**
 * Navbar Tourist theo Figma Design:
 *
 * Desktop:
 * [LOGO] [Search input] [Tìm kiếm] [Bộ lọc] [User]
 *
 * Mobile:
 * [LOGO]                 [Menu] [User]
 * [Search input             Search icon]
 *
 * Nút lọc luôn hiển thị popup bộ lọc theo thiết kế
 */
export const Navbar = ({ onOpenFilter }) => {
  const { user, isAuthenticated, isHost, isAdmin, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const mobileUserMenuRef = useRef(null);

  // Đóng dropdown tài khoản khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktop = userMenuRef.current && userMenuRef.current.contains(event.target);
      const inMobile = mobileUserMenuRef.current && mobileUserMenuRef.current.contains(event.target);
      if (!inDesktop && !inMobile) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useNavigate();
  const filterContext = useFilter();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  // Đồng bộ ô search khi keyword trên URL thay đổi
  useEffect(() => {
    setSearchTerm(searchParams.get('keyword') || '');
  }, [searchParams]);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    const kw = searchTerm.trim();
    if (kw) {
      navigate(`${ROUTES.SEARCH}?keyword=${encodeURIComponent(kw)}`);
    } else {
      navigate(ROUTES.SEARCH);
    }
    setIsMobileMenuOpen(false);
  };

  // Xử lý mở bộ lọc (FilterContext hoặc callback onOpenFilter)
  const handleOpenFilter = () => {
    if (filterContext?.openFilter) {
      filterContext.openFilter();
    } else if (onOpenFilter) {
      onOpenFilter();
    } else {
      navigate(ROUTES.SEARCH);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#CBD5E1] shadow-sm">
      {/* =====================================================
          MAIN NAVBAR CONTAINER
      ===================================================== */}
      <div className="
        max-w-7xl mx-auto
        px-4 sm:px-6 lg:px-8
        min-h-16
        flex flex-col
        md:flex-row md:h-16 md:items-center
        gap-2 md:gap-4
        py-2 md:py-0
      ">
        {/* =====================================================
            LOGO DESKTOP
        ===================================================== */}
        <BrandLogo
          size="md"
          id="navbar-logo"
          className="hidden md:flex flex-shrink-0"
        />

        {/* =====================================================
            MOBILE HEADER: LOGO + MENU + USER
        ===================================================== */}
        <div className="md:hidden flex items-center justify-between w-full h-7">
          {/* Logo */}
          <BrandLogo
            size="sm"
            id="navbar-mobile-logo"
          />

          {/* Menu + User */}
          <div className="flex items-center gap-3">
            {/* Menu button */}
            <button
              id="navbar-mobile-menu-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="
                p-1
                text-black
                flex items-center justify-center
                hover:bg-[#F8F4E8]
                rounded-md
                cursor-pointer
                transition-colors
              "
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            {/* User icon with Dropdown (Host & Admin) */}
            <div ref={mobileUserMenuRef} className="relative">
              <button
                type="button"
                id="navbar-mobile-user-icon"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                title="Tài khoản"
                className={`
                  p-1
                  flex items-center justify-center
                  rounded-md
                  transition-colors
                  cursor-pointer
                  ${isUserMenuOpen ? 'bg-black text-white' : 'text-black hover:text-gray-500'}
                `}
                aria-expanded={isUserMenuOpen}
              >
                <User size={18} />
              </button>

              {/* Mobile User Dropdown Popover */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] py-1.5 px-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <ul className="space-y-0.5">
                    <UserMenuContent
                      isAuthenticated={isAuthenticated}
                      isHost={isHost}
                      isAdmin={isAdmin}
                      user={user}
                      onSelect={() => setIsUserMenuOpen(false)}
                      onLogout={handleLogout}
                    />
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            SEARCH DESKTOP + ACTIONS
        ===================================================== */}
        <div className="hidden md:flex items-center gap-2 flex-1">
          {/* Search form */}
          <form
            id="navbar-search-form"
            onSubmit={handleSearch}
            className="
              flex-1 max-w-lg
              flex items-center
              bg-[#F8F4E8]
              border border-[#CBD5E1]
              rounded-lg overflow-hidden
              focus-within:bg-white
              focus-within:border-black
              transition-all
            "
          >
            <input
              id="navbar-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm khách sạn..."
              className="
                flex-1 min-w-0
                px-4 py-2.5
                bg-transparent
                text-sm text-black
                placeholder-[#64748B]
                focus:outline-none
              "
              aria-label="Tìm kiếm theo tên cơ sở lưu trú"
            />
          </form>

          {/* Search button */}
          <button
            id="navbar-search-submit-btn"
            type="button"
            onClick={handleSearch}
            className="
              flex items-center justify-center
              px-4 py-2.5
              rounded-lg
              border border-black
              bg-black
              text-sm font-semibold text-white
              hover:bg-gray-800
              hover:border-gray-800
              transition-all
              cursor-pointer
              flex-shrink-0
            "
          >
            Tìm kiếm
          </button>

          {/* Filter button */}
          <button
            id="navbar-filter-btn"
            type="button"
            onClick={handleOpenFilter}
            className="
              flex items-center gap-2
              px-4 py-2.5
              rounded-lg
              border border-[#CBD5E1]
              bg-white
              text-sm font-semibold text-black
              hover:border-black
              hover:bg-[#F8F4E8]
              transition-all
              cursor-pointer
              flex-shrink-0
            "
          >
            <span>Bộ lọc</span>
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {/* =====================================================
            USER ICON DESKTOP + DROPDOWN (UL / LI)
        ===================================================== */}
        <div ref={userMenuRef} className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto relative">
          <button
            type="button"
            id="navbar-user-icon"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
            title="Đăng nhập"
            className={`
              w-9 h-9
              rounded-full
              flex items-center justify-center
              transition-all
              cursor-pointer
              ${
                isUserMenuOpen
                  ? 'bg-black text-white shadow-xs'
                  : 'text-[#64748B] hover:text-black hover:bg-[#F8F4E8]'
              }
            `}
          >
            <User size={20} />
          </button>

          {/* DROPDOWN MENU UL / LI */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#CBD5E1] py-1.5 px-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <ul className="space-y-0.5">
                <UserMenuContent
                  isAuthenticated={isAuthenticated}
                  isHost={isHost}
                  isAdmin={isAdmin}
                  user={user}
                  onSelect={() => setIsUserMenuOpen(false)}
                  onLogout={handleLogout}
                />
              </ul>
            </div>
          )}
        </div>

        {/* =====================================================
            MOBILE SEARCH: SEARCH INPUT + ICON
        ===================================================== */}
        <form
          id="navbar-mobile-search-form"
          onSubmit={handleSearch}
          className="md:hidden w-full"
        >
          <div className="
            flex items-center
            w-full h-[32px]
            bg-[#F8F4E8]
            border border-[#CBD5E1]
            rounded-md
            px-3
            focus-within:bg-white
            focus-within:border-black
            transition-all
          ">
            {/* Input */}
            <input
              id="navbar-mobile-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm khách sạn..."
              className="
                flex-1 min-w-0
                bg-transparent
                text-[11px] text-black
                placeholder-[#64748B]
                outline-none
              "
              aria-label="Tìm kiếm khách sạn"
            />

            {/* Search icon button */}
            <button
              type="submit"
              className="
                ml-2
                flex items-center justify-center
                text-black
                hover:text-gray-500
                cursor-pointer
                transition-colors
              "
              aria-label="Tìm kiếm"
            >
              <Search size={13} />
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          MOBILE EXPANDED MENU
        ===================================================== */}
      {isMobileMenuOpen && (
        <div className="
          md:hidden
          px-4
          pt-2 pb-3
          bg-white
          border-t border-[#E2E8F0]
          border-b border-[#CBD5E1]
          space-y-2
        ">
          {/* Filter */}
          <button
            id="navbar-mobile-filter-btn"
            type="button"
            onClick={handleOpenFilter}
            className="
              w-full
              flex items-center gap-2
              px-3 py-2.5
              rounded-lg
              text-sm font-semibold text-black
              hover:bg-[#F8F4E8]
              cursor-pointer
              transition-colors
            "
          >
            <SlidersHorizontal size={16} />
            Bộ lọc
          </button>

          <ul className="space-y-1 pt-1 border-t border-[#E2E8F0]">
            <UserMenuContent
              isAuthenticated={isAuthenticated}
              isHost={isHost}
              isAdmin={isAdmin}
              user={user}
              onSelect={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          </ul>
        </div>
      )}
    </nav>
  );
};
