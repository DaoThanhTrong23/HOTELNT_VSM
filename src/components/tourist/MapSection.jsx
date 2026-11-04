import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { MAP_PINS } from '../../data/mockHotels';

/**
 * Component MapSection hiển thị bản đồ định vị các cơ sở lưu trú (theo Figma Tourist/Home)
 * Khi BE/Maps API sẵn sàng, có thể hoán đổi ruột bên trong mà không ảnh hưởng HomePage
 */
export const MapSection = ({ pins = MAP_PINS, onPinClick }) => {
  const navigate = useNavigate();

  const handlePinClick = (pin) => {
    if (onPinClick) {
      onPinClick(pin);
    } else {
      navigate(`/hotel/${pin.id}`);
    }
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

      {/* Map pins */}
      {pins.map((pin) => (
        <button
          key={pin.id}
          id={`map-pin-${pin.id}`}
          type="button"
          onClick={() => handlePinClick(pin)}
          className="absolute group cursor-pointer"
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -100%)' }}
          title={pin.label}
        >
          {/* Pin icon */}
          <div className="relative flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={16} className="text-white" fill="white" />
            </div>
            <div className="w-2 h-2 bg-black rotate-45 -mt-1 shadow" />
          </div>
          {/* Tooltip tên */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[11px] font-semibold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#CBD5E1]">
            {pin.label}
          </div>
        </button>
      ))}

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
