/**
 * DỮ LIỆU MOCK theo đúng shape của API_DESIGN (/listings, /chatbot).
 * Bật bằng VITE_USE_MOCK=true (mặc định bật ở .env.development) để FE chạy được khi chưa có backend.
 */
import { haversineKm } from '../utils/geo';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const img = (id) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop&q=80`;

const LISTINGS = [
  {
    maCSLT: 1,
    tenCSLT: 'Khách sạn Mường Thanh Luxury Nha Trang',
    tenLoai: 'Khách sạn',
    maPhuong: 1,
    tenPhuong: 'Phường Lộc Thọ',
    diaChiChiTiet: '60 Trần Phú, Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa',
    moTa:
      'Tọa lạc ngay trên đường Trần Phú, hướng nhìn trọn vẹn Vịnh Nha Trang.\nPhòng nghỉ tiện nghi chuẩn 5 sao, hồ bơi vô cực tầng thượng và đội ngũ phục vụ 24/7.',
    latitude: 12.2416,
    longitude: 109.1962,
    gia: 1200000,
    ngayCapNhatGia: '2026-10-01T08:00:00Z',
    ngayCapNhat: '2026-10-15T08:00:00Z',
    chuCoSo: { hoTen: 'Nguyễn Văn An' },
    lienHe: {
      soDienThoai: '0258 3898 888',
      zalo: '0905123456',
      facebook: 'https://www.facebook.com/muongthanhluxurynhatrang',
    },
    hinhAnh: [
      { mediaId: 11, url: img('photo-1566073771259-6a8506099945'), thuTu: 1 },
      { mediaId: 12, url: img('photo-1582719478250-c89cae4dc85b'), thuTu: 2 },
      { mediaId: 13, url: img('photo-1522798514-97ceb8c4f1c8'), thuTu: 3 },
      { mediaId: 14, url: img('photo-1590490360182-c33d57733427'), thuTu: 4 },
      { mediaId: 15, url: img('photo-1571896349842-33c89424de2d'), thuTu: 5 },
      { mediaId: 16, url: img('photo-1584132967334-10e028bd69f7'), thuTu: 6 },
    ],
    video: [],
    tienIch: [
      { maTienIch: 1, tenTienIch: 'Wifi miễn phí', icon: 'wifi', nhom: 'TIEN_NGHI' },
      { maTienIch: 2, tenTienIch: 'Hồ bơi vô cực', icon: 'pool', nhom: 'TIEN_NGHI' },
      { maTienIch: 3, tenTienIch: 'Bãi đỗ xe ô tô', icon: 'parking', nhom: 'TIEN_NGHI' },
      { maTienIch: 4, tenTienIch: 'Phòng Gym', icon: 'gym', nhom: 'TIEN_NGHI' },
      { maTienIch: 5, tenTienIch: 'Buffet sáng', icon: 'breakfast', nhom: 'TIEN_NGHI' },
      { maTienIch: 6, tenTienIch: 'Spa & Massage', icon: 'spa', nhom: 'TIEN_NGHI' },
      { maTienIch: 7, tenTienIch: 'Điều hòa', icon: 'aircon', nhom: 'TIEN_NGHI' },
      { maTienIch: 8, tenTienIch: 'Thang máy', icon: 'elevator', nhom: 'TIEN_NGHI' },
      { maTienIch: 20, tenTienIch: 'Gần biển', icon: 'beach', nhom: 'LAN_CAN' },
      { maTienIch: 21, tenTienIch: 'Gần chợ Đầm', icon: 'market', nhom: 'LAN_CAN' },
      { maTienIch: 22, tenTienIch: 'Gần Tháp Bà Ponagar', icon: 'landmark', nhom: 'LAN_CAN' },
    ],
  },
  {
    maCSLT: 2,
    tenCSLT: 'Nha Trang Chill House Homestay',
    tenLoai: 'Homestay',
    maPhuong: 2,
    tenPhuong: 'Phường Tân Lập',
    diaChiChiTiet: '14/3 Hoàng Hoa Thám, Phường Tân Lập, TP. Nha Trang, Khánh Hòa',
    moTa: 'Homestay phong cách tối giản, cách biển 5 phút đi bộ. Có bếp chung và ban công ngắm phố.',
    latitude: 12.2449,
    longitude: 109.1923,
    gia: 450000,
    ngayCapNhatGia: '2026-10-20T08:00:00Z',
    ngayCapNhat: '2026-10-20T08:00:00Z',
    chuCoSo: { hoTen: 'Trần Thị Bình' },
    lienHe: { soDienThoai: '0987654321', zalo: '0987654321', facebook: null },
    hinhAnh: [
      { mediaId: 21, url: img('photo-1522798514-97ceb8c4f1c8'), thuTu: 1 },
      { mediaId: 22, url: img('photo-1505693416388-ac5ce068fe85'), thuTu: 2 },
      { mediaId: 23, url: img('photo-1554995207-c18c203602cb'), thuTu: 3 },
    ],
    video: [],
    tienIch: [
      { maTienIch: 1, tenTienIch: 'Wifi miễn phí', icon: 'wifi', nhom: 'TIEN_NGHI' },
      { maTienIch: 9, tenTienIch: 'Bếp chung', icon: 'restaurant', nhom: 'TIEN_NGHI' },
      { maTienIch: 10, tenTienIch: 'Máy giặt', icon: 'laundry', nhom: 'TIEN_NGHI' },
      { maTienIch: 20, tenTienIch: 'Gần biển', icon: 'beach', nhom: 'LAN_CAN' },
    ],
  },
  {
    maCSLT: 3,
    tenCSLT: 'Amiana Resort Nha Trang',
    tenLoai: 'Resort',
    maPhuong: 3,
    tenPhuong: 'Phường Vĩnh Hòa',
    diaChiChiTiet: 'Phạm Văn Đồng, Phường Vĩnh Hòa, TP. Nha Trang, Khánh Hòa',
    moTa: 'Khu nghỉ dưỡng có bãi biển riêng, hồ bơi nước mặn và spa khoáng nóng.',
    latitude: 12.2911,
    longitude: 109.2087,
    gia: 3800000,
    ngayCapNhatGia: '2026-09-28T08:00:00Z',
    ngayCapNhat: '2026-10-02T08:00:00Z',
    chuCoSo: { hoTen: 'Lê Minh Châu' },
    lienHe: { soDienThoai: '02583555333', zalo: null, facebook: 'amianaresort' },
    hinhAnh: [
      { mediaId: 31, url: img('photo-1582719478250-c89cae4dc85b'), thuTu: 1 },
      { mediaId: 32, url: img('photo-1571003123894-1f0594d2b5d9'), thuTu: 2 },
      { mediaId: 33, url: img('photo-1520250497591-112f2f40a3f4'), thuTu: 3 },
    ],
    video: [],
    tienIch: [
      { maTienIch: 2, tenTienIch: 'Hồ bơi nước mặn', icon: 'pool', nhom: 'TIEN_NGHI' },
      { maTienIch: 6, tenTienIch: 'Spa khoáng nóng', icon: 'spa', nhom: 'TIEN_NGHI' },
      { maTienIch: 11, tenTienIch: 'Nhà hàng', icon: 'restaurant', nhom: 'TIEN_NGHI' },
      { maTienIch: 23, tenTienIch: 'Bãi biển riêng', icon: 'beach', nhom: 'LAN_CAN' },
    ],
  },
];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const notFound = () =>
  Object.assign(new Error('LISTING_NOT_FOUND'), {
    response: { status: 404, data: { code: 'LISTING_NOT_FOUND' } },
  });

// Mock khoảng cách đường đi ≈ đường chim bay x 1.3 (backend thật dùng dịch vụ chỉ đường).
const mockDistance = (l, location) =>
  location ? Math.round(haversineKm(location, l) * 1.3 * 10) / 10 : null;

const toPreview = (l, location) => ({
  maCSLT: l.maCSLT,
  tenCSLT: l.tenCSLT,
  tenLoai: l.tenLoai,
  tenPhuong: l.tenPhuong,
  diaChiChiTiet: l.diaChiChiTiet,
  gia: l.gia,
  ngayCapNhatGia: l.ngayCapNhatGia,
  latitude: l.latitude,
  longitude: l.longitude,
  duongDanAnh: l.hinhAnh[0]?.url ?? null,
  tienIchNoiBat: l.tienIch.slice(0, 3).map(({ maTienIch, tenTienIch, icon }) => ({ maTienIch, tenTienIch, icon })),
  khoangCach: mockDistance(l, location),
});

const find = (maCSLT) => LISTINGS.find((l) => String(l.maCSLT) === String(maCSLT));

export const mockListingApi = {
  getDetail: async (maCSLT, location) => {
    await delay();
    const l = find(maCSLT);
    if (!l) throw notFound();
    return { ...l, khoangCach: mockDistance(l, location) };
  },
  getPreview: async (maCSLT, location) => {
    await delay(300);
    const l = find(maCSLT);
    if (!l) throw notFound();
    return toPreview(l, location);
  },
  search: async ({ keyword = '' } = {}) => {
    await delay();
    const kw = keyword.toLowerCase();
    const items = LISTINGS.filter((l) => !kw || l.tenCSLT.toLowerCase().includes(kw)).map((l) => toPreview(l));
    return { items, pagination: { totalItems: items.length, totalPages: 1, currentPage: 1, limit: 10 } };
  },
};

// Chatbot mock: hiểu vài ý định đơn giản (giá, loại hình, gần biển) để demo UI product card.
export const mockChatbotApi = {
  sendMessage: async (message, sessionId) => {
    await delay(900);
    const text = message.toLowerCase();
    let results = [...LISTINGS];

    const priceMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|m)?/);
    if (/dưới|<|tối đa|không quá|rẻ/.test(text) && priceMatch) {
      const n = parseFloat(priceMatch[1].replace(',', '.'));
      const unit = priceMatch[2] || '';
      const max = /tr|triệu|m/.test(unit) ? n * 1_000_000 : /k|nghìn|ngàn/.test(unit) ? n * 1000 : n;
      results = results.filter((l) => l.gia <= max);
    } else if (/rẻ|bình dân|sinh viên/.test(text)) {
      results = results.filter((l) => l.gia < 1_000_000);
    }
    if (/homestay/.test(text)) results = results.filter((l) => l.tenLoai === 'Homestay');
    if (/resort|nghỉ dưỡng/.test(text)) results = results.filter((l) => l.tenLoai === 'Resort');
    if (/khách sạn/.test(text)) results = results.filter((l) => l.tenLoai === 'Khách sạn');
    if (/biển/.test(text)) results = results.filter((l) => l.tienIch.some((t) => /biển/i.test(t.tenTienIch)));

    const isGreeting = /^(xin )?chào|hello|hi\b/.test(text) && text.length < 20;
    const suggestedListings = isGreeting
      ? []
      : results.map((l) => ({
          maCSLT: l.maCSLT,
          tenCSLT: l.tenCSLT,
          tenLoai: l.tenLoai,
          gia: l.gia,
          ngayCapNhatGia: l.ngayCapNhatGia,
          duongDanAnh: l.hinhAnh[0]?.url ?? null,
          lienHe: l.lienHe,
        }));

    const replyText = isGreeting
      ? 'Chào bạn! Bạn muốn tìm khách sạn, homestay hay resort? Mức giá khoảng bao nhiêu một đêm?'
      : suggestedListings.length
        ? `Mình tìm thấy ${suggestedListings.length} cơ sở lưu trú phù hợp với yêu cầu của bạn. Bấm "Xem chi tiết" để xem ảnh, tiện ích và liên hệ trực tiếp với chủ cơ sở nhé:`
        : 'Hiện chưa có cơ sở lưu trú nào phù hợp với yêu cầu này. Bạn thử nới rộng mức giá hoặc khu vực nhé!';

    return { replyText, sessionId: sessionId || `mock-${Date.now()}`, suggestedListings };
  },
};
