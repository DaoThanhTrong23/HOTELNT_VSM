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
    const res = await axiosClient.get('/admin/listings', { params });
    return unwrap(res);
  },

  // GET /admin/listings/:maCSLT (Row 43)
  getListingDetail: async (maCSLT) => {
    if (USE_MOCK) return mockAdminApi.getListingDetail(maCSLT);
    const res = await axiosClient.get(`/admin/listings/${maCSLT}`);
    return unwrap(res);
  },

  // PATCH /admin/listings/:maCSLT/moderation (Row 44 - Duyệt / Từ chối)
  moderateListing: async (maCSLT, { action, lyDoTuChoi }) => {
    if (USE_MOCK) return mockAdminApi.moderateListing(maCSLT, { action, lyDoTuChoi });
    const res = await axiosClient.patch(`/admin/listings/${maCSLT}/moderation`, {
      action,
      lyDoTuChoi,
    });
    return unwrap(res);
  },

  // PATCH /admin/listings/:maCSLT/unpublish (Row 45 - Ẩn / Gỡ cơ sở vi phạm)
  unpublishListing: async (maCSLT, { hinhThuc, lyDoViPham }) => {
    if (USE_MOCK) return mockAdminApi.unpublishListing(maCSLT, { hinhThuc, lyDoViPham });
    const res = await axiosClient.patch(`/admin/listings/${maCSLT}/unpublish`, {
      hinhThuc,
      lyDoViPham,
    });
    return unwrap(res);
  },

  // ==========================================
  // 2. QUẢN LÝ TÀI KHOẢN HOST (API_DESIGN Row 39 - 41)
  // ==========================================

  // GET /admin/hosts (Row 39)
  getHosts: async (params = {}) => {
    if (USE_MOCK) return mockAdminApi.getHosts(params);
    const cleanParams = {};
    if (params.trangThai && params.trangThai.toLowerCase() !== 'all') {
      cleanParams.trangThai = params.trangThai.toUpperCase();
    }
    if (params.keyword && params.keyword.trim()) {
      cleanParams.keyword = params.keyword.trim();
    }
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const res = await axiosClient.get('/admin/hosts', { params: cleanParams });
    return unwrap(res);
  },

  // GET /admin/hosts/:id (Row 40)
  getHostDetail: async (id) => {
    if (USE_MOCK) return mockAdminApi.getHostDetail(id);
    const res = await axiosClient.get(`/admin/hosts/${id}`);
    return unwrap(res);
  },

  // PATCH /admin/hosts/:id/status (Row 41 - Khóa / Mở khóa Host)
  updateHostStatus: async (id, { trangThai, lyDoKhoa }) => {
    if (USE_MOCK) return mockAdminApi.updateHostStatus(id, { trangThai, lyDoKhoa });
    const res = await axiosClient.patch(`/admin/hosts/${id}/status`, {
      trangThai,
      lyDoKhoa,
    });
    return unwrap(res);
  },

  // ==========================================
  // 3. CẤU HÌNH HỆ THỐNG SEO & AI (API_DESIGN Row 46 - 50)
  // ==========================================

  // GET /admin/configurations/seo (Row 46)
  getSeoConfig: async () => {
    if (USE_MOCK) return mockAdminApi.getSeoConfig();
    const res = await axiosClient.get('/admin/configurations/seo');
    return unwrap(res);
  },

  // PUT /admin/configurations/seo (Row 47)
  updateSeoConfig: async (data) => {
    if (USE_MOCK) return mockAdminApi.updateSeoConfig(data);
    const res = await axiosClient.put('/admin/configurations/seo', data);
    return unwrap(res);
  },

  // POST /admin/configurations/seo/og-image (Row 48)
  uploadOgImage: async (file) => {
    if (USE_MOCK) return mockAdminApi.uploadOgImage(file);
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post('/admin/configurations/seo/og-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  // GET /admin/configurations/ai (Row 49)
  getAiConfig: async () => {
    if (USE_MOCK) return mockAdminApi.getAiConfig();
    const res = await axiosClient.get('/admin/configurations/ai');
    return unwrap(res);
  },

  // PUT /admin/configurations/ai (Row 50)
  updateAiConfig: async (data) => {
    if (USE_MOCK) return mockAdminApi.updateAiConfig(data);
    const res = await axiosClient.put('/admin/configurations/ai', data);
    return unwrap(res);
  },
};
