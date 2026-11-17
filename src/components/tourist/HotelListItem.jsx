import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { formatCurrency, resolveHotelImageUrl, FALLBACK_HOTEL_IMAGE, DEFAULT_HOTEL_IMAGES } from '../../utils/formatters';
import { buildTelLink, buildZaloLink, buildFacebookLink } from '../../utils/contactLinks';
import { ZaloLogo, FacebookLogo } from '../common/icons/BrandIcons';

/**
 * Component hiển thị thông tin khách sạn dạng list item theo Figma
 * Layout: ảnh bên trái, chi tiết và nút hành động bên phải
 */
export const HotelListItem = ({ hotel }) => {
  if (!hotel) return null;

  const id = hotel.maCSLT ?? hotel.id;
  const name = hotel.tenCSLT ?? hotel.name;
  const address = hotel.diaChiChiTiet ?? hotel.address;
  const thumbnail = hotel.duongDanAnh ?? hotel.thumbnail ?? hotel.hinhAnh?.[0]?.url;
  const minPrice = hotel.gia ?? hotel.minPrice;
  const rawPhone = hotel.lienHe?.soDienThoai ?? hotel.phone;
  const rawZalo = hotel.lienHe?.zalo ?? hotel.zalo ?? rawPhone;
  const rawFacebook = hotel.lienHe?.facebook ?? hotel.facebook;
  const description = hotel.moTa ?? hotel.description;

  const telLink = buildTelLink(rawPhone);
  const zaloLink = buildZaloLink(rawZalo);
  const facebookLink = buildFacebookLink(rawFacebook);
  const imageUrl = resolveHotelImageUrl(thumbnail, id);

  return (
    <div className="bg-white rounded-2xl border border-[#CBD5E1] overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
      {/* Ảnh thumbnail */}
      <div className="relative sm:w-64 sm:flex-shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-[#CBD5E1]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              const idx = typeof id === 'number' ? Math.abs(id) : 0;
              e.currentTarget.src = DEFAULT_HOTEL_IMAGES[idx % DEFAULT_HOTEL_IMAGES.length] || FALLBACK_HOTEL_IMAGE;
            }}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#64748B] text-sm">
            Chưa có ảnh
          </div>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          {/* Tên */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-base text-black leading-snug hover:text-[#D97706] transition-colors line-clamp-2">
              <Link to={`/hotel/${id}`}>{name}</Link>
            </h3>
          </div>

          {/* Địa chỉ */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <MapPin size={13} className="flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>

          {/* Mô tả ngắn */}
          {description && (
            <p className="text-xs text-[#64748B] line-clamp-2 pt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Giá & Nút hành động */}
        <div className="pt-4 mt-3 border-t border-[#CBD5E1]/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-[#64748B] block">Giá chỉ từ</span>
            <div className="text-base font-bold text-black">
              {formatCurrency(minPrice)}
              <span className="text-xs font-normal text-[#64748B]"> /đêm</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {telLink && (
              <a
                href={telLink}
                title={`Gọi ${rawPhone}`}
                className="p-2 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors flex items-center justify-center"
              >
                <Phone size={14} />
              </a>
            )}
            {zaloLink && (
              <a
                href={zaloLink}
                target="_blank"
                rel="noreferrer"
                title="Nhắn Zalo"
                className="p-1.5 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors flex items-center justify-center"
              >
                <ZaloLogo size={18} />
              </a>
            )}
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noreferrer"
                title="Fanpage Facebook"
                className="p-1.5 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors flex items-center justify-center"
              >
                <FacebookLogo size={18} />
              </a>
            )}
            <Link
              to={`/hotel/${id}`}
              className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListItem;
