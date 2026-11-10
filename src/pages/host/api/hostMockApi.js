import { HOTEL_STATUS, USER_ROLES } from '../../../constants/enums';
import { FALLBACK_ACTIONS } from '../components/listingActions';
import { DEFAULT_PRICE_RANGE, computeChecklist, resolveOptions, toFormValues } from '../components/listing-form/listingFormModel';
import { ApiError } from './hostApi';

// Loaded only when VITE_USE_MOCK=true (through hostApi.js). Covers the dashboard list, the listing form and the profile.
// Listings 1–5 cover the five statuses; 6 belongs to another host.

const FILTER_OPTIONS = {
  propertyTypes: [
    { maLoai: 1, tenLoai: 'Khách sạn' },
    { maLoai: 2, tenLoai: 'Homestay' },
    { maLoai: 3, tenLoai: 'Resort' },
    { maLoai: 4, tenLoai: 'Căn hộ du lịch' },
    { maLoai: 5, tenLoai: 'Nhà nghỉ' },
    { maLoai: 6, tenLoai: 'Villa' },
  ],
  wards: [
    { maPhuong: 1, tenPhuong: 'Lộc Thọ' },
    { maPhuong: 2, tenPhuong: 'Vạn Thạnh' },
    { maPhuong: 3, tenPhuong: 'Vĩnh Hải' },
    { maPhuong: 4, tenPhuong: 'Vĩnh Hòa' },
    { maPhuong: 5, tenPhuong: 'Vĩnh Phước' },
    { maPhuong: 6, tenPhuong: 'Vĩnh Thọ' },
    { maPhuong: 7, tenPhuong: 'Phước Hải' },
    { maPhuong: 8, tenPhuong: 'Tân Lập' },
    { maPhuong: 9, tenPhuong: 'Phước Tân' },
    { maPhuong: 10, tenPhuong: 'Phương Sài' },
    { maPhuong: 11, tenPhuong: 'Xương Huân' },
    { maPhuong: 12, tenPhuong: 'Vạn Thắng' },
    { maPhuong: 13, tenPhuong: 'Phước Hòa' },
    { maPhuong: 14, tenPhuong: 'Phước Tiến' },
  ],
  amenities: [
    { maTienIch: 1, tenTienIch: 'Wifi miễn phí' },
    { maTienIch: 2, tenTienIch: 'Hồ bơi vô cực' },
    { maTienIch: 3, tenTienIch: 'Giáp biển' },
    { maTienIch: 4, tenTienIch: 'Bãi đỗ xe ô tô' },
    { maTienIch: 5, tenTienIch: 'Điều hòa nhiệt độ' },
    { maTienIch: 6, tenTienIch: 'Buffet sáng' },
    { maTienIch: 7, tenTienIch: 'Thang máy' },
    { maTienIch: 8, tenTienIch: 'Lễ tân 24/7' },
    { maTienIch: 9, tenTienIch: 'Dọn phòng hàng ngày' },
    { maTienIch: 10, tenTienIch: 'Phòng gym / Fitness' },
  ],
  nearbyPlaces: [
    { maTienIch: 101, tenTienIch: 'Gần bãi biển' },
    { maTienIch: 102, tenTienIch: 'Gần chợ Đầm' },
    { maTienIch: 103, tenTienIch: 'Gần Vinpearl Harbour' },
    { maTienIch: 104, tenTienIch: 'Gần Tháp Bà Ponagar' },
  ],
  priceRange: { giaMin: DEFAULT_PRICE_RANGE.min, giaMax: DEFAULT_PRICE_RANGE.max },
};

const OTHER_HOST_LISTING_ID = 6;
const FIRST_NEW_ID = 1000;
const LISTING_STATUSES = Object.values(HOTEL_STATUS);
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

// Excel PATCH /host/profile and POST /host/profile/change-password.
const PHONE_PATTERN = /^0\d{9}$/;
const NAME_MAX_LENGTH = 100;
const PASSWORD_RULES = [/^.{8,}$/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9\s]/];

// Fake credentials for local runs and the Selenium tests, never a real account.
export const MOCK_HOST_PASSWORD = 'Host@12345';

const SEED_PROFILE = {
  id: 1,
  vaiTro: USER_ROLES.HOST,
  trangThai: 'ACTIVE',
  hoTen: 'Nguyễn Văn Host',
  soDienThoai: '0905123456',
  email: 'host.demo@hotelnt.vn',
  cccd: '079******234',
  ngayTao: '2026-08-15T08:00:00Z',
};

const PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
];

const mediaOf = (maCSLT) => [
  ...PHOTOS.map((url, index) => ({ mediaId: maCSLT * 100 + index + 1, type: 'IMAGE', url, thuTu: index + 1 })),
  { mediaId: maCSLT * 100 + 5, type: 'VIDEO', url: 'https://example.com/video.mp4', kichThuoc: 48 * 1024 * 1024, thuTu: 5 },
];

const SEA_BREEZE = {
  tenCSLT: 'Sea Breeze Homestay',
  maLoai: 2,
  maPhuong: 1,
  diaChiChiTiet: '12 Trần Phú',
  moTa: 'Homestay 8 phòng cách biển 2 phút đi bộ, có ban công nhìn ra biển.',
  lienHe: { soDienThoai: '0905 123 456', zalo: 'zalo.me/0905123456', facebook: 'https://facebook.com/seabreezehomestay' },
  gia: 650000,
  maTienIch: [1, 2, 3],
  latitude: 12.2388,
  longitude: 109.1967,
};

const TRAN_PHU_CENTRAL = {
  tenCSLT: 'Trần Phú Central Hotel',
  maLoai: 1,
  maPhuong: 1,
  diaChiChiTiet: '45 Trần Phú',
  moTa: 'Khách sạn 3 sao trung tâm thành phố.',
  lienHe: { soDienThoai: '0258 3812 345', zalo: '0258 3812 345', facebook: 'https://facebook.com/tranphucentral' },
  gia: 850000,
  maTienIch: [1, 5, 7, 8],
  latitude: 12.2415,
  longitude: 109.195,
};

const seedListings = () =>
  [
    { maCSLT: 1, ...SEA_BREEZE, trangThai: HOTEL_STATUS.APPROVED },
    {
      maCSLT: 2,
      ...TRAN_PHU_CENTRAL,
      trangThai: HOTEL_STATUS.REJECTED,
      lyDoTuChoi:
        'Ảnh bìa không đúng với cơ sở và địa chỉ chưa khớp với vị trí ghim trên bản đồ. Vui lòng sửa rồi gửi kiểm duyệt lại.',
    },
    { maCSLT: 3, ...SEA_BREEZE, trangThai: HOTEL_STATUS.PENDING, ngayGuiDuyet: '2026-09-24T15:00:00Z' },
    {
      maCSLT: 4,
      ...TRAN_PHU_CENTRAL,
      trangThai: HOTEL_STATUS.HIDDEN,
      lyDoViPham: 'Phát hiện vi phạm tiêu chuẩn cộng đồng về thông tin liên hệ. Vui lòng sửa lại để được xem xét hiển thị.',
    },
    { maCSLT: 5, ...SEA_BREEZE, trangThai: HOTEL_STATUS.DRAFT },
  ].map((listing) => ({
    lyDoTuChoi: null,
    lyDoViPham: null,
    ngayGuiDuyet: null,
    ngayTao: '2026-09-01T08:00:00Z',
    ngayCapNhat: '2026-09-24T14:30:00Z',
    media: mediaOf(listing.maCSLT),
    ...listing,
  }));

const clone = (value) => structuredClone(value);
const now = () => new Date().toISOString();

let listings;
let nextListingId;
let nextMediaId;
let profile;
let password;

export const resetHostMockStore = () => {
  listings = new Map(clone(seedListings()).map((listing) => [listing.maCSLT, listing]));
  nextListingId = FIRST_NEW_ID;
  nextMediaId = FIRST_NEW_ID;
  profile = clone(SEED_PROFILE);
  password = MOCK_HOST_PASSWORD;
};

resetHostMockStore();

const countsOf = (listing) => ({
  soAnh: listing.media.filter((item) => item.type === 'IMAGE').length,
  soVideo: listing.media.filter((item) => item.type === 'VIDEO').length,
});

const findOwned = (maCSLT) => {
  if (maCSLT === OTHER_HOST_LISTING_ID) throw new ApiError({ status: 403, code: 'NOT_OWNER' });
  const listing = listings.get(maCSLT);
  if (!listing) throw new ApiError({ status: 404, code: 'LISTING_NOT_FOUND' });
  return listing;
};

const assertEditable = (listing) => {
  if (listing.trangThai === HOTEL_STATUS.PENDING) throw new ApiError({ status: 409, code: 'LISTING_LOCKED_PENDING' });
};

