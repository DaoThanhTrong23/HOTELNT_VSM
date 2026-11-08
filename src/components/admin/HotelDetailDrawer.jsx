import { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Waves,
  Wifi,
  Umbrella,
  Utensils,
  Car,
} from 'lucide-react';

const amenityIconMap = {
  'Hồ bơi': Waves,
  'Wifi miễn phí': Wifi,
  'Bãi biển riêng': Umbrella,
  'Nhà hàng': Utensils,
  'Đưa đón sân bay': Car,
  'Spa & Trị liệu': Sparkles,
};

const TypeBadge = ({ type }) => {
  switch (type) {
    case 'Hotel':
    case 'Khách sạn':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
          Hotel
        </span>
      );
    case 'Homestay':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          Homestay
        </span>
      );
    case 'Resort':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          Resort
        </span>
      );
    case 'Căn hộ':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">
          Căn hộ
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
          {type || 'Cơ sở'}
        </span>
      );
  }
};

export const HotelDetailDrawer = ({
  hotel,
  onClose,
  onApproveClick,
  onRejectClick,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!hotel) return null;

  const displayImages =
    hotel.media && hotel.media.length > 0
      ? hotel.media.map((m) => (typeof m === 'string' ? m : m.url))
      : [
          hotel.anhDaiDien ||
            hotel.thumbnail ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        ];

  const amenitiesList =
    hotel.tienIch && hotel.tienIch.length > 0
      ? hotel.tienIch.map((t) => (typeof t === 'string' ? t : t.tenTienIch))
      : ['Hồ bơi', 'Wifi miễn phí', 'Bãi biển riêng', 'Nhà hàng', 'Đưa đón sân bay', 'Spa & Trị liệu'];

  const formatVND = (val) => {
    if (!val && val !== 0) return '0đ';
    return Number(val).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <aside className="w-full lg:w-[440px] xl:w-[480px] bg-white border-l border-[#CBD5E1] flex flex-col h-full shrink-0 shadow-lg lg:shadow-none overflow-hidden z-30 transition-all duration-300">
      {/* PANEL HEADER: QUAY LẠI DANH SÁCH */}
      <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-bold text-black hover:text-neutral-600 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách</span>
        </button>
        <span className="text-[11px] font-semibold text-[#64748B]">
          ID: CSLT-{hotel.maCSLT}
        </span>
      </div>

      {/* PANEL SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* PHOTO GALLERY */}
        <div className="space-y-2">
          {/* Main Photo */}
          <div className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden bg-neutral-100 border border-[#E2E8F0]">
            <img
              src={displayImages[activeImageIndex] || displayImages[0]}
              alt={hotel.tenCSLT}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnails row */}
          {displayImages.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {displayImages.slice(1, 4).map((imgUrl, idx) => {
                const realIndex = idx + 1;
                const isActive = activeImageIndex === realIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(realIndex)}
                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                      isActive
                        ? 'border-black shadow-xs'
                        : 'border-transparent hover:border-[#CBD5E1]'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TITLE & BADGE */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-black text-black tracking-tight leading-tight">
              {hotel.tenCSLT}
            </h2>
            <TypeBadge type={hotel.tenLoai} />
          </div>
          <p className="flex items-center gap-1 text-xs text-[#64748B]">
            <MapPin size={13} className="text-[#64748B] shrink-0" />
            <span>{hotel.diaChiChiTiet || hotel.tenPhuong}</span>
          </p>
        </div>

        {/* SECTION: THÔNG TIN CƠ BẢN */}
        <div className="space-y-2.5 pt-2 border-t border-[#F1F5F9]">
          <h3 className="text-sm font-bold text-black">Thông tin cơ bản</h3>
          <div className="text-xs text-[#334155] space-y-1.5 leading-relaxed">
            <div className="flex">
              <span className="text-[#64748B] w-28 shrink-0">• Tên cơ sở:</span>
              <span className="font-semibold text-black">{hotel.tenCSLT}</span>
            </div>
            <div className="flex">
              <span className="text-[#64748B] w-28 shrink-0">• Loại hình:</span>
              <span className="font-semibold text-black">{hotel.tenLoai || 'Khách sạn'}</span>
            </div>
            <div className="flex">
              <span className="text-[#64748B] w-28 shrink-0">• Địa chỉ:</span>
              <span className="font-semibold text-black">{hotel.diaChiChiTiet || hotel.tenPhuong}</span>
            </div>
            <div className="flex">
              <span className="text-[#64748B] w-28 shrink-0">• Giá tham khảo:</span>
              <span className="font-bold text-[#2563EB]">
                {formatVND(hotel.giaThapNhat)} - {formatVND(hotel.giaCaoNhat)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0">
              <span className="text-[#64748B] w-28 shrink-0">• Mô tả:</span>
              <span className="text-[#475569] leading-relaxed flex-1">
                {hotel.moTa || 'Chưa có mô tả chi tiết cho cơ sở này.'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: TIỆN ÍCH */}
        <div className="space-y-2.5 pt-2 border-t border-[#F1F5F9]">
          <h3 className="text-sm font-bold text-black">Tiện ích</h3>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((item, idx) => {
              const IconComp = amenityIconMap[item] || Sparkles;
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]"
                >
                  <IconComp size={13} className="text-[#64748B]" />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: BẢN ĐỒ VỊ TRÍ */}
        <div className="space-y-2.5 pt-2 border-t border-[#F1F5F9]">
          <h3 className="text-sm font-bold text-black">Bản đồ vị trí</h3>
          <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-[#CBD5E1] bg-[#F1F5F9] shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=700&auto=format&fit=crop&q=80"
              alt="Bản đồ vị trí cơ sở"
              className="w-full h-full object-cover filter brightness-95 contrast-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="px-3.5 py-1.5 bg-white/95 backdrop-blur-xs rounded-full shadow-md border border-[#CBD5E1] flex items-center gap-1.5 text-xs font-bold text-black">
                <MapPin size={14} className="text-rose-600 fill-rose-600" />
                <span>
                  {hotel.viDo && hotel.kinhDo
                    ? `${hotel.viDo.toFixed(4)}, ${hotel.kinhDo.toFixed(4)}`
                    : 'Nha Trang, Khánh Hòa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL FOOTER: ACTION BUTTONS (FIGMA FRAME 16) */}
      <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center gap-3 shrink-0 shadow-sm">
        <button
          type="button"
          onClick={onRejectClick}
          className="flex-1 py-2.5 px-4 rounded-xl border border-[#FDA4AF] bg-white text-[#E11D48] font-bold text-xs sm:text-sm hover:bg-rose-50 active:scale-[0.98] transition cursor-pointer text-center"
        >
          Từ chối
        </button>

        <button
          type="button"
          onClick={onApproveClick}
          className="flex-1 py-2.5 px-4 rounded-xl bg-black text-white font-bold text-xs sm:text-sm hover:bg-neutral-800 active:scale-[0.98] transition cursor-pointer text-center shadow-xs"
        >
          Duyệt cơ sở
        </button>
      </div>
    </aside>
  );
};

export default HotelDetailDrawer;
