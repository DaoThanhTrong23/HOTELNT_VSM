import { MEDIA_LIMITS, NHA_TRANG_MAP_BOUNDS } from '../../../../constants/enums';

// Pure helpers for the 4-step listing form (Figma 12.x / 13.x). No React here.

export const STEPS = [
  { id: 1, label: 'Thông tin cơ bản' },
  { id: 2, label: 'Giá & tiện ích' },
  { id: 3, label: 'Hình ảnh & video' },
  { id: 4, label: 'Bản đồ' },
];

// Defaults when /filter-options does not send limits (values from API_DESIGN.xlsx).
export const DEFAULT_PRICE_RANGE = { min: 500_000, max: 100_000_000 };
export const DEFAULT_MAP_BOUNDS = {
  latMin: NHA_TRANG_MAP_BOUNDS.LAT_MIN,
  latMax: NHA_TRANG_MAP_BOUNDS.LAT_MAX,
  lngMin: NHA_TRANG_MAP_BOUNDS.LNG_MIN,
  lngMax: NHA_TRANG_MAP_BOUNDS.LNG_MAX,
};

export const NAME_MAX_LENGTH = 150;
export const ADDRESS_MAX_LENGTH = 200;
export const LOCATION_OUT_OF_RANGE_MESSAGE = 'Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.';

export const CHECKLIST_ITEMS = [
  { key: 'ten', label: 'Tên cơ sở' },
  { key: 'diaChi', label: 'Địa chỉ cụ thể' },
  { key: 'phuong', label: 'Phường/Xã' },
  { key: 'toaDo', label: 'Tọa độ trong khu vực Nha Trang' },
  { key: 'anhToiThieu3', label: 'Ít nhất 3 ảnh' },
  { key: 'tienIchToiThieu1', label: 'Ít nhất 1 tiện ích' },
  { key: 'gia', label: 'Giá hợp lệ' },
];

const PHONE_PATTERN = /^0\d{9}$/;
const ZALO_LINK_PATTERN = /^(https:\/\/)?zalo\.me\/\S+$/;
const FACEBOOK_PATTERN = /^https:\/\/(www\.)?facebook\.com\/\S+$/;

const list = (value) => (Array.isArray(value) ? value : []);
const finiteOr = (value, fallback) => (Number.isFinite(value) ? value : fallback);

export const resolveOptions = (filterOptions = {}) => {
  const priceRange = filterOptions?.priceRange ?? {};
  const mapBounds = filterOptions?.mapBounds ?? {};
  return {
    wards: list(filterOptions?.wards),
    propertyTypes: list(filterOptions?.propertyTypes),
    amenities: list(filterOptions?.amenities),
    nearbyPlaces: list(filterOptions?.nearbyPlaces),
    priceRange: {
      min: finiteOr(priceRange.giaMin, DEFAULT_PRICE_RANGE.min),
      max: finiteOr(priceRange.giaMax, DEFAULT_PRICE_RANGE.max),
    },
    mapBounds: {
      latMin: finiteOr(mapBounds.latMin, DEFAULT_MAP_BOUNDS.latMin),
      latMax: finiteOr(mapBounds.latMax, DEFAULT_MAP_BOUNDS.latMax),
      lngMin: finiteOr(mapBounds.lngMin, DEFAULT_MAP_BOUNDS.lngMin),
      lngMax: finiteOr(mapBounds.lngMax, DEFAULT_MAP_BOUNDS.lngMax),
    },
  };
};

export const emptyValues = () => ({
  tenCSLT: '',
  maLoai: '',
  maPhuong: '',
  diaChiChiTiet: '',
  moTa: '',
  lienHe: { soDienThoai: '', zalo: '', facebook: '' },
  gia: '',
  maTienIch: [],
  latitude: '',
  longitude: '',
});

const asText = (value) => (value === null || value === undefined ? '' : String(value));

export const toFormValues = (detail = {}) => ({
  tenCSLT: asText(detail.tenCSLT),
  maLoai: asText(detail.maLoai),
  maPhuong: asText(detail.maPhuong),
  diaChiChiTiet: asText(detail.diaChiChiTiet),
  moTa: asText(detail.moTa),
  lienHe: {
    soDienThoai: asText(detail.lienHe?.soDienThoai),
    zalo: asText(detail.lienHe?.zalo),
    facebook: asText(detail.lienHe?.facebook),
  },
  gia: Number.isFinite(detail.gia) ? detail.gia : '',
  maTienIch: list(detail.maTienIch).map(Number).filter(Number.isFinite),
  latitude: asText(detail.latitude),
  longitude: asText(detail.longitude),
});

const compactSpaces = (value) => asText(value).replace(/\s+/g, '');
const isPhoneLike = (value) => /^[\d\s]+$/.test(value);

