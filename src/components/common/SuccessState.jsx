import { CheckCircle2 } from 'lucide-react';

export const SuccessState = ({
  title = 'Thao tác thành công!',
  message = 'Yêu cầu của bạn đã được ghi nhận và xử lý thành công.',
  actionText = 'Tiếp tục',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-[#CBD5E1] shadow-xs max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-4">
        <CheckCircle2 size={36} />
      </div>
      <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
      <p className="text-sm text-[#64748B] mb-6 leading-relaxed">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-[#15803D] text-white hover:opacity-85 transition-opacity cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
