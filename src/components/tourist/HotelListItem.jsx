import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Component hiển thị thông tin khách sạn dạng list item theo Figma
 * Layout: ảnh bên trái, chi tiết và nút hành động bên phải
 */
export const HotelListItem = ({ hotel }) => {
  const { id, name, type, address, thumbnail, minPrice, rating, phone, zalo, description } = hotel;

  return (
    <div className="bg-white rounded-2xl border border-[#CBD5E1] overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
      {/* Ảnh thumbnail */}
      <div className="relative sm:w-64 sm:flex-shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-[#CBD5E1]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#64748B] text-sm">
            Chưa có ảnh
          </div>
        )}
        <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {type}
        </span>
      </div>

      {/* Thông tin */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          {/* Tên + Rating */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-base text-black leading-snug hover:text-[#D97706] transition-colors line-clamp-2">
              <Link to={`/hotel/${id}`}>{name}</Link>
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0 bg-[#F8F4E8] px-2 py-1 rounded-lg">
              <Star size={13} className="fill-[#D97706] text-[#D97706]" />
              <span className="text-xs font-bold text-black">{rating}</span>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <MapPin size={13} className="flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>

          {/* Mô tả ngắn */}
          {description && (
            <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Bottom: Giá + Nút */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#CBD5E1]/60">
          <div>
            <span className="text-xs text-[#64748B]">Giá từ:</span>
            <div className="font-bold text-base text-black">
              {formatCurrency(minPrice)}
              <span className="text-xs font-normal text-[#64748B]"> / đêm</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                title="Gọi điện"
                className="w-8 h-8 rounded-full border border-[#CBD5E1] flex items-center justify-center text-black hover:bg-[#F8F4E8] transition-colors"
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
                className="w-8 h-8 rounded-full border border-[#CBD5E1] flex items-center justify-center text-black hover:bg-[#F8F4E8] transition-colors"
              >
                <MessageSquare size={14} />
              </a>
            )}
            <Link
              to={`/hotel/${id}`}
              id={`view-detail-${id}`}
              className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:opacity-85 transition-opacity"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
