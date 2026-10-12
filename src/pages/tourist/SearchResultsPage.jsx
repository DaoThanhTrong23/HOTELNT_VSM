import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { HotelCard } from '../../components/common/HotelCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PRICE_LIMITS } from '../../constants/enums';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [sortBy, setSortBy] = useState('price_asc'); // price_asc, price_desc, distance
  const [minPrice, setMinPrice] = useState(PRICE_LIMITS.MIN_VND);
  const [maxPrice, setMaxPrice] = useState(PRICE_LIMITS.MAX_VND);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const amenityOptions = ['Wifi miễn phí', 'Hồ bơi', 'Giáp biển', 'Chỗ đỗ xe', 'Điều hòa', 'Gần nhà hàng'];

  useEffect(() => {
    setLoading(true);
    // Giả lập gọi API lọc & tìm kiếm
    setTimeout(() => {
      // Demo logic: Nếu gõ keyword linh tinh thì ra empty state
      if (keyword.toLowerCase().includes('xyz')) {
        setHotels([]);
      } else {
        setHotels([
          {
            id: '1',
            name: 'Khách sạn Mường Thanh Luxury Nha Trang',
            type: 'Khách sạn',
            address: '60 Trần Phú, Lộc Thọ, Nha Trang',
            thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
            minPrice: 1200000,
            maxPrice: 3500000,
            rating: 4.9,
            phone: '02583898888',
            zalo: '0905123456',
            amenities: ['Hồ bơi', 'Giáp biển', 'Wifi miễn phí'],
          },
          {
            id: '2',
            name: 'Nha Trang Chill House Homestay',
            type: 'Homestay',
            address: '14/3 Hoàng Hoa Thám, Vạn Thạnh, Nha Trang',
            thumbnail: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=600&auto=format&fit=crop&q=80',
            minPrice: 450000,
            maxPrice: 900000,
            rating: 4.7,
            phone: '0987654321',
            zalo: '0987654321',
            amenities: ['Wifi miễn phí', 'Gần nhà hàng'],
          },
        ]);
      }
      setLoading(false);
    }, 400);
  }, [keyword, sortBy, selectedAmenities]);

  const handleResetFilters = () => {
    setMinPrice(PRICE_LIMITS.MIN_VND);
    setMaxPrice(PRICE_LIMITS.MAX_VND);
    setSelectedAmenities([]);
    setSearchParams({});
  };

  const toggleAmenity = (item) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER TÌM KIẾM */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#CBD5E1]">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {keyword ? `Kết quả tìm kiếm cho: "${keyword}"` : 'Tất cả cơ sở lưu trú tại Nha Trang'}
          </h1>
          <p className="text-sm text-[#64748B]">Tìm thấy {hotels.length} kết quả phù hợp</p>
        </div>

        {/* SẮP XẾP THEO (FR-04) */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-[#64748B]" />
          <span className="text-sm text-[#64748B]">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-sm font-semibold text-black focus:outline-hidden"
          >
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="distance">Khoảng cách gần nhất</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR BỘ LỌC (FR-03) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-[#CBD5E1] space-y-6 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1]">
            <div className="flex items-center gap-2 font-bold text-sm text-black">
              <SlidersHorizontal size={16} />
              <span>Bộ lọc tìm kiếm</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#DC2626] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw size={12} />
              Đặt lại
            </button>
          </div>

          {/* TIỆN ÍCH */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-3">
              Tiện ích phổ biến
            </label>
            <div className="space-y-2">
              {amenityOptions.map((item) => (
                <label key={item} className="flex items-center gap-2.5 text-sm text-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(item)}
                    onChange={() => toggleAmenity(item)}
                    className="w-4 h-4 rounded-sm border-[#CBD5E1] accent-black"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner />
          ) : hotels.length === 0 ? (
            <EmptyState onAction={handleResetFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
