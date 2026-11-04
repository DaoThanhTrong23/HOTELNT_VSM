import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants/routes';

// Icon màn hình máy tính mặt buồn theo thiết kế Figma 404 (Desktop & Mobile)
const SadMonitorIcon = ({ className = 'w-24 h-22 sm:w-32 sm:h-28 text-black mx-auto' }) => (
  <svg
    viewBox="0 0 120 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Khung màn hình */}
    <rect
      x="12"
      y="10"
      width="96"
      height="66"
      rx="6"
      stroke="currentColor"
      strokeWidth="4"
      fill="#FFFFFF"
    />
    {/* Mắt trái hình chữ X */}
    <line x1="38" y1="31" x2="48" y2="41" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="48" y1="31" x2="38" y2="41" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    {/* Mắt phải hình chữ X */}
    <line x1="72" y1="31" x2="82" y2="41" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="82" y1="31" x2="72" y2="41" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    {/* Miệng buồn cong xuống */}
    <path
      d="M48 57 Q60 48 72 57"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cổ chân đế */}
    <path
      d="M53 76 L48 94 H72 L67 76"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      fill="#FFFFFF"
    />
    {/* Chân đế màn hình */}
    <line x1="36" y1="94" x2="84" y2="94" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main
      data-testid="not-found-page"
      className="min-h-screen bg-[#F8F4E8] flex flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Hình minh họa Desktop & Mobile khớp Figma */}
        <div className="relative inline-block">
          <SadMonitorIcon />
        </div>

        {/* Thông điệp lỗi 404 */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Lỗi 404</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Không tìm thấy trang
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] max-w-sm mx-auto leading-relaxed">
            Đường dẫn bạn đang truy cập không tồn tại, đã bị xóa hoặc cơ sở lưu trú này không còn khả dụng trên hệ thống.
          </p>
        </div>

        {/* Nhóm nút hành động: Quay lại trang chủ / Quay lại trang trước */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-black text-sm font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Quay lại trang trước
          </button>

          <Link
            to={ROUTES.HOME}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
};
