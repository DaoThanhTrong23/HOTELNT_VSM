import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, User, Menu, X } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

/**
 * Navbar Tourist
 * Figma layout (Desktop): [LOGO] [Search input──────] [Tìm kiếm] [Bộ lọc ▼] [User icon]
 * prop onOpenFilter: callback mở Filter Popup (dùng ở SearchResultsPage)
 */
export const Navbar = ({ onOpenFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isSearchPage = location.pathname === ROUTES.SEARCH;

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

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#CBD5E1] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

        {/* ── LOGO ─────────────────────────────────────────────────── */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 font-black text-lg text-black flex-shrink-0 tracking-tight"
          id="navbar-logo"
        >
          {/* Icon thay thế Palmtree (đã deprecated) */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#D97706]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#D97706" opacity="0.15"/>
            <path d="M8 17l1.5-4.5L6 11l4-1 2-5 2 5 4 1-3.5 1.5L16 17l-4-2-4 2z" fill="#D97706"/>
          </svg>
          <span>LOGO</span>
        </Link>

        {/* ── SEARCH + ACTIONS (DESKTOP) ────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 flex-1">
          {/* Search form */}
          <form
            id="navbar-search-form"
            onSubmit={handleSearch}
            className="flex-1 max-w-lg flex items-center bg-[#F8F4E8] border border-[#CBD5E1] rounded-lg overflow-hidden focus-within:bg-white focus-within:border-black transition-all"
          >
            <input
              id="navbar-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="flex-1 px-4 py-2.5 bg-transparent text-sm text-black placeholder-[#64748B] focus:outline-none"
              aria-label="Tìm kiếm theo tên cơ sở lưu trú"
            />
          </form>

          {/* Tìm kiếm button */}
          <button
            id="navbar-search-submit-btn"
            type="button"
            onClick={handleSearch}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-sm font-semibold text-black hover:border-black hover:bg-[#F8F4E8] transition-all cursor-pointer flex-shrink-0"
          >
            <Search size={15} />
            Tìm kiếm
          </button>

          {/* Bộ lọc button – luôn hiển thị, callback khi ở SearchPage */}
          <button
            id="navbar-filter-btn"
            type="button"
            onClick={() => {
              if (isSearchPage && onOpenFilter) {
                onOpenFilter();
              } else {
                navigate(ROUTES.SEARCH);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-sm font-semibold text-black hover:border-black hover:bg-[#F8F4E8] transition-all cursor-pointer flex-shrink-0"
          >
            <SlidersHorizontal size={15} />
            Bộ lọc ▾
          </button>
        </div>

        {/* ── USER ICON (DESKTOP) ───────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
          <Link
            to={ROUTES.ADMIN.LOGIN}
            id="navbar-user-icon"
            title="Đăng nhập"
            className="w-9 h-9 rounded-full border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-black hover:border-black transition-colors"
          >
            <User size={17} />
          </Link>
        </div>

        {/* ── MOBILE: Search icon + Menu toggle ────────────────────── */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <button
            id="navbar-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-black hover:bg-[#F8F4E8] cursor-pointer"
            aria-label="Mở menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE EXPANDED MENU ──────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 bg-white border-b border-[#CBD5E1] space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên cơ sở lưu trú..."
              className="flex-1 px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-lg text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-black text-white rounded-lg text-sm font-semibold cursor-pointer"
            >
              Tìm
            </button>
          </form>

          <div className="flex gap-2 pt-1">
            {isSearchPage && onOpenFilter && (
              <button
                type="button"
                onClick={() => { onOpenFilter(); setIsMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#CBD5E1] text-sm font-semibold text-black hover:bg-[#F8F4E8] cursor-pointer"
              >
                <SlidersHorizontal size={15} />
                Bộ lọc
              </button>
            )}
            <Link
              to={ROUTES.ADMIN.LOGIN}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#CBD5E1] text-sm font-semibold text-black hover:bg-[#F8F4E8]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={15} />
              Đăng nhập
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
