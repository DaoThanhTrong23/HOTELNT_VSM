/**
 * Hàm lọc và sắp xếp danh sách cơ sở lưu trú (FR-03, FR-04)
 * Pure function: không làm thay đổi mảng gốc, dễ dàng unit test
 *
 * @param {Object} params
 * @param {Array} params.hotels Danh sách cơ sở lưu trú đầu vào
 * @param {string} params.keyword Từ khóa tìm kiếm (tên khách sạn)
 * @param {string} params.loaiHinh Loại hình đã chọn ('Tất cả' hoặc loại cụ thể)
 * @param {number} params.minPrice Giá tối thiểu
 * @param {number} params.maxPrice Giá tối đa
 * @param {Array<string>} params.amenities Mảng các tiện ích yêu cầu
 * @param {string} params.sortBy Tiêu chí sắp xếp ('price_asc', 'price_desc', 'distance', 'rating')
 * @returns {Array} Danh sách sau khi lọc và sắp xếp
 */
export function applyFiltersAndSort({
  hotels = [],
  keyword = '',
  loaiHinh = 'Tất cả',
  minPrice = 0,
  maxPrice = Infinity,
  amenities = [],
  sortBy = 'price_asc',
}) {
  let result = [...hotels];

  // 1. Lọc theo từ khóa (FR-02)
  if (keyword.trim()) {
    const kw = keyword.toLowerCase();
    result = result.filter((h) => h.name?.toLowerCase().includes(kw));
  }

  // 2. Lọc theo loại hình (FR-03)
  if (loaiHinh && loaiHinh !== 'Tất cả') {
    result = result.filter((h) => h.type === loaiHinh);
  }

  // 3. Lọc theo khoảng giá (FR-03)
  result = result.filter((h) => h.minPrice >= minPrice && h.minPrice <= maxPrice);

  // 4. Lọc theo tiện ích - quy tắc AND (FR-04): phải chứa đủ toàn bộ tiện ích đã chọn
  if (amenities.length > 0) {
    result = result.filter((h) =>
      amenities.every((a) => Array.isArray(h.amenities) && h.amenities.includes(a))
    );
  }

  // 5. Sắp xếp kết quả (FR-04)
  result.sort((a, b) => {
    if (sortBy === 'price_asc') return (a.minPrice ?? 0) - (b.minPrice ?? 0);
    if (sortBy === 'price_desc') return (b.minPrice ?? 0) - (a.minPrice ?? 0);
    if (sortBy === 'distance') return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  return result;
}
