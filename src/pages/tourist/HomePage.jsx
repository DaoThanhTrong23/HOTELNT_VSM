import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { HotelCard } from '../../components/common/HotelCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ROUTES } from '../../constants/routes';

export const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Dữ liệu mẫu ban đầu để team có thể xem trước UI ngay lập tức
  useEffect(() => {
    setLoading(true);
    // TODO: Thay bằng api hotelService.getFeaturedHotels()
    setTimeout(() => {
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
          amenities: ['Hồ bơi vô cực', 'Giáp biển', 'Buffet sáng', 'Wifi miễn phí'],
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
          amenities: ['Ban công ngắm phố', 'Bếp chung', 'Gần chợ Đầm'],
        },
        {
          id: '3',
          name: 'Amiana Resort Nha Trang',
          type: 'Resort',
          address: 'Phạm Văn Đồng, Vĩnh Hòa, Nha Trang',
          thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
          minPrice: 3800000,
          maxPrice: 8500000,
          rating: 5.0,
          phone: '02583555333',
          zalo: '0912345678',
          amenities: ['Bãi biển riêng', 'Hồ nước mặn', 'Spa cao cấp'],
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`${ROUTES.SEARCH}?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative bg-white border-b border-[#CBD5E1] py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8F4E8] border border-[#CBD5E1] text-xs font-semibold text-black">
            <Sparkles size={14} className="text-[#D97706]" />
            Khám phá chỗ ở lý tưởng tại Vịnh Biển Nha Trang
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black tracking-tight leading-tight">
            Tìm Kiếm & Định Vị Khách Sạn Không Qua Trung Gian
          </h1>

          <p className="text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Tra cứu thông tin chính xác từ chủ cơ sở, liên hệ trực tiếp qua Zalo/Hotline, không phụ thuộc vào nền tảng trung gian thu phí.
          </p>

          {/* SEARCH BOX TRUNG TÂM */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center bg-[#F8F4E8] border border-[#CBD5E1] rounded-full p-2 shadow-sm focus-within:bg-white focus-within:border-black transition-all">
            <div className="pl-4 pr-2 text-[#64748B]">
              <MapPin size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên cơ sở lưu trú (VD: Mường Thanh, Amiana)..."
              className="flex-1 bg-transparent border-none text-sm text-black placeholder-[#64748B] focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-black text-white text-sm font-semibold flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
            >
              <Search size={16} />
              <span>Khám phá</span>
            </button>
          </form>
        </div>
      </section>

      {/* FEATURED ACCOMMODATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">Cơ Sở Lưu Trú Nổi Bật</h2>
            <p className="text-sm text-[#64748B]">Được kiểm duyệt và cập nhật thông tin giá mới nhất</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.SEARCH)}
            className="text-sm font-semibold text-black hover:underline cursor-pointer"
          >
            Xem tất cả →
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
