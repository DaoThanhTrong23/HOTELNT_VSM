import { CheckCircle2, X, Info } from 'lucide-react';
import { FALLBACK_HOTEL_IMAGE } from '../../utils/formatters';

export const ApproveListingModal = ({
  isOpen,
  hotel,
  displayImage,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !hotel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] w-full max-w-sm sm:max-w-md p-6 overflow-hidden transform animate-in zoom-in-95 duration-200 space-y-4">
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
            <CheckCircle2 size={24} className="stroke-[2.2]" />
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
            Duyệt cơ sở này?
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Xác nhận duyệt thông tin cơ sở lưu trú do Host gửi lên hệ thống.
          </p>
        </div>

        {/* Facility Card Preview */}
        <div className="p-3 rounded-2xl bg-[#F0F7FF] border border-[#E0EEFF] flex items-center gap-3.5">
          <img
            src={displayImage || FALLBACK_HOTEL_IMAGE}
            alt={hotel.tenCSLT}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_HOTEL_IMAGE;
            }}
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

        {/* Info callout */}
        <div className="p-3.5 rounded-2xl bg-[#F0F7FF] border border-[#E0EEFF] flex items-start gap-3">
          <Info size={18} className="text-[#2563EB] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-black">
              Cơ sở sẽ được duyệt và hiển thị
            </p>
            <p className="text-[#64748B] leading-relaxed">
              {hotel.tenCSLT} sẽ xuất hiện trên hệ thống để khách tìm kiếm và đặt phòng. Host sẽ nhận được thông báo phê duyệt.
            </p>
          </div>
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
            className="px-5 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-neutral-800 transition cursor-pointer shadow-xs"
          >
            Xác nhận duyệt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveListingModal;
