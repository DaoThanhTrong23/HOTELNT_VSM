/**
 * Hàm lọc và sắp xếp danh sách cơ sở lưu trú (FR-02, FR-03, FR-04, FR-09)
 * Pure function: không làm thay đổi mảng gốc, dễ dàng unit test
 *
 * @param {Object} params
 * @param {Array}  params.hotels      Danh sách cơ sở lưu trú đầu vào
 * @param {string} params.keyword     Từ khóa tìm kiếm (tên khách sạn)
 * @param {string} params.loaiHinh   Loại hình đã chọn ('Tất cả' hoặc loại cụ thể)
 * @param {number} params.minPrice    Giá tối thiểu
 * @param {number} params.maxPrice    Giá tối đa
 * @param {Array}  params.amenities   Mảng các tiện ích yêu cầu (AND rule)
 * @param {string} params.distance    Khoảng cách tối đa tính bằng km ('1','3','5','')
 * @param {string} params.sortBy      Tiêu chí sắp xếp ('price_asc', 'price_desc', 'distance', 'rating')
 * @returns {Array} Danh sách sau khi lọc và sắp xếp
 */
export function applyFiltersAndSort({
  hotels = [],
  keyword = '',
  loaiHinh = 'Tất cả',
  minPrice = 0,
  maxPrice = Infinity,
  amenities = [],
  distance = '',
  phuong = '',
  sortBy = 'price_asc',
}) {
  let result = [...hotels];

  // 1. Lọc theo từ khóa – trim + lowercase (TC_HOM_02, TC_HOM_03 – FR-02)
  if (keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    result = result.filter((h) => h.name?.toLowerCase().includes(kw));
  }

  // 2. Lọc theo loại hình (FR-03)
  if (loaiHinh && loaiHinh !== 'Tất cả') {
    result = result.filter((h) => h.type === loaiHinh);
  }

  // 3. Lọc theo khoảng giá (TC_SEA_02 – FR-03)
  result = result.filter((h) => h.minPrice >= minPrice && h.minPrice <= maxPrice);

  // 4. Lọc theo tiện ích – quy tắc AND (TC_SEA_04, TC_SEA_06 – FR-03)
  // Đồng thời hỗ trợ alias tiếng Việt ('Bể bơi' tương đương 'Hồ bơi')
  if (amenities.length > 0) {
    result = result.filter((h) => {
      if (!Array.isArray(h.amenities)) return false;
      return amenities.every((req) => {
        if (req === 'Bể bơi' || req === 'Hồ bơi') {
          return h.amenities.includes('Hồ bơi') || h.amenities.includes('Bể bơi');
        }
        return h.amenities.includes(req);
      });
    });
  }

  // 5. Lọc theo Phường/Xã (TC_SEA_05, TC_SEA_06 – FR-03)
  if (phuong && phuong.trim()) {
    const p = phuong.trim().toLowerCase();
    result = result.filter((h) => h.address?.toLowerCase().includes(p));
  }

  // 6. Lọc theo khoảng cách (TC_SEA_03 – FR-03, FR-09)
  if (distance && !isNaN(Number(distance))) {
    const maxKm = Number(distance);
    result = result.filter((h) => (h.distanceKm ?? 999) <= maxKm);
  }

  // 7. Sắp xếp kết quả (TC_SEA_07, TC_SEA_08, TC_SEA_09 – FR-04)
  result.sort((a, b) => {
    if (sortBy === 'price_asc')  return (a.minPrice ?? 0) - (b.minPrice ?? 0);
    if (sortBy === 'price_desc') return (b.minPrice ?? 0) - (a.minPrice ?? 0);
    if (sortBy === 'distance')   return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
    if (sortBy === 'rating')     return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  return result;
}
