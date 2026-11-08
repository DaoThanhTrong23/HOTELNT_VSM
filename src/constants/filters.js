import { PRICE_LIMITS } from './enums';

/**
 * Danh sách loại hình cơ sở lưu trú (FR-03)
 */
export const LOAI_HINH_OPTIONS = [
  'Tất cả',
  'Khách sạn',
  'Resort',
  'Homestay',
  'Hostel',
  'Nhà nghỉ',
];

/**
 * Danh sách Phường/Xã TP. Nha Trang (FR-03, API_DESIGN Row 3 & 10)
 */
export const NHA_TRANG_WARDS = [
  { id: '', name: 'Tất cả Phường / Xã' },
  { id: '1', name: 'Phường Lộc Thọ' },
  { id: '2', name: 'Phường Vĩnh Hòa' },
  { id: '3', name: 'Phường Vĩnh Hải' },
  { id: '4', name: 'Phường Vĩnh Phước' },
  { id: '5', name: 'Phường Vĩnh Thọ' },
  { id: '6', name: 'Phường Vĩnh Nguyên' },
  { id: '7', name: 'Phường Vĩnh Trường' },
  { id: '8', name: 'Phường Vạn Thạnh' },
  { id: '9', name: 'Phường Vạn Thắng' },
  { id: '10', name: 'Phường Tân Lập' },
  { id: '11', name: 'Phường Phước Tiến' },
  { id: '12', name: 'Phường Phước Tân' },
  { id: '13', name: 'Phường Phước Hải' },
  { id: '14', name: 'Phường Phước Long' },
  { id: '15', name: 'Phường Xương Huân' },
  { id: '16', name: 'Phường Phương Sài' },
  { id: '17', name: 'Phường Phương Sơn' },
  { id: '18', name: 'Phường Ngọc Hiệp' },
  { id: '19', name: 'Xã Vĩnh Lương' },
  { id: '20', name: 'Xã Vĩnh Phương' },
  { id: '21', name: 'Xã Vĩnh Ngọc' },
  { id: '22', name: 'Xã Vĩnh Thạnh' },
  { id: '23', name: 'Xã Vĩnh Trung' },
  { id: '24', name: 'Xã Vĩnh Hiệp' },
  { id: '25', name: 'Xã Vĩnh Thái' },
  { id: '26', name: 'Xã Phước Đồng' },
];

/**
 * Giới hạn bán kính tìm kiếm km (FR-03, API_DESIGN Row 3)
 */
export const RADIUS_LIMITS = {
  MIN_KM: 0, // 0 = Không giới hạn
  MAX_KM: 20,
};

export const RADIUS_PRESETS = [
  { label: 'Tất cả', value: 0 },
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
];

/**
 * Danh sách tiện ích phổ biến (FR-04 - quy tắc AND)
 */
export const AMENITY_OPTIONS = [
  'Wifi miễn phí',
  'Hồ bơi',
  'Giáp biển',
  'Chỗ đỗ xe',
  'Điều hòa',
  'Gần nhà hàng',
  'Buffet sáng',
  'Spa',
];

/**
 * Các tùy chọn sắp xếp kết quả tìm kiếm (FR-04)
 */
export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'distance', label: 'Khoảng cách gần nhất' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

/**
 * Gợi ý khoảng giá nhanh
 */
export const PRICE_PRESETS = [
  { label: 'Dưới 500k', min: PRICE_LIMITS.MIN_VND, max: 500000 },
  { label: '500k – 2tr', min: 500000, max: 2000000 },
  { label: 'Trên 2tr', min: 2000000, max: PRICE_LIMITS.MAX_VND },
];

/**
 * Số item hiển thị trên mỗi trang kết quả
 */
export const SEARCH_PAGE_SIZE = 5;
