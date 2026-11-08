import { XCircle, X } from 'lucide-react';

export const RejectListingModal = ({
  isOpen,
  hotel,
  displayImage,
  rejectReason,
  setRejectReason,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !hotel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] w-full max-w-sm sm:max-w-md p-6 overflow-hidden transform animate-in zoom-in-95 duration-200 space-y-4">
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#E11D48]">
            <XCircle size={24} className="stroke-[2.2]" />
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
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-black tracking-tight">
            Từ chối cơ sở
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Vui lòng nhập lý do để Host biết và điều chỉnh thông tin cơ sở trước khi gửi duyệt lại.
          </p>
        </div>

        {/* Facility Card Preview */}
        <div className="p-3 rounded-2xl bg-[#F0F7FF] border border-[#E0EEFF] flex items-center gap-3.5">
          <img
            src={displayImage}
            alt={hotel.tenCSLT}
            className="w-13 h-13 rounded-xl object-cover shrink-0 border border-[#CBD5E1]"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-black text-xs sm:text-sm truncate">
              {hotel.tenCSLT}
            </h4>
            <p className="text-xs text-[#64748B] truncate mt-0.5">
              {hotel.diaChiChiTiet} · {hotel.tenLoai}
            </p>
            <p className="text-xs text-[#64748B] truncate mt-0.5">
              Host: {hotel.chuCoSo?.hoTen || hotel.hoTen}
            </p>
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-black">
            Lý do từ chối
          </label>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối (ví dụ: Thiếu ảnh chứng nhận an toàn, giấy phép, giá phòng chưa rõ ràng...)"
            className="w-full resize-none rounded-xl border border-[#CBD5E1] bg-white p-3 text-xs text-black placeholder:text-[#94A3B8] outline-none focus:border-black transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm font-semibold text-black hover:bg-neutral-50 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-[#E11D48] text-white text-xs sm:text-sm font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectListingModal;
