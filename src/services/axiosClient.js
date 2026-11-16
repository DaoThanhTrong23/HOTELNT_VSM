import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.hotelnt.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Kiểm tra định dạng JWT hợp lệ (header.payload.signature)
const isValidJwt = (token) => typeof token === 'string' && token.split('.').length === 3;

// Request Interceptor: Tự động đính kèm JWT Token vào Header nếu có
axiosClient.interceptors.request.use(
  (config) => {
    // Nếu data là FormData, xóa Content-Type mặc định để trình duyệt tự tạo boundary multipart chuẩn
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.info(`🌐 [API Request] ${config.method?.toUpperCase()} ${fullUrl}`, config.params || config.data || '');
    const token = localStorage.getItem('token');
    if (token) {
      const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true';
      const isMockToken = token.startsWith('mock_') || token.startsWith('jwt_admin_') || token.startsWith('jwt_host_') || !isValidJwt(token);

      // Nếu đang kết nối Backend thật mà token trong localStorage là token mock cũ:
      // Tự động dọn dẹp sạch sẽ để tránh làm sập middleware JWT của Backend (gây lỗi 500)
      if (!isMockEnabled && isMockToken) {
        console.warn('⚠️ Phát hiện token Mock cũ trong localStorage khi đang bật API thật. Đã tự động dọn dẹp để tránh lỗi 500 từ Backend!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý dữ liệu trả về và bắt lỗi bảo mật tập trung
axiosClient.interceptors.response.use(
  (response) => {
    console.info(`✅ [API Response] ${response.status} from ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    console.warn(
      `❌ [API Error] ${error.response?.status || 'Network Error'} from ${error.config?.url}:`,
      error.response?.data || error.message
    );
    if (error.response) {
      const { status } = error.response;

      // 401 hoặc 500 do token không hợp lệ -> Xóa phiên và về trang login nếu ở trang nội bộ
      const isAuthError =
        status === 401 ||
        (status === 500 &&
          (error.response?.data?.error?.code === 'INTERNAL_ERROR' ||
            error.response?.data?.error?.code === 'TOKEN_INVALID'));

      if (isAuthError) {
        const token = localStorage.getItem('token');
        if (token && !isValidJwt(token)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          } else if (window.location.pathname.startsWith('/host')) {
            window.location.href = '/login';
          }
        }
      }

      // 403: Không có quyền truy cập
      if (status === 403) {
        console.warn('Lỗi 403: Bạn không có quyền truy cập tài nguyên này.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
