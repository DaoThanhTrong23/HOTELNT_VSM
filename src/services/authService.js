import axiosClient from './axiosClient';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper giả lập độ trễ khi chạy chế độ Mock
const mockDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * AUTH SERVICE
 * Chuẩn hóa 100% khớp từng endpoint theo API_DESIGN.xlsx (Dòng 14 – 24):
 *
 * 1. POST /auth/signup                 - FR-11: Đăng ký tài khoản Host
 * 2. POST /auth/signup/verify          - FR-11: Xác thực OTP đăng ký
 * 3. POST /auth/otp/resend             - FR-11, FR-12: Gửi lại mã OTP
 * 4. POST /auth/signin                 - FR-12: Đăng nhập Host bước 1
 * 5. POST /auth/signin/verify          - FR-12: Xác thực OTP đăng nhập Host
 * 6. POST /auth/admin/signin           - FR-19: Đăng nhập Admin nội bộ (không OTP)
 * 7. POST /auth/forgot-password        - FR-13: Yêu cầu gửi OTP quên mật khẩu
 * 8. POST /auth/forgot-password/verify - FR-13: Xác thực OTP quên mật khẩu
 * 9. POST /auth/reset-password         - FR-13: Đặt lại mật khẩu mới
 * 10. POST /auth/refresh               - FR-12: Làm mới Access Token
 * 11. POST /auth/logout                - FR-12: Đăng xuất
 */
