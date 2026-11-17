import { Check, X } from 'lucide-react';

export const SaveConfigSuccessModal = ({
  isOpen,
  title = 'Lưu cấu hình thành công!',
  message = 'Các thiết lập SEO và AI đã được cập nhật vào hệ thống.',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] w-full max-w-sm sm:max-w-md p-7 overflow-hidden transform animate-in zoom-in-95 duration-200 text-center space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-black transition cursor-pointer p-1"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto shadow-md">
          <Check size={28} className="stroke-[3]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-black tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm font-semibold text-black hover:bg-neutral-50 transition cursor-pointer"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-neutral-800 transition cursor-pointer shadow-xs"
          >
            Tiếp tục chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveConfigSuccessModal;
