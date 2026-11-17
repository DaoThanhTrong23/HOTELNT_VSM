/**
 * MOCK ADMIN DATA & API
 * Tuân thủ 100% theo hợp đồng API_DESIGN.xlsx (/admin router).
 * Được sử dụng khi VITE_USE_MOCK !== 'false' hoặc khi BE chưa sẵn sàng.
 */

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper image generator
const img = (id) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop&q=80`;

// --- 1. MOCK ADMIN LISTINGS (API_DESIGN Row 42, 43, 44, 45) ---
let ADMIN_LISTINGS = [
  {
    maCSLT: 1,
    tenCSLT: 'Sunrise Beach Hotel',
    maLoai: 1,
    tenLoai: 'Hotel',
    tenPhuong: 'Phường Lộc Thọ',
    diaChiChiTiet: 'Trần Phú, Lộc Thọ, TP. Nha Trang, Khánh Hòa',
    moTa: 'Khách sạn ven biển với tầm nhìn tuyệt vời, phòng nghỉ hiện đại, tiện nghi cao cấp và dịch vụ hoàn hảo.',
    latitude: 12.2388,
    longitude: 109.1967,
    gia: 800000,
    giaMax: 2500000,
    ngayCapNhatGia: '2026-09-26T12:30:00Z',
    duongDanAnh: img('photo-1566073771259-6a8506099945'),
    hoTen: 'Nguyễn Huỳnh Gia Vỹ',
    soDienThoaiHost: '0905123456',
    emailHost: 'nguyenhuynhgiavy@gmail.com',
    initials: 'HA',
    bgColor: 'bg-purple-100 text-purple-700',
    chuCoSo: {
      id: 1,
      hoTen: 'Nguyễn Huỳnh Gia Vỹ',
      email: 'nguyenhuynhgiavy@gmail.com',
      soDienThoai: '0905123456',
      trangThai: 'ACTIVE',
    },
    lienHe: {
      soDienThoai: '0905123456',
      zalo: '0905123456',
      facebook: 'https://facebook.com/sunrisebeachhotel',
    },
    trangThai: 'PENDING',
    lyDoTuChoi: null,
    lyDoViPham: null,
    ngayTao: '2026-09-25T08:00:00Z',
    ngayGuiDuyet: '2026-09-26T12:30:00Z',
    ngayCapNhat: '2026-09-26T12:30:00Z',
    media: [
      { mediaId: 1, url: img('photo-1566073771259-6a8506099945'), type: 'IMAGE', thuTu: 1 },
      { mediaId: 2, url: img('photo-1582719478250-c89cae4dc85b'), type: 'IMAGE', thuTu: 2 },
      { mediaId: 3, url: img('photo-1590490360182-c33d57733427'), type: 'IMAGE', thuTu: 3 },
      { mediaId: 4, url: img('photo-1571896349842-33c89424de2d'), type: 'IMAGE', thuTu: 4 },
    ],
    tienIch: [
      { maTienIch: 1, tenTienIch: 'Hồ bơi', icon: 'Waves', nhom: 'TIEN_NGHI' },
      { maTienIch: 2, tenTienIch: 'Wifi miễn phí', icon: 'Wifi', nhom: 'TIEN_NGHI' },
      { maTienIch: 3, tenTienIch: 'Bãi biển riêng', icon: 'Umbrella', nhom: 'TIEN_NGHI' },
      { maTienIch: 4, tenTienIch: 'Nhà hàng', icon: 'Utensils', nhom: 'TIEN_NGHI' },
      { maTienIch: 5, tenTienIch: 'Đưa đón sân bay', icon: 'Car', nhom: 'TIEN_NGHI' },
      { maTienIch: 6, tenTienIch: 'Spa & Trị liệu', icon: 'Sparkles', nhom: 'TIEN_NGHI' },
    ],
    checklistDuyet: {
      thongTinBatBuoc: true,
      anhToiThieu3: true,
      toaDoTrongNhaTrang: true,
    },
    allowedActions: ['APPROVE', 'REJECT'],
  },
  {
    maCSLT: 2,
    tenCSLT: 'Ocean View Hotel',
    maLoai: 2,
    tenLoai: 'Homestay',
    tenPhuong: 'Phường Vĩnh Hải',
    diaChiChiTiet: 'Phạm Văn Đồng, Vĩnh Hải, TP. Nha Trang, Khánh Hòa',
    moTa: 'Homestay phong cách mộc mạc nhìn ra biển Phạm Văn Đồng yên bình, có sân hiên ngắm bình minh.',
    latitude: 12.2742,
    longitude: 109.2015,
    gia: 450000,
    giaMax: 1200000,
    ngayCapNhatGia: '2026-09-23T16:32:00Z',
    duongDanAnh: img('photo-1522798514-97ceb8c4f1c8'),
    hoTen: 'Trần Minh Khang',
    soDienThoaiHost: '0912345678',
    emailHost: 'khangbkk@gmail.com',
    initials: 'TK',
    bgColor: 'bg-sky-100 text-sky-700',
    chuCoSo: {
      id: 2,
      hoTen: 'Trần Minh Khang',
      email: 'khangbkk@gmail.com',
      soDienThoai: '0912345678',
      trangThai: 'ACTIVE',
    },
    lienHe: {
      soDienThoai: '0912345678',
      zalo: '0912345678',
    },
    trangThai: 'PENDING',
    ngayTao: '2026-09-22T09:00:00Z',
    ngayGuiDuyet: '2026-09-23T16:32:00Z',
    ngayCapNhat: '2026-09-23T16:32:00Z',
    media: [
      { mediaId: 21, url: img('photo-1522798514-97ceb8c4f1c8'), type: 'IMAGE', thuTu: 1 },
      { mediaId: 22, url: img('photo-1566073771259-6a8506099945'), type: 'IMAGE', thuTu: 2 },
      { mediaId: 23, url: img('photo-1582719478250-c89cae4dc85b'), type: 'IMAGE', thuTu: 3 },
    ],
    tienIch: [
      { maTienIch: 2, tenTienIch: 'Wifi miễn phí', icon: 'Wifi', nhom: 'TIEN_NGHI' },
      { maTienIch: 3, tenTienIch: 'Bãi biển riêng', icon: 'Umbrella', nhom: 'TIEN_NGHI' },
      { maTienIch: 4, tenTienIch: 'Nhà hàng', icon: 'Utensils', nhom: 'TIEN_NGHI' },
    ],
    checklistDuyet: { thongTinBatBuoc: true, anhToiThieu3: true, toaDoTrongNhaTrang: true },
    allowedActions: ['APPROVE', 'REJECT'],
  },
  {
    maCSLT: 3,
    tenCSLT: 'Nha Trang Resort',
    maLoai: 3,
    tenLoai: 'Resort',
    tenPhuong: 'Xã Cam Hải Đông',
    diaChiChiTiet: 'Bãi Dài, Cam Ranh, Khánh Hòa',
    moTa: 'Resort 5 sao biệt lập với cảnh quan đồi cát và biển ngọc Cam Ranh. Biệt thự riêng tư có hồ bơi tràn bờ.',
    latitude: 12.0833,
    longitude: 109.1833,
    gia: 2200000,
    giaMax: 6000000,
    ngayCapNhatGia: '2026-09-22T14:12:00Z',
    duongDanAnh: img('photo-1582719478250-c89cae4dc85b'),
    hoTen: 'Lê Hoàng Nam',
    soDienThoaiHost: '0987654321',
    emailHost: 'namlh@gmail.com',
    initials: 'LM',
    bgColor: 'bg-amber-100 text-amber-700',
    chuCoSo: {
      id: 3,
      hoTen: 'Lê Hoàng Nam',
      email: 'namlh@gmail.com',
      soDienThoai: '0987654321',
      trangThai: 'ACTIVE',
    },
    lienHe: {
      soDienThoai: '0987654321',
      zalo: '0987654321',
    },
    trangThai: 'PENDING',
    ngayTao: '2026-09-20T10:00:00Z',
    ngayGuiDuyet: '2026-09-22T14:12:00Z',
    ngayCapNhat: '2026-09-22T14:12:00Z',
    media: [
      { mediaId: 31, url: img('photo-1582719478250-c89cae4dc85b'), type: 'IMAGE', thuTu: 1 },
      { mediaId: 32, url: img('photo-1566073771259-6a8506099945'), type: 'IMAGE', thuTu: 2 },
      { mediaId: 33, url: img('photo-1571896349842-33c89424de2d'), type: 'IMAGE', thuTu: 3 },
    ],
    tienIch: [
      { maTienIch: 1, tenTienIch: 'Hồ bơi', icon: 'Waves', nhom: 'TIEN_NGHI' },
      { maTienIch: 2, tenTienIch: 'Wifi miễn phí', icon: 'Wifi', nhom: 'TIEN_NGHI' },
      { maTienIch: 3, tenTienIch: 'Bãi biển riêng', icon: 'Umbrella', nhom: 'TIEN_NGHI' },
      { maTienIch: 4, tenTienIch: 'Nhà hàng', icon: 'Utensils', nhom: 'TIEN_NGHI' },
      { maTienIch: 5, tenTienIch: 'Đưa đón sân bay', icon: 'Car', nhom: 'TIEN_NGHI' },
      { maTienIch: 6, tenTienIch: 'Spa & Trị liệu', icon: 'Sparkles', nhom: 'TIEN_NGHI' },
    ],
    checklistDuyet: { thongTinBatBuoc: true, anhToiThieu3: true, toaDoTrongNhaTrang: true },
    allowedActions: ['APPROVE', 'REJECT'],
  },
  {
    maCSLT: 4,
    tenCSLT: 'Moonlight Hotel',
    maLoai: 1,
    tenLoai: 'Hotel',
    tenPhuong: 'Phường Tân Lập',
    diaChiChiTiet: 'Nguyễn Thiện Thuật, Tân Lập, TP. Nha Trang',
    moTa: 'Vị trí trung tâm khu phố Tây sầm uất, chỉ 3 phút tản bộ ra bãi biển Quảng trường 2/4.',
    latitude: 12.2375,
    longitude: 109.1944,
    gia: 600000,
    giaMax: 1500000,
    ngayCapNhatGia: '2026-09-21T09:45:00Z',
    duongDanAnh: img('photo-1590490360182-c33d57733427'),
    hoTen: 'Phạm Gia Huy',
    soDienThoaiHost: '0933221100',
    emailHost: 'huypham@gmail.com',
    initials: 'PH',
    bgColor: 'bg-teal-100 text-teal-700',
    chuCoSo: {
      id: 4,
      hoTen: 'Phạm Gia Huy',
      email: 'huypham@gmail.com',
      soDienThoai: '0933221100',
      trangThai: 'ACTIVE',
    },
    lienHe: {
      soDienThoai: '0933221100',
    },
    trangThai: 'PENDING',
    ngayTao: '2026-09-19T08:00:00Z',
    ngayGuiDuyet: '2026-09-21T09:45:00Z',
    ngayCapNhat: '2026-09-21T09:45:00Z',
    media: [
      { mediaId: 41, url: img('photo-1590490360182-c33d57733427'), type: 'IMAGE', thuTu: 1 },
      { mediaId: 42, url: img('photo-1566073771259-6a8506099945'), type: 'IMAGE', thuTu: 2 },
    ],
    tienIch: [
      { maTienIch: 2, tenTienIch: 'Wifi miễn phí', icon: 'Wifi', nhom: 'TIEN_NGHI' },
      { maTienIch: 4, tenTienIch: 'Nhà hàng', icon: 'Utensils', nhom: 'TIEN_NGHI' },
    ],
    checklistDuyet: { thongTinBatBuoc: true, anhToiThieu3: false, toaDoTrongNhaTrang: true },
    allowedActions: ['APPROVE', 'REJECT'],
  },
  {
    maCSLT: 5,
    tenCSLT: 'Seaview Apartment',
    maLoai: 4,
    tenLoai: 'Căn hộ',
    tenPhuong: 'Phường Vĩnh Phước',
    diaChiChiTiet: 'Hòn Chồng, Vĩnh Phước, TP. Nha Trang',
    moTa: 'Căn hộ chung cư cao cấp nhìn trực diện danh thắng Hòn Chồng. Bếp đầy đủ dụng cụ nấu nướng.',
    latitude: 12.2711,
    longitude: 109.2024,
    gia: 700000,
    giaMax: 1800000,
    ngayCapNhatGia: '2026-09-20T11:00:00Z',
    duongDanAnh: img('photo-1571896349842-33c89424de2d'),
    hoTen: 'Nguyễn Thanh Tú',
    soDienThoaiHost: '0977889900',
    emailHost: 'tu.nt@gmail.com',
    initials: 'NT',
    bgColor: 'bg-lime-100 text-lime-700',
    chuCoSo: {
      id: 5,
      hoTen: 'Nguyễn Thanh Tú',
      email: 'tu.nt@gmail.com',
      soDienThoai: '0977889900',
      trangThai: 'ACTIVE',
    },
    lienHe: {
      soDienThoai: '0977889900',
    },
    trangThai: 'PENDING',
    ngayTao: '2026-09-18T10:00:00Z',
    ngayGuiDuyet: '2026-09-20T11:00:00Z',
    ngayCapNhat: '2026-09-20T11:00:00Z',
    media: [
      { mediaId: 51, url: img('photo-1571896349842-33c89424de2d'), type: 'IMAGE', thuTu: 1 },
      { mediaId: 52, url: img('photo-1566073771259-6a8506099945'), type: 'IMAGE', thuTu: 2 },
    ],
    tienIch: [
      { maTienIch: 1, tenTienIch: 'Hồ bơi', icon: 'Waves', nhom: 'TIEN_NGHI' },
      { maTienIch: 2, tenTienIch: 'Wifi miễn phí', icon: 'Wifi', nhom: 'TIEN_NGHI' },
      { maTienIch: 3, tenTienIch: 'Bãi biển riêng', icon: 'Umbrella', nhom: 'TIEN_NGHI' },
    ],
    checklistDuyet: { thongTinBatBuoc: true, anhToiThieu3: false, toaDoTrongNhaTrang: true },
    allowedActions: ['APPROVE', 'REJECT'],
  },
  {
    maCSLT: 86,
    tenCSLT: 'Mường Thanh Luxury Nha Trang',
    maLoai: 1,
    tenLoai: 'Hotel',
    tenPhuong: 'Phường Lộc Thọ',
    diaChiChiTiet: '60 Trần Phú, Lộc Thọ, TP. Nha Trang',
    moTa: 'Khách sạn 5 sao mặt biển Trần Phú, đầy đủ dịch vụ ẩm thực, hội nghị và giải trí.',
    latitude: 12.2416,
    longitude: 109.1962,
    gia: 1200000,
    giaMax: 3500000,
    ngayCapNhatGia: '2026-09-02T08:00:00Z',
    duongDanAnh: img('photo-1566073771259-6a8506099945'),
    hoTen: 'Nguyễn Văn An',
    soDienThoaiHost: '02583898888',
    emailHost: 'hosta@gmail.com',
    initials: 'NA',
    bgColor: 'bg-blue-100 text-blue-700',
    chuCoSo: {
      id: 86,
      hoTen: 'Nguyễn Văn An',
      email: 'hosta@gmail.com',
      soDienThoai: '02583898888',
      trangThai: 'ACTIVE',
    },
    lienHe: {
      soDienThoai: '02583898888',
      zalo: '0905123456',
    },
    trangThai: 'APPROVED',
    ngayTao: '2026-09-01T08:00:00Z',
    ngayGuiDuyet: '2026-09-01T08:00:00Z',
    ngayCapNhat: '2026-09-02T08:00:00Z',
    media: [
      { mediaId: 861, url: img('photo-1566073771259-6a8506099945'), type: 'IMAGE', thuTu: 1 },
      { mediaId: 862, url: img('photo-1582719478250-c89cae4dc85b'), type: 'IMAGE', thuTu: 2 },
    ],
    tienIch: [
      { maTienIch: 1, tenTienIch: 'Hồ bơi', icon: 'Waves', nhom: 'TIEN_NGHI' },
      { maTienIch: 2, tenTienIch: 'Wifi miễn phí', icon: 'Wifi', nhom: 'TIEN_NGHI' },
    ],
    checklistDuyet: { thongTinBatBuoc: true, anhToiThieu3: true, toaDoTrongNhaTrang: true },
    allowedActions: ['HIDE', 'REMOVE'],
  },
];

// --- 2. MOCK ADMIN HOSTS (API_DESIGN Row 39, 40, 41) ---
let ADMIN_HOSTS = [
  {
    id: 1,
    hoTen: 'Nguyễn Huỳnh Gia Vỹ',
    email: 'nguyenhuynhgiavy@gmail.com',
    soDienThoai: '0905123456',
    cccd: '056099******',
    trangThai: 'ACTIVE',
    soLuongCSLT: 3,
    lyDoKhoa: null,
    ngayKhoa: null,
    ngayTao: '15/08/2026',
    thongKeCSLT: { DRAFT: 0, PENDING: 1, APPROVED: 2, REJECTED: 0, HIDDEN: 0 },
    hotels: ['Sunrise Beach Hotel', 'Ocean Pearl Homestay', 'Sunrise Beach Resort'],
  },
  {
    id: 2,
    hoTen: 'Trần Thị Host 2',
    email: 'host2@hotelnt.com',
    soDienThoai: '0987654321',
    cccd: '056098******',
    trangThai: 'LOCKED',
    soLuongCSLT: 1,
    lyDoKhoa: 'Vi phạm chính sách đăng tải thông tin.',
    ngayKhoa: '2026-08-25T10:00:00Z',
    ngayTao: '20/08/2026',
    thongKeCSLT: { DRAFT: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, HIDDEN: 1 },
    hotels: ['Biển Xanh Luxury Hotel'],
  },
  {
    id: 3,
    hoTen: 'Lê Hoàng Nam',
    email: 'namlh@gmail.com',
    soDienThoai: '0912345678',
    cccd: '056097******',
    trangThai: 'LOCKED',
    soLuongCSLT: 2,
    lyDoKhoa: 'Tài khoản tạm ngưng để kiểm tra tính xác thực hồ sơ.',
    ngayKhoa: '2026-09-08T15:30:00Z',
    ngayTao: '05/09/2026',
    thongKeCSLT: { DRAFT: 0, PENDING: 1, APPROVED: 1, REJECTED: 0, HIDDEN: 0 },
    hotels: ['Nha Trang Resort', 'Cam Ranh Beach Villas'],
  },
  {
    id: 4,
    hoTen: 'Phạm Minh Anh',
    email: 'minhanh@hotelnt.com',
    soDienThoai: '0934567890',
    cccd: '056096******',
    trangThai: 'ACTIVE',
    soLuongCSLT: 1,
    lyDoKhoa: null,
    ngayKhoa: null,
    ngayTao: '12/09/2026',
    thongKeCSLT: { DRAFT: 0, PENDING: 0, APPROVED: 1, REJECTED: 0, HIDDEN: 0 },
    hotels: ['Golden Sand Resort'],
  },
  {
    id: 5,
    hoTen: 'Trần Quốc Bảo',
    email: 'bao@hotelnt.com',
    soDienThoai: '0978123456',
    cccd: '056095******',
    trangThai: 'LOCKED',
    soLuongCSLT: 0,
    lyDoKhoa: 'Tài khoản có dấu hiệu đăng tải thông tin không chính xác.',
    ngayKhoa: '2026-09-22T08:00:00Z',
    ngayTao: '20/09/2026',
    thongKeCSLT: { DRAFT: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, HIDDEN: 0 },
    hotels: [],
  },
];

// --- 3. MOCK ADMIN CONFIGURATIONS (API_DESIGN Row 46, 47, 48, 49, 50) ---
let ADMIN_SEO_CONFIG = {
  metaTitle: 'Hotel Nha Trang - Khám phá và đặt phòng khách sạn, homestay tốt nhất',
  metaDescription:
    'Tìm kiếm và đặt phòng khách sạn, homestay tại Nha Trang với giá tốt, nhiều ưu đãi hấp dẫn. Khám phá những địa điểm lưu trú chất lượng, gần biển, thuận tiện di chuyển.',
  slugUrl: 'hotel-nha-trang',
  ogTitle: 'Hotel Nha Trang - Đặt Phòng Trực Tiếp Không Qua Trung Gian',
  ogImageUrl:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
  ngayCapNhat: new Date().toISOString(),
};

let ADMIN_AI_CONFIG = {
  tinNhanMacDinh: 'Xin chào! Tôi có thể giúp gì cho chuyến du lịch Nha Trang của bạn hôm nay?',
  enabled: true,
  systemPrompt:
    'Bạn là trợ lý ảo AI thông minh của WebApp Hotel Nha Trang. Nhiệm vụ của bạn là hỗ trợ khách du lịch tìm kiếm cơ sở lưu trú, gợi ý khách sạn theo khoảng giá, vị trí gần biển và tiện ích phù hợp.',
  temperature: 0.7,
  maxTokens: 500,
  nguonDuLieu: 'APPROVED_ONLY',
  phamViTraLoi: 'LISTING_INFO_ONLY',
  ngayCapNhat: new Date().toISOString(),
};

// --- SIMULATED MOCK API METHODS (Contract Matching API_DESIGN.xlsx) ---
export const mockAdminApi = {
  // 1. GET /admin/listings
  getListings: async ({ trangThai = 'PENDING', keyword = '', page = 1, limit = 5 } = {}) => {
    await new Promise((r) => setTimeout(r, 80));
    let items = ADMIN_LISTINGS.filter((item) => {
      if (trangThai && item.trangThai !== trangThai) return false;
      if (keyword) {
        const q = keyword.toLowerCase();
        return (
          item.tenCSLT.toLowerCase().includes(q) ||
          item.hoTen.toLowerCase().includes(q) ||
          item.diaChiChiTiet.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const pagedItems = items.slice((page - 1) * limit, page * limit);

    return {
      items: pagedItems,
      pagination: { totalItems, totalPages, currentPage: page, limit },
    };
  },

  // 2. GET /admin/listings/:maCSLT
  getListingDetail: async (maCSLT) => {
    await new Promise((r) => setTimeout(r, 60));
    const found = ADMIN_LISTINGS.find((item) => item.maCSLT === Number(maCSLT));
    if (!found) throw new Error('LISTING_NOT_FOUND');
    return found;
  },

  // 3. PATCH /admin/listings/:maCSLT/moderation (Duyệt / Từ chối)
  moderateListing: async (maCSLT, { action, lyDoTuChoi }) => {
    await new Promise((r) => setTimeout(r, 100));
    const target = ADMIN_LISTINGS.find((item) => item.maCSLT === Number(maCSLT));
    if (!target) throw new Error('LISTING_NOT_FOUND');

    if (action === 'APPROVE') {
      target.trangThai = 'APPROVED';
      target.lyDoTuChoi = null;
      target.ngayDuyet = new Date().toISOString();
    } else {
      target.trangThai = 'REJECTED';
      target.lyDoTuChoi = lyDoTuChoi || 'Không đạt yêu cầu kiểm duyệt';
    }
    target.ngayCapNhat = new Date().toISOString();

    return {
      maCSLT: target.maCSLT,
      trangThai: target.trangThai,
      lyDoTuChoi: target.lyDoTuChoi,
      ngayCapNhat: target.ngayCapNhat,
      ngayDuyet: target.ngayDuyet,
    };
  },

  // 4. PATCH /admin/listings/:maCSLT/unpublish (Ẩn / Gỡ)
  unpublishListing: async (maCSLT, { hinhThuc, lyDoViPham }) => {
    await new Promise((r) => setTimeout(r, 100));
    const target = ADMIN_LISTINGS.find((item) => item.maCSLT === Number(maCSLT));
    if (!target) throw new Error('LISTING_NOT_FOUND');

    target.trangThai = hinhThuc === 'REMOVE' ? 'REMOVED' : 'HIDDEN';
    target.lyDoViPham = lyDoViPham;
    target.ngayCapNhat = new Date().toISOString();

    return {
      maCSLT: target.maCSLT,
      trangThai: target.trangThai,
      lyDoViPham: target.lyDoViPham,
      ngayCapNhat: target.ngayCapNhat,
    };
  },

  // 5. GET /admin/hosts
  getHosts: async ({ trangThai = 'all', keyword = '', page = 1, limit = 10 } = {}) => {
    await new Promise((r) => setTimeout(r, 80));
    let items = ADMIN_HOSTS.filter((host) => {
      if (trangThai === 'active' && host.trangThai !== 'ACTIVE') return false;
      if (trangThai === 'locked' && host.trangThai !== 'LOCKED') return false;
      if (keyword) {
        const q = keyword.toLowerCase();
        return (
          host.hoTen.toLowerCase().includes(q) ||
          host.email.toLowerCase().includes(q) ||
          host.soDienThoai.includes(q) ||
          String(host.id).includes(q)
        );
      }
      return true;
    });

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const pagedItems = items.slice((page - 1) * limit, page * limit);

    return {
      items: pagedItems,
      pagination: { totalItems, totalPages, currentPage: page, limit },
    };
  },

  // 6. GET /admin/hosts/:id
  getHostDetail: async (id) => {
    await new Promise((r) => setTimeout(r, 60));
    const found = ADMIN_HOSTS.find((h) => h.id === Number(id));
    if (!found) throw new Error('HOST_NOT_FOUND');
    return found;
  },

  // 7. PATCH /admin/hosts/:id/status (Khóa / Mở khóa)
  updateHostStatus: async (id, { trangThai, lyDoKhoa }) => {
    await new Promise((r) => setTimeout(r, 100));
    const host = ADMIN_HOSTS.find((h) => h.id === Number(id));
    if (!host) throw new Error('HOST_NOT_FOUND');

    host.trangThai = trangThai;
    host.lyDoKhoa = trangThai === 'LOCKED' ? lyDoKhoa || 'Khóa tài khoản theo yêu cầu quản trị viên' : null;
    host.ngayKhoa = trangThai === 'LOCKED' ? new Date().toISOString() : null;
    host.ngayCapNhat = new Date().toISOString();

    return {
      id: host.id,
      trangThai: host.trangThai,
      lyDoKhoa: host.lyDoKhoa,
      ngayCapNhat: host.ngayCapNhat,
    };
  },

  // 8. GET /admin/configurations/seo
  getSeoConfig: async () => {
    await new Promise((r) => setTimeout(r, 60));
    return { ...ADMIN_SEO_CONFIG };
  },

  // 9. PUT /admin/configurations/seo
  updateSeoConfig: async (data) => {
    await new Promise((r) => setTimeout(r, 100));
    ADMIN_SEO_CONFIG = {
      ...ADMIN_SEO_CONFIG,
      ...data,
      ngayCapNhat: new Date().toISOString(),
    };
    return {
      message: 'Cập nhật cấu hình SEO thành công',
      ngayCapNhat: ADMIN_SEO_CONFIG.ngayCapNhat,
    };
  },

  // 10. POST /admin/configurations/seo/og-image
  uploadOgImage: async (file) => {
    await new Promise((r) => setTimeout(r, 120));
    const url = URL.createObjectURL(file);
    ADMIN_SEO_CONFIG.ogImageUrl = url;
    return { url };
  },

  // 11. GET /admin/configurations/ai
  getAiConfig: async () => {
    await new Promise((r) => setTimeout(r, 60));
    return { ...ADMIN_AI_CONFIG };
  },

  // 12. PUT /admin/configurations/ai
  updateAiConfig: async (data) => {
    await new Promise((r) => setTimeout(r, 100));
    ADMIN_AI_CONFIG = {
      ...ADMIN_AI_CONFIG,
      ...data,
      ngayCapNhat: new Date().toISOString(),
    };
    return {
      message: 'Cập nhật cấu hình AI thành công',
      ngayCapNhat: ADMIN_AI_CONFIG.ngayCapNhat,
    };
  },
};
