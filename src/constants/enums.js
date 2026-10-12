/**
 * ENUMS & BUSINESS RULES THEO CHUẨN SRS_HOTELNT
 */

// 1. Trạng thái cơ sở lưu trú (Hotel Status)
export const HOTEL_STATUS = {
  DRAFT: 'DRAFT',         // Bản nháp
  PENDING: 'PENDING',     // Chờ duyệt
  APPROVED: 'APPROVED',   // Đã duyệt (Đang live)
  REJECTED: 'REJECTED',   // Bị từ chối
};

export const HOTEL_STATUS_LABELS = {
  [HOTEL_STATUS.DRAFT]: 'Bản nháp',
  [HOTEL_STATUS.PENDING]: 'Chờ duyệt',
  [HOTEL_STATUS.APPROVED]: 'Đã duyệt',
  [HOTEL_STATUS.REJECTED]: 'Từ chối duyệt',
};

// 2. Phân quyền tài khoản (User Roles)
export const USER_ROLES = {
  TOURIST: 'TOURIST', // Khách du lịch (Không cần đăng nhập)
  HOST: 'HOST',       // Chủ cơ sở lưu trú
  ADMIN: 'ADMIN',     // Quản trị viên
};

// 3. Ràng buộc Tọa độ Bản đồ Nha Trang (FR-18)
export const NHA_TRANG_MAP_BOUNDS = {
  LAT_MIN: 12.1,
  LAT_MAX: 12.45,
  LNG_MIN: 109.1,
  LNG_MAX: 109.3,
  DEFAULT_CENTER: { lat: 12.2388, lng: 109.1967 }, // Tọa độ trung tâm TP. Nha Trang
};

// 4. Giới hạn Upload Media (FR-16)
export const MEDIA_LIMITS = {
  IMAGE_MIN: 3,
  IMAGE_MAX: 100,
  IMAGE_MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  VIDEO_MAX: 5,
  VIDEO_MAX_SIZE_MB: 100,
  ALLOWED_VIDEO_TYPES: ['video/mp4'],
};

// 5. Ràng buộc Giá cơ sở lưu trú (FR-17)
export const PRICE_LIMITS = {
  MIN_VND: 50_000,
  MAX_VND: 100_000_000,
};

// 6. Ràng buộc Xác thực OTP & Bảo mật (FR-11, FR-12)
export const AUTH_RULES = {
  OTP_LENGTH: 6,
  OTP_EXPIRE_SECONDS: 300,  // 5 phút
  OTP_RESEND_COOLDOWN: 60,  // 60 giây
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
};
