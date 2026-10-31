import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import { HotelListItem } from '../../components/tourist/HotelListItem';
import { FilterPopup } from '../../components/tourist/FilterPopup';
import { PRICE_LIMITS } from '../../constants/enums';
import { SORT_OPTIONS, SEARCH_PAGE_SIZE } from '../../constants/filters';
import { applyFiltersAndSort } from '../../utils/filterHelpers';
import { MOCK_HOTELS } from '../../data/mockHotels';

/**
 * Trang Kết quả Tìm kiếm cơ sở lưu trú (Tourist) theo Figma Design
 */
export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  // Draft filters (trong popup – chỉ áp dụng khi nhấn "Áp dụng")
  const [draftLoaiHinh, setDraftLoaiHinh] = useState('Tất cả');
  const [draftMinPrice, setDraftMinPrice] = useState(PRICE_LIMITS.MIN_VND);
  const [draftMaxPrice, setDraftMaxPrice] = useState(PRICE_LIMITS.MAX_VND);
  const [draftAmenities, setDraftAmenities] = useState([]);

  // Applied filters (bộ lọc đang có hiệu lực)
  const [appliedLoaiHinh, setAppliedLoaiHinh] = useState('Tất cả');
  const [appliedMinPrice, setAppliedMinPrice] = useState(PRICE_LIMITS.MIN_VND);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(PRICE_LIMITS.MAX_VND);
  const [appliedAmenities, setAppliedAmenities] = useState([]);

  const [sortBy, setSortBy] = useState('price_asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(1);

  // ── Tải danh sách kết quả ─────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setPage(1);
    // ⚠️ KHI BE SẴN SÀNG: Thay thế bằng hotelService.searchHotels({ keyword, loaiHinh, ... })
    const timer = setTimeout(() => {
      const filtered = applyFiltersAndSort({
        hotels: MOCK_HOTELS,
        keyword,
        loaiHinh: appliedLoaiHinh,
        minPrice: appliedMinPrice,
        maxPrice: appliedMaxPrice,
        amenities: appliedAmenities,
        sortBy,
      });
      setHotels(filtered);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword, appliedLoaiHinh, appliedMinPrice, appliedMaxPrice, appliedAmenities, sortBy]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleDraftAmenity = useCallback((item) => {
    setDraftAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }, []);

  const handleOpenFilter = useCallback(() => {
    // Khi mở popup, đồng bộ draft với applied hiện tại
    setDraftLoaiHinh(appliedLoaiHinh);
    setDraftMinPrice(appliedMinPrice);
    setDraftMaxPrice(appliedMaxPrice);
    setDraftAmenities([...appliedAmenities]);
    setIsFilterOpen(true);
  }, [appliedLoaiHinh, appliedMinPrice, appliedMaxPrice, appliedAmenities]);

  const handleApplyFilter = useCallback(() => {
    setAppliedLoaiHinh(draftLoaiHinh);
    setAppliedMinPrice(draftMinPrice);
    setAppliedMaxPrice(draftMaxPrice);
    setAppliedAmenities([...draftAmenities]);
    setIsFilterOpen(false);
  }, [draftLoaiHinh, draftMinPrice, draftMaxPrice, draftAmenities]);

  const handleResetDraft = useCallback(() => {
    setDraftLoaiHinh('Tất cả');
    setDraftMinPrice(PRICE_LIMITS.MIN_VND);
    setDraftMaxPrice(PRICE_LIMITS.MAX_VND);
    setDraftAmenities([]);
  }, []);

  const handleResetAll = useCallback(() => {
    setAppliedLoaiHinh('Tất cả');
    setAppliedMinPrice(PRICE_LIMITS.MIN_VND);
    setAppliedMaxPrice(PRICE_LIMITS.MAX_VND);
    setAppliedAmenities([]);
    setSortBy('price_asc');
  }, []);

  // Đếm số lượng bộ lọc đang kích hoạt
  const activeFilterCount =
    (appliedLoaiHinh !== 'Tất cả' ? 1 : 0) +
    appliedAmenities.length +
    (appliedMinPrice !== PRICE_LIMITS.MIN_VND ? 1 : 0) +
    (appliedMaxPrice !== PRICE_LIMITS.MAX_VND ? 1 : 0);

  // Phân trang
  const pagedHotels = hotels.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Filter Popup Modal */}
      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        loaiHinh={draftLoaiHinh}
        setLoaiHinh={setDraftLoaiHinh}
        minPrice={draftMinPrice}
        setMinPrice={setDraftMinPrice}
        maxPrice={draftMaxPrice}
        setMaxPrice={setDraftMaxPrice}
        amenities={draftAmenities}
        toggleAmenity={toggleDraftAmenity}
        onReset={handleResetDraft}
        onApply={handleApplyFilter}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── HEADER: Kết quả + Sắp xếp + Bộ lọc ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#CBD5E1]">
          <div>
            <h1 className="text-lg font-bold text-black">
              {keyword ? (
                <>
                  Tìm thấy <span className="text-[#D97706]">{hotels.length}</span> kết quả cho "{keyword}"
                </>
              ) : (
                <>
                  Tất cả cơ sở lưu trú tại Nha Trang –{' '}
                  <span className="text-[#D97706]">{hotels.length}</span> kết quả
                </>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-xl px-3 py-2">
              <ArrowUpDown size={14} className="text-[#64748B]" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-semibold text-black focus:outline-none bg-transparent cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bộ lọc button */}
            <button
              id="open-filter-popup-btn"
              type="button"
              onClick={handleOpenFilter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white text-sm font-semibold text-black hover:border-black hover:bg-[#F8F4E8] transition-all cursor-pointer"
            >
              <SlidersHorizontal size={15} />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Nút reset nếu có filter */}
            {activeFilterCount > 0 && (
              <button
                id="reset-all-filter-btn"
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-xs text-[#DC2626] font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw size={12} />
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* ── RESULTS LIST ── */}
        {loading ? (
          <LoadingSpinner />
        ) : hotels.length === 0 ? (
          <EmptyState
            title="Không tìm thấy cơ sở phù hợp"
            message={
              keyword
                ? `Không có kết quả cho "${keyword}". Thử tên khác hoặc điều chỉnh bộ lọc để xem thêm.`
                : 'Không có cơ sở nào phù hợp với bộ lọc hiện tại. Hãy điều chỉnh lại bộ lọc.'
            }
            actionText="Xóa tất cả bộ lọc"
            onAction={handleResetAll}
          />
        ) : (
          <>
            <div className="space-y-4">
              {pagedHotels.map((hotel) => (
                <HotelListItem key={hotel.id} hotel={hotel} />
              ))}
            </div>

            <Pagination
              total={hotels.length}
              pageSize={SEARCH_PAGE_SIZE}
              page={page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
};
