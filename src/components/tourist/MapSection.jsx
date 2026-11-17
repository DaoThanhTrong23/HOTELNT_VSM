import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Plus, Minus, RotateCcw, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listingService } from '../../services/listingService';
import { adminService } from '../../services/adminService';
import { MAP_PINS } from '../../data/mockHotels';
import {
  formatCurrency,
  resolveHotelImageUrl,
  DEFAULT_HOTEL_IMAGES,
  FALLBACK_HOTEL_IMAGE,
} from '../../utils/formatters';

const NHA_TRANG_CENTER = [12.2451, 109.1943];
const DEFAULT_ZOOM = 13;

// Các tọa độ thực tế đẹp tại TP. Nha Trang cho các cơ sở chưa có tọa độ GPS trong CSDL
const SPREAD_LOCATIONS = [
  { lat: 12.2388, lng: 109.1967, name: 'Trung tâm Nha Trang' },
  { lat: 12.2451, lng: 109.1943, name: 'Đường Trần Phú' },
  { lat: 12.2400, lng: 109.1950, name: 'Bãi biển Nha Trang' },
  { lat: 12.2500, lng: 109.1900, name: 'Khu vực Chợ Đầm' },
  { lat: 12.2700, lng: 109.2100, name: 'Đường Phạm Văn Đồng' },
  { lat: 12.2350, lng: 109.1980, name: 'Khu phố Tây Tuệ Tĩnh' },
  { lat: 12.2280, lng: 109.2010, name: 'Khu vực Cầu Đá' },
  { lat: 12.2150, lng: 109.2180, name: 'Đảo Hòn Tre (Vinpearl)' },
  { lat: 12.2580, lng: 109.1850, name: 'Tháp Bà Ponagar' },
  { lat: 12.2850, lng: 109.2050, name: 'Bến du thuyền Ana Marina' },
  { lat: 12.2420, lng: 109.1920, name: 'Đường Nguyễn Thị Minh Khai' },
  { lat: 12.2480, lng: 109.1960, name: 'Quảng trường 2/4' },
];

/**
 * Quét toàn bộ cơ sở từ CSDL, API du khách, API admin và local drafts
 */
