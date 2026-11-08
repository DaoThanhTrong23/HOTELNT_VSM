import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HotelCard = ({ hotel }) => {
  if (!hotel) return null;

  const id = hotel.maCSLT ?? hotel.id;
  const name = hotel.tenCSLT ?? hotel.name;
  const type = hotel.tenLoai ?? hotel.type ?? 'Khách sạn';
  const thumbnail = hotel.duongDanAnh ?? hotel.thumbnail ?? hotel.hinhAnh?.[0]?.url;
  const address = hotel.diaChiChiTiet ?? hotel.address;
  const minPrice = hotel.gia ?? hotel.minPrice;
  const phone = hotel.lienHe?.soDienThoai ?? hotel.phone;
  const zalo = hotel.lienHe?.zalo ?? hotel.zalo;
  const amenities = hotel.tienIchNoiBat
    ? hotel.tienIchNoiBat.map((t) => (typeof t === 'string' ? t : t.tenTienIch))
    : (hotel.amenities || []);

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
            <div className="text-sm font-bold text-black">
              {formatCurrency(minPrice)}
              <span className="text-xs font-normal text-[#64748B]"> /đêm</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {phone && (
              <a
                href={`tel:${phone}`}
                title={`Gọi ${phone}`}
                className="p-2 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors"
              >
                <Phone size={14} />
              </a>
            )}
            {zalo && (
              <a
                href={zalo.startsWith('http') ? zalo : `https://zalo.me/${zalo.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                title="Nhắn Zalo"
                className="p-2 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors"
              >
                <MessageSquare size={14} />
              </a>
            )}
            <Link
              to={`/hotel/${id}`}
              className="px-3 py-1.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              Chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
