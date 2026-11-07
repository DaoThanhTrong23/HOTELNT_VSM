import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, User, Menu, X } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useFilter } from '../../context/FilterContext';

/**
 * Navbar Tourist
 *
 * Desktop:
 * [LOGO] [Search input] [Tìm kiếm] [Bộ lọc ▾] [User]
 *
 * Mobile:
 * [LOGO]                 [Menu] [User]
 * [Search input             Search icon]
 *
 * Nút lọc luôn hiển thị popup bộ lọc theo thiết kế
 */
export const Navbar = ({ onOpenFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const filterContext = useFilter();

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
        <Link
          to={ROUTES.HOME}
          className="
            hidden md:flex
            items-center gap-2
            font-black text-lg text-black
            flex-shrink-0 tracking-tight
          "
          id="navbar-logo"
        >
          <span>HOTELNT</span>
        </Link>

        {/* =====================================================
            MOBILE HEADER: LOGO + MENU + USER
        ===================================================== */}
        <div className="md:hidden flex items-center justify-between w-full h-7">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            id="navbar-mobile-logo"
            className="font-black text-base text-black tracking-tight"
          >
            HOTELNT
          </Link>

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

            {/* User icon */}
            <Link
              to={ROUTES.ADMIN.LOGIN}
              id="navbar-mobile-user-icon"
              title="Đăng nhập"
              className="
                text-black
                flex items-center justify-center
                hover:text-gray-500
                transition-colors
              "
            >
              <User size={17} />
            </Link>
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
              placeholder="Tìm kiếm khách sạn..."
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
              flex items-center gap-1.5
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
            <Search size={15} />
            Tìm kiếm
          </button>

          {/* Filter button */}
          <button
            id="navbar-filter-btn"
            type="button"
            onClick={handleOpenFilter}
            className="
              flex items-center gap-1.5
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
            <SlidersHorizontal size={15} />
            Bộ lọc ▾
          </button>
        </div>

        {/* =====================================================
            USER ICON DESKTOP
        ===================================================== */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
          <Link
            to={ROUTES.ADMIN.LOGIN}
            id="navbar-user-icon"
            title="Đăng nhập"
            className="
              w-9 h-9
              rounded-full
              flex items-center justify-center
              text-[#64748B]
              hover:text-black
              hover:bg-[#F8F4E8]
              transition-colors
            "
          >
            <User size={22} />
          </Link>
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

          {/* Login */}
          <Link
            to={ROUTES.ADMIN.LOGIN}
            id="navbar-mobile-login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="
              flex items-center gap-2
              px-3 py-2.5
              rounded-lg
              text-sm font-semibold text-black
              hover:bg-[#F8F4E8]
              transition-colors
            "
          >
            <User size={16} />
            Đăng nhập
          </Link>
        </div>
      )}
    </nav>
  );
};