// Excel: editing an approved listing (fields or media) sends it back to review. Returns thayDoiTrangThai.
const touch = (listing) => {
  listing.ngayCapNhat = now();
  if (listing.trangThai !== HOTEL_STATUS.APPROVED) return false;
  listing.trangThai = HOTEL_STATUS.PENDING;
  listing.ngayGuiDuyet = listing.ngayCapNhat;
  return true;
};

const optionName = (list, key, nameKey, value) =>
  list.find((option) => String(option[key]) === String(value))?.[nameKey] ?? null;

// Excel GET /host/listings item. tenPhuong is not in the Excel but the dashboard shows it.
const toListItem = (listing) => ({
  maCSLT: listing.maCSLT,
  tenCSLT: listing.tenCSLT,
  tenLoai: optionName(FILTER_OPTIONS.propertyTypes, 'maLoai', 'tenLoai', listing.maLoai),
  tenPhuong: optionName(FILTER_OPTIONS.wards, 'maPhuong', 'tenPhuong', listing.maPhuong),
  gia: listing.gia ?? null,
  duongDanAnh: listing.media.find((item) => item.type === 'IMAGE')?.url ?? null,
  trangThai: listing.trangThai,
  lyDoTuChoi: listing.lyDoTuChoi,
  lyDoViPham: listing.lyDoViPham,
  ngayTao: listing.ngayTao,
  ngayCapNhat: listing.ngayCapNhat,
  allowedActions: FALLBACK_ACTIONS[listing.trangThai],
});

// One status or several (array or comma separated). Anything outside the five statuses is a 400.
const parseStatuses = (trangThai) => {
  if (trangThai === undefined || trangThai === null || trangThai === '') return null;
  const values = (Array.isArray(trangThai) ? trangThai : String(trangThai).split(',')).map((value) => String(value).trim());
  if (values.some((value) => !LISTING_STATUSES.includes(value))) {
    throw new ApiError({ status: 400, code: 'VALIDATION_ERROR' });
  }
  return values;
};

const toPageNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

const validationError = (details) => new ApiError({ status: 400, code: 'VALIDATION_ERROR', details });

