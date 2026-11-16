import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelCard } from '../../components/common/HotelCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MapSection } from '../../components/tourist/MapSection';
import { ROUTES } from '../../constants/routes';
import { listingService } from '../../services/listingService';
import { USE_MOCK } from '../../mocks/mockListings';
import { FEATURED_HOTELS } from '../../data/mockHotels';

/**
 * Trang chủ (Tourist Home) theo đúng Figma Design:
 * - Nửa trên: Bản đồ định vị các khách sạn (Google Maps section)
 * - Nửa dưới: Danh sách cơ sở lưu trú nổi bật (grid 3 cột)
 */
export const HomePage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchHotels = async () => {
      try {
        setLoading(true);
        const res = await listingService.searchListings({ limit: 6 });
        const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          if (items.length > 0 || !USE_MOCK) {
            setHotels(items.slice(0, 6));
          } else {
            setHotels(FEATURED_HOTELS);
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải CSLT nổi bật từ listingService:', err);
        if (isMounted) {
          if (USE_MOCK) {
            setHotels(FEATURED_HOTELS);
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

    fetchHotels();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="pb-12 space-y-6 sm:space-y-8">
      {/* ══════════════════════════════════════════
          MAP SECTION – Bản đồ định vị CSLT
          (Được bọc gọn gàng trong container có lề và bo góc, tối ưu cho cả mobile & desktop)
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#CBD5E1] shadow-xs bg-[#F1F5F9]">
          <MapSection />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CƠ SỞ LƯU TRÚ NỔI BẬT
          (Figma: dưới bản đồ, card 3 cột)
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-black">Cơ sở lưu trú nổi bật</h2>
          <button
            id="see-all-hotels-btn"
            type="button"
            onClick={() => navigate(ROUTES.SEARCH)}
            className="text-xs sm:text-sm font-semibold text-black hover:underline cursor-pointer"
          >
            Xem tất cả →
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.maCSLT || hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
