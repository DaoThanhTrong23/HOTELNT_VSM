import axiosClient from './axiosClient';
import { USE_MOCK, mockListingApi } from '../mocks/mockListings';

/**
 * PUBLIC LISTING APIS (Khách du lịch) - theo API_DESIGN, router /listings & /configurations
 * Backend có thể trả thẳng object hoặc bọc trong { data }, nên luôn đi qua unwrap().
 */
const unwrap = (res) =>
  res && typeof res === 'object' && res.data && typeof res.data === 'object' && !Array.isArray(res.data)
    ? res.data
    : res;

const toLocationParams = (location) =>
  location ? { latitude: location.latitude, longitude: location.longitude } : undefined;

export const listingService = {
  // Row 4 (FR-05): GET /listings/map-markers -> Lấy danh sách ghim trên bản đồ
  getMapMarkers: async (bounds) => {
    if (USE_MOCK) return mockListingApi.getMapMarkers();
    const params = {
      boundsSouthWest: bounds?.southWest || '12.15,109.15',
      boundsNorthEast: bounds?.northEast || '12.35,109.25',
    };
    const res = await axiosClient.get('/listings/map-markers', { params });
    return unwrap(res);
  },

  // Row 6 (FR-07): GET /listings/:maCSLT?latitude&longitude -> chi tiết CSLT (kèm khoangCach nếu gửi vị trí)
  getListingDetail: async (maCSLT, location) => {
    if (USE_MOCK) return mockListingApi.getDetail(maCSLT, location);
    const res = await axiosClient.get(`/listings/${maCSLT}`, { params: toLocationParams(location) });
    return unwrap(res);
  },

  // Row 5 (FR-06): GET /listings/:maCSLT/preview?latitude&longitude -> dùng để lấy khoangCach thực tế (km)
  getListingPreview: async (maCSLT, location) => {
    if (USE_MOCK) return mockListingApi.getPreview(maCSLT, location);
    const res = await axiosClient.get(`/listings/${maCSLT}/preview`, { params: toLocationParams(location) });
    return unwrap(res);
  },

  // Row 3 (FR-02, FR-03): GET /listings -> tìm kiếm, lọc, sắp xếp chuẩn theo API_DESIGN
  searchListings: async (rawParams = {}) => {
    if (USE_MOCK) return mockListingApi.search(rawParams);
    const params = {};

      // Keyword
      if (rawParams.keyword && typeof rawParams.keyword === 'string' && rawParams.keyword.trim()) {
        params.keyword = rawParams.keyword.trim();
      }

      // Giá: Frontend minPrice/maxPrice -> Backend giaMin/giaMax
      const minPrice = rawParams.giaMin ?? rawParams.minPrice;
      if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
        params.giaMin = Number(minPrice);
      }
      const maxPrice = rawParams.giaMax ?? rawParams.maxPrice;
      if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
        params.giaMax = Number(maxPrice);
      }

      // Sắp xếp: Map các giá trị UI sang Enum Backend (GIA_ASC, GIA_DESC, KHOANG_CACH_ASC, NGAY_CAP_NHAT_DESC)
      const sortMap = {
        price_asc: 'GIA_ASC',
        price_desc: 'GIA_DESC',
        distance_asc: 'KHOANG_CACH_ASC',
        newest: 'NGAY_CAP_NHAT_DESC',
        GIA_ASC: 'GIA_ASC',
        GIA_DESC: 'GIA_DESC',
        KHOANG_CACH_ASC: 'KHOANG_CACH_ASC',
        NGAY_CAP_NHAT_DESC: 'NGAY_CAP_NHAT_DESC',
      };
      if (rawParams.sortBy && sortMap[rawParams.sortBy]) {
        params.sortBy = sortMap[rawParams.sortBy];
      }

      // Vị trí & Phường/Xã & Bán kính
      if (rawParams.maPhuong) params.maPhuong = rawParams.maPhuong;
      if (rawParams.radiusKm && Number(rawParams.radiusKm) > 0) params.radiusKm = Number(rawParams.radiusKm);
      if (rawParams.latitude) params.latitude = rawParams.latitude;
      if (rawParams.longitude) params.longitude = rawParams.longitude;

      // Loại hình: map tên tiếng Việt sang ID nếu cần
      if (rawParams.maLoai) {
        params.maLoai = rawParams.maLoai;
      } else if (rawParams.loaiHinh && rawParams.loaiHinh !== 'Tất cả') {
        const typeMap = { 'Khách sạn': 1, 'Villa': 2, 'Homestay': 3, 'Resort': 4, 'Căn hộ': 5 };
        if (typeMap[rawParams.loaiHinh]) params.maLoai = typeMap[rawParams.loaiHinh];
      }

      // Tiện ích: hỗ trợ cả maTienIch hoặc danh sách tên amenities từ UI
      if (rawParams.maTienIch) {
        params.maTienIch = rawParams.maTienIch;
      } else if (rawParams.amenities) {
        const amenityMap = {
          'Hồ bơi': 1,
          'Wifi': 2,
          'Wifi miễn phí': 2,
          'Gần biển': 3,
          'Giáp biển': 3,
          'Bãi đậu xe': 4,
          'Chỗ đỗ xe': 4,
          'Điều hòa': 5,
          'Bếp riêng': 6,
          'Gần chợ đêm': 7,
          'Gần nhà hàng': 7,
          'Gần trung tâm': 8,
        };

        const amenityList = typeof rawParams.amenities === 'string'
          ? rawParams.amenities.split(',').map((s) => s.trim()).filter(Boolean)
          : (Array.isArray(rawParams.amenities) ? rawParams.amenities : []);

        const ids = amenityList
          .map((a) => {
            if (!isNaN(a)) return Number(a);
            return amenityMap[a];
          })
          .filter(Boolean);

        if (ids.length > 0) {
          params.maTienIch = ids.join(',');
        }
      }

      // Phân trang
      if (rawParams.page) params.page = Number(rawParams.page);
      if (rawParams.limit) params.limit = Number(rawParams.limit);

      const res = await axiosClient.get('/listings', { params });
      return unwrap(res);
  },

  // Row 10 (FR-03): GET /filter-options -> Lấy toàn bộ danh mục bộ lọc
  getFilterOptions: async () => {
    if (USE_MOCK) return mockListingApi.getFilterOptions();
    const res = await axiosClient.get('/filter-options');
    return unwrap(res);
  },

  // Row 12 (FR-25): GET /configurations/seo -> Lấy cấu hình SEO công khai
  getPublicSeoConfig: async () => {
    if (USE_MOCK) {
      return {
        metaTitle: 'Hotel Nha Trang - Khám phá và đặt phòng khách sạn, homestay tốt nhất',
        metaDescription: 'Tìm kiếm và đặt phòng khách sạn, homestay tại Nha Trang với giá tốt.',
        ogImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      };
    }
    try {
      const res = await axiosClient.get('/configurations/seo');
      return unwrap(res);
    } catch (err) {
      return {
        metaTitle: 'Hotel Nha Trang - Khám phá và đặt phòng khách sạn, homestay tốt nhất',
        metaDescription: 'Tìm kiếm và đặt phòng khách sạn, homestay tại Nha Trang với giá tốt.',
        ogImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      };
    }
  },
};

export default listingService;
