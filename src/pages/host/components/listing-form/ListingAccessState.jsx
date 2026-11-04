import { Link } from 'react-router-dom';
import { SearchX, ShieldOff } from 'lucide-react';
import { ROUTES } from '../../../../constants/routes';

const COPY = {
  forbidden: {
    icon: ShieldOff,
    title: 'Bạn không có quyền quản lí cơ sở này',
    message: 'Cơ sở này thuộc về tài khoản khác hoặc bạn chưa được cấp quyền.',
  },
  'not-found': {
    icon: SearchX,
    title: 'Không tìm thấy cơ sở lưu trú.',
    message: 'Cơ sở có thể đã bị xóa hoặc đường dẫn không đúng.',
  },
};

// Figma 13.5 (403) and the not-found variant.
export const ListingAccessState = ({ variant = 'forbidden' }) => {
  const isForbidden = variant === 'forbidden';
  const copy = COPY[variant] ?? COPY['not-found'];
  const Icon = copy.icon;

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#CBD5E1] p-8 text-center space-y-3">
        <div
          className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
            isForbidden ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#F1F5F9] text-[#64748B]'
          }`}
        >
          <Icon size={24} />
        </div>
        <h1 className="text-lg font-semibold text-black">{copy.title}</h1>
        <p className="text-sm text-[#64748B]">{copy.message}</p>
        <div className="pt-2">
          <Link
            to={ROUTES.HOST.DASHBOARD}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#475569] hover:text-black hover:underline transition-colors"
          >
            ← Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};