export const hostMockApi = {
  async getFilterOptions() {
    return clone(FILTER_OPTIONS);
  },

  async getHostListingDetail(maCSLT) {
    const listing = findOwned(maCSLT);
    const counts = countsOf(listing);
    return clone({
      ...listing,
      ...counts,
      checklistGuiDuyet: computeChecklist(toFormValues(listing), counts, resolveOptions(FILTER_OPTIONS)),
      allowedActions: FALLBACK_ACTIONS[listing.trangThai],
    });
  },

  async createHostListing(body) {
    const maCSLT = nextListingId++;
    const timestamp = now();
    listings.set(maCSLT, {
      lyDoTuChoi: null,
      lyDoViPham: null,
      ngayGuiDuyet: null,
      ...clone(body),
      maCSLT,
      trangThai: HOTEL_STATUS.DRAFT,
      media: [],
      ngayTao: timestamp,
      ngayCapNhat: timestamp,
    });
    return { maCSLT, trangThai: HOTEL_STATUS.DRAFT };
  },

  async updateHostListing(maCSLT, body) {
    const listing = findOwned(maCSLT);
    assertEditable(listing);
    Object.assign(listing, clone(body));
    const thayDoiTrangThai = touch(listing);
    const response = { maCSLT, trangThai: listing.trangThai, thayDoiTrangThai };
    return thayDoiTrangThai ? { ...response, message: 'Đã lưu thay đổi. Cơ sở chuyển sang Chờ duyệt.' } : response;
  },

  async uploadListingMedia(maCSLT, { file, type }, { onProgress } = {}) {
    const listing = findOwned(maCSLT);
    assertEditable(listing);
    const item = {
      mediaId: nextMediaId++,
      type,
      url: typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '',
      kichThuoc: file?.size ?? 0,
      thuTu: Math.max(0, ...listing.media.map((media) => media.thuTu ?? 0)) + 1,
    };
    listing.media.push(item);
    onProgress?.(100);
    const thayDoiTrangThai = touch(listing);
    return { ...clone(item), ...countsOf(listing), thayDoiTrangThai };
  },

  async deleteListingMedia(maCSLT, mediaId) {
    const listing = findOwned(maCSLT);
    assertEditable(listing);
    if (!listing.media.some((item) => item.mediaId === mediaId)) {
      throw new ApiError({ status: 404, code: 'MEDIA_NOT_FOUND' });
    }
    listing.media = listing.media.filter((item) => item.mediaId !== mediaId);
    const thayDoiTrangThai = touch(listing);
    return { ...countsOf(listing), thayDoiTrangThai };
  },

  async submitListingForReview(maCSLT) {
    const listing = findOwned(maCSLT);
    if (!FALLBACK_ACTIONS[listing.trangThai]?.includes('SUBMIT')) {
      throw new ApiError({ status: 409, code: 'INVALID_STATE_TRANSITION' });
    }
    listing.trangThai = HOTEL_STATUS.PENDING;
    listing.ngayGuiDuyet = now();
    listing.ngayCapNhat = listing.ngayGuiDuyet;
    return { maCSLT, trangThai: listing.trangThai };
  },

  async withdrawListing(maCSLT) {
    const listing = findOwned(maCSLT);
    if (listing.trangThai !== HOTEL_STATUS.PENDING) {
      throw new ApiError({ status: 409, code: 'INVALID_STATE_TRANSITION' });
    }
    listing.trangThai = HOTEL_STATUS.DRAFT;
    listing.ngayCapNhat = now();
    return { maCSLT, trangThai: listing.trangThai };
  },

  async getHostListings({ trangThai, keyword, page, limit } = {}) {
    const statuses = parseStatuses(trangThai);
    const search = typeof keyword === 'string' ? keyword.trim().toLowerCase() : '';
    const matches = [...listings.values()]
      .filter((listing) => !statuses || statuses.includes(listing.trangThai))
      .filter((listing) => !search || listing.tenCSLT.toLowerCase().includes(search))
      .sort((a, b) => a.maCSLT - b.maCSLT);
    const size = Math.min(toPageNumber(limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const currentPage = toPageNumber(page, 1);
    return clone({
      items: matches.slice((currentPage - 1) * size, currentPage * size).map(toListItem),
      pagination: { totalItems: matches.length, totalPages: Math.ceil(matches.length / size), currentPage, limit: size },
    });
  },

  async deleteHostListing(maCSLT) {
    const listing = findOwned(maCSLT);
    if (!FALLBACK_ACTIONS[listing.trangThai]?.includes('DELETE')) {
      throw new ApiError({ status: 409, code: 'LISTING_NOT_DELETABLE' });
    }
    listings.delete(maCSLT);
    return { message: 'Xóa cơ sở thành công' };
  },

  async getHostProfile() {
    return clone(profile);
  },

  async updateHostProfile(body = {}) {
    const changes = {};
    if (body.hoTen !== undefined) changes.hoTen = String(body.hoTen).trim();
    if (body.soDienThoai !== undefined) changes.soDienThoai = body.soDienThoai;
    if (Object.keys(changes).length === 0) {
      throw new ApiError({ status: 400, code: 'VALIDATION_ERROR', message: 'Không có thông tin nào để cập nhật.' });
    }

    const details = [];
    if (changes.hoTen !== undefined && (!changes.hoTen || changes.hoTen.length > NAME_MAX_LENGTH)) {
      details.push({ field: 'hoTen', message: `Họ và tên không được để trống và tối đa ${NAME_MAX_LENGTH} ký tự.` });
    }
    if (changes.soDienThoai !== undefined && !PHONE_PATTERN.test(changes.soDienThoai)) {
      details.push({ field: 'soDienThoai', message: 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng số 0.' });
    }
    if (details.length) throw validationError(details);

    Object.assign(profile, changes);
    const { id, hoTen, soDienThoai, email } = profile;
    return { id, hoTen, soDienThoai, email, ngayCapNhat: now() };
  },

  async changeHostPassword({ oldPassword, newPassword } = {}) {
    if (typeof newPassword !== 'string' || !PASSWORD_RULES.every((rule) => rule.test(newPassword))) {
      throw validationError([
        {
          field: 'newPassword',
          message: 'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.',
        },
      ]);
    }
    if (newPassword === oldPassword) {
      throw validationError([{ field: 'newPassword', message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' }]);
    }
    if (oldPassword !== password) throw new ApiError({ status: 400, code: 'OLD_PASSWORD_INCORRECT' });
    password = newPassword;
    return { message: 'Đổi mật khẩu thành công' };
  },
};
