import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelCard } from '../../components/common/HotelCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MapSection } from '../../components/tourist/MapSection';
import { ROUTES } from '../../constants/routes';
import { listingService } from '../../services/listingService';
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
          if (items.length > 0) {
            setHotels(items.slice(0, 6));
          } else {
            setHotels(FEATURED_HOTELS);
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải CSLT nổi bật từ listingService, fallback mockHotels:', err);
        if (isMounted) {
          setHotels(FEATURED_HOTELS);
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
    <div>
      {/* ══════════════════════════════════════════
          MAP SECTION – Bản đồ định vị CSLT
          (Figma: chiếm phần trên cùng)
      ══════════════════════════════════════════ */}
      <MapSection />

      {/* ══════════════════════════════════════════
          CƠ SỞ LƯU TRÚ NỔI BẬT
          (Figma: dưới bản đồ, card 3 cột)
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Cơ sở lưu trú nổi bật</h2>
          <button
            id="see-all-hotels-btn"
            type="button"
            onClick={() => navigate(ROUTES.SEARCH)}
            className="text-sm font-semibold text-black hover:underline cursor-pointer"
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
