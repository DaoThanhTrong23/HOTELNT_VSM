import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import { HotelListItem } from '../../components/tourist/HotelListItem';
import { useFilter } from '../../context/FilterContext';
import { PRICE_LIMITS } from '../../constants/enums';
import { SORT_OPTIONS, SEARCH_PAGE_SIZE } from '../../constants/filters';
import { applyFiltersAndSort } from '../../utils/filterHelpers';
import { MOCK_HOTELS } from '../../data/mockHotels';

/**
 * Trang Kết quả Tìm kiếm cơ sở lưu trú (Tourist) theo Figma Design
 */
export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterContext = useFilter();

  const keyword = searchParams.get('keyword') || '';
  const loaiHinhParam = searchParams.get('loaiHinh') || searchParams.get('type') || 'Tất cả';
  const minPriceParam = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : PRICE_LIMITS.MIN_VND;
  const maxPriceParam = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : PRICE_LIMITS.MAX_VND;
  const amenitiesParam = useMemo(() => {
    const raw = searchParams.get('amenities');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);
  const sortBy = searchParams.get('sortBy') || 'price_asc';

  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(1);

  // ── Tải danh sách kết quả dựa trên SearchParams ────────────────────────────
  useEffect(() => {
    setLoading(true);
    setPage(1);

    // ⚠️ KHI BE SẴN SÀNG: Thay thế bằng hotelService.searchHotels(...)
    const timer = setTimeout(() => {
      const filtered = applyFiltersAndSort({
        hotels: MOCK_HOTELS,
        keyword,
        loaiHinh: loaiHinhParam,
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
        amenities: amenitiesParam,
        sortBy,
      });
      setHotels(filtered);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [keyword, loaiHinhParam, minPriceParam, maxPriceParam, amenitiesParam, sortBy]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenFilter = useCallback(() => {
    if (filterContext?.openFilter) {
      filterContext.openFilter();
    }
  }, [filterContext]);

  const handleSortChange = useCallback(
    (newSort) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('sortBy', newSort);
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleResetAll = useCallback(() => {
    const nextParams = new URLSearchParams();
    if (keyword.trim()) {
      nextParams.set('keyword', keyword.trim());
    }
    setSearchParams(nextParams);
  }, [keyword, setSearchParams]);

  // Đếm số lượng bộ lọc đang kích hoạt
  const activeFilterCount =
    (loaiHinhParam !== 'Tất cả' ? 1 : 0) +
    amenitiesParam.length +
    (minPriceParam > PRICE_LIMITS.MIN_VND ? 1 : 0) +
    (maxPriceParam < PRICE_LIMITS.MAX_VND ? 1 : 0);

  // Phân trang
  const pagedHotels = hotels.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
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
              onChange={(e) => handleSortChange(e.target.value)}
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
            Bộ lọc ▾
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
  );
};
