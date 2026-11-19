import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, MapPin, Navigation } from 'lucide-react';
import { PRICE_LIMITS } from '../../constants/enums';
import {
  LOAI_HINH_OPTIONS,
  AMENITY_OPTIONS,
  PRICE_PRESETS,
  NHA_TRANG_WARDS,
  RADIUS_LIMITS,
  RADIUS_PRESETS,
  DISTANCE_OPTIONS,
  NEARBY_OPTIONS,
} from '../../constants/filters';
import { listingService } from '../../services/listingService';
import { formatCurrency } from '../../utils/formatters';

/**
 * Component Popup / Modal bộ lọc tìm kiếm theo đúng Figma & SRS FR-03, API_DESIGN Row 3:
 * - Loại hình cơ sở (Hotel, Resort, Homestay,...)
 * - Dropdown Phường/Xã TP. Nha Trang (maPhuong)
 * - Thanh chọn Bán kính khoảng cách km (radiusKm)
 * - Khoảng giá VNĐ/đêm
 * - Tiện ích (quy tắc AND)
 */
export const FilterPopup = ({
  isOpen,
  onClose,
  loaiHinh,
  setLoaiHinh,
  maPhuong,
  setMaPhuong,
  radiusKm = 0,
  setRadiusKm,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  amenities,
  toggleAmenity,
  distance,
  setDistance,
  nearby,
  toggleNearby,
  onReset,
  onApply,
}) => {
  const overlayRef = useRef(null);
  const [wards, setWards] = useState(NHA_TRANG_WARDS);
  const [propertyTypes, setPropertyTypes] = useState(LOAI_HINH_OPTIONS);
  const [amenityOptions, setAmenityOptions] = useState(AMENITY_OPTIONS);

  useEffect(() => {
    let isMounted = true;
    listingService.getFilterOptions()
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.wards) && data.wards.length > 0) {
          const mappedWards = [
            { id: '', name: 'Tất cả phường/xã' },
            ...data.wards.map((w) => ({ id: String(w.maPhuong), name: w.tenPhuong })),
          ];
          setWards(mappedWards);
        }
        if (Array.isArray(data.propertyTypes) && data.propertyTypes.length > 0) {
          const mappedTypes = ['Tất cả', ...data.propertyTypes.map((t) => t.tenLoai)];
          setPropertyTypes(mappedTypes);
        }
        if (Array.isArray(data.amenities) && data.amenities.length > 0) {
          const mappedAmenities = data.amenities.map((a) => a.tenTienIch);
          setAmenityOptions(mappedAmenities);
        }
      })
      .catch((err) => {
        console.warn('Không tải được filter-options từ server, dùng danh mục mặc định:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Đóng khi click ra ngoài backdrop
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Đóng khi nhấn phím Esc
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bộ lọc tìm kiếm"
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#CBD5E1]">
          <div>
            <h2 className="font-bold text-base text-black">Bộ lọc tìm kiếm</h2>
            <p className="text-xs text-[#64748B]">Tùy chỉnh tiêu chí tìm kiếm cơ sở lưu trú</p>
          </div>
          <button
            id="close-filter-popup-btn"
            type="button"
            onClick={onClose}
            aria-label="Đóng bộ lọc"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F8F4E8] hover:text-black transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung cuộn */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* ── 1. Loại hình cơ sở (FR-03) ── */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Loại hình cơ sở
            </label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((opt) => (
                <button
                  key={opt}
                  id={`loai-hinh-${opt.replace(/\s/g, '-')}`}
                  type="button"
                  onClick={() => setLoaiHinh(opt)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${loaiHinh === opt
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-[#64748B] border-[#CBD5E1] hover:border-black hover:text-black'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. Khu vực / Phường Xã TP. Nha Trang (FR-03, Row 3 & 10) ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="filter-ward-select" className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <MapPin size={13} className="text-[#64748B]" />
                Khu vực / Phường Xã (TP. Nha Trang)
              </label>
              {maPhuong && (
                <button
                  type="button"
                  onClick={() => setMaPhuong('')}
                  className="text-[11px] text-[#64748B] hover:text-black underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
            </div>

            <div className="relative">
              <select
                id="filter-ward-select"
                value={maPhuong || ''}
                onChange={(e) => setMaPhuong(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black transition cursor-pointer font-medium"
              >
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-[#64748B]">
                ▼
              </span>
            </div>
          </div>

          {/* ── 3. Bán kính khoảng cách km (radiusKm - FR-03, Row 3) ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="filter-radius-km" className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Navigation size={13} className="text-[#64748B]" />
                Bán kính khoảng cách (km)
              </label>
              <span className="text-xs font-semibold text-black bg-[#F8F4E8] px-2.5 py-0.5 rounded-full border border-[#CBD5E1]/60">
                {radiusKm > 0 ? `Trong vòng ${radiusKm} km` : 'Tất cả (Không giới hạn)'}
              </span>
            </div>

            <div className="space-y-2">
              <input
                id="filter-radius-km"
                type="range"
                min={RADIUS_LIMITS.MIN_KM}
                max={RADIUS_LIMITS.MAX_KM}
                step={1}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-black cursor-pointer bg-neutral-200"
              />
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>Tất cả</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>15 km</span>
                <span>20 km</span>
              </div>
            </div>

            {/* Presets bán kính nhanh */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setRadiusKm(preset.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                    radiusKm === preset.value
                      ? 'bg-black text-white border-black'
                      : 'bg-[#F8F4E8] text-[#64748B] border-[#CBD5E1] hover:border-black hover:text-black'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. Khoảng giá (VNĐ/đêm - FR-03) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Khoảng giá (VNĐ/đêm)
              </label>
              <span className="text-xs text-[#64748B]">
                {formatCurrency(minPrice)} –{' '}
                {maxPrice >= PRICE_LIMITS.MAX_VND ? 'Không giới hạn' : formatCurrency(maxPrice)}
              </span>
            </div>

            <div className="space-y-3">
              {/* Slider giá tối thiểu */}
              <div>
                <div className="flex justify-between text-xs text-[#64748B] mb-1">
                  <span>
                    Từ: <strong className="text-black">{formatCurrency(minPrice)}</strong>
                  </span>
                </div>
                <input
                  id="filter-min-price"
                  type="range"
                  min={PRICE_LIMITS.MIN_VND}
                  max={PRICE_LIMITS.MAX_VND}
                  step={50000}
                  value={minPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMinPrice(v > maxPrice ? maxPrice : v);
                  }}
                  className="w-full h-1.5 rounded-full accent-black cursor-pointer bg-neutral-200"
                />
              </div>

              {/* Slider giá tối đa */}
              <div>
                <div className="flex justify-between text-xs text-[#64748B] mb-1">
                  <span>
                    Đến:{' '}
                    <strong className="text-black">
                      {maxPrice >= PRICE_LIMITS.MAX_VND ? 'Không giới hạn' : formatCurrency(maxPrice)}
                    </strong>
                  </span>
                </div>
                <input
                  id="filter-max-price"
                  type="range"
                  min={PRICE_LIMITS.MIN_VND}
                  max={PRICE_LIMITS.MAX_VND}
                  step={50000}
                  value={maxPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMaxPrice(v < minPrice ? minPrice : v);
                  }}
                  className="w-full h-1.5 rounded-full accent-black cursor-pointer bg-neutral-200"
                />
              </div>
            </div>

            {/* Gợi ý nhanh */}
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setMinPrice(p.min);
                    setMaxPrice(p.max);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${minPrice === p.min && maxPrice === p.max
                      ? 'bg-black text-white border-black'
                      : 'bg-[#F8F4E8] text-[#64748B] border-[#CBD5E1] hover:border-black hover:text-black'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Khoảng cách (FR-03, FR-09) ── */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Khoảng cách
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DISTANCE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 text-sm text-black cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="distance"
                    value={opt.value}
                    checked={distance === opt.value}
                    onChange={() => setDistance && setDistance(opt.value)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <span className="text-sm group-hover:text-[#D97706] transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Địa điểm lân cận ── */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Địa điểm lân cận
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NEARBY_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-black cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    id={`filter-nearby-${item.replace(/\s+/g, '-')}`}
                    checked={Array.isArray(nearby) && nearby.includes(item)}
                    onChange={() => toggleNearby && toggleNearby(item)}
                    className="w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer"
                  />
                  <span className="text-sm group-hover:text-[#D97706] transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Tiện ích (FR-04 – quy tắc AND) ── */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Tiện ích
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenityOptions.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-black cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    id={`filter-amenity-${item.replace(/\s+/g, '-')}`}
                    checked={amenities.includes(item)}
                    onChange={() => toggleAmenity(item)}
                    className="w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer"
                  />
                  <span className="group-hover:text-[#D97706] transition-colors">{item}</span>
                </label>
              ))}
            </div>
            {amenities.length > 0 && (
              <p className="text-[11px] text-[#64748B]">
                ✅ Áp dụng quy tắc <strong>AND</strong> – Kết quả phải có đủ tất cả tiện ích đã chọn
              </p>
            )}
          </div>
        </div>

        {/* Footer: Đặt lại + Áp dụng */}
        <div className="px-6 py-4 border-t border-[#CBD5E1] flex items-center gap-3 bg-neutral-50">
          <button
            id="filter-reset-btn"
            type="button"
            onClick={onReset}
            className="flex-1 py-3 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-semibold text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Đặt lại
          </button>
          <button
            id="filter-apply-btn"
            type="button"
            onClick={onApply}
            className="flex-1 py-3 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
