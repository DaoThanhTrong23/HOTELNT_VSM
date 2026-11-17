import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Star, X, ArrowRight } from 'lucide-react';
import { MAP_PINS, MOCK_HOTELS } from '../../data/mockHotels';
import { formatCurrency } from '../../utils/formatters';

/**
 * Component MapSection hiển thị bản đồ định vị các cơ sở lưu trú (theo Figma Tourist/Home)
 * Hỗ trợ TC_SEA_12 (hiển thị marker) và TC_SEA_13 (click marker hiện Info Card mini có ảnh, tên, giá, nút Xem chi tiết)
 */
export const MapSection = ({ pins = MAP_PINS, onPinClick }) => {
  const navigate = useNavigate();
  const [selectedPin, setSelectedPin] = useState(null);

  const selectedHotel = selectedPin
    ? MOCK_HOTELS.find((h) => h.id === selectedPin.id)
    : null;

  const handlePinClick = (pin) => {
    setSelectedPin(pin);
    if (onPinClick) onPinClick(pin);
  };

  return (
    <div
      className="relative w-full overflow-hidden border-b border-[#CBD5E1]"
      style={{ height: '420px', background: '#E8EAE6' }}
    >
      {/* Giả lập nền bản đồ */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200,210,195,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,210,195,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundColor: '#E8EAE6',
        }}
      />
      {/* Giả lập đường phố */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="35%" x2="100%" y2="38%" stroke="#bbb" strokeWidth="6" />
        <line x1="0" y1="60%" x2="100%" y2="65%" stroke="#bbb" strokeWidth="4" />
        <line x1="25%" y1="0" x2="28%" y2="100%" stroke="#bbb" strokeWidth="5" />
        <line x1="55%" y1="0" x2="58%" y2="100%" stroke="#bbb" strokeWidth="4" />
        <line x1="75%" y1="0" x2="78%" y2="100%" stroke="#bbb" strokeWidth="3" />
        <line x1="0" y1="20%" x2="100%" y2="25%" stroke="#ccc" strokeWidth="2" />
        <line x1="40%" y1="0" x2="42%" y2="100%" stroke="#ccc" strokeWidth="2" />
      </svg>

      {/* Label Google Maps */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-4xl font-bold text-[#9AA0A6] opacity-60 select-none">Google Maps</div>
          <div className="text-sm text-[#9AA0A6] opacity-50 mt-1">Tích hợp API bản đồ thực tế</div>
        </div>
      </div>

      {/* Map pins (TC_SEA_12) */}
      {pins.map((pin) => {
        const isSelected = selectedPin?.id === pin.id;
        return (
          <button
            key={pin.id}
            id={`map-pin-${pin.id}`}
            type="button"
            onClick={() => handlePinClick(pin)}
            className="absolute group cursor-pointer z-10"
            style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -100%)' }}
            title={pin.label}
          >
            {/* Pin icon */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${
                  isSelected ? 'bg-[#D97706] scale-125 ring-2 ring-black' : 'bg-black group-hover:scale-110'
                }`}
              >
                <MapPin size={16} className="text-white" fill="white" />
              </div>
              <div className={`w-2 h-2 rotate-45 -mt-1 shadow ${isSelected ? 'bg-[#D97706]' : 'bg-black'}`} />
            </div>
            {/* Tooltip tên */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[11px] font-semibold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#CBD5E1]">
              {pin.label}
            </div>
          </button>
        );
      })}

      {/* INFO CARD POPUP KHI CLICK VÀO PIN (TC_SEA_13 – FR-06) */}
      {selectedHotel && (
        <div
          id="map-info-card"
          className="absolute z-30 bottom-16 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 w-80 bg-white rounded-2xl p-3 shadow-2xl border border-[#CBD5E1] flex gap-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#CBD5E1] flex-shrink-0">
            <img
              src={selectedHotel.thumbnail}
              alt={selectedHotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1">
              <h4 className="font-bold text-xs text-black line-clamp-1 leading-tight">
                {selectedHotel.name}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                aria-label="Đóng popup"
                className="text-[#64748B] hover:text-black p-0.5 cursor-pointer -mr-1 -mt-1"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
              <Star size={11} className="fill-[#D97706] text-[#D97706]" />
              <span className="font-bold text-black">{selectedHotel.rating}</span>
              <span>• {selectedHotel.type}</span>
            </div>
            <div className="text-xs font-extrabold text-black mt-1">
              {formatCurrency(selectedHotel.minPrice)}{' '}
              <span className="text-[10px] font-normal text-[#64748B]">/ đêm</span>
            </div>
            <button
              id="map-info-view-detail-btn"
              type="button"
              onClick={() => navigate(`/hotel/${selectedHotel.id}`)}
              className="mt-1.5 w-full py-1.5 px-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Nút vị trí của tôi */}
      <button
        id="my-location-btn"
        type="button"
        className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-[#CBD5E1] hover:bg-[#F8F4E8] transition-colors cursor-pointer"
        title="Vị trí của tôi"
      >
        <Navigation size={18} className="text-[#1A73E8]" />
      </button>

      {/* Watermark Google Maps style */}
      <div className="absolute bottom-2 left-3 text-[10px] text-[#9AA0A6]">
        © 2026 Bản đồ Nha Trang – Dữ liệu mẫu
      </div>
    </div>
  );
};
