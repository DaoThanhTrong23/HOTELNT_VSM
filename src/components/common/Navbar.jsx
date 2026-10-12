import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Palmtree, User, Menu, X } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const Navbar = ({ onOpenFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`${ROUTES.SEARCH}?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#CBD5E1] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-xl text-black flex-shrink-0">
          <Palmtree className="text-[#D97706]" size={28} />
          <span>Hotel Nha Trang</span>
        </Link>

        {/* SEARCH BAR & FILTER (DESKTOP) */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên cơ sở lưu trú..."
              className="w-full pl-5 pr-12 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-full text-sm text-black placeholder-[#64748B] focus:outline-hidden focus:border-black focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer"
            >
              <Search size={16} />
            </button>
          </form>

          {onOpenFilter && (
            <button
              onClick={onOpenFilter}
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#CBD5E1] bg-white text-sm font-semibold text-black hover:border-black hover:bg-[#F8F4E8] transition-all cursor-pointer flex-shrink-0"
            >
              <SlidersHorizontal size={16} />
              <span>Bộ lọc</span>
            </button>
          )}
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Link
            to={ROUTES.LOGIN}
            className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer"
          >
            Trở thành Host
          </Link>
          <Link
            to={ROUTES.ADMIN.LOGIN}
            title="Đăng nhập Quản trị viên"
            className="w-10 h-10 rounded-full border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-black hover:border-black transition-colors"
          >
            <User size={18} />
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-black hover:bg-[#F8F4E8]"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE EXPANDED MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white border-b border-[#CBD5E1] space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên cơ sở..."
              className="flex-1 px-4 py-2 bg-[#F8F4E8] border border-[#CBD5E1] rounded-lg text-sm"
            />
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
              Tìm
            </button>
          </form>
          <div className="flex flex-col gap-2 pt-2 border-t border-[#CBD5E1]">
            <Link
              to={ROUTES.LOGIN}
              className="block w-full py-2.5 text-center bg-black text-white rounded-lg font-semibold text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trở thành Host
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
