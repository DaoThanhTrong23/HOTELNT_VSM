import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PRICE_LIMITS } from '../constants/enums';
import { ROUTES } from '../constants/routes';
import { FilterPopup } from '../components/tourist/FilterPopup';

export const FilterContext = createContext(null);

/**
 * FilterProvider quản lý trạng thái hiển thị Popup Bộ Lọc cho luồng Tourist
 * Cho phép nút "Bộ lọc ▾" trên Navbar mở Popup ở bất kỳ trang nào (Trang chủ, Tìm kiếm, Chi tiết,...)
 */
export const FilterProvider = ({ children }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Draft filters bên trong popup (chỉ được áp dụng khi người dùng nhấn "Áp dụng")
  const [draftLoaiHinh, setDraftLoaiHinh] = useState('Tất cả');
  const [draftMaPhuong, setDraftMaPhuong] = useState('');
  const [draftRadiusKm, setDraftRadiusKm] = useState(0);
  const [draftMinPrice, setDraftMinPrice] = useState(PRICE_LIMITS.MIN_VND);
  const [draftMaxPrice, setDraftMaxPrice] = useState(PRICE_LIMITS.MAX_VND);
  const [draftAmenities, setDraftAmenities] = useState([]);

  // Đồng bộ draft filters từ URL khi mở popup
  const openFilter = useCallback(() => {
    const loaiHinhParam = searchParams.get('loaiHinh') || searchParams.get('type') || 'Tất cả';
    const maPhuongParam = searchParams.get('maPhuong') || searchParams.get('ward') || '';
    const radiusKmParam = searchParams.get('radiusKm') ? Number(searchParams.get('radiusKm')) : 0;
    const minPriceParam = searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : PRICE_LIMITS.MIN_VND;
    const maxPriceParam = searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : PRICE_LIMITS.MAX_VND;
    const amenitiesParam = searchParams.get('amenities')
      ? searchParams.get('amenities').split(',').filter(Boolean)
      : [];

    setDraftLoaiHinh(loaiHinhParam);
    setDraftMaPhuong(maPhuongParam);
    setDraftRadiusKm(radiusKmParam);
    setDraftMinPrice(minPriceParam);
    setDraftMaxPrice(maxPriceParam);
    setDraftAmenities(amenitiesParam);
    setIsFilterOpen(true);
  }, [searchParams]);

  const closeFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const toggleDraftAmenity = useCallback((item) => {
    setDraftAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }, []);

  const handleResetDraft = useCallback(() => {
    setDraftLoaiHinh('Tất cả');
    setDraftMaPhuong('');
    setDraftRadiusKm(0);
    setDraftMinPrice(PRICE_LIMITS.MIN_VND);
    setDraftMaxPrice(PRICE_LIMITS.MAX_VND);
    setDraftAmenities([]);
  }, []);

  const handleApplyFilter = useCallback(() => {
    const currentKeyword = searchParams.get('keyword') || '';
    const params = new URLSearchParams();

    if (currentKeyword.trim()) {
      params.set('keyword', currentKeyword.trim());
    }
    if (draftLoaiHinh && draftLoaiHinh !== 'Tất cả') {
      params.set('loaiHinh', draftLoaiHinh);
    }
    if (draftMaPhuong) {
      params.set('maPhuong', draftMaPhuong);
    }
    if (draftRadiusKm > 0) {
      params.set('radiusKm', draftRadiusKm.toString());
    }
    if (draftMinPrice > PRICE_LIMITS.MIN_VND) {
      params.set('minPrice', draftMinPrice.toString());
    }
    if (draftMaxPrice < PRICE_LIMITS.MAX_VND) {
      params.set('maxPrice', draftMaxPrice.toString());
    }
    if (draftAmenities.length > 0) {
      params.set('amenities', draftAmenities.join(','));
    }

    const currentSort = searchParams.get('sortBy');
    if (currentSort) {
      params.set('sortBy', currentSort);
    }

    const queryString = params.toString();
    const targetUrl = `${ROUTES.SEARCH}${queryString ? `?${queryString}` : ''}`;

    setIsFilterOpen(false);
    navigate(targetUrl);
  }, [
    searchParams,
    draftLoaiHinh,
    draftMaPhuong,
    draftRadiusKm,
    draftMinPrice,
    draftMaxPrice,
    draftAmenities,
    navigate,
  ]);

  const contextValue = useMemo(
    () => ({
      isFilterOpen,
      openFilter,
      closeFilter,
    }),
    [isFilterOpen, openFilter, closeFilter]
  );

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
      <FilterPopup
        isOpen={isFilterOpen}
        onClose={closeFilter}
        loaiHinh={draftLoaiHinh}
        setLoaiHinh={setDraftLoaiHinh}
        maPhuong={draftMaPhuong}
        setMaPhuong={setDraftMaPhuong}
        radiusKm={draftRadiusKm}
        setRadiusKm={setDraftRadiusKm}
        minPrice={draftMinPrice}
        setMinPrice={setDraftMinPrice}
        maxPrice={draftMaxPrice}
        setMaxPrice={setDraftMaxPrice}
        amenities={draftAmenities}
        toggleAmenity={toggleDraftAmenity}
        onReset={handleResetDraft}
        onApply={handleApplyFilter}
      />
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  return useContext(FilterContext);
};

export default FilterProvider;
