import { useEffect, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { PRICE_LIMITS } from '../../constants/enums';
import { LOAI_HINH_OPTIONS, AMENITY_OPTIONS, PRICE_PRESETS } from '../../constants/filters';
import { formatCurrency } from '../../utils/formatters';

/**
 * Component Popup / Modal bộ lọc tìm kiếm theo đúng Figma
 */
export const FilterPopup = ({
  isOpen,
  onClose,
  loaiHinh,
  setLoaiHinh,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  amenities,
  toggleAmenity,
  onReset,
  onApply,
}) => {
  const overlayRef = useRef(null);

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
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#CBD5E1]">
          <h2 className="font-bold text-base text-black">Bộ lọc tìm kiếm</h2>
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
          {/* ── Loại hình cơ sở (FR-03) ── */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Loại hình cơ sở
            </label>
            <div className="flex flex-wrap gap-2">
              {LOAI_HINH_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  id={`loai-hinh-${opt.replace(/\s/g, '-')}`}
                  type="button"
                  onClick={() => setLoaiHinh(opt)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    loaiHinh === opt
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-[#64748B] border-[#CBD5E1] hover:border-black hover:text-black'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* ── Khoảng giá (FR-03) ── */}
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
                  className="w-full h-1.5 rounded-full accent-black cursor-pointer"
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
                  className="w-full h-1.5 rounded-full accent-black cursor-pointer"
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                    minPrice === p.min && maxPrice === p.max
                      ? 'bg-black text-white border-black'
                      : 'bg-[#F8F4E8] text-[#64748B] border-[#CBD5E1] hover:border-black hover:text-black'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tiện ích (FR-04 – quy tắc AND) ── */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Tiện ích
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITY_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-black cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    id={`filter-amenity-${item.replace(/\s+/g, '-')}`}
                    checked={amenities.includes(item)}
                    onChange={() => toggleAmenity(item)}
                    className="w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer"
                  />
                  <span className="text-sm group-hover:text-[#D97706] transition-colors">{item}</span>
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
        <div className="px-6 py-4 border-t border-[#CBD5E1] flex items-center gap-3">
          <button
            id="filter-reset-btn"
            type="button"
            onClick={onReset}
            className="flex-1 py-3 rounded-xl border border-[#CBD5E1] text-sm font-semibold text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Đặt lại
          </button>
          <button
            id="filter-apply-btn"
            type="button"
            onClick={onApply}
            className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
