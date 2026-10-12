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
