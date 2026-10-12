import axiosClient from './axiosClient';

export const adminService = {
  // FR-21: Xem danh sách cơ sở chờ duyệt
  getPendingHotels: () => {
    return axiosClient.get('/admin/moderation/pending');
  },

  // FR-22: Duyệt cơ sở (Chuyển sang Đã duyệt / Public)
  approveHotel: (hotelId) => {
    return axiosClient.post(`/admin/moderation/${hotelId}/approve`);
  },

  // FR-23: Từ chối cơ sở (Lý do tùy chọn, gửi email thông báo cho Host)
  rejectHotel: (hotelId, reason) => {
    return axiosClient.post(`/admin/moderation/${hotelId}/reject`, { reason });
  },

  // FR-24: Xem danh sách cơ sở đang hiển thị (Đã duyệt)
  getLiveHotels: () => {
    return axiosClient.get('/admin/moderation/live');
  },

  // FR-24: Ẩn / Gỡ cơ sở vi phạm
  hideHotel: (hotelId, reason) => {
    return axiosClient.post(`/admin/moderation/${hotelId}/hide`, { reason });
  },

  // FR-20: Quản lý danh sách Host
  getHosts: (params) => {
    return axiosClient.get('/admin/hosts', { params });
  },

  // FR-20: Khóa / Mở khóa tài khoản Host
  toggleLockHost: (hostId, isLocked, reason) => {
    return axiosClient.post(`/admin/hosts/${hostId}/toggle-lock`, { isLocked, reason });
  },

  // FR-25: Lấy cấu hình SEO
  getSeoConfig: () => {
    return axiosClient.get('/admin/config/seo');
  },

  // FR-25: Cập nhật cấu hình SEO
  updateSeoConfig: (data) => {
    return axiosClient.put('/admin/config/seo', data);
  },

  // FR-26: Lấy cấu hình AI Chatbot
  getAiConfig: () => {
    return axiosClient.get('/admin/config/ai');
  },

  // FR-26: Cập nhật cấu hình AI Chatbot
  updateAiConfig: (data) => {
    return axiosClient.put('/admin/config/ai', data);
  },
};
