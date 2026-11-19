import { PRICE_LIMITS } from './enums';

/**
 * Danh sách loại hình cơ sở lưu trú (FR-03) khớp chuẩn Backend DB
 */
export const LOAI_HINH_OPTIONS = [
  'Tất cả',
  'Khách sạn',
  'Villa',
  'Homestay',
  'Resort',
  'Căn hộ',
];

/**
 * Danh sách Phường/Xã TP. Nha Trang (FR-03, khớp chính xác ID trong database Backend)
 */
export const NHA_TRANG_WARDS = [
  { id: '', name: 'Tất cả Phường / Xã' },
  { id: '2', name: 'Phường Lộc Thọ' },
  { id: '1', name: 'Phường Phước Hải' },
  { id: '3', name: 'Phường Vĩnh Phước' },
  { id: '4', name: 'Phường Vĩnh Hải' },
  { id: '5', name: 'Phường Vĩnh Nguyên' },
  { id: '6', name: 'Phường Phước Long' },
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
 * Danh sách tiện ích phổ biến (FR-04 - quy tắc AND, khớp ID Backend)
 */
export const AMENITY_OPTIONS = [
  'Hồ bơi',
  'Wifi',
  'Gần biển',
  'Bãi đậu xe',
  'Điều hòa',
  'Bếp riêng',
  'Gần chợ đêm',
  'Gần trung tâm',
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
 * Các tùy chọn khoảng cách (FR-03, FR-09)
 */
export const DISTANCE_OPTIONS = [
  { value: '', label: 'Bất kỳ' },
  { value: '1', label: 'Dưới 1km' },
  { value: '3', label: 'Dưới 3km' },
  { value: '5', label: 'Dưới 5km' },
];

/**
 * Các địa điểm lân cận nổi bật tại Nha Trang
 */
export const NEARBY_OPTIONS = [
  'Gần biển',
  'Gần nhà hàng',
  'Gần khu vui chơi',
];

/**
 * Số item hiển thị trên mỗi trang kết quả
 */
export const SEARCH_PAGE_SIZE = 5;