const fetchAllSystemFacilities = async () => {
  const facilityMap = new Map();

  const addFacility = (item) => {
    if (!item) return;
    const id = item.maCSLT || item.id;
    if (!id) return;
    const existing = facilityMap.get(id);
    facilityMap.set(id, {
      ...existing,
      ...item,
      maCSLT: id,
      id,
      tenCSLT: item.tenCSLT || item.name || existing?.tenCSLT || 'Cơ sở lưu trú',
      tenLoai: item.tenLoai || item.type || existing?.tenLoai || 'Khách sạn',
      gia: item.gia || item.price || existing?.gia || null,
      latitude: item.latitude ?? item.viDo ?? item.lat ?? existing?.latitude,
      longitude: item.longitude ?? item.kinhDo ?? item.lng ?? existing?.longitude,
      duongDanAnh: item.duongDanAnh || item.thumbnail || item.url || existing?.duongDanAnh || '',
      trangThai: item.trangThai || item.status || existing?.trangThai || 'APPROVED',
    });
  };

  // 1. Quét map markers từ API du khách
  try {
    const markerRes = await listingService.getMapMarkers();
    const markers =
      markerRes?.markers || markerRes?.items || markerRes?.data || (Array.isArray(markerRes) ? markerRes : []);
    markers.forEach(addFacility);
  } catch (err) {
    console.warn('Lỗi lấy map-markers:', err);
  }

  // 2. Quét toàn bộ listings công khai từ /listings?limit=50
  try {
    const listRes = await listingService.searchListings({ limit: 50 });
    const items = listRes?.items || listRes?.listings || (Array.isArray(listRes) ? listRes : []);
    items.forEach(addFacility);
  } catch (err) {
    console.warn('Lỗi searchListings:', err);
  }

  // 3. Nếu đang ở portal Admin (hoặc có token), quét thêm toàn bộ cơ sở của admin
  try {
    const adminRes = await adminService.getListings({ limit: 50 });
    const adminItems = adminRes?.items || (Array.isArray(adminRes) ? adminRes : []);
    adminItems.forEach(addFacility);
  } catch {
    /* ignore unauthenticated admin endpoint */
  }

  // 4. Quét localStorage để bổ sung các cơ sở host mới tạo hoặc bản nháp (nếu có)
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('hotelnt_custom_media_') || key.startsWith('host_listings'))) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const idMatch = key.replace('hotelnt_custom_media_', '');
                if (idMatch && idMatch !== 'draft' && !facilityMap.has(Number(idMatch))) {
                  addFacility({
                    maCSLT: Number(idMatch),
                    tenCSLT: `Cơ sở #${idMatch}`,
                    tenLoai: 'Khách sạn',
                    duongDanAnh: parsed[0]?.dataUrl || parsed[0]?.url || '',
                  });
                }
              }
            } catch {
              /* ignore parse errors */
            }
          }
        }
      }
    }
  } catch {
    /* ignore storage errors */
  }

  // Nếu API chưa có dữ liệu nào, fallback sang MAP_PINS mẫu
  if (facilityMap.size === 0) {
    MAP_PINS.forEach((pin, idx) => {
      addFacility({
        maCSLT: pin.id || idx + 1,
        tenCSLT: pin.name || pin.label,
        tenLoai: pin.type || 'Khách sạn',
        gia: pin.price || null,
        latitude: SPREAD_LOCATIONS[idx % SPREAD_LOCATIONS.length].lat,
        longitude: SPREAD_LOCATIONS[idx % SPREAD_LOCATIONS.length].lng,
      });
    });
  }

  return Array.from(facilityMap.values());
};

/**
 * Component MapSection hiển thị bản đồ tương tác
 * với các dấu chỉ vị trí (Pins) của TẤT CẢ cơ sở lưu trú hiện có trong hệ thống.
 */
