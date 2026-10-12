import { Outlet, Link } from 'react-router-dom';
import { Palmtree } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8F4E8] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* BRAND HEADER */}
      <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-2xl text-black mb-8">
        <Palmtree className="text-[#D97706]" size={32} />
        <span>Hotel Nha Trang</span>
      </Link>

      {/* CARD CONTAINER */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#CBD5E1] shadow-xl p-8">
        <Outlet />
      </div>

      {/* FOOTER */}
      <p className="mt-8 text-xs text-[#64748B]">
        Cần hỗ trợ? Liên hệ <a href="mailto:support@hotelnt.com" className="text-black font-semibold underline">support@hotelnt.com</a>
      </p>
    </div>
  );
};
