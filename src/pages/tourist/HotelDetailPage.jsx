import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Phone,
  MessageSquare,
  Calendar,
  Navigation,
  Check,
  Building,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Giả lập load chi tiết khách sạn
    setLoading(true);
    setTimeout(() => {
      setHotel({
        id,
        name: 'Khách sạn Mường Thanh Luxury Nha Trang',
        type: 'Khách sạn 5 sao',
        address: '60 Trần Phú, Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa',
        minPrice: 1200000,
        maxPrice: 3500000,
        updatedPriceDate: '2026-10-01T08:00:00Z',
        hostName: 'Nguyễn Văn Quản Lý',
        phone: '02583898888',
        zalo: '0905123456',
        facebook: 'https://facebook.com/muongthanhhotelnhatrang',
        rating: 4.9,
        distanceFromUser: 1.8, // km
        description:
          'Khách sạn Mường Thanh Luxury Nha Trang tọa lạc ngay tại vị trí đắc địa nhất trên đường Trần Phú, hướng nhìn trọn vẹn toàn cảnh Vịnh Nha Trang. Với tiện nghi sang trọng chuẩn 5 sao và đội ngũ phục vụ chuyên nghiệp.',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1000&auto=format&fit=crop&q=80',
        ],
        amenities: [
          'Hồ bơi vô cực ngắm biển',
          'Buffet sáng Á - Âu',
          'Wifi tốc độ cao',
          'Bãi đỗ xe ô tô miễn phí',
          'Trung tâm thể hình / Gym',
          'Phục vụ phòng 24/7',
        ],
        coordinates: { lat: 12.2388, lng: 109.1967 },
      });
      setLoading(false);
    }, 400);
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!hotel) return <div className="text-center py-16">Không tìm thấy khách sạn</div>;

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

      {/* IMAGE GALLERY CAROUSEL (FR-16) */}
      <div className="space-y-4">
        <div className="aspect-21/9 rounded-3xl overflow-hidden bg-[#CBD5E1] border border-[#CBD5E1] shadow-xs">
          <img
            src={hotel.images[activeImage]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {hotel.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                activeImage === idx ? 'border-black scale-105' : 'border-transparent opacity-70'
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* MAIN DETAILS & CONTACT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: OVERVIEW, AMENITIES, MAP */}
        <div className="lg:col-span-2 space-y-10">
          {/* MÔ TẢ */}
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
            <h2 className="text-xl font-bold text-black">Giới thiệu tổng quan</h2>
            <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
          </div>

          {/* TIỆN ÍCH */}
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
            <h2 className="text-xl font-bold text-black">Tiện ích nổi bật</h2>
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

          {/* BẢN ĐỒ & KHOẢNG CÁCH (FR-05, FR-06) */}
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">Vị trí trên bản đồ</h2>
              {hotel.distanceFromUser && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F4E8] text-xs font-semibold text-black border border-[#CBD5E1]">
                  <Navigation size={12} className="text-[#D97706]" />
                  <span>Cách bạn: {hotel.distanceFromUser} km (Đường thực tế)</span>
                </div>
              )}
            </div>

            <div className="h-72 rounded-2xl bg-[#CBD5E1] flex items-center justify-center text-[#64748B] text-sm border border-[#CBD5E1]">
              [Tích hợp Google Maps API: Lat: {hotel.coordinates.lat}, Lng: {hotel.coordinates.lng}]
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRICE & DIRECT CONTACT ACTIONS */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-[#CBD5E1] shadow-lg sticky top-28 space-y-6">
            <div>
              <span className="text-xs text-[#64748B] block mb-1">Khoảng giá tham khảo:</span>
              <div className="text-2xl font-black text-black">
                {formatCurrency(hotel.minPrice)} - {formatCurrency(hotel.maxPrice)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-2">
                <Calendar size={14} />
                <span>Ngày cập nhật giá: {formatDate(hotel.updatedPriceDate)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F4E8] border border-[#CBD5E1] space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Building size={14} />
                <span>Đại diện cơ sở:</span>
              </div>
              <p className="font-bold text-sm text-black">{hotel.hostName}</p>
            </div>

            {/* ACTION BUTTONS (FR-08, FR-09) */}
            <div className="space-y-3 pt-2">
              {hotel.phone && (
                <a
                  href={`tel:${hotel.phone}`}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-85 transition-opacity"
                >
                  <Phone size={18} />
                  <span>Gọi Hotline ({hotel.phone})</span>
                </a>
              )}

              {hotel.zalo && (
                <a
                  href={`https://zalo.me/${hotel.zalo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#0068FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <MessageSquare size={18} />
                  <span>Nhắn tin qua Zalo</span>
                </a>
              )}

              {hotel.facebook && (
                <a
                  href={hotel.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#CBD5E1] text-black font-semibold text-sm hover:bg-[#F8F4E8] transition-colors"
                >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
