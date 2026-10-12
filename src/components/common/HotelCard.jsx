import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HotelCard = ({ hotel }) => {
  const {
    id,
    name,
    type = 'Khách sạn',
    thumbnail,
    address,
    minPrice,
    maxPrice,
    rating = 4.8,
    phone,
    zalo,
    amenities = [],
  } = hotel;

  return (
    <div className="bg-white rounded-2xl border border-[#CBD5E1] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
      {/* THUMBNAIL */}
      <div className="relative aspect-video bg-[#CBD5E1] overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#64748B] text-sm">
            Chưa có hình ảnh
          </div>
        )}
        <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {type}
        </span>
        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-black text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
          <Star size={12} className="fill-[#D97706] text-[#D97706]" />
          {rating}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-black mb-1.5 line-clamp-1 hover:text-[#D97706] transition-colors">
            <Link to={`/hotel/${id}`}>{name}</Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-3">
            <MapPin size={14} className="flex-shrink-0 text-[#64748B]" />
            <span className="truncate">{address || 'Nha Trang, Khánh Hòa'}</span>
          </div>

          {/* AMENITIES PILLS */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {amenities.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-[#F8F4E8] text-[#64748B] border border-[#CBD5E1]/60"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM PRICE & ACTIONS */}
        <div className="pt-3 border-t border-[#CBD5E1]/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#64748B] block">Giá từ:</span>
            <span className="font-bold text-base text-black">{formatCurrency(minPrice)}</span>
          </div>

          <div className="flex items-center gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                title="Gọi điện"
                className="w-8 h-8 rounded-full border border-[#CBD5E1] flex items-center justify-center text-black hover:bg-[#F8F4E8]"
              >
                <Phone size={14} />
              </a>
            )}
            {zalo && (
              <a
                href={`https://zalo.me/${zalo}`}
                target="_blank"
                rel="noreferrer"
                title="Chat Zalo"
                className="w-8 h-8 rounded-full border border-[#CBD5E1] flex items-center justify-center text-black hover:bg-[#F8F4E8]"
              >
                <MessageSquare size={14} />
              </a>
            )}
            <Link
              to={`/hotel/${id}`}
              className="px-3.5 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:opacity-85 transition-opacity"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
