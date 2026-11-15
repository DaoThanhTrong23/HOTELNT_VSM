import { NHA_TRANG_MAP_BOUNDS } from '../constants/enums';

// Định dạng tiền tệ VNĐ
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Định dạng ngày giờ
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Kiểm tra tọa độ có nằm trong TP. Nha Trang hay không (FR-18)
export const isInsideNhaTrang = (lat, lng) => {
  return (
    lat >= NHA_TRANG_MAP_BOUNDS.LAT_MIN &&
    lat <= NHA_TRANG_MAP_BOUNDS.LAT_MAX &&
    lng >= NHA_TRANG_MAP_BOUNDS.LNG_MIN &&
    lng <= NHA_TRANG_MAP_BOUNDS.LNG_MAX
  );
};

// Kiểm tra số điện thoại chuẩn Việt Nam (10 số)
export const isValidPhoneNumber = (phone) => {
  return /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone);
};

// Kiểm tra số CCCD (Đúng 12 chữ số)
export const isValidCCCD = (cccd) => {
  return /^[0-9]{12}$/.test(cccd);
};

// Kiểm tra định dạng Email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Kiểm tra độ mạnh mật khẩu theo SRS (Tối thiểu 8 ký tự, gồm 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt)
export const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

// Ảnh khách sạn dự phòng chất lượng cao (Nha Trang Unsplash) khi máy chủ chưa có file ảnh vật lý
export const DEFAULT_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
];

export const FALLBACK_HOTEL_IMAGE = DEFAULT_HOTEL_IMAGES[0];

// Xử lý link ảnh từ Backend API: Lấy 100% từ URL của Backend, không thay thế bằng ảnh FE
export const resolveHotelImageUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // Gắn domain Backend (Azure) cho các đường dẫn relative trả về từ BE
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : '/' + url;
  return apiBase + cleanPath;
};
