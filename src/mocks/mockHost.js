/**
 * MOCK HOST API & DATA - THEO API_DESIGN.xlsx (Rows 25 - 37)
 * Cung cấp dữ liệu ảo đầy đủ cho phân hệ Host khi Back-End chưa sẵn sàng.
 */

let MOCK_HOST_PROFILE = {
  id: 1,
  vaiTro: 'HOST',
  trangThai: 'ACTIVE',
  hoTen: 'Nguyễn Văn Host',
  soDienThoai: '0901234567',
  email: 'host@hotelnhatrang.vn',
  cccd: '079******234',
  ngayTao: '2026-01-15',
};

let MOCK_HOST_LISTINGS = [
  {
    maCSLT: 1,
    tenCSLT: 'Sunrise Beach Hotel',
    maLoai: 1,
    tenLoai: 'Hotel',
    maPhuong: 1,
    tenPhuong: 'Lộc Thọ',
    diaChiChiTiet: '12-14 Trần Phú, Lộc Thọ, Nha Trang',
    moTa: 'Khách sạn ven biển với tầm nhìn tuyệt đẹp bao quát toàn vịnh Nha Trang. Phòng ốc tiện nghi hiện đại.',
    latitude: 12.2388,
    longitude: 109.1967,
    gia: 1200000,
    ngayCapNhatGia: '2026-03-25T10:30:00Z',
    duongDanAnh: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    trangThai: 'APPROVED',
    lyDoTuChoi: null,
    lyDoViPham: null,
    ngayTao: '2026-03-20T08:00:00Z',
    ngayCapNhat: '2026-03-25T14:30:00Z',
    lienHe: {
      soDienThoai: '0901234567',
      zalo: '0901234567',
      facebook: 'https://facebook.com/sunrisebeachhotel',
    },
    maTienIch: [1, 2, 3, 4, 5, 6],
    media: [
      { mediaId: 101, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', type: 'IMAGE', kichThuoc: 204800, thuTu: 1 },
      { mediaId: 102, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', type: 'IMAGE', kichThuoc: 195000, thuTu: 2 },
      { mediaId: 103, url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', type: 'IMAGE', kichThuoc: 180000, thuTu: 3 },
    ],
    soAnh: 3,
    soVideo: 0,
    checklistGuiDuyet: {
      ten: true,
      diaChi: true,
      phuong: true,
      toaDo: true,
      gia: true,
      anhToiThieu3: true,
      tienIchToiThieu1: true,
    },
    allowedActions: ['EDIT', 'DELETE', 'PREVIEW'],
  },
  {
    maCSLT: 2,
    tenCSLT: 'Sea Breeze Homestay',
    maLoai: 2,
    tenLoai: 'Homestay',
    maPhuong: 2,
    tenPhuong: 'Vĩnh Hòa',
    diaChiChiTiet: '88 Phạm Văn Đồng, Vĩnh Hòa, Nha Trang',
    moTa: 'Homestay ấm cúng phong cách mộc mạc, gần biển và chợ hải sản tươi sống.',
    latitude: 12.2856,
    longitude: 109.2014,
    gia: 650000,
    ngayCapNhatGia: '2026-03-26T09:15:00Z',
    duongDanAnh: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=600&auto=format&fit=crop&q=80',
    trangThai: 'PENDING',
    lyDoTuChoi: null,
    lyDoViPham: null,
    ngayTao: '2026-03-24T11:00:00Z',
    ngayGuiDuyet: '2026-03-26T09:15:00Z',
    ngayCapNhat: '2026-03-26T09:15:00Z',
    lienHe: {
      soDienThoai: '0901234567',
      zalo: '0901234567',
      facebook: 'https://facebook.com/seabreeze',
    },
    maTienIch: [1, 2, 7, 8],
    media: [
      { mediaId: 201, url: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=800', type: 'IMAGE', kichThuoc: 175000, thuTu: 1 },
      { mediaId: 202, url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', type: 'IMAGE', kichThuoc: 160000, thuTu: 2 },
      { mediaId: 203, url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', type: 'IMAGE', kichThuoc: 185000, thuTu: 3 },
    ],
    soAnh: 3,
    soVideo: 0,
    checklistGuiDuyet: {
      ten: true,
      diaChi: true,
      phuong: true,
      toaDo: true,
      gia: true,
      anhToiThieu3: true,
      tienIchToiThieu1: true,
    },
    allowedActions: ['PREVIEW', 'WITHDRAW'],
  },
  {
    maCSLT: 3,
    tenCSLT: 'Nha Trang Sunset Villa',
    maLoai: 3,
    tenLoai: 'Resort',
    maPhuong: 4,
    tenPhuong: 'Vĩnh Phước',
    diaChiChiTiet: 'Bãi Dài, Cam Ranh, Khánh Hòa',
    moTa: 'Bản nháp đang lưu thông tin tiện ích và tải lên hình ảnh.',
    latitude: 12.2415,
    longitude: 109.195,
    gia: 2500000,
    ngayCapNhatGia: '2026-03-27T14:00:00Z',
    duongDanAnh: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    trangThai: 'DRAFT',
    lyDoTuChoi: null,
    lyDoViPham: null,
    ngayTao: '2026-03-27T14:00:00Z',
    ngayCapNhat: '2026-03-27T14:00:00Z',
    lienHe: {
      soDienThoai: '0901234567',
      zalo: '0901234567',
      facebook: '',
    },
    maTienIch: [1, 2],
    media: [
      { mediaId: 301, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', type: 'IMAGE', kichThuoc: 190000, thuTu: 1 },
    ],
    soAnh: 1,
    soVideo: 0,
    checklistGuiDuyet: {
      ten: true,
      diaChi: true,
      phuong: true,
      toaDo: true,
      gia: true,
      anhToiThieu3: false,
      tienIchToiThieu1: true,
    },
    allowedActions: ['EDIT', 'SUBMIT', 'DELETE', 'PREVIEW'],
  },
  {
    maCSLT: 4,
    tenCSLT: 'Trần Phú Central Hotel',
    maLoai: 1,
    tenLoai: 'Hotel',
    maPhuong: 1,
    tenPhuong: 'Lộc Thọ',
    diaChiChiTiet: '45 Trần Phú, Lộc Thọ, Nha Trang',
    moTa: 'Khách sạn 3 sao trung tâm đường Trần Phú.',
    latitude: 12.2415,
    longitude: 109.195,
    gia: 850000,
    ngayCapNhatGia: '2026-03-22T09:00:00Z',
    duongDanAnh: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    trangThai: 'REJECTED',
    lyDoTuChoi: 'Ảnh cơ sở chất lượng chưa đạt yêu cầu, thiếu giấy chứng nhận an toàn PCCC.',
    lyDoViPham: null,
    ngayTao: '2026-03-18T10:00:00Z',
    ngayCapNhat: '2026-03-22T16:00:00Z',
    lienHe: {
      soDienThoai: '0258 3812 345',
      zalo: '0258 3812 345',
      facebook: 'https://facebook.com/tranphucentral',
    },
    maTienIch: [1, 5, 7, 8],
    media: [
      { mediaId: 401, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', type: 'IMAGE', kichThuoc: 190000, thuTu: 1 },
      { mediaId: 402, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', type: 'IMAGE', kichThuoc: 180000, thuTu: 2 },
    ],
    soAnh: 2,
    soVideo: 0,
    checklistGuiDuyet: {
      ten: true,
      diaChi: true,
      phuong: true,
      toaDo: true,
      gia: true,
      anhToiThieu3: false,
      tienIchToiThieu1: true,
    },
    allowedActions: ['EDIT', 'DELETE', 'PREVIEW'],
  },
  {
    maCSLT: 5,
    tenCSLT: 'Moonlight Apartment Nha Trang',
    maLoai: 4,
    tenLoai: 'Căn hộ',
    maPhuong: 6,
    tenPhuong: 'Tân Lập',
    diaChiChiTiet: '10 Nguyễn Thiện Thuật, Tân Lập, Nha Trang',
    moTa: 'Căn hộ dịch vụ cao cấp, đầy đủ đồ gia dụng.',
    latitude: 12.235,
    longitude: 109.192,
    gia: 950000,
    ngayCapNhatGia: '2026-03-15T08:00:00Z',
    duongDanAnh: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
    trangThai: 'HIDDEN',
    lyDoTuChoi: null,
    lyDoViPham: 'Tạm ẩn để sửa chữa nội thất theo yêu cầu của Host.',
    ngayTao: '2026-03-10T08:00:00Z',
    ngayCapNhat: '2026-03-15T10:00:00Z',
    lienHe: {
      soDienThoai: '0901234567',
      zalo: '0901234567',
      facebook: '',
    },
    maTienIch: [1, 7, 8],
    media: [
      { mediaId: 501, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', type: 'IMAGE', kichThuoc: 190000, thuTu: 1 },
      { mediaId: 502, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', type: 'IMAGE', kichThuoc: 180000, thuTu: 2 },
      { mediaId: 503, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', type: 'IMAGE', kichThuoc: 185000, thuTu: 3 },
    ],
    soAnh: 3,
    soVideo: 0,
    checklistGuiDuyet: {
      ten: true,
      diaChi: true,
      phuong: true,
      toaDo: true,
      gia: true,
      anhToiThieu3: true,
      tienIchToiThieu1: true,
    },
    allowedActions: ['EDIT', 'DELETE', 'PREVIEW'],
  },
];

const MOCK_FILTER_OPTIONS = {
  wards: [
    { maPhuong: 1, tenPhuong: 'Lộc Thọ' },
    { maPhuong: 2, tenPhuong: 'Vĩnh Hòa' },
    { maPhuong: 3, tenPhuong: 'Vĩnh Hải' },
    { maPhuong: 4, tenPhuong: 'Vĩnh Phước' },
    { maPhuong: 5, tenPhuong: 'Vạn Thạnh' },
    { maPhuong: 6, tenPhuong: 'Tân Lập' },
    { maPhuong: 7, tenPhuong: 'Phước Tiến' },
    { maPhuong: 8, tenPhuong: 'Xương Huân' },
  ],
  propertyTypes: [
    { maLoai: 1, tenLoai: 'Khách sạn' },
    { maLoai: 2, tenLoai: 'Homestay' },
    { maLoai: 3, tenLoai: 'Resort' },
    { maLoai: 4, tenLoai: 'Căn hộ' },
  ],
  amenities: [
    { maTienIch: 1, tenTienIch: 'Wifi miễn phí', icon: 'Wifi', nhom: 'TIEN_NGHI' },
    { maTienIch: 2, tenTienIch: 'Hồ bơi', icon: 'Waves', nhom: 'TIEN_NGHI' },
    { maTienIch: 3, tenTienIch: 'Bãi biển riêng', icon: 'Umbrella', nhom: 'TIEN_NGHI' },
    { maTienIch: 4, tenTienIch: 'Nhà hàng', icon: 'Utensils', nhom: 'TIEN_NGHI' },
    { maTienIch: 5, tenTienIch: 'Đưa đón sân bay', icon: 'Car', nhom: 'TIEN_NGHI' },
    { maTienIch: 6, tenTienIch: 'Spa & Trị liệu', icon: 'Sparkles', nhom: 'TIEN_NGHI' },
    { maTienIch: 7, tenTienIch: 'Chỗ đỗ xe miễn phí', icon: 'Car', nhom: 'TIEN_NGHI' },
    { maTienIch: 8, tenTienIch: 'Máy lạnh / Điều hòa', icon: 'Wind', nhom: 'TIEN_NGHI' },
  ],
  nearbyPlaces: [
    { maTienIch: 101, tenTienIch: 'Gần bãi biển', icon: 'MapPin', nhom: 'LAN_CAN' },
    { maTienIch: 102, tenTienIch: 'Gần chợ Đầm', icon: 'ShoppingBag', nhom: 'LAN_CAN' },
    { maTienIch: 103, tenTienIch: 'Gần quảng trường 2/4', icon: 'Compass', nhom: 'LAN_CAN' },
  ],
  priceRange: { giaMin: 500000, giaMax: 100000000 },
  radiusOptions: [1, 2, 3, 5, 10],
  sortOptions: [
    { value: 'PRICE_ASC', label: 'Giá tăng dần' },
    { value: 'PRICE_DESC', label: 'Giá giảm dần' },
    { value: 'DISTANCE_ASC', label: 'Gần nhất' },
  ],
  mapBounds: { latMin: 12.1, latMax: 12.45, lngMin: 109.1, lngMax: 109.3 },
};

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockHostApi = {
  // GET /host/profile (Row 26)
  getHostProfile: async () => {
    await delay();
    return { ...MOCK_HOST_PROFILE };
  },

  // PATCH /host/profile (Row 27)
  updateHostProfile: async (changes = {}) => {
    await delay();
    if (changes.hoTen) MOCK_HOST_PROFILE.hoTen = changes.hoTen;
    if (changes.soDienThoai) MOCK_HOST_PROFILE.soDienThoai = changes.soDienThoai;
    MOCK_HOST_PROFILE.ngayCapNhat = new Date().toISOString();
    return { ...MOCK_HOST_PROFILE };
  },

  // POST /host/profile/change-password (Row 34)
  changeHostPassword: async ({ oldPassword, newPassword }) => {
    await delay();
    if (oldPassword === 'wrong') {
      throw { response: { status: 400, data: { error: { code: 'OLD_PASSWORD_INCORRECT', message: 'Mật khẩu cũ không chính xác.' } } } };
    }
    return { message: 'Đổi mật khẩu thành công' };
  },

  // GET /host/listings (Row 28)
  getHostListings: async ({ trangThai, keyword, page = 1, limit = 10 } = {}) => {
    await delay();
    let filtered = [...MOCK_HOST_LISTINGS];

    if (trangThai && trangThai !== 'ALL') {
      filtered = filtered.filter((item) => item.trangThai === trangThai);
    }

    if (keyword && keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      filtered = filtered.filter((item) => item.tenCSLT.toLowerCase().includes(q));
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIdx, startIdx + limit);

    return {
      items: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  },

  // GET /host/listings/:maCSLT (Row 29)
  getHostListingDetail: async (maCSLT) => {
    await delay();
    const found = MOCK_HOST_LISTINGS.find((item) => item.maCSLT === Number(maCSLT));
    if (!found) {
      throw { response: { status: 404, data: { error: { code: 'LISTING_NOT_FOUND', message: 'Không tìm thấy cơ sở lưu trú.' } } } };
    }
    return { ...found };
  },

  // POST /host/listings (Row 30 - Tạo bản nháp)
  createHostListing: async (payload = {}) => {
    await delay();
    const newId = Date.now();
    const newListing = {
      maCSLT: newId,
      tenCSLT: payload.tenCSLT || 'Bản nháp mới',
      maLoai: payload.maLoai || 1,
      tenLoai: payload.maLoai === 2 ? 'Homestay' : payload.maLoai === 3 ? 'Resort' : payload.maLoai === 4 ? 'Căn hộ' : 'Khách sạn',
      maPhuong: payload.maPhuong || 1,
      tenPhuong: 'Lộc Thọ',
      diaChiChiTiet: payload.diaChiChiTiet || '',
      moTa: payload.moTa || '',
      latitude: payload.latitude || 12.2388,
      longitude: payload.longitude || 109.1967,
      gia: payload.gia || 500000,
      ngayCapNhatGia: new Date().toISOString(),
      duongDanAnh: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
      trangThai: 'DRAFT',
      lyDoTuChoi: null,
      lyDoViPham: null,
      ngayTao: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString(),
      lienHe: payload.lienHe || { soDienThoai: '', zalo: '', facebook: '' },
      maTienIch: payload.maTienIch || [],
      media: [],
      soAnh: 0,
      soVideo: 0,
      checklistGuiDuyet: {
        ten: !!payload.tenCSLT,
        diaChi: !!payload.diaChiChiTiet,
        phuong: !!payload.maPhuong,
        toaDo: !!(payload.latitude && payload.longitude),
        gia: !!payload.gia,
        anhToiThieu3: false,
        tienIchToiThieu1: !!(payload.maTienIch && payload.maTienIch.length > 0),
      },
      allowedActions: ['EDIT', 'SUBMIT', 'DELETE', 'PREVIEW'],
    };

    MOCK_HOST_LISTINGS.unshift(newListing);

    return {
      maCSLT: newId,
      trangThai: 'DRAFT',
      ngayTao: newListing.ngayTao,
    };
  },

  // PUT /host/listings/:maCSLT (Row 31 - Cập nhật)
  updateHostListing: async (maCSLT, payload = {}) => {
    await delay();
    const idx = MOCK_HOST_LISTINGS.findIndex((item) => item.maCSLT === Number(maCSLT));
    if (idx === -1) {
      throw { response: { status: 404, data: { error: { code: 'LISTING_NOT_FOUND', message: 'Không tìm thấy cơ sở lưu trú.' } } } };
    }

    const current = MOCK_HOST_LISTINGS[idx];
    const updated = {
      ...current,
      ...payload,
      ngayCapNhat: new Date().toISOString(),
    };

    MOCK_HOST_LISTINGS[idx] = updated;

    return {
      maCSLT: Number(maCSLT),
      trangThai: updated.trangThai,
      trangThaiTruoc: current.trangThai,
      ngayCapNhat: updated.ngayCapNhat,
      ngayCapNhatGia: updated.ngayCapNhatGia,
      thayDoiTrangThai: false,
      message: 'Cập nhật cơ sở lưu trú thành công',
    };
  },

  // POST /host/listings/:maCSLT/media (Row 32)
  uploadListingMedia: async (maCSLT, { file, type }) => {
    await delay(300);
    const item = MOCK_HOST_LISTINGS.find((i) => i.maCSLT === Number(maCSLT));
    const mediaId = Date.now();
    const fakeUrl = URL.createObjectURL ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

    const newMedia = {
      mediaId,
      url: fakeUrl,
      type: type || 'IMAGE',
      kichThuoc: file?.size || 150000,
      thuTu: item ? (item.media?.length || 0) + 1 : 1,
    };

    if (item) {
      if (!item.media) item.media = [];
      item.media.push(newMedia);
      if (type === 'VIDEO') item.soVideo = (item.soVideo || 0) + 1;
      else item.soAnh = (item.soAnh || 0) + 1;
    }

    return {
      mediaId,
      url: fakeUrl,
      type: type || 'IMAGE',
      kichThuoc: newMedia.kichThuoc,
      thuTu: newMedia.thuTu,
      soAnh: item?.soAnh || 1,
      soVideo: item?.soVideo || 0,
    };
  },

  // DELETE /host/listings/:maCSLT/media/:mediaId (Row 33)
  deleteListingMedia: async (maCSLT, mediaId) => {
    await delay();
    const item = MOCK_HOST_LISTINGS.find((i) => i.maCSLT === Number(maCSLT));
    if (item && item.media) {
      item.media = item.media.filter((m) => m.mediaId !== Number(mediaId));
      item.soAnh = item.media.filter((m) => m.type === 'IMAGE').length;
      item.soVideo = item.media.filter((m) => m.type === 'VIDEO').length;
    }
    return {
      message: 'Xóa file thành công',
      soAnh: item?.soAnh || 0,
      soVideo: item?.soVideo || 0,
      thayDoiTrangThai: false,
    };
  },

  // POST /host/listings/:maCSLT/submit-review (Row 37)
  submitListingForReview: async (maCSLT) => {
    await delay();
    const item = MOCK_HOST_LISTINGS.find((i) => i.maCSLT === Number(maCSLT));
    if (item) {
      item.trangThai = 'PENDING';
      item.ngayGuiDuyet = new Date().toISOString();
      item.allowedActions = ['PREVIEW', 'WITHDRAW'];
    }
    return {
      maCSLT: Number(maCSLT),
      trangThai: 'PENDING',
      ngayGuiDuyet: new Date().toISOString(),
    };
  },

  // POST /host/listings/:maCSLT/withdraw (Row 36)
  withdrawListing: async (maCSLT) => {
    await delay();
    const item = MOCK_HOST_LISTINGS.find((i) => i.maCSLT === Number(maCSLT));
    if (item) {
      item.trangThai = 'DRAFT';
      item.allowedActions = ['EDIT', 'SUBMIT', 'DELETE', 'PREVIEW'];
    }
    return {
      maCSLT: Number(maCSLT),
      trangThai: 'DRAFT',
    };
  },

  // DELETE /host/listings/:maCSLT (Row 35)
  deleteHostListing: async (maCSLT) => {
    await delay();
    MOCK_HOST_LISTINGS = MOCK_HOST_LISTINGS.filter((i) => i.maCSLT !== Number(maCSLT));
    return { message: 'Xóa cơ sở thành công' };
  },

  // GET /filter-options (Row 10)
  getFilterOptions: async () => {
    await delay();
    return { ...MOCK_FILTER_OPTIONS };
  },
};
