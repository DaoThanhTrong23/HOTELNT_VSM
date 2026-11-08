import { NHA_TRANG_WARDS } from '../constants/filters';

/**
 * Hàm lọc và sắp xếp danh sách cơ sở lưu trú (FR-03, FR-04, API_DESIGN Row 3)
 * Pure function: không làm thay đổi mảng gốc, dễ dàng unit test
 *
 * @param {Object} params
 * @param {Array} params.hotels Danh sách cơ sở lưu trú đầu vào
 * @param {string} params.keyword Từ khóa tìm kiếm (tên khách sạn)
 * @param {string} params.loaiHinh Loại hình đã chọn ('Tất cả' hoặc loại cụ thể)
 * @param {string|number} params.maPhuong Mã phường/xã đã chọn
 * @param {number} params.radiusKm Bán kính tìm kiếm (km)
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
  maPhuong = '',
  radiusKm = 0,
  minPrice = 0,
  maxPrice = Infinity,
  amenities = [],
  sortBy = 'price_asc',
}) {
  let result = [...hotels];

  // 1. Lọc theo từ khóa (FR-02)
  if (keyword.trim()) {
    const kw = keyword.toLowerCase();
    result = result.filter(
      (h) =>
        (h.name && h.name.toLowerCase().includes(kw)) ||
        (h.tenCSLT && h.tenCSLT.toLowerCase().includes(kw))
    );
  }

  // 2. Lọc theo loại hình (FR-03)
  if (loaiHinh && loaiHinh !== 'Tất cả') {
    result = result.filter((h) => (h.type || h.tenLoai) === loaiHinh);
  }

  // 3. Lọc theo Phường/Xã TP. Nha Trang (FR-03, Row 3)
  if (maPhuong) {
    const wardObj = NHA_TRANG_WARDS.find((w) => String(w.id) === String(maPhuong));
    const wardName = wardObj ? wardObj.name.replace(/^(Phường|Xã)\s+/i, '').toLowerCase() : '';
    result = result.filter((h) => {
      if (h.maPhuong && String(h.maPhuong) === String(maPhuong)) return true;
      const addr = (h.address || h.diaChiChiTiet || '').toLowerCase();
      if (wardName && addr.includes(wardName)) return true;
      return false;
    });
  }

  // 4. Lọc theo bán kính khoảng cách (radiusKm)
  if (radiusKm && Number(radiusKm) > 0) {
    const maxDist = Number(radiusKm);
    result = result.filter((h) => {
      const dist = h.distanceKm ?? h.khoangCach ?? 2.5;
      return dist <= maxDist;
    });
  }

  // 5. Lọc theo khoảng giá (FR-03)
  result = result.filter((h) => {
    const price = h.minPrice ?? h.gia ?? 0;
    return price >= minPrice && price <= maxPrice;
  });

  // 6. Lọc theo tiện ích - quy tắc AND (FR-04): phải chứa đủ toàn bộ tiện ích đã chọn
  if (amenities.length > 0) {
    result = result.filter((h) => {
      const hotelAmenities = Array.isArray(h.amenities)
        ? h.amenities
        : Array.isArray(h.tienIch)
          ? h.tienIch.map((t) => (typeof t === 'string' ? t : t.tenTienIch))
          : [];
      return amenities.every((a) => hotelAmenities.some((item) => item.includes(a) || a.includes(item)));
    });
  }

  // 7. Sắp xếp kết quả (FR-04)
  result.sort((a, b) => {
    const priceA = a.minPrice ?? a.gia ?? 0;
    const priceB = b.minPrice ?? b.gia ?? 0;
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'distance') {
      const distA = a.distanceKm ?? a.khoangCach ?? 99;
      const distB = b.distanceKm ?? b.khoangCach ?? 99;
      return distA - distB;
    }
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  return result;
}
