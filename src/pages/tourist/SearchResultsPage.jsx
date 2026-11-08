import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, MapPin, Navigation } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import { HotelListItem } from '../../components/tourist/HotelListItem';
import { PRICE_LIMITS } from '../../constants/enums';
import { SORT_OPTIONS, SEARCH_PAGE_SIZE, NHA_TRANG_WARDS } from '../../constants/filters';
import { applyFiltersAndSort } from '../../utils/filterHelpers';
import { MOCK_HOTELS } from '../../data/mockHotels';
import { listingService } from '../../services/listingService';

/**
 * Trang Kết quả Tìm kiếm cơ sở lưu trú (Tourist) theo Figma & SRS FR-02, FR-03:
 * - Thanh toolbar trên cùng: Nút "Sắp xếp: [Giá tăng dần] ▼" và các tag bộ lọc đang áp dụng (Phường/Xã, Bán kính km, Loại hình)
 * - Khi không tìm thấy: Hiển thị nền #F8F4E8 toàn khung và căn giữa dòng chữ "Không tìm thấy khách sạn phù hợp"
 * - Khi tìm thấy: Hiển thị danh sách khách sạn kèm phân trang
 */
export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const loaiHinhParam = searchParams.get('loaiHinh') || searchParams.get('type') || 'Tất cả';
  const maPhuongParam = searchParams.get('maPhuong') || searchParams.get('ward') || '';
  const radiusKmParam = searchParams.get('radiusKm') ? Number(searchParams.get('radiusKm')) : 0;
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

  // Tên phường/xã hiển thị nếu có chọn
  const selectedWardName = useMemo(() => {
    if (!maPhuongParam) return '';
    const ward = NHA_TRANG_WARDS.find((w) => String(w.id) === String(maPhuongParam));
    return ward ? ward.name : `Phường ${maPhuongParam}`;
  }, [maPhuongParam]);

  // ── Tải danh sách kết quả dựa trên SearchParams ────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setPage(1);

    const fetchResults = async () => {
      try {
        const res = await listingService.searchListings({
          keyword,
          loaiHinh: loaiHinhParam !== 'Tất cả' ? loaiHinhParam : undefined,
          maPhuong: maPhuongParam || undefined,
          radiusKm: radiusKmParam > 0 ? radiusKmParam : undefined,
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
          amenities: amenitiesParam.length ? amenitiesParam.join(',') : undefined,
          sortBy,
          limit: 50,
        });

        const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          if (items.length > 0) {
            setHotels(items);
          } else {
            // Client filter fallback
            const filtered = applyFiltersAndSort({
              hotels: MOCK_HOTELS,
              keyword,
              loaiHinh: loaiHinhParam,
              maPhuong: maPhuongParam,
              radiusKm: radiusKmParam,
              minPrice: minPriceParam,
              maxPrice: maxPriceParam,
              amenities: amenitiesParam,
              sortBy,
            });
            setHotels(filtered);
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải kết quả tìm kiếm từ listingService, fallback MOCK_HOTELS:', err);
        if (isMounted) {
          const filtered = applyFiltersAndSort({
            hotels: MOCK_HOTELS,
            keyword,
            loaiHinh: loaiHinhParam,
            maPhuong: maPhuongParam,
            radiusKm: radiusKmParam,
            minPrice: minPriceParam,
            maxPrice: maxPriceParam,
            amenities: amenitiesParam,
            sortBy,
          });
          setHotels(filtered);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [
    keyword,
    loaiHinhParam,
    maPhuongParam,
    radiusKmParam,
    minPriceParam,
    maxPriceParam,
    amenitiesParam,
    sortBy,
  ]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSortChange = useCallback(
    (newSort) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('sortBy', newSort);
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleRemoveFilterParam = useCallback(
    (key) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete(key);
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  // Phân trang
  const pagedHotels = hotels.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col w-full">
      {/* ── TOP TOOLBAR: Sắp xếp theo Figma & Active Filter Tags ── */}
      <div className="bg-white border-b border-[#CBD5E1] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Dropdown Sắp xếp theo dạng nút Figma: Sắp xếp: Giá tăng dần ▼ */}
          <div className="relative inline-block">
            <label htmlFor="sort-select" className="sr-only">
              Sắp xếp kết quả
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border border-[#CBD5E1] rounded-md px-3 py-1.5 pr-7 text-xs sm:text-sm font-semibold text-black focus:outline-none focus:border-black cursor-pointer shadow-xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sắp xếp: {opt.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[10px] text-black">
              ▼
            </span>
          </div>

          {/* Active Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedWardName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F4E8] text-black border border-[#CBD5E1]">
                <MapPin size={12} className="text-[#64748B]" />
                {selectedWardName}
                <button
                  type="button"
                  onClick={() => handleRemoveFilterParam('maPhuong')}
                  className="hover:text-red-500 cursor-pointer ml-0.5"
                  title="Bỏ lọc phường này"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {radiusKmParam > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F4E8] text-black border border-[#CBD5E1]">
                <Navigation size={12} className="text-[#64748B]" />
                Bán kính: {radiusKmParam} km
                <button
                  type="button"
                  onClick={() => handleRemoveFilterParam('radiusKm')}
                  className="hover:text-red-500 cursor-pointer ml-0.5"
                  title="Bỏ lọc bán kính"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {loaiHinhParam !== 'Tất cả' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F4E8] text-black border border-[#CBD5E1]">
                {loaiHinhParam}
                <button
                  type="button"
                  onClick={() => handleRemoveFilterParam('loaiHinh')}
                  className="hover:text-red-500 cursor-pointer ml-0.5"
                  title="Bỏ lọc loại hình"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG KẾT QUẢ ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px] w-full bg-[#F8F4E8]">
          <LoadingSpinner />
        </div>
      ) : hotels.length === 0 ? (
        /* ── MÀN HÌNH KHÔNG TÌM THẤY CƠ SỞ THEO FIGMA DESIGN ── */
        <div
          data-testid="empty-state"
          className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)] w-full bg-[#F8F4E8] px-4"
        >
          <p className="text-sm sm:text-base font-bold text-black text-center tracking-normal select-none">
            Không tìm thấy khách sạn phù hợp
          </p>
        </div>
      ) : (
        /* ── DANH SÁCH KẾT QUẢ KHI CÓ CƠ SỞ LƯU TRÚ ── */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-5">
          <div className="space-y-4">
            {pagedHotels.map((hotel) => (
              <HotelListItem key={hotel.maCSLT || hotel.id} hotel={hotel} />
            ))}
          </div>

          {/* Phân trang */}
          <div className="pt-2 flex justify-center">
            <Pagination
              currentPage={page}
              totalItems={hotels.length}
              pageSize={SEARCH_PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