// mode 'create': empty optional fields are left out. mode 'update': PUT replaces everything, so empty means null.
export const toPayload = (values, mode = 'create') => {
  const emptyValue = mode === 'update' ? null : undefined;
  const text = (value) => {
    const trimmed = asText(value).trim();
    return trimmed === '' ? emptyValue : trimmed;
  };
  const number = (value) => {
    const trimmed = asText(value).trim();
    if (trimmed === '') return emptyValue;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : emptyValue;
  };

  const zaloRaw = asText(values.lienHe?.zalo).trim();
  const contact = {
    soDienThoai: compactSpaces(values.lienHe?.soDienThoai) || emptyValue,
    zalo: (isPhoneLike(zaloRaw) ? compactSpaces(zaloRaw) : zaloRaw) || emptyValue,
    facebook: text(values.lienHe?.facebook),
  };
  Object.keys(contact).forEach((key) => {
    if (contact[key] === undefined) delete contact[key];
  });
  const hasContact = Object.values(contact).some((value) => value !== null);
  const amenities = list(values.maTienIch);

  const payload = {
    tenCSLT: asText(values.tenCSLT).trim(),
    maLoai: number(values.maLoai),
    maPhuong: number(values.maPhuong),
    diaChiChiTiet: asText(values.diaChiChiTiet).trim(),
    moTa: text(values.moTa),
    lienHe: hasContact || mode === 'update' ? contact : undefined,
    gia: number(values.gia),
    maTienIch: amenities.length > 0 || mode === 'update' ? [...amenities] : undefined,
    latitude: number(values.latitude),
    longitude: number(values.longitude),
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });
  return payload;
};

export const formatThousands = (value) =>
  Number.isFinite(value) ? new Intl.NumberFormat('vi-VN').format(value) : '';

export const parseDigits = (text, maxDigits = 9) => {
  const digits = asText(text).replace(/\D/g, '').slice(0, maxDigits);
  return digits === '' ? '' : Number(digits);
};

