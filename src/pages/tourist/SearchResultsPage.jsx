import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, MapPin, Navigation } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import { HotelListItem } from '../../components/tourist/HotelListItem';
import { PRICE_LIMITS } from '../../constants/enums';
import { SORT_OPTIONS, SEARCH_PAGE_SIZE, NHA_TRANG_WARDS } from '../../constants/filters';
import { formatCurrency } from '../../utils/formatters';
import { applyFiltersAndSort } from '../../utils/filterHelpers';
import { MOCK_HOTELS } from '../../data/mockHotels';
import { USE_MOCK } from '../../mocks/mockListings';
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
  const distanceParam = searchParams.get('distance') || '';
  const phuongParam = searchParams.get('phuong') || searchParams.get('ward') || '';
  const sortBy = searchParams.get('sortBy') || 'price_asc';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(pageParam);

  // Đồng bộ page từ searchParams khi URL thay đổi (Back/Forward hoặc direct link)
  useEffect(() => {
    setPage(pageParam);
  }, [pageParam]);

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
          if (items.length > 0 || !USE_MOCK) {
            setHotels(items);
          } else {
            // Client filter fallback chỉ khi USE_MOCK=true
            const filtered = applyFiltersAndSort({
              hotels: MOCK_HOTELS,
              keyword,
              loaiHinh: loaiHinhParam,
              maPhuong: maPhuongParam,
              phuong: phuongParam,
              radiusKm: radiusKmParam,
              distance: distanceParam,
              minPrice: minPriceParam,
              maxPrice: maxPriceParam,
              amenities: amenitiesParam,
              sortBy,
            });
            setHotels(filtered);
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải kết quả tìm kiếm từ listingService:', err);
        if (isMounted) {
          if (USE_MOCK) {
            const filtered = applyFiltersAndSort({
              hotels: MOCK_HOTELS,
              keyword,
              loaiHinh: loaiHinhParam,
              maPhuong: maPhuongParam,
              phuong: phuongParam,
              radiusKm: radiusKmParam,
              distance: distanceParam,
              minPrice: minPriceParam,
              maxPrice: maxPriceParam,
              amenities: amenitiesParam,
              sortBy,
            });
            setHotels(filtered);
          } else {
            setHotels([]);
          }
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
    phuongParam,
    radiusKmParam,
    distanceParam,
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
      nextParams.delete('page');
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleRemoveFilterParam = useCallback(
    (key) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete(key);
      nextParams.delete('page');
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      setPage(newPage);
      const nextParams = new URLSearchParams(searchParams);
      if (newPage > 1) {
        nextParams.set('page', String(newPage));
      } else {
        nextParams.delete('page');
      }
      setSearchParams(nextParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams]
  );

  // Đếm số lượng bộ lọc đang kích hoạt
  const activeFilterCount =
    (loaiHinhParam !== 'Tất cả' ? 1 : 0) +
    amenitiesParam.length +
    (minPriceParam > PRICE_LIMITS.MIN_VND ? 1 : 0) +
    (maxPriceParam < PRICE_LIMITS.MAX_VND ? 1 : 0) +
    (distanceParam ? 1 : 0);

  // Kiểm tra từ khóa có phải nhập dạng giá tiền không (TC_HOM_04 - FR-02)
  const isPriceKeyword = /^\s*[\d\.\,]+(\s*(k|đ|vnd|triệu|tr))?\s*$/i.test(keyword.trim());

  // Phân trang an toàn với safePage nằm trong [1, totalPages]
  const totalPages = Math.max(1, Math.ceil(hotels.length / SEARCH_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pagedHotels = hotels.slice((safePage - 1) * SEARCH_PAGE_SIZE, safePage * SEARCH_PAGE_SIZE);

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

            {(minPriceParam > PRICE_LIMITS.MIN_VND || maxPriceParam < PRICE_LIMITS.MAX_VND) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F4E8] text-black border border-[#CBD5E1]">
                Giá: {formatCurrency(minPriceParam)} – {maxPriceParam >= PRICE_LIMITS.MAX_VND ? '...' : formatCurrency(maxPriceParam)}
                <button
                  type="button"
                  onClick={() => {
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.delete('minPrice');
                    nextParams.delete('maxPrice');
                    setSearchParams(nextParams);
                  }}
                  className="hover:text-red-500 cursor-pointer ml-0.5"
                  title="Bỏ lọc giá"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {amenitiesParam.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F4E8] text-black border border-[#CBD5E1]"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => {
                    const nextParams = new URLSearchParams(searchParams);
                    const remaining = amenitiesParam.filter((a) => a !== amenity);
                    if (remaining.length > 0) {
                      nextParams.set('amenities', remaining.join(','));
                    } else {
                      nextParams.delete('amenities');
                    }
                    setSearchParams(nextParams);
                  }}
                  className="hover:text-red-500 cursor-pointer ml-0.5"
                  title={`Bỏ tiện ích ${amenity}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
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
              page={safePage}
              currentPage={safePage}
              total={hotels.length}
              totalItems={hotels.length}
              pageSize={SEARCH_PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
