import axiosClient from './axiosClient';

export const authService = {
  // FR-12: Đăng nhập Host
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },

  // FR-11: Đăng ký Host (Nhận mã Email OTP)
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },

  // FR-11, FR-12: Xác thực mã Email OTP
  verifyOtp: (data) => {
    return axiosClient.post('/auth/verify-otp', data);
  },

  // Gửi lại mã OTP (sau 60s)
  resendOtp: (email) => {
    return axiosClient.post('/auth/resend-otp', { email });
  },

  // FR-13: Quên mật khẩu
  forgotPassword: (email) => {
    return axiosClient.post('/auth/forgot-password', { email });
  },

  // FR-13: Đặt lại mật khẩu với OTP
  resetPassword: (data) => {
    return axiosClient.post('/auth/reset-password', data);
  },

  // FR-13: Lấy thông tin cá nhân
  getProfile: () => {
    return axiosClient.get('/auth/profile');
  },

  // FR-13: Cập nhật Họ tên, SĐT (Email & CCCD bị khóa Read-only)
  updateProfile: (data) => {
    return axiosClient.put('/auth/profile', data);
  },

  // FR-19: Đăng nhập Admin nội bộ
  adminLogin: (data) => {
    return axiosClient.post('/admin/auth/login', data);
  },
};
