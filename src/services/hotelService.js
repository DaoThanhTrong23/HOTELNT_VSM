import axiosClient from './axiosClient';

export const hotelService = {
  // --- TOURIST APIS ---
  
  // FR-01, FR-04: Lấy danh sách cơ sở lưu trú trang chủ
  getFeaturedHotels: () => {
    return axiosClient.get('/hotels/featured');
  },

  // FR-02, FR-03: Tìm kiếm theo tên & Lọc đa tiêu chí
  searchHotels: (params) => {
    // params gồm: keyword (tên), minPrice, maxPrice, distance, amenities, location
    return axiosClient.get('/hotels/search', { params });
  },

  // FR-07: Xem chi tiết cơ sở lưu trú
  getHotelById: (id) => {
    return axiosClient.get(`/hotels/${id}`);
  },

  // FR-06: Tính khoảng cách di chuyển thực tế từ vị trí khách
  calculateDistance: (hotelId, userLocation) => {
    return axiosClient.post(`/hotels/${hotelId}/distance`, userLocation);
  },

  // --- HOST APIS ---

  // Lấy danh sách cơ sở của Host hiện tại
  getHostHotels: () => {
    return axiosClient.get('/host/hotels');
  },

  // FR-14: Tạo cơ sở lưu trú mới (Bước 1: Lưu bản nháp để nhận CSLT_ID UUID)
  createDraft: (data) => {
    return axiosClient.post('/host/hotels/draft', data);
  },

  // FR-15, FR-17: Cập nhật thông tin cơ sở
  updateHotel: (id, data) => {
    return axiosClient.put(`/host/hotels/${id}`, data);
  },

  // FR-16: Upload Media (Hình ảnh, Video) kèm CSLT_ID
  uploadMedia: (hotelId, formData) => {
    return axiosClient.post(`/host/hotels/${hotelId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Xóa media
  deleteMedia: (hotelId, mediaId) => {
    return axiosClient.delete(`/host/hotels/${hotelId}/media/${mediaId}`);
  },

  // FR-18: Gửi kiểm duyệt (Sau khi đã thỏa mãn Checklist)
  submitForModeration: (hotelId, coordinates) => {
    return axiosClient.post(`/host/hotels/${hotelId}/submit-moderation`, coordinates);
  },

  // Rút lại yêu cầu kiểm duyệt (Chuyển về trạng thái Bản nháp)
  withdrawModeration: (hotelId) => {
    return axiosClient.post(`/host/hotels/${hotelId}/withdraw`);
  },

  // Xóa cơ sở (Chỉ áp dụng cho Bản nháp hoặc Bị từ chối)
  deleteHotel: (hotelId) => {
    return axiosClient.delete(`/host/hotels/${hotelId}`);
  },
};
