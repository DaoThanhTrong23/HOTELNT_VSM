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
