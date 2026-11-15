import { CheckCircle2, X } from 'lucide-react';

export const SuccessState = ({
  title = 'Thao tác thành công!',
  message = 'Yêu cầu của bạn đã được ghi nhận và xử lý thành công.',
  actionText = 'Tiếp tục',
  onAction,
  secondaryActionText,
  onSecondaryAction,
  icon: Icon = CheckCircle2,
  isModal = false,
  isOpen = true,
  onClose,
  closeText = 'Đóng',
  className = '',
  testId = 'success-state',
}) => {
  if (isModal && !isOpen) return null;

  const content = (
    <div
      data-testid={testId}
      className={`flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white rounded-2xl border border-[#CBD5E1] shadow-xs max-w-md w-full mx-auto my-6 ${className}`}
    >
      {/* Icon trạng thái thành công xanh lá */}
      <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-4 shrink-0">
        <Icon size={34} aria-hidden="true" />
      </div>

      {/* Tiêu đề & thông điệp */}
      <h3 className="text-lg font-bold text-black mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-[#64748B] mb-6 leading-relaxed max-w-sm">{message}</p>

      {/* Nhóm nút hành động */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-lg font-medium text-sm border border-[#CBD5E1] bg-white text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer"
          >
            {closeText}
          </button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-lg font-medium text-sm border border-[#CBD5E1] bg-white text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer"
          >
            {secondaryActionText}
          </button>
        )}

        {onAction && actionText && (
          <button
            type="button"
            onClick={onAction}
            className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 rounded-lg font-semibold text-sm bg-[#15803D] text-white hover:bg-green-800 transition-colors cursor-pointer shadow-xs"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );

  // Modal thông báo thành công popup
  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-[#64748B] hover:text-black hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Component tiện ích mở nhanh dạng Modal thông báo thành công
export const SuccessModal = (props) => <SuccessState {...props} isModal={true} />;