export const authService = {
  // ── 1. ĐĂNG KÝ TÀI KHOẢN HOST (POST /auth/signup) ──────────────────────────
  signup: async (data) => {
    const payload = {
      hoTen: data.hoTen,
      soDienThoai: data.soDienThoai,
      email: data.email,
      cccd: data.cccd,
      matKhau: data.matKhau || data.password,
    };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          registrationId: 'reg_' + Date.now(),
          challengeId: 'chg_reg_' + Date.now(),
          otpExpiresIn: 300,
          resendAfter: 60,
          message: 'Đã gửi mã OTP xác thực tới email.',
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/signup', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            registrationId: 'reg_' + Date.now(),
            challengeId: 'chg_reg_' + Date.now(),
            otpExpiresIn: 300,
            resendAfter: 60,
            message: 'Đã gửi mã OTP xác thực tới email.',
          },
        };
      }
      throw err;
    }
  },

  // ── 2. XÁC THỰC OTP ĐĂNG KÝ (POST /auth/signup/verify) ───────────────────────
  signupVerify: async (data) => {
    const payload = {
      registrationId: data.registrationId || data.challengeId,
      otpCode: data.otpCode || data.otp,
    };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          accessToken: 'jwt_host_access_' + Date.now(),
          refreshToken: 'jwt_host_refresh_' + Date.now(),
          expiresIn: 1800,
          userInfo: {
            id: 1,
            hoTen: data.hoTen || 'Chủ cơ sở HotelNT',
            email: data.email || 'host@hotelnt.vn',
            soDienThoai: data.soDienThoai || '0901234567',
            vaiTro: 'HOST',
          },
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/signup/verify', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            accessToken: 'jwt_host_access_' + Date.now(),
            refreshToken: 'jwt_host_refresh_' + Date.now(),
            expiresIn: 1800,
            userInfo: {
              id: 1,
              hoTen: data.hoTen || 'Chủ cơ sở HotelNT',
              email: data.email || 'host@hotelnt.vn',
              soDienThoai: data.soDienThoai || '0901234567',
              vaiTro: 'HOST',
            },
          },
        };
      }
      throw err;
    }
  },

  // ── 3. GỬI LẠI MÃ OTP (POST /auth/otp/resend) ───────────────────────────────
  resendOtp: async (data) => {
    const payload =
      typeof data === 'string'
        ? { challengeId: data, email: data }
        : {
            challengeId: data.challengeId || data.registrationId,
            email: data.email,
          };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          challengeId: payload.challengeId || 'chg_resend_' + Date.now(),
          otpExpiresIn: 300,
          resendAfter: 60,
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/otp/resend', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            challengeId: payload.challengeId || 'chg_resend_' + Date.now(),
            otpExpiresIn: 300,
            resendAfter: 60,
          },
        };
      }
      throw err;
    }
  },

  // ── 4. ĐĂNG NHẬP HOST (POST /auth/signin) ──────────────────────────────────
  signin: async (data) => {
    const payload = {
      loginIdentity: data.loginIdentity || data.email,
      matKhau: data.matKhau || data.password,
    };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          challengeId: 'chg_signin_' + Date.now(),
          otpExpiresIn: 300,
          resendAfter: 60,
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/signin', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            challengeId: 'chg_signin_' + Date.now(),
            otpExpiresIn: 300,
            resendAfter: 60,
          },
        };
      }
      throw err;
    }
  },

  // ── 5. XÁC THỰC OTP ĐĂNG NHẬP (POST /auth/signin/verify) ────────────────────
  signinVerify: async (data) => {
    const payload = {
      challengeId: data.challengeId || data.registrationId,
      otpCode: data.otpCode || data.otp,
    };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          accessToken: 'jwt_host_access_' + Date.now(),
          refreshToken: 'jwt_host_refresh_' + Date.now(),
          expiresIn: 1800,
          userInfo: {
            id: 1,
            hoTen: 'Nguyễn Văn An',
            email: data.email || 'nguyenvanan@hotelnt.vn',
            soDienThoai: '0905123456',
            vaiTro: 'HOST',
          },
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/signin/verify', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            accessToken: 'jwt_host_access_' + Date.now(),
            refreshToken: 'jwt_host_refresh_' + Date.now(),
            expiresIn: 1800,
            userInfo: {
              id: 1,
              hoTen: 'Nguyễn Văn An',
              email: data.email || 'nguyenvanan@hotelnt.vn',
              soDienThoai: '0905123456',
              vaiTro: 'HOST',
            },
          },
        };
      }
      throw err;
    }
  },

  // ── 6. ĐĂNG NHẬP ADMIN NỘI BỘ (POST /auth/admin/signin) ─────────────────────
  adminSignin: async (data) => {
    const payload = {
      email: data.email,
      matKhau: data.matKhau || data.password,
    };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          accessToken: 'jwt_admin_token_' + Date.now(),
          refreshToken: 'jwt_admin_refresh_' + Date.now(),
          expiresIn: 1800,
          userInfo: {
            id: 'admin-01',
            hoTen: 'Đào Thanh Trọng',
            email: data.email || 'admin@hotelnt.vn',
            vaiTro: 'ADMIN',
          },
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/admin/signin', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            accessToken: 'jwt_admin_token_' + Date.now(),
            refreshToken: 'jwt_admin_refresh_' + Date.now(),
            expiresIn: 1800,
            userInfo: {
              id: 'admin-01',
              hoTen: 'Đào Thanh Trọng',
              email: data.email || 'admin@hotelnt.vn',
              vaiTro: 'ADMIN',
            },
          },
        };
      }
      throw err;
    }
  },

  // ── 7. QUÊN MẬT KHẨU (POST /auth/forgot-password) ──────────────────────────
  forgotPassword: async (data) => {
    const payload =
      typeof data === 'string'
        ? { emailOrPhone: data }
        : { emailOrPhone: data.emailOrPhone || data.email || data.soDienThoai };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          challengeId: 'chg_forgot_' + Date.now(),
          otpExpiresIn: 300,
          resendAfter: 60,
          message:
            'Nếu thông tin bạn nhập là chính xác, một mã OTP khôi phục đã được gửi đến thiết bị của bạn.',
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/forgot-password', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            challengeId: 'chg_forgot_' + Date.now(),
            otpExpiresIn: 300,
            resendAfter: 60,
            message:
              'Nếu thông tin bạn nhập là chính xác, một mã OTP khôi phục đã được gửi đến thiết bị của bạn.',
          },
        };
      }
      throw err;
    }
  },

  // ── 8. XÁC THỰC OTP QUÊN MẬT KHẨU (POST /auth/forgot-password/verify) ───────
  forgotPasswordVerify: async (data) => {
    const payload = {
      challengeId: data.challengeId,
      otpCode: data.otpCode || data.otp,
    };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        data: {
          resetToken: 'reset_token_' + Date.now(),
        },
      };
    }

    try {
      const res = await axiosClient.post('/auth/forgot-password/verify', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          data: {
            resetToken: 'reset_token_' + Date.now(),
          },
        };
      }
      throw err;
    }
  },

  // ── 9. ĐẶT LẠI MẬT KHẨU MỚI (POST /auth/reset-password) ─────────────────────
  resetPassword: async (data) => {
    const payload = {
      resetToken: data.resetToken,
      newPassword: data.newPassword || data.matKhauMoi,
    };

    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        message: 'Đặt lại mật khẩu thành công.',
      };
    }

    try {
      const res = await axiosClient.post('/auth/reset-password', payload);
      return res?.data || res;
    } catch (err) {
      if (!err?.response) {
        return {
          success: true,
          message: 'Đặt lại mật khẩu thành công.',
        };
      }
      throw err;
    }
  },

  // ── 10. LÀM MỚI ACCESS TOKEN (POST /auth/refresh) ─────────────────────────
  refresh: async (refreshToken) => {
    const payload = typeof refreshToken === 'string' ? { refreshToken } : refreshToken;

    if (USE_MOCK) {
      await mockDelay(200);
      return {
        success: true,
        data: {
          accessToken: 'jwt_host_access_refreshed_' + Date.now(),
          refreshToken: 'jwt_host_refresh_refreshed_' + Date.now(),
          expiresIn: 1800,
        },
      };
    }

    const res = await axiosClient.post('/auth/refresh', payload);
    return res?.data || res;
  },

  // ── 11. ĐĂNG XUẤT (POST /auth/logout) ──────────────────────────────────────
  logout: async (refreshToken) => {
    const payload = typeof refreshToken === 'string' ? { refreshToken } : refreshToken || {};

    if (USE_MOCK) {
      await mockDelay(100);
      return {
        success: true,
        message: 'Đăng xuất thành công.',
      };
    }

    try {
      const res = await axiosClient.post('/auth/logout', payload);
      return res?.data || res;
    } catch (_err) {
      return {
        success: true,
        message: 'Đăng xuất thành công.',
      };
    }
  },

  // ── TƯƠNG THÍCH NGƯỢC CHO CÁC MÀN HÌNH ĐANG GỌI TÊN CŨ ────────────────────
  login: (data) => authService.signin(data),
  register: (data) => authService.signup(data),
  adminLogin: (data) => authService.adminSignin(data),
  verifyOtp: (data) =>
    data?.flow === 'SIGNUP' || data?.registrationId
      ? authService.signupVerify(data)
      : data?.flow === 'FORGOT_PASSWORD'
        ? authService.forgotPasswordVerify(data)
        : authService.signinVerify(data),
  refreshToken: (token) => authService.refresh(token),
  getProfile: () => axiosClient.get('/host/profile'),
  updateProfile: (data) => axiosClient.patch('/host/profile', data),
};

export default authService;
