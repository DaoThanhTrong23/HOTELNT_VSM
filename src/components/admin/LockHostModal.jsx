import { Lock, X, AlertTriangle } from 'lucide-react';

export const LockHostModal = ({
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
          <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
            <Lock size={22} className="stroke-[2.2]" />
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
            Xác nhận khóa Host?
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Host sẽ không thể đăng nhập, quản lý cơ sở hoặc nhận đặt phòng mới cho đến khi được mở khóa.
          </p>
        </div>

        {/* Host Info Card */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xs font-bold italic shrink-0">
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

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            Hoạt động
          </span>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] flex items-center gap-2.5 text-xs text-[#DC2626] font-medium">
          <AlertTriangle size={16} className="shrink-0" />
          <span>Thao tác này có hiệu lực ngay sau khi xác nhận.</span>
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
            className="px-6 py-2.5 rounded-xl bg-[#DC2626] text-white text-xs sm:text-sm font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs"
          >
            Khóa Host
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockHostModal;
