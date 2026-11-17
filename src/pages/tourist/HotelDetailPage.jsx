import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin,
  Star,
  Phone,
  MessageSquare,
  Calendar,
  Navigation,
  Check,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MOCK_HOTELS } from '../../data/mockHotels';

/** Mở rộng mock data chi tiết: thêm images[], description, hostName, coordinates cho từng khách sạn */
const HOTEL_DETAIL_MAP = {
  '1': {
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Mường Thanh Hospitality Group',
    facebook: 'https://facebook.com/muongthanhhotelnhatrang',
    coordinates: { lat: 12.2388, lng: 109.1967 },
    updatedPriceDate: '2026-10-01T08:00:00Z',
    maxPrice: 3500000,
  },
  '2': {
    images: [
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Trần Thị Lan',
    facebook: 'https://facebook.com/chillhouse.nhatrang',
    coordinates: { lat: 12.2504, lng: 109.1933 },
    updatedPriceDate: '2026-10-10T10:00:00Z',
    maxPrice: 900000,
  },
  '3': {
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Amiana Resort Management',
    facebook: 'https://facebook.com/amianaresort',
    coordinates: { lat: 12.2890, lng: 109.2041 },
    updatedPriceDate: '2026-09-15T08:00:00Z',
    maxPrice: 8500000,
  },
  '4': {
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Lê Văn Quản',
    facebook: null,
    coordinates: { lat: 12.2434, lng: 109.1950 },
    updatedPriceDate: '2026-10-20T09:00:00Z',
    maxPrice: 2200000,
  },
  '5': {
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Nguyễn Hải Nam',
    facebook: null,
    coordinates: { lat: 12.2401, lng: 109.1960 },
    updatedPriceDate: '2026-10-05T08:00:00Z',
    maxPrice: 450000,
  },
  '6': {
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Phạm Minh Hùng',
    facebook: 'https://facebook.com/michelia.nhatrang',
    coordinates: { lat: 12.2550, lng: 109.1870 },
    updatedPriceDate: '2026-10-18T08:00:00Z',
    maxPrice: 1500000,
  },
  '7': {
    images: [
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Six Senses Management',
    facebook: 'https://facebook.com/sixsenses',
    coordinates: { lat: 12.3100, lng: 109.2200 },
    updatedPriceDate: '2026-09-01T08:00:00Z',
    maxPrice: 35000000,
  },
  '8': {
    images: [
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Trần Sao Đêm',
    facebook: null,
    coordinates: { lat: 12.2470, lng: 109.1910 },
    updatedPriceDate: '2026-11-01T08:00:00Z',
    maxPrice: 600000,
  },
  '9': {
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&auto=format&fit=crop&q=80',
    ],
    hostName: 'Nguyễn Văn Hải',
    facebook: 'https://facebook.com/vinhhaigreen',
    coordinates: { lat: 12.2700, lng: 109.1990 },
    updatedPriceDate: '2026-11-05T08:00:00Z',
    maxPrice: 950000,
  },
};

export const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setTimeout(() => {
      // Tìm đúng khách sạn theo id từ MOCK_HOTELS
      const base = MOCK_HOTELS.find((h) => h.id === id);
      const extra = HOTEL_DETAIL_MAP[id];

      if (base && extra) {
        setHotel({ ...base, ...extra });
      } else if (base) {
        // Fallback nếu không có extra detail
        setHotel({
          ...base,
          images: [base.thumbnail],
          hostName: 'Chủ cơ sở',
          facebook: null,
          coordinates: { lat: 12.2388, lng: 109.1967 },
          updatedPriceDate: new Date().toISOString(),
          maxPrice: base.minPrice * 2,
        });
      } else {
        setHotel(null);
      }
      setLoading(false);
    }, 400);
  }, [id]);

  const handlePrevImage = () =>
    setActiveImage((prev) => (prev === 0 ? hotel.images.length - 1 : prev - 1));
  const handleNextImage = () =>
    setActiveImage((prev) => (prev === hotel.images.length - 1 ? 0 : prev + 1));

  if (loading) return <LoadingSpinner />;
  if (!hotel)
    return (
      <div className="text-center py-24 text-[#64748B]">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-xl font-bold text-black">Không tìm thấy khách sạn</p>
        <p className="text-sm mt-2">ID #{id} không tồn tại trong hệ thống.</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* HEADER & RATING */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">
            {hotel.type}
          </span>
          <div className="flex items-center gap-1 text-sm font-bold text-black">
            <Star size={16} className="fill-[#D97706] text-[#D97706]" />
            <span>{hotel.rating}</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black">{hotel.name}</h1>
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <MapPin size={16} className="text-black flex-shrink-0" />
          <span>{hotel.address}</span>
        </div>
      </div>

      {/* IMAGE GALLERY + CAROUSEL (TC_DET_01 – FR-07) */}
      <div className="space-y-3">
        {/* Ảnh lớn chính */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#CBD5E1] border border-[#CBD5E1] shadow-sm">
          <img
            src={hotel.images[activeImage]}
            alt={`${hotel.name} - ảnh ${activeImage + 1}`}
            className="w-full h-full object-cover"
          />
          {hotel.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                aria-label="Ảnh trước"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow cursor-pointer transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextImage}
                aria-label="Ảnh tiếp theo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow cursor-pointer transition"
              >
                <ChevronRight size={20} />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {hotel.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeImage === idx ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          {hotel.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                activeImage === idx
                  ? 'border-black scale-105 shadow'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img src={img} alt={`thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* MAIN DETAILS & CONTACT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: Mô tả + Tiện ích + Bản đồ */}
        <div className="lg:col-span-2 space-y-8">
          {/* MÔ TẢ (TC_DET_01) */}
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
            <h2 className="text-xl font-bold text-black">Giới thiệu tổng quan</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">{hotel.description}</p>
            {hotel.distanceKm && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F4E8] border border-[#CBD5E1] text-xs font-semibold text-black">
                <Navigation size={12} className="text-[#D97706]" />
                Cách trung tâm: {hotel.distanceKm} km
              </div>
            )}
          </div>

          {/* TIỆN ÍCH (TC_DET_02) */}
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
            <h2 className="text-xl font-bold text-black">Tiện ích có sẵn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotel.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-black">
                  <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center flex-shrink-0">
                    <Check size={14} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BẢN ĐỒ VỊ TRÍ (FR-05) */}
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
            <h2 className="text-xl font-bold text-black">Vị trí trên bản đồ</h2>
            <div className="h-64 rounded-2xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-sm border border-[#CBD5E1]">
              <div className="text-center space-y-1">
                <MapPin size={32} className="mx-auto text-[#D97706]" />
                <p className="font-semibold text-black">{hotel.name}</p>
                <p className="text-xs">{hotel.address}</p>
                <p className="text-xs text-[#94A3B8]">
                  {hotel.coordinates.lat.toFixed(4)}, {hotel.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Giá + Liên hệ (TC_DET_03, TC_DET_04) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] shadow-lg sticky top-28 space-y-6">
            {/* Khoảng giá */}
            <div>
              <span className="text-xs text-[#64748B] block mb-1">Khoảng giá tham khảo:</span>
              <div className="text-2xl font-black text-black">
                {formatCurrency(hotel.minPrice)}
                {hotel.maxPrice && hotel.maxPrice !== hotel.minPrice && (
                  <span className="text-lg font-bold"> – {formatCurrency(hotel.maxPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-2">
                <Calendar size={14} />
                <span>Cập nhật giá: {formatDate(hotel.updatedPriceDate)}</span>
              </div>
            </div>

            {/* Chủ cơ sở */}
            <div className="p-4 rounded-2xl bg-[#F8F4E8] border border-[#CBD5E1] space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Building size={14} />
                <span>Đại diện cơ sở:</span>
              </div>
              <p className="font-bold text-sm text-black">{hotel.hostName}</p>
            </div>

            {/* NÚT LIÊN HỆ TRỰC TIẾP */}
            <div className="space-y-3 pt-2">
              {/* TC_DET_03: Gọi Hotline */}
              {hotel.phone && (
                <a
                  href={`tel:${hotel.phone}`}
                  id="contact-call-btn"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-85 transition-opacity"
                >
                  <Phone size={18} />
                  <span>Gọi Hotline ({hotel.phone})</span>
                </a>
              )}

              {/* TC_DET_04: Chat Zalo */}
              {hotel.zalo && (
                <a
                  href={`https://zalo.me/${hotel.zalo}`}
                  id="contact-zalo-btn"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#0068FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <MessageSquare size={18} />
                  <span>Nhắn tin qua Zalo</span>
                </a>
              )}

              {/* Facebook */}
              {hotel.facebook && (
                <a
                  href={hotel.facebook}
                  id="contact-facebook-btn"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#CBD5E1] text-black font-semibold text-sm hover:bg-[#F8F4E8] transition-colors"
                >
                  <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Xem trang Facebook</span>
                </a>
              )}
            </div>

            <p className="text-[11px] text-[#64748B] text-center leading-relaxed">
              * Hệ thống WebApp hỗ trợ liên hệ trực tiếp, không thu phí hoa hồng đặt phòng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