export const MapSection = ({
  pins: initialPins,
  onPinClick,
  height,
  className = '',
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [markers, setMarkers] = useState(initialPins || []);

  // 1. Tải toàn bộ danh sách cơ sở lưu trú hiện có
  useEffect(() => {
    if (initialPins && initialPins.length > 0) {
      setMarkers(initialPins);
      return;
    }

    let isMounted = true;
    fetchAllSystemFacilities().then((allListings) => {
      if (isMounted && allListings && allListings.length > 0) {
        setMarkers(allListings);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialPins]);

  // 2. Khởi tạo bản đồ OpenStreetMap qua Leaflet (100% tin cậy, không bị Brave Shields chặn)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: NHA_TRANG_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      // Lớp bản đồ OpenStreetMap chuẩn (ổn định, không bị CORS, không bị adblocker chặn)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Đảm bảo Leaflet cập nhật kích thước khung nhìn khi render hoặc container resize
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (ro) ro.disconnect();
    };
  }, []);

  // 3. Render markers dấu chỉ vị trí đỏ (Google Map Pins) lên bản đồ
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const bounds = [];

    markers.forEach((pin, index) => {
      let lat = Number(pin.latitude ?? pin.viDo ?? pin.lat);
      let lng = Number(pin.longitude ?? pin.kinhDo ?? pin.lng);

      // Nếu không có tọa độ số hợp lệ, dùng vị trí mẫu trong Nha Trang
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        const fallback = SPREAD_LOCATIONS[index % SPREAD_LOCATIONS.length];
        lat = fallback.lat;
        lng = fallback.lng;
      }

      bounds.push([lat, lng]);

      const pinId = pin.maCSLT || pin.id;
      const pinName = pin.tenCSLT || pin.name || pin.label || 'Cơ sở lưu trú';
      const pinType = pin.tenLoai || pin.type || 'Khách sạn';
      const pinPrice = pin.gia ? formatCurrency(pin.gia) : '';
      const pinImg = resolveHotelImageUrl(pin.duongDanAnh || pin.thumbnail, index) || FALLBACK_HOTEL_IMAGE;

      // Google Red Pin SVG Icon ("dấu chỉ vị trí" giống Google Maps trong trang chi tiết)
      const customIcon = L.divIcon({
        className: 'google-map-marker-wrapper',
        html: `
          <div class="google-pin-container" title="${pinName}">
            <div class="google-pin-badge">
              <span class="badge-text">${pinPrice || pinName}</span>
            </div>
            <div class="google-pin-svg-wrap">
              <svg class="google-pin-svg" width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="#EA4335"/>
                <path d="M16 1C7.716 1 1 7.716 1 16C1 27.2 16 40.5 16 40.5C16 40.5 31 27.2 31 16C31 7.716 24.284 1 16 1Z" stroke="#B31412" stroke-width="1.2"/>
                <circle cx="16" cy="15" r="6" fill="#FFFFFF"/>
                <circle cx="16" cy="15" r="3" fill="#B31412"/>
              </svg>
              <div class="google-pin-ground-shadow"></div>
            </div>
          </div>
        `,
        iconSize: [120, 68],
        iconAnchor: [60, 64],
        popupAnchor: [0, -66],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Nội dung Popup chi tiết khi click marker
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const popupHtml = `
        <div class="google-map-popup">
          <div class="popup-image-container">
            <img src="${pinImg}" alt="${pinName}" onerror="this.onerror=null;this.src='${FALLBACK_HOTEL_IMAGE}';" />
            <span class="popup-badge">${pinType}</span>
          </div>
          <div class="popup-content">
            <h4 class="popup-title">${pinName}</h4>
            ${pinPrice ? `<p class="popup-price">${pinPrice} <span class="popup-unit">/ đêm</span></p>` : ''}
            <div class="popup-actions">
              <button class="popup-btn-detail" data-id="${pinId}">
                Xem chi tiết phòng
              </button>
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="popup-btn-dir" title="Chỉ đường trên Google Maps">
                Chỉ đường ↗
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        className: 'google-leaflet-popup',
      });

      marker.on('popupopen', () => {
        const btn = document.querySelector(`.popup-btn-detail[data-id="${pinId}"]`);
        if (btn) {
          btn.onclick = () => {
            if (onPinClick) {
              onPinClick(pin);
            } else {
              navigate(`/hotel/${pinId}`);
            }
          };
        }
      });

      marker.on('click', () => {
        if (onPinClick) onPinClick(pin);
      });

      layer.addLayer(marker);
    });

    // Căn chỉnh bản đồ bao trọn các markers
    if (bounds.length > 0 && map) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, navigate, onPinClick]);

  // Điều khiển phóng to / thu nhỏ
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCenter = () => {
    mapInstanceRef.current?.flyTo(NHA_TRANG_CENTER, DEFAULT_ZOOM);
  };

  // Định vị vị trí người dùng
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([userLat, userLng], 15);
          L.circleMarker([userLat, userLng], {
            radius: 8,
            fillColor: '#2563EB',
            color: '#FFFFFF',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindPopup('<b>📍 Vị trí hiện tại của bạn</b>')
            .openPopup();
        }
      },
      () => {
        alert('Không thể xác định vị trí hiện tại của bạn.');
      }
    );
  };

  return (
    <div
      className={`relative w-full bg-[#F1F5F9] overflow-hidden ${
        height ? '' : 'h-[280px] sm:h-[360px] md:h-[440px] lg:h-[480px]'
      } ${className}`}
      style={height ? { height } : undefined}
    >
      {/* Container Leaflet Map */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Badge thông tin góc dưới trái: có max-w để không đè lên attribution Leaflet trên mobile */}
      <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-[400] bg-white/95 backdrop-blur-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-[#CBD5E1] shadow-md flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-black max-w-[calc(100%-110px)] sm:max-w-none">
        <MapPin size={13} className="text-[#EA4335] fill-[#EA4335] flex-shrink-0" />
        <span className="truncate">Bản đồ vị trí · {markers.length} CSLT tại Nha Trang</span>
      </div>

      {/* Floating Controls: Phóng to / Thu nhỏ / Reset / Định vị (tối ưu kích thước trên mobile) */}
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-[400] flex flex-col gap-1.5 sm:gap-2">
        <div className="bg-white rounded-xl shadow-md border border-[#E2E8F0] overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 hover:bg-neutral-100 text-neutral-800 transition cursor-pointer flex items-center justify-center border-b border-[#E2E8F0]"
            title="Phóng to"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 hover:bg-neutral-100 text-neutral-800 transition cursor-pointer flex items-center justify-center"
            title="Thu nhỏ"
          >
            <Minus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetCenter}
          className="bg-white p-2 sm:p-2.5 rounded-xl border border-[#E2E8F0] shadow-md hover:bg-neutral-100 text-neutral-800 transition cursor-pointer flex items-center justify-center"
          title="Về trung tâm Nha Trang"
        >
          <RotateCcw size={15} />
        </button>

        <button
          type="button"
          onClick={handleLocateMe}
          className="bg-white p-2 sm:px-3 sm:py-2 rounded-xl border border-[#E2E8F0] shadow-md hover:bg-[#F8F4E8] text-black transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Định vị của tôi"
        >
          <Navigation size={14} className="text-[#2563EB] flex-shrink-0" />
          <span className="hidden sm:inline">Vị trí của tôi</span>
        </button>
      </div>

      {/* Custom Styles cho Google Map Pins & Popup */}
      <style>{`
        .google-map-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .google-pin-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .google-pin-container:hover {
          transform: translateY(-5px) scale(1.1);
          z-index: 9999 !important;
        }
        .google-pin-badge {
          background-color: #0F172A;
          color: #FFFFFF;
          padding: 2.5px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          border: 1.5px solid #FFFFFF;
          white-space: nowrap;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
          transition: background-color 0.15s ease;
        }
        .google-pin-container:hover .google-pin-badge {
          background-color: #EA4335;
        }
        .google-pin-svg-wrap {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .google-pin-svg {
          filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
        }
        .google-pin-ground-shadow {
          position: absolute;
          bottom: -2px;
          width: 14px;
          height: 4px;
          background: rgba(0,0,0,0.35);
          border-radius: 50%;
          filter: blur(1.5px);
        }
        .google-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.25);
          border: 1px solid #E2E8F0;
        }
        .google-leaflet-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .google-map-popup {
          width: 240px;
        }
        .popup-image-container {
          position: relative;
          width: 100%;
          height: 120px;
          background: #F1F5F9;
        }
        .popup-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .popup-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          color: #FFFFFF;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }
        .popup-content {
          padding: 10px 12px 12px;
        }
        .popup-title {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .popup-price {
          margin: 4px 0 10px;
          font-size: 13px;
          font-weight: 800;
          color: #EA4335;
        }
        .popup-unit {
          font-size: 10px;
          font-weight: 500;
          color: #64748B;
        }
        .popup-actions {
          display: flex;
          gap: 6px;
        }
        .popup-btn-detail {
          flex: 1;
          padding: 7px 10px;
          background: #000000;
          color: #FFFFFF;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .popup-btn-detail:hover {
          background: #334155;
        }
        .popup-btn-dir {
          padding: 7px 10px;
          background: #FFFFFF;
          color: #000000;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          transition: background 0.15s ease;
        }
        .popup-btn-dir:hover {
          background: #F8F4E8;
        }
      `}</style>
    </div>
  );
};

export default MapSection;
