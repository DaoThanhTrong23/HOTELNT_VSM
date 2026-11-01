import axios from 'axios';
import axiosClient from '../../../services/axiosClient';

// Endpoints used by the Host screens (dashboard, add/edit listing, profile).
// Contract source: docs/Copy of API_DESIGN.xlsx, sheets "API Design" and "Error Format".

export const HOST_LISTINGS_PAGE_SIZE = 10;

// Messages copied from the "Error Format" sheet, plus client-side codes.
const DEFAULT_MESSAGES = {
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường được đánh dấu.',
  LOCATION_OUT_OF_RANGE: 'Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.',
  FIELD_NOT_EDITABLE: 'Email và CCCD không thể tự chỉnh sửa. Vui lòng liên hệ quản trị viên.',
  OLD_PASSWORD_INCORRECT: 'Mật khẩu cũ không chính xác.',
  MEDIA_LIMIT_EXCEEDED: 'Vượt quá số lượng cho phép: tối đa 100 ảnh và 5 video cho mỗi cơ sở.',
  TOKEN_INVALID: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
  ACCOUNT_LOCKED: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
  FORBIDDEN_ROLE: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_OWNER: 'Bạn không có quyền thao tác trên cơ sở lưu trú này.',
  LISTING_NOT_FOUND: 'Không tìm thấy cơ sở lưu trú.',
  MEDIA_NOT_FOUND: 'Không tìm thấy hình ảnh/video.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  ACCOUNT_DUPLICATED: 'Email, số điện thoại hoặc CCCD đã được sử dụng.',
  INVALID_STATE_TRANSITION: 'Trạng thái hiện tại của cơ sở không cho phép thao tác này.',
  LISTING_LOCKED_PENDING: 'Cơ sở đang chờ duyệt nên không thể chỉnh sửa. Hãy rút lại yêu cầu duyệt trước.',
  LISTING_REMOVED: 'Cơ sở đã bị gỡ khỏi hệ thống.',
  LISTING_NOT_DELETABLE: 'Không thể xóa cơ sở ở trạng thái hiện tại.',
  MIN_IMAGES_REQUIRED: 'Cơ sở cần có tối thiểu 3 ảnh.',
  CONFLICT: 'Dữ liệu đã thay đổi. Vui lòng tải lại trang.',
  FILE_TOO_LARGE: 'Tệp quá lớn: ảnh tối đa 10MB, video tối đa 100MB.',
  UNSUPPORTED_MEDIA_TYPE: 'Định dạng không được hỗ trợ: ảnh .jpg/.png/.webp, video .mp4.',
  CHECKLIST_INCOMPLETE: 'Vui lòng hoàn thiện các trường bắt buộc trước khi gửi/duyệt.',
  RATE_LIMITED: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
  INTERNAL_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  NETWORK_ERROR: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.',
  TIMEOUT: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.',
  CANCELED: 'Yêu cầu đã bị hủy.',
};

const STATUS_CODES = {
  400: 'VALIDATION_ERROR',
  401: 'TOKEN_INVALID',
  403: 'FORBIDDEN_ROLE',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'FILE_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'CHECKLIST_INCOMPLETE',
  429: 'RATE_LIMITED',
};

const codeFromStatus = (status) => {
  if (STATUS_CODES[status]) return STATUS_CODES[status];
  return status >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR';
};

export class ApiError extends Error {
  constructor({ status = null, code, message, details = null, traceId = null } = {}) {
    super(message || DEFAULT_MESSAGES[code] || DEFAULT_MESSAGES.INTERNAL_ERROR);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.traceId = traceId;
  }
}

// A2 in the plan: success bodies may be bare or wrapped in { success: true, data }.
export const unwrapData = (body) =>
  body && typeof body === 'object' && body.success === true && 'data' in body ? body.data : body;

const isCancelError = (err) =>
  axios.isCancel(err) || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';

export const toApiError = (err) => {
  if (err instanceof ApiError) return err;
  if (isCancelError(err)) return new ApiError({ code: 'CANCELED' });

  const response = err?.response;
  if (response) {
    const body = response.data;
    const serverError = body && typeof body === 'object' ? body.error : null;
    if (serverError && typeof serverError.code === 'string') {
      return new ApiError({
        status: response.status,
        code: serverError.code,
        message: serverError.message || DEFAULT_MESSAGES[serverError.code],
        details: serverError.details ?? null,
        traceId: body.traceId ?? null,
      });
    }
    return new ApiError({ status: response.status, code: codeFromStatus(response.status) });
  }

  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') return new ApiError({ code: 'TIMEOUT' });
  return new ApiError({ code: 'NETWORK_ERROR' });
};

export const getFieldErrors = (apiError) => {
  const details = apiError?.details;
  if (!Array.isArray(details)) return {};
  return details.reduce((acc, item) => {
    if (item && typeof item.field === 'string' && item.field && !acc[item.field]) {
      acc[item.field] = item.message || DEFAULT_MESSAGES.VALIDATION_ERROR;
    }
    return acc;
  }, {});
};

