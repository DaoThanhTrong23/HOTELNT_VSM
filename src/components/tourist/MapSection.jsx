import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { MAP_PINS } from '../../data/mockHotels';
import { listingService } from '../../services/listingService';

/**
 * Component MapSection hiển thị bản đồ định vị các cơ sở lưu trú (theo Figma Tourist/Home & SRS FR-05, API Row 4)
 * Gọi API GET /listings/map-markers với fallback về MAP_PINS
 */
export const MapSection = ({ pins: initialPins, onPinClick }) => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState(initialPins || MAP_PINS);

  useEffect(() => {
    if (initialPins) {
      setMarkers(initialPins);
      return;
    }

    let isMounted = true;
    const fetchMarkers = async () => {
      try {
        const res = await listingService.getMapMarkers();
        const data = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && data.length > 0) {
          setMarkers(data);
        }
      } catch (err) {
        console.warn('Lỗi khi tải map markers từ listingService, fallback MAP_PINS:', err);
      }
    };

    fetchMarkers();
    return () => {
      isMounted = false;
    };
  }, [initialPins]);

  const handlePinClick = (pin) => {
    if (onPinClick) {
      onPinClick(pin);
    } else {
      const pinId = pin.maCSLT || pin.id;
      navigate(`/hotel/${pinId}`);
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
      {markers.map((pin) => {
        const pinId = pin.maCSLT || pin.id;
        const pinName = pin.tenCSLT || pin.name;
        const pinTop = pin.top ?? (30 + ((Number(pinId) * 17) % 45));
        const pinLeft = pin.left ?? (20 + ((Number(pinId) * 23) % 60));

        return (
          <button
            key={pinId}
            id={`map-pin-${pinId}`}
            type="button"
            onClick={() => handlePinClick(pin)}
            style={{ top: `${pinTop}%`, left: `${pinLeft}%` }}
            className="absolute group transform -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none z-10"
          >
            {/* Pin Icon */}
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:bg-[#D97706] transition-all">
              <MapPin size={16} />
            </div>

            {/* Tooltip khi hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-black text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-20">
              <p className="font-bold">{pinName}</p>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black" />
            </div>
          </button>
        );
      })}

      {/* Nút chỉ đường / vị trí */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => alert(`Vị trí của bạn: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
                () => alert('Không thể lấy vị trí hiện tại.')
              );
            }
          }}
          className="bg-white p-2.5 rounded-xl border border-[#CBD5E1] shadow-md hover:bg-[#F8F4E8] text-black transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Định vị của tôi"
        >
          <Navigation size={15} />
          <span>Vị trí của tôi</span>
        </button>
      </div>
    </div>
  );
};

export default MapSection;
