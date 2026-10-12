import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { ROUTES } from '../constants/routes';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F4E8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmptyState
          title="404 - Không tìm thấy trang"
          message="Đường dẫn bạn đang truy cập không tồn tại hoặc cơ sở lưu trú này đã bị ẩn khỏi hệ thống."
          actionText="Quay lại trang chủ"
          onAction={() => window.location.href = ROUTES.HOME}
        />
      </div>
    </div>
  );
};
