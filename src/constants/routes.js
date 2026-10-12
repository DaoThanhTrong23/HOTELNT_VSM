/**
 * ĐỊNH NGHĨA TOÀN BỘ ROUTE PATHS CỦA ỨNG DỤNG
 */

export const ROUTES = {
  // --- TOURIST (Khách du lịch) ---
  HOME: '/',
  SEARCH: '/search',
  HOTEL_DETAIL: '/hotel/:id',

  // --- AUTH (Xác thực chung & Host) ---
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',

  // --- HOST PORTAL (Chủ cơ sở lưu trú) ---
  HOST: {
    DASHBOARD: '/host/dashboard',
    HOTELS: '/host/hotels',
    ADD_HOTEL: '/host/hotels/new',
    EDIT_HOTEL: '/host/hotels/:id/edit',
    PROFILE: '/host/profile',
  },

  // --- ADMIN PORTAL (Quản trị viên) ---
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    MODERATION: '/admin/moderation',
    HOST_MANAGEMENT: '/admin/hosts',
    SYSTEM_CONFIG: '/admin/config',
  },
};
