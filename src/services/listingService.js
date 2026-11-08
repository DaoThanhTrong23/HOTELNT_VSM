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
  getMapMarkers: async () => {
    if (USE_MOCK) return mockListingApi.getMapMarkers();
    try {
      const res = await axiosClient.get('/listings/map-markers');
      return unwrap(res);
    } catch (err) {
      try {
        return await mockListingApi.getMapMarkers();
      } catch {
        throw err;
      }
    }
  },

  // Row 6 (FR-07): GET /listings/:maCSLT?latitude&longitude -> chi tiết CSLT (kèm khoangCach nếu gửi vị trí)
  getListingDetail: async (maCSLT, location) => {
    if (USE_MOCK) return mockListingApi.getDetail(maCSLT, location);
    try {
      const res = await axiosClient.get(`/listings/${maCSLT}`, { params: toLocationParams(location) });
      return unwrap(res);
    } catch (err) {
      try {
        return await mockListingApi.getDetail(maCSLT, location);
      } catch {
        throw err;
      }
    }
  },

  // Row 5 (FR-06): GET /listings/:maCSLT/preview?latitude&longitude -> dùng để lấy khoangCach thực tế (km)
  getListingPreview: async (maCSLT, location) => {
    if (USE_MOCK) return mockListingApi.getPreview(maCSLT, location);
    try {
      const res = await axiosClient.get(`/listings/${maCSLT}/preview`, { params: toLocationParams(location) });
      return unwrap(res);
    } catch (err) {
      try {
        return await mockListingApi.getPreview(maCSLT, location);
      } catch {
        throw err;
      }
    }
  },

  // Row 3 (FR-02, FR-03): GET /listings -> tìm kiếm, lọc, sắp xếp
  searchListings: async (params) => {
    if (USE_MOCK) return mockListingApi.search(params);
    try {
      const res = await axiosClient.get('/listings', { params });
      return unwrap(res);
    } catch (err) {
      try {
        return await mockListingApi.search(params);
      } catch {
        throw err;
      }
    }
  },

  // Row 10 (FR-03): GET /filter-options -> Lấy toàn bộ danh mục bộ lọc
  getFilterOptions: async () => {
    if (USE_MOCK) return mockListingApi.getFilterOptions();
    try {
      const res = await axiosClient.get('/filter-options');
      return unwrap(res);
    } catch (err) {
      try {
        return await mockListingApi.getFilterOptions();
      } catch {
        throw err;
      }
    }
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
