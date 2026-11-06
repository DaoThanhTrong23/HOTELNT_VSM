import axiosClient from './axiosClient';
import { USE_MOCK, mockListingApi } from '../mocks/mockListings';

/**
 * PUBLIC LISTING APIS (Khách du lịch) - theo API_DESIGN, router /listings
 * Backend có thể trả thẳng object hoặc bọc trong { data }, nên luôn đi qua unwrap().
 */
const unwrap = (res) =>
  res && typeof res === 'object' && res.data && typeof res.data === 'object' && !Array.isArray(res.data)
    ? res.data
    : res;

const toLocationParams = (location) =>
  location ? { latitude: location.latitude, longitude: location.longitude } : undefined;

export const listingService = {
  // FR-07: GET /listings/:maCSLT?latitude&longitude -> chi tiết CSLT (kèm khoangCach nếu gửi vị trí)
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

  // FR-06: GET /listings/:maCSLT/preview?latitude&longitude -> dùng để lấy khoangCach thực tế (km)
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

  // FR-02, FR-03: GET /listings -> tìm kiếm, lọc, sắp xếp
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
};
