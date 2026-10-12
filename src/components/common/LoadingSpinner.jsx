import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-[#64748B]">
      <Loader2 className="animate-spin text-[#D97706] mb-3" size={36} />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};
