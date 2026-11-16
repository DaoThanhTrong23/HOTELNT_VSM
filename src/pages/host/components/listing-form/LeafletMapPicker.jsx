import { useEffect, useRef, useState } from 'react';
import { Plus, Minus, RotateCcw, MapPin, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NHA_TRANG_MAP_BOUNDS } from '../../../../constants/enums';

// Custom Google Red Pin Icon
const createRedPinIcon = () =>
  L.divIcon({
    className: 'host-listing-pin-wrapper',
    html: `
      <div style="position: relative; width: 32px; height: 42px; transform: translate(-50%, -100%); cursor: grab;">
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="#EA4335"/>
          <path d="M16 1C7.716 1 1 7.716 1 16C1 27.2 16 40.5 16 40.5C16 40.5 31 27.2 31 16C31 7.716 24.284 1 16 1Z" stroke="#B31412" stroke-width="1.2"/>
          <circle cx="16" cy="15" r="6" fill="#FFFFFF"/>
          <circle cx="16" cy="15" r="3" fill="#B31412"/>
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [0, 0],
  });

export const LeafletMapPicker = ({
  latitude,
  longitude,
  readOnly = false,
  bounds,
  onSelect,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [addressQuery, setAddressQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const hasValidPoint =
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= bounds.latMin &&
    numLat <= bounds.latMax &&
    numLng >= bounds.lngMin &&
    numLng <= bounds.lngMax;

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    try {
      if (!mapRef.current) {
        const centerLat = hasValidPoint
          ? numLat
          : NHA_TRANG_MAP_BOUNDS.DEFAULT_CENTER.lat;
        const centerLng = hasValidPoint
          ? numLng
          : NHA_TRANG_MAP_BOUNDS.DEFAULT_CENTER.lng;

        const map = L.map(containerRef.current, {
          center: [centerLat, centerLng],
          zoom: 15,
          zoomControl: false,
          maxBounds: [
            [bounds.latMin - 0.05, bounds.lngMin - 0.05],
            [bounds.latMax + 0.05, bounds.lngMax + 0.05],
          ],
        });

        // Use Google Maps tiles (roadmap)
        L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          attribution: '&copy; Google Maps / OpenStreetMap',
          maxZoom: 20,
          subdomains: ['0', '1', '2', '3'],
        }).addTo(map);

        // Red Pin Marker
        const marker = L.marker([centerLat, centerLng], {
          icon: createRedPinIcon(),
          draggable: !readOnly,
          title: 'Vị trí cơ sở lưu trú (Kéo để chỉnh vị trí)',
        }).addTo(map);

        // Marker drag event
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          if (onSelectRef.current) {
            onSelectRef.current(pos.lat, pos.lng);
          }
        });

        // Map click event
        map.on('click', (e) => {
          if (readOnly) return;
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          if (onSelectRef.current) {
            onSelectRef.current(lat, lng);
          }
        });

        mapRef.current = map;
        markerRef.current = marker;

        // Invalidate size after container settles
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      }
    } catch (err) {
      console.warn('Lỗi khởi tạo Leaflet map:', err);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          /* ignore */
        }
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when lat/lng inputs change externally
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    if (hasValidPoint) {
      markerRef.current.setLatLng([numLat, numLng]);
      mapRef.current.panTo([numLat, numLng]);
    }
  }, [numLat, numLng, hasValidPoint]);

  const zoomBy = (delta) => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + delta);
    }
  };

  const resetCenter = () => {
    if (mapRef.current && markerRef.current) {
      const center = NHA_TRANG_MAP_BOUNDS.DEFAULT_CENTER;
      markerRef.current.setLatLng([center.lat, center.lng]);
      mapRef.current.setView([center.lat, center.lng], 15);
      if (onSelectRef.current) {
        onSelectRef.current(center.lat, center.lng);
      }
    }
  };

  // Search address via Nominatim OpenStreetMap API
  const handleSearchAddress = async (e) => {
    e?.preventDefault();
    const query = addressQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchMsg('');

    try {
      const fullQuery = query.toLowerCase().includes('nha trang')
        ? query
        : `${query}, Nha Trang, Khánh Hòa`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        fullQuery
      )}&viewbox=${bounds.lngMin},${bounds.latMax},${bounds.lngMax},${
        bounds.latMin
      }&bounded=1&limit=1`;

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);

        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([foundLat, foundLng]);
          mapRef.current.setView([foundLat, foundLng], 16);
        }
        if (onSelectRef.current) {
          onSelectRef.current(foundLat, foundLng);
        }
        setSearchMsg(`Đã tìm thấy: ${data[0].display_name.split(',')[0]}`);
      } else {
        setSearchMsg('Không tìm thấy địa chỉ trong khu vực Nha Trang');
      }
    } catch {
      setSearchMsg('Không thể tìm kiếm địa chỉ lúc này');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Search Address Toolbar */}
      {!readOnly && (
        <div className="space-y-1">
          <label htmlFor="leaflet-map-search" className="text-xs font-medium text-black">
            Tìm kiếm địa chỉ nhanh
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="leaflet-map-search"
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchAddress();
                  }
                }}
                placeholder="Ví dụ: 12 Trần Phú, Phạm Văn Đồng, Chợ Đầm..."
                className="w-full px-3.5 py-2 pl-9 rounded-lg border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black placeholder-[#94A3B8] outline-none focus:border-black transition"
              />
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchAddress}
              disabled={isSearching}
              className="px-4 py-2 rounded-lg bg-black text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 transition cursor-pointer"
            >
              {isSearching ? 'Đang tìm...' : 'Tìm'}
            </button>
          </div>
          {searchMsg && (
            <p
              className={`text-xs ${
                searchMsg.startsWith('Đã')
                  ? 'text-emerald-700 font-medium'
                  : 'text-red-500'
              }`}
            >
              {searchMsg}
            </p>
          )}
        </div>
      )}

      {/* Real Interactive Map Canvas */}
      <div className="relative h-72 sm:h-84 rounded-xl overflow-hidden border border-[#CBD5E1] shadow-2xs">
        <div
          ref={containerRef}
          data-testid="leaflet-interactive-map"
          className="w-full h-full z-10"
          style={{ minHeight: '288px' }}
        />

        {/* Map Hint Overlay */}
        <div className="absolute top-2.5 right-2.5 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] shadow-xs text-[11px] font-medium text-[#1E293B] pointer-events-none flex items-center gap-1.5">
          <MapPin size={13} className="text-red-600 shrink-0" />
          <span>Click hoặc kéo ghim đỏ để chọn vị trí</span>
        </div>

        {/* Map Controls */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label="Phóng to"
            onClick={() => zoomBy(1)}
            className="w-8 h-8 rounded-lg bg-white border border-[#CBD5E1] shadow flex items-center justify-center text-black hover:bg-[#F8F4E8] cursor-pointer transition"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            aria-label="Thu nhỏ"
            onClick={() => zoomBy(-1)}
            className="w-8 h-8 rounded-lg bg-white border border-[#CBD5E1] shadow flex items-center justify-center text-black hover:bg-[#F8F4E8] cursor-pointer transition"
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            aria-label="Về trung tâm Nha Trang"
            title="Về trung tâm Nha Trang"
            onClick={resetCenter}
            className="w-8 h-8 rounded-lg bg-white border border-[#CBD5E1] shadow flex items-center justify-center text-black hover:bg-[#F8F4E8] cursor-pointer transition mt-1"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
