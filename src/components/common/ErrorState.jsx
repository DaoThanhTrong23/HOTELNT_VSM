import { AlertTriangle } from 'lucide-react';

export const ErrorState = ({
  title = 'Đã xảy ra sự cố',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
  actionText = 'Thử lại',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-[#CBD5E1] shadow-xs max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-[#F4A9A9] text-[#DC2626] flex items-center justify-center mb-4">
        <AlertTriangle size={32} />
      </div>
      <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
      <p className="text-sm text-[#64748B] mb-6 leading-relaxed">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-[#DC2626] text-white hover:opacity-85 transition-opacity cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
