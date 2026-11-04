import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MapPin, Minus, Plus } from 'lucide-react';
import { NHA_TRANG_MAP_BOUNDS } from '../../../../constants/enums';
import { coordinateError, errorId, fieldId, roundCoordinate } from './listingFormModel';
import { Field, INPUT_CLASS, INPUT_ERROR_CLASS, INPUT_OK_CLASS, ReadOnlyField } from './formFields';
import { useGoogleMaps } from './useGoogleMaps';

// Dev-only Map ID required by AdvancedMarkerElement; production needs a real Map ID.
const MAP_ID = 'DEMO_MAP_ID';

const readNumber = (value) => (typeof value === 'function' ? value() : value);
const parse = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? Number.NaN : Number(trimmed);
};

export const MapStep = ({ latitude, longitude, error, bounds, readOnly = false, onChange }) => {
  const mapStatus = useGoogleMaps();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const latestRef = useRef({});
  const [query, setQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const lat = parse(latitude);
  const lng = parse(longitude);
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng);
  const { latMin, latMax, lngMin, lngMax } = bounds;

  const emitPosition = (nextLat, nextLng) =>
    onChange({ latitude: String(roundCoordinate(nextLat)), longitude: String(roundCoordinate(nextLng)) });

  // Map listeners are created once; they read the newest point and callback from here.
  useEffect(() => {
    latestRef.current = { lat, lng, hasPoint, emitPosition };
  });

  useEffect(() => {
    if (mapStatus !== 'ready' || !containerRef.current) return undefined;
    const maps = window.google.maps;
    const start = latestRef.current.hasPoint
      ? { lat: latestRef.current.lat, lng: latestRef.current.lng }
      : NHA_TRANG_MAP_BOUNDS.DEFAULT_CENTER;

    const map = new maps.Map(containerRef.current, {
      center: start,
      zoom: 15,
      mapId: MAP_ID,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      restriction: { latLngBounds: { north: latMax, south: latMin, east: lngMax, west: lngMin }, strictBounds: false },
    });
    const marker = new maps.marker.AdvancedMarkerElement({
      map,
      position: start,
      gmpDraggable: !readOnly,
      title: 'Vị trí cơ sở',
    });

    const emitLatLng = (latLng) => {
      if (!latLng) return;
      latestRef.current.emitPosition(readNumber(latLng.lat), readNumber(latLng.lng));
    };
    const listeners = readOnly
      ? []
      : [
          marker.addListener('dragend', (event) => emitLatLng(event?.latLng ?? marker.position)),
          map.addListener('click', (event) => emitLatLng(event?.latLng)),
        ];

    mapRef.current = map;
    markerRef.current = marker;
    return () => {
      listeners.forEach((listener) => listener?.remove?.());
      marker.map = null;
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapStatus, readOnly, latMin, latMax, lngMin, lngMax]);

  // Typing coordinates moves the pin.
  useEffect(() => {
    if (!hasPoint || !markerRef.current) return;
    markerRef.current.position = { lat, lng };
    mapRef.current?.panTo?.({ lat, lng });
  }, [hasPoint, lat, lng]);

  const zoomBy = (delta) => {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom?.() ?? 15) + delta);
  };

  const handleSearch = async () => {
    const text = query.trim();
    if (!text || mapStatus !== 'ready') return;
    setIsSearching(true);
    setSearchMessage('');
    try {
      const geocoder = new window.google.maps.Geocoder();
      const { results } = await geocoder.geocode({
        address: text,
        region: 'vn',
        bounds: { north: latMax, south: latMin, east: lngMax, west: lngMin },
      });
      const location = results?.[0]?.geometry?.location;
      if (location) emitPosition(readNumber(location.lat), readNumber(location.lng));
      else setSearchMessage('Không tìm thấy địa chỉ');
    } catch {
      setSearchMessage('Không tìm thấy địa chỉ');
    } finally {
      setIsSearching(false);
    }
  };

  const bothFilled = String(latitude).trim() !== '' && String(longitude).trim() !== '';
  const message = error || (bothFilled ? coordinateError({ latitude, longitude }, bounds) : null);
  const isValid = bothFilled && !message;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-black">Vị trí trên bản đồ</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Kéo ghim đỏ đến đúng vị trí cơ sở. Chỉ nhận vị trí trong khu vực Nha Trang.
        </p>
      </div>

      {!readOnly && mapStatus === 'ready' && (
        <div className="space-y-1.5">
          <label htmlFor="listing-map-search" className="text-xs font-medium text-black">
            Tìm địa chỉ
          </label>
          <div className="flex gap-2">
            <input
              id="listing-map-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Ví dụ: 12 Trần Phú, Nha Trang"
              className={`${INPUT_CLASS} ${INPUT_OK_CLASS}`}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 min-h-[44px] rounded-lg border border-[#CBD5E1] bg-white text-sm hover:bg-[#F8F4E8] cursor-pointer disabled:opacity-40"
            >
              {isSearching ? 'Đang tìm...' : 'Tìm'}
            </button>
          </div>
          {searchMessage && <p className="text-xs text-[#DC2626]">{searchMessage}</p>}
        </div>
      )}

      {mapStatus === 'ready' ? (
        <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden border border-[#CBD5E1]">
          <div ref={containerRef} data-testid="listing-map" className="absolute inset-0" />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <button type="button" aria-label="Phóng to bản đồ" onClick={() => zoomBy(1)} className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center cursor-pointer">
              <Plus size={16} />
            </button>
            <button type="button" aria-label="Thu nhỏ bản đồ" onClick={() => zoomBy(-1)} className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center cursor-pointer">
              <Minus size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          data-testid="map-fallback"
          className="h-40 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center gap-2 text-center px-4"
        >
          <MapPin size={22} className="text-[#64748B]" />
          <p className="text-sm text-[#64748B]">
            {mapStatus === 'loading'
              ? 'Đang tải bản đồ...'
              : 'Không tải được bản đồ. Bạn vẫn có thể nhập vĩ độ, kinh độ.'}
          </p>
        </div>
      )}

      {readOnly ? (
        <div className="grid grid-cols-2 gap-4">
          <ReadOnlyField label="Vĩ độ (lat)" value={String(latitude)} />
          <ReadOnlyField label="Kinh độ (lng)" value={String(longitude)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Field path="latitude" label="Vĩ độ (lat)">
            <input
              id={fieldId('latitude')}
              type="text"
              inputMode="decimal"
              value={latitude}
              onChange={(event) => onChange({ latitude: event.target.value })}
              aria-invalid={message ? 'true' : 'false'}
              aria-describedby={message ? errorId('toaDo') : undefined}
              className={`${INPUT_CLASS} ${message ? INPUT_ERROR_CLASS : INPUT_OK_CLASS}`}
            />
          </Field>
          <Field path="longitude" label="Kinh độ (lng)">
            <input
              id={fieldId('longitude')}
              type="text"
              inputMode="decimal"
              value={longitude}
              onChange={(event) => onChange({ longitude: event.target.value })}
              aria-invalid={message ? 'true' : 'false'}
              aria-describedby={message ? errorId('toaDo') : undefined}
              className={`${INPUT_CLASS} ${message ? INPUT_ERROR_CLASS : INPUT_OK_CLASS}`}
            />
          </Field>
        </div>
      )}

      {message && (
        <p id={errorId('toaDo')} className="text-xs text-[#DC2626]">
          {message}
        </p>
      )}
      {isValid && (
        <p className="text-xs text-[#15803D] flex items-center gap-1.5">
          <CheckCircle2 size={14} />
          <span>Vị trí hợp lệ — nằm trong khu vực Nha Trang</span>
        </p>
      )}
    </div>
  );
};