const parseCoordinate = (value) => {
  const trimmed = asText(value).trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const roundCoordinate = (value) => Math.round(value * 1e6) / 1e6;

export const isInsideBounds = (lat, lng, bounds = DEFAULT_MAP_BOUNDS) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= bounds.latMin &&
  lat <= bounds.latMax &&
  lng >= bounds.lngMin &&
  lng <= bounds.lngMax;

export const coordinateError = (values, bounds = DEFAULT_MAP_BOUNDS) => {
  const lat = parseCoordinate(values.latitude);
  const lng = parseCoordinate(values.longitude);
  if (lat === null && lng === null) return null;
  if (lat === null || lng === null) return 'Vui lòng nhập đủ cả vĩ độ và kinh độ.';
  if (Number.isNaN(lat) || Number.isNaN(lng)) return 'Vĩ độ và kinh độ phải là số.';
  return isInsideBounds(lat, lng, bounds) ? null : LOCATION_OUT_OF_RANGE_MESSAGE;
};

const priceError = (gia, priceRange) => {
  if (gia === '' || gia === null || gia === undefined) return null;
  const valid = Number.isInteger(gia) && gia >= priceRange.min && gia <= priceRange.max;
  return valid ? null : `Giá phải từ ${formatThousands(priceRange.min)} đến ${formatThousands(priceRange.max)} VNĐ`;
};

const hasOption = (options, key, value) => {
  if (!options.length) return true;
  return options.some((option) => String(option[key]) === String(value));
};

export const validateStep = (step, values, options = resolveOptions()) => {
  const errors = {};

  if (step === 1) {
    const name = values.tenCSLT.trim();
    if (!name) errors.tenCSLT = 'Vui lòng nhập tên cơ sở lưu trú';
    else if (name.length > NAME_MAX_LENGTH) errors.tenCSLT = `Tối đa ${NAME_MAX_LENGTH} ký tự`;

    if (!values.maLoai || !hasOption(options.propertyTypes, 'maLoai', values.maLoai)) {
      errors.maLoai = 'Vui lòng chọn loại hình';
    }
    if (!values.maPhuong || !hasOption(options.wards, 'maPhuong', values.maPhuong)) {
      errors.maPhuong = 'Vui lòng chọn phường/xã';
    }

    const address = values.diaChiChiTiet.trim();
    if (!address) errors.diaChiChiTiet = 'Vui lòng nhập địa chỉ cụ thể';
    else if (address.length > ADDRESS_MAX_LENGTH) errors.diaChiChiTiet = `Tối đa ${ADDRESS_MAX_LENGTH} ký tự`;

    const phone = compactSpaces(values.lienHe.soDienThoai);
    if (phone && !PHONE_PATTERN.test(phone)) {
      errors['lienHe.soDienThoai'] = 'Số điện thoại phải gồm đúng 10 chữ số';
    }
    const zalo = values.lienHe.zalo.trim();
    if (zalo && !(isPhoneLike(zalo) ? PHONE_PATTERN.test(compactSpaces(zalo)) : ZALO_LINK_PATTERN.test(zalo))) {
      errors['lienHe.zalo'] = 'Nhập số Zalo hoặc link zalo.me';
    }
    const facebook = values.lienHe.facebook.trim();
    if (facebook && !FACEBOOK_PATTERN.test(facebook)) {
      errors['lienHe.facebook'] = 'Link phải bắt đầu bằng https://facebook.com/';
    }
  }

  if (step === 2) {
    const message = priceError(values.gia, options.priceRange);
    if (message) errors.gia = message;
  }

  if (step === 4) {
    const message = coordinateError(values, options.mapBounds);
    if (message) errors.toaDo = message;
  }

  return errors;
};

export const validateAll = (values, options) => ({
  ...validateStep(1, values, options),
  ...validateStep(2, values, options),
  ...validateStep(4, values, options),
});

export const computeChecklist = (values, mediaSummary = {}, options = resolveOptions()) => {
  const stepOne = validateStep(1, values, options);
  const lat = parseCoordinate(values.latitude);
  const lng = parseCoordinate(values.longitude);
  return {
    ten: Boolean(values.tenCSLT.trim()) && !stepOne.tenCSLT,
    diaChi: Boolean(values.diaChiChiTiet.trim()) && !stepOne.diaChiChiTiet,
    phuong: Boolean(values.maPhuong) && !stepOne.maPhuong,
    toaDo: isInsideBounds(lat, lng, options.mapBounds),
    anhToiThieu3: (mediaSummary.soAnh ?? 0) >= MEDIA_LIMITS.IMAGE_MIN,
    tienIchToiThieu1: list(values.maTienIch).length >= 1,
    gia: values.gia !== '' && priceError(values.gia, options.priceRange) === null,
  };
};

export const countCompleted = (checklist) => CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;

// Text under the form / in the bottom bar, matching Figma 12.1 – 12.6.
export const submitHint = ({ hasListing, completed, isSubmitting }) => {
  const total = CHECKLIST_ITEMS.length;
  if (isSubmitting) return 'Đang gửi yêu cầu kiểm duyệt…';
  if (!hasListing) return `Hoàn thành ${total} điều kiện bên phải để gửi kiểm duyệt`;
  if (completed < total) return `Còn ${total - completed} điều kiện chưa hoàn thành`;
  return 'Đã đủ điều kiện — sau khi gửi, bạn không thể chỉnh sửa cho đến khi có kết quả duyệt';
};

const normalizeForCompare = (values) => {
  const payload = toPayload(values, 'update');
  return JSON.stringify({ ...payload, maTienIch: [...(payload.maTienIch ?? [])].sort((a, b) => a - b) });
};

export const isDirty = (values, baseline) => normalizeForCompare(values) !== normalizeForCompare(baseline);

const FIELD_STEPS = {
  tenCSLT: 1,
  maLoai: 1,
  maPhuong: 1,
  diaChiChiTiet: 1,
  moTa: 1,
  'lienHe.soDienThoai': 1,
  'lienHe.zalo': 1,
  'lienHe.facebook': 1,
  gia: 2,
  maTienIch: 2,
  toaDo: 4,
};

// Maps details[].field from the API to the form field and the step that holds it.
export const fieldPathFromServer = (field) => {
  if (field === 'latitude' || field === 'longitude') return { path: 'toaDo', step: 4 };
  if (field === 'lienHe') return { path: 'lienHe.soDienThoai', step: 1 };
  if (FIELD_STEPS[field]) return { path: field, step: FIELD_STEPS[field] };
  return { path: field, step: null };
};

export const stepOfField = (path) => FIELD_STEPS[path] ?? null;

const CHECKLIST_FIELD_MAP = {
  tenCSLT: 'ten',
  diaChiChiTiet: 'diaChi',
  maPhuong: 'phuong',
  latitude: 'toaDo',
  longitude: 'toaDo',
  gia: 'gia',
  maTienIch: 'tienIchToiThieu1',
  media: 'anhToiThieu3',
  anh: 'anhToiThieu3',
};

// details[] of a 422 CHECKLIST_INCOMPLETE → checklist keys to mark as missing.
export const checklistKeysFromDetails = (details) =>
  list(details)
    .map((detail) => {
      const field = detail?.field;
      if (CHECKLIST_ITEMS.some((item) => item.key === field)) return field;
      return CHECKLIST_FIELD_MAP[field] ?? null;
    })
    .filter(Boolean);

export const fieldId = (path) => `listing-${path.replace(/\./g, '-')}`;
export const errorId = (path) => `${fieldId(path)}-error`;
