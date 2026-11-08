import axiosClient from './axiosClient';
import { USE_MOCK, mockAdminApi } from '../mocks/mockAdmin';

/**
 * ADMIN SERVICE
 * Kết nối các API theo đúng tài liệu API_DESIGN.xlsx (/admin router).
 * Khi chưa có BE (USE_MOCK=true), tự động gọi mockAdminApi để FE hoạt động hoàn hảo.
 */

const unwrap = (res) =>
  res && typeof res === 'object' && res.data && typeof res.data === 'object' && !Array.isArray(res.data)
    ? res.data
    : res;

export const adminService = {
  // ==========================================
  // 1. KIỂM DUYỆT CƠ SỞ LƯU TRÚ (API_DESIGN Row 42 - 45)
  // ==========================================

  // GET /admin/listings (Row 42)
  getListings: async (params) => {
    if (USE_MOCK) return mockAdminApi.getListings(params);
    try {
      const res = await axiosClient.get('/admin/listings', { params });
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.getListings(params);
    }
  },

  // GET /admin/listings/:maCSLT (Row 43)
  getListingDetail: async (maCSLT) => {
    if (USE_MOCK) return mockAdminApi.getListingDetail(maCSLT);
    try {
      const res = await axiosClient.get(`/admin/listings/${maCSLT}`);
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.getListingDetail(maCSLT);
    }
  },

  // PATCH /admin/listings/:maCSLT/moderation (Row 44 - Duyệt / Từ chối)
  moderateListing: async (maCSLT, { action, lyDoTuChoi }) => {
    if (USE_MOCK) return mockAdminApi.moderateListing(maCSLT, { action, lyDoTuChoi });
    try {
      const res = await axiosClient.patch(`/admin/listings/${maCSLT}/moderation`, {
        action,
        lyDoTuChoi,
      });
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.moderateListing(maCSLT, { action, lyDoTuChoi });
    }
  },

  // PATCH /admin/listings/:maCSLT/unpublish (Row 45 - Ẩn / Gỡ cơ sở vi phạm)
  unpublishListing: async (maCSLT, { hinhThuc, lyDoViPham }) => {
    if (USE_MOCK) return mockAdminApi.unpublishListing(maCSLT, { hinhThuc, lyDoViPham });
    try {
      const res = await axiosClient.patch(`/admin/listings/${maCSLT}/unpublish`, {
        hinhThuc,
        lyDoViPham,
      });
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.unpublishListing(maCSLT, { hinhThuc, lyDoViPham });
    }
  },

  // ==========================================
  // 2. QUẢN LÝ TÀI KHOẢN HOST (API_DESIGN Row 39 - 41)
  // ==========================================

  // GET /admin/hosts (Row 39)
  getHosts: async (params) => {
    if (USE_MOCK) return mockAdminApi.getHosts(params);
    try {
      const res = await axiosClient.get('/admin/hosts', { params });
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.getHosts(params);
    }
  },

  // GET /admin/hosts/:id (Row 40)
  getHostDetail: async (id) => {
    if (USE_MOCK) return mockAdminApi.getHostDetail(id);
    try {
      const res = await axiosClient.get(`/admin/hosts/${id}`);
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.getHostDetail(id);
    }
  },

  // PATCH /admin/hosts/:id/status (Row 41 - Khóa / Mở khóa Host)
  updateHostStatus: async (id, { trangThai, lyDoKhoa }) => {
    if (USE_MOCK) return mockAdminApi.updateHostStatus(id, { trangThai, lyDoKhoa });
    try {
      const res = await axiosClient.patch(`/admin/hosts/${id}/status`, {
        trangThai,
        lyDoKhoa,
      });
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.updateHostStatus(id, { trangThai, lyDoKhoa });
    }
  },

  // ==========================================
  // 3. CẤU HÌNH HỆ THỐNG SEO & AI (API_DESIGN Row 46 - 50)
  // ==========================================

  // GET /admin/configurations/seo (Row 46)
  getSeoConfig: async () => {
    if (USE_MOCK) return mockAdminApi.getSeoConfig();
    try {
      const res = await axiosClient.get('/admin/configurations/seo');
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.getSeoConfig();
    }
  },

  // PUT /admin/configurations/seo (Row 47)
  updateSeoConfig: async (data) => {
    if (USE_MOCK) return mockAdminApi.updateSeoConfig(data);
    try {
      const res = await axiosClient.put('/admin/configurations/seo', data);
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.updateSeoConfig(data);
    }
  },

  // POST /admin/configurations/seo/og-image (Row 48)
  uploadOgImage: async (file) => {
    if (USE_MOCK) return mockAdminApi.uploadOgImage(file);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axiosClient.post('/admin/configurations/seo/og-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.uploadOgImage(file);
    }
  },

  // GET /admin/configurations/ai (Row 49)
  getAiConfig: async () => {
    if (USE_MOCK) return mockAdminApi.getAiConfig();
    try {
      const res = await axiosClient.get('/admin/configurations/ai');
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.getAiConfig();
    }
  },

  // PUT /admin/configurations/ai (Row 50)
  updateAiConfig: async (data) => {
    if (USE_MOCK) return mockAdminApi.updateAiConfig(data);
    try {
      const res = await axiosClient.put('/admin/configurations/ai', data);
      return unwrap(res);
    } catch (_err) {
      return mockAdminApi.updateAiConfig(data);
    }
  },
};
