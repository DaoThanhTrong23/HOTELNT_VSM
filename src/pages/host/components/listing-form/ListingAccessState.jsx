import { Link } from 'react-router-dom';
import { SearchX, ShieldOff } from 'lucide-react';
import { ROUTES } from '../../../../constants/routes';

const COPY = {
  forbidden: {
    icon: ShieldOff,
    title: 'Bạn không có quyền truy cập',
    message: 'Bạn không có quyền chỉnh sửa cơ sở lưu trú này.',
  },
  'not-found': {
    icon: SearchX,
    title: 'Không tìm thấy cơ sở lưu trú.',
    message: 'Cơ sở có thể đã bị xóa hoặc đường dẫn không đúng.',
  },
};

// Figma 13.5 (403) and the not-found variant.
export const ListingAccessState = ({ variant }) => {
  const copy = COPY[variant] ?? COPY['not-found'];
  const Icon = copy.icon;
  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#CBD5E1] p-8 text-center space-y-3">
      <div className="w-14 h-14 rounded-full bg-[#F1F5F9] text-[#475569] mx-auto flex items-center justify-center">
        <Icon size={24} />
      </div>
      <h1 className="text-lg font-semibold text-black">{copy.title}</h1>
      <p className="text-sm text-[#64748B]">{copy.message}</p>
      <Link
        to={ROUTES.HOST.DASHBOARD}
        className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        Về danh sách cơ sở
      </Link>
    </div>
  );
};