export const isCanceled = (err) => err?.code === 'CANCELED';

// Ids come from the URL as strings; only positive integers are valid.
export const toPositiveInt = (value) => {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0 ? value : null;
  if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) return Number(value);
  return null;
};

const requireId = (value, name) => {
  const id = toPositiveInt(value);
  if (id === null) {
    throw new ApiError({ code: 'VALIDATION_ERROR', message: `Mã ${name} không hợp lệ.` });
  }
  return id;
};

const call = async (send) => {
  try {
    return unwrapData(await send());
  } catch (err) {
    throw toApiError(err);
  }
};

// Async wrapper so id validation errors reject instead of throwing synchronously.
const withListingId = async (maCSLT, send) => send(requireId(maCSLT, 'cơ sở'));

const LISTING_KEYS = [
  'tenCSLT',
  'maLoai',
  'maPhuong',
  'diaChiChiTiet',
  'moTa',
  'lienHe',
  'gia',
  'maTienIch',
  'latitude',
  'longitude',
];
const CONTACT_KEYS = ['soDienThoai', 'zalo', 'facebook'];

// Keeps only the body keys listed in the Excel. undefined is dropped, null is kept (clears a value).
export const pickListingBody = (payload = {}) => {
  const body = {};
  LISTING_KEYS.forEach((key) => {
    const value = payload[key];
    if (value === undefined) return;
    if (key === 'lienHe' && value !== null && typeof value === 'object') {
      body.lienHe = {};
      CONTACT_KEYS.forEach((contactKey) => {
        if (value[contactKey] !== undefined) body.lienHe[contactKey] = value[contactKey];
      });
      return;
    }
    body[key] = value;
  });
  return body;
};

const PROFILE_KEYS = ['hoTen', 'soDienThoai'];

export const getHostProfile = ({ signal } = {}) => call(() => axiosClient.get('/host/profile', { signal }));

export const updateHostProfile = async (changes = {}) => {
  const body = {};
  PROFILE_KEYS.forEach((key) => {
    if (changes[key] !== undefined) body[key] = changes[key];
  });
  if (Object.keys(body).length === 0) {
    throw new ApiError({ code: 'VALIDATION_ERROR', message: 'Không có thông tin nào để cập nhật.' });
  }
  return call(() => axiosClient.patch('/host/profile', body));
};

export const changeHostPassword = ({ oldPassword, newPassword }) =>
  call(() => axiosClient.post('/host/profile/change-password', { oldPassword, newPassword }));

export const getHostListings = ({ trangThai, keyword, page, limit } = {}, { signal } = {}) => {
  const params = {};
  if (trangThai && trangThai !== 'ALL') params.trangThai = trangThai;
  const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';
  if (trimmedKeyword) params.keyword = trimmedKeyword;
  if (page !== undefined && page !== null && page !== '') params.page = page;
  if (limit !== undefined && limit !== null && limit !== '') params.limit = limit;
  return call(() => axiosClient.get('/host/listings', { params, signal }));
};

export const getHostListingDetail = (maCSLT, { signal } = {}) =>
  withListingId(maCSLT, (id) => call(() => axiosClient.get(`/host/listings/${id}`, { signal })));

export const createHostListing = (payload) =>
  call(() => axiosClient.post('/host/listings', pickListingBody(payload)));

export const updateHostListing = (maCSLT, payload) =>
  withListingId(maCSLT, (id) => call(() => axiosClient.put(`/host/listings/${id}`, pickListingBody(payload))));

export const uploadListingMedia = (maCSLT, { file, type }, { onProgress, signal } = {}) =>
  withListingId(maCSLT, (id) => {
    if (type !== 'IMAGE' && type !== 'VIDEO') {
      throw new ApiError({ code: 'VALIDATION_ERROR', message: 'Loại tệp phải là IMAGE hoặc VIDEO.' });
    }
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    return call(() =>
      axiosClient.post(`/host/listings/${id}/media`, form, {
        // axiosClient defaults to JSON, which would serialize the FormData into JSON.
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (event) => {
          if (!onProgress || !event?.total) return;
          onProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
        },
      }),
    );
  });

export const deleteListingMedia = (maCSLT, mediaId) =>
  withListingId(maCSLT, (id) => {
    const media = requireId(mediaId, 'ảnh/video');
    return call(() => axiosClient.delete(`/host/listings/${id}/media/${media}`));
  });

export const submitListingForReview = (maCSLT) =>
  withListingId(maCSLT, (id) => call(() => axiosClient.post(`/host/listings/${id}/submit-review`)));

export const withdrawListing = (maCSLT) =>
  withListingId(maCSLT, (id) => call(() => axiosClient.post(`/host/listings/${id}/withdraw`)));

export const deleteHostListing = (maCSLT) =>
  withListingId(maCSLT, (id) => call(() => axiosClient.delete(`/host/listings/${id}`)));

export const getFilterOptions = ({ signal } = {}) => call(() => axiosClient.get('/filter-options', { signal }));
