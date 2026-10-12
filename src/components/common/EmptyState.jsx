import { SearchX } from 'lucide-react';

export const EmptyState = ({
  title = 'Không tìm thấy dữ liệu',
  message = 'Không tìm thấy cơ sở phù hợp. Vui lòng thử lại với từ khóa khác hoặc xóa bớt bộ lọc.',
  actionText = 'Xóa bớt bộ lọc',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-[#CBD5E1] shadow-sm max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-[#FEE8A8] text-[#B45309] flex items-center justify-center mb-4">
        <SearchX size={32} />
      </div>
      <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
      <p className="text-sm text-[#64748B] mb-6 leading-relaxed">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-black text-black hover:bg-black hover:text-white transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
