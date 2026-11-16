import { Unlock, X, CheckCircle2 } from 'lucide-react';

export const UnlockHostModal = ({
  isOpen,
  host,
  initials,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !host) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] w-full max-w-sm sm:max-w-md p-6 sm:p-7 overflow-hidden transform animate-in zoom-in-95 duration-200 space-y-4">
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
            <Unlock size={22} className="stroke-[2.2]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-black transition cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-black tracking-tight">
            Xác nhận mở khóa Host?
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Host sẽ có thể đăng nhập và hoạt động trở lại, bao gồm quản lý cơ sở và nhận đặt phòng mới.
          </p>
        </div>

        {/* Host Info Card */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[#0F172A] text-sm truncate">
                {host.hoTen || host.name}
              </h4>
              <p className="text-xs text-[#64748B] truncate mt-0.5">
                {host.email}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#DC2626] shrink-0">
            <span className="font-bold text-xs">+</span>
            Đã khóa
          </span>
        </div>

        {/* Success Note */}
        <div className="p-3.5 rounded-xl bg-[#E8F5E9] flex items-center gap-2.5 text-xs text-[#2E7D32] font-medium">
          <CheckCircle2 size={16} className="shrink-0 text-[#2E7D32]" />
          <span>Quyền truy cập sẽ được khôi phục ngay sau khi xác nhận.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm font-semibold text-[#334155] hover:bg-neutral-50 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-neutral-800 transition cursor-pointer shadow-xs"
          >
            Mở khóa Host
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockHostModal;
