import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.hotelnt.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Tự động đính kèm JWT Token vào Header nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý dữ liệu trả về và bắt lỗi bảo mật tập trung
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // 401: Token hết hạn hoặc không hợp lệ -> Xóa phiên và về trang login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Không redirect tự động nếu đang ở trang public
        if (window.location.pathname.startsWith('/host') || window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
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
