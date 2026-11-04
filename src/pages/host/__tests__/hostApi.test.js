import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../../../services/axiosClient';
import {
  ApiError,
  HOST_LISTINGS_PAGE_SIZE,
  changeHostPassword,
  createHostListing,
  deleteHostListing,
  deleteListingMedia,
  getFieldErrors,
  getFilterOptions,
  getHostListingDetail,
  getHostListings,
  getHostProfile,
  isCanceled,
  submitListingForReview,
  toApiError,
  unwrapData,
  updateHostListing,
  updateHostProfile,
  uploadListingMedia,
  withdrawListing,
} from '../api/hostApi';

vi.mock('../../../services/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const httpError = (status, data) => Object.assign(new Error(`HTTP ${status}`), { isAxiosError: true, response: { status, data } });

const apiErrorBody = (code, message, details) => ({
  success: false,
  error: { code, message, details },
  traceId: 'trace-123',
});

const catchError = async (promise) => {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  throw new Error('Expected promise to reject');
};

describe('hostApi: error normalization', () => {
  it('ERR-01: keeps status, code, message, details and traceId of a standard error body', () => {
    const details = [{ field: 'soDienThoai', message: 'Số điện thoại đã được sử dụng' }];
    const err = toApiError(
      httpError(409, apiErrorBody('ACCOUNT_DUPLICATED', 'Email, số điện thoại hoặc CCCD đã được sử dụng.', details)),
    );

    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'ACCOUNT_DUPLICATED',
      message: 'Email, số điện thoại hoặc CCCD đã được sử dụng.',
      details,
      traceId: 'trace-123',
    });
  });

  it('ERR-02: derives INTERNAL_ERROR from a 500 with an HTML or empty body', () => {
    const fromHtml = toApiError(httpError(500, '<html>Bad gateway</html>'));
    const fromEmpty = toApiError(httpError(502, ''));

    expect(fromHtml).toMatchObject({ status: 500, code: 'INTERNAL_ERROR', message: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.' });
    expect(fromEmpty.code).toBe('INTERNAL_ERROR');
    expect(toApiError(httpError(401, null)).code).toBe('TOKEN_INVALID');
    expect(toApiError(httpError(404, {})).code).toBe('NOT_FOUND');
    expect(toApiError(httpError(413, {})).code).toBe('FILE_TOO_LARGE');
  });

  it('ERR-03: maps a missing response to NETWORK_ERROR', () => {
    const err = toApiError(Object.assign(new Error('Network Error'), { isAxiosError: true, request: {} }));
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.status).toBeNull();
    expect(err.message).toBe('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
  });

  it('ERR-04: maps ECONNABORTED to TIMEOUT', () => {
    const err = toApiError(Object.assign(new Error('timeout of 15000ms exceeded'), { code: 'ECONNABORTED' }));
    expect(err.code).toBe('TIMEOUT');
    expect(err.message).toBe('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
  });

  it('ERR-05: maps a canceled request to CANCELED', () => {
    const canceled = Object.assign(new Error('canceled'), { name: 'CanceledError', code: 'ERR_CANCELED' });
    const err = toApiError(canceled);
    expect(err.code).toBe('CANCELED');
    expect(isCanceled(err)).toBe(true);
    expect(isCanceled(toApiError(httpError(500, '')))).toBe(false);
  });

  it('ERR-06: unwraps both a bare body and a { success, data } envelope', () => {
    expect(unwrapData({ hoTen: 'A' })).toEqual({ hoTen: 'A' });
    expect(unwrapData({ success: true, data: { hoTen: 'A' } })).toEqual({ hoTen: 'A' });
    expect(unwrapData(null)).toBeNull();
  });

  it('ERR-07: turns details[] into a field map and ignores other shapes', () => {
    const arrayErr = new ApiError({
      code: 'VALIDATION_ERROR',
      details: [
        { field: 'hoTen', message: 'Tối đa 100 ký tự' },
        { field: 'hoTen', message: 'Lỗi thứ hai' },
        { field: 'gia', message: 'Giá phải từ 500.000 đến 100.000.000 VNĐ' },
        { message: 'Không có field' },
      ],
    });
    expect(getFieldErrors(arrayErr)).toEqual({
      hoTen: 'Tối đa 100 ký tự',
      gia: 'Giá phải từ 500.000 đến 100.000.000 VNĐ',
    });
    expect(getFieldErrors(new ApiError({ code: 'X', details: { retryAfter: 900 } }))).toEqual({});
    expect(getFieldErrors(new ApiError({ code: 'X', details: null }))).toEqual({});
    expect(getFieldErrors(null)).toEqual({});
  });
});

describe('hostApi: endpoints follow API_DESIGN.xlsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SVC-01: GET /host/profile with signal', async () => {
    const signal = new AbortController().signal;
    axiosClient.get.mockResolvedValue({ success: true, data: { hoTen: 'Khánh Quỳnh' } });

    await expect(getHostProfile({ signal })).resolves.toEqual({ hoTen: 'Khánh Quỳnh' });
    expect(axiosClient.get).toHaveBeenCalledWith('/host/profile', { signal });
  });

  it('SVC-02: PATCH /host/profile only sends hoTen / soDienThoai', async () => {
    axiosClient.patch.mockResolvedValue({ id: 1, hoTen: 'A' });

    await updateHostProfile({ hoTen: 'A', email: 'x@y.vn', cccd: '079' });
    expect(axiosClient.patch).toHaveBeenCalledWith('/host/profile', { hoTen: 'A' });
  });

  it('SVC-03: rejects an empty profile update without calling the network', async () => {
    const err = await catchError(updateHostProfile({ email: 'x@y.vn' }));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(axiosClient.patch).not.toHaveBeenCalled();
  });

  it('SVC-04: POST /host/profile/change-password with exactly two keys', async () => {
    axiosClient.post.mockResolvedValue({ message: 'Đổi mật khẩu thành công' });

    await changeHostPassword({ oldPassword: 'Old@1234', newPassword: 'New@1234', extra: 'x' });
    expect(axiosClient.post).toHaveBeenCalledWith('/host/profile/change-password', {
      oldPassword: 'Old@1234',
      newPassword: 'New@1234',
    });
  });

  it('SVC-05: GET /host/listings sends trimmed keyword and paging params', async () => {
    axiosClient.get.mockResolvedValue({ items: [], pagination: { totalItems: 0 } });

    await getHostListings({ trangThai: 'PENDING', keyword: '  sea ', page: 2, limit: 10 });
    expect(axiosClient.get).toHaveBeenCalledWith('/host/listings', {
      params: { trangThai: 'PENDING', keyword: 'sea', page: 2, limit: 10 },
      signal: undefined,
    });
    expect(HOST_LISTINGS_PAGE_SIZE).toBe(10);
  });

  it('SVC-06: drops ALL status and empty keyword', async () => {
    axiosClient.get.mockResolvedValue({ items: [] });

    await getHostListings({ trangThai: 'ALL', keyword: '   ', page: null });
    expect(axiosClient.get).toHaveBeenCalledWith('/host/listings', { params: {}, signal: undefined });
  });

  it('SVC-07: GET /host/listings/:maCSLT with signal', async () => {
    const signal = new AbortController().signal;
    axiosClient.get.mockResolvedValue({ maCSLT: 12 });

    await getHostListingDetail(12, { signal });
    expect(axiosClient.get).toHaveBeenCalledWith('/host/listings/12', { signal });
  });

  it('SVC-08: POST /host/listings strips unknown keys', async () => {
    axiosClient.post.mockResolvedValue({ maCSLT: 12, trangThai: 'DRAFT' });

    await createHostListing({
      tenCSLT: 'Nhà Biển Xanh',
      maLoai: 2,
      maPhuong: 5,
      diaChiChiTiet: '12 Trần Phú',
      moTa: undefined,
      gia: 350000,
      maTienIch: [1, 3],
      latitude: 12.2388,
      longitude: 109.1967,
      foo: 1,
      lienHe: { soDienThoai: '0905123456', x: 1 },
    });

    expect(axiosClient.post).toHaveBeenCalledWith('/host/listings', {
      tenCSLT: 'Nhà Biển Xanh',
      maLoai: 2,
      maPhuong: 5,
      diaChiChiTiet: '12 Trần Phú',
      gia: 350000,
      maTienIch: [1, 3],
      latitude: 12.2388,
      longitude: 109.1967,
      lienHe: { soDienThoai: '0905123456' },
    });
  });

  it('SVC-09: PUT /host/listings/:maCSLT keeps null values to clear fields', async () => {
    axiosClient.put.mockResolvedValue({ maCSLT: 12, thayDoiTrangThai: false });

    await updateHostListing(12, { tenCSLT: 'A', moTa: null, lienHe: null, gia: null });
    expect(axiosClient.put).toHaveBeenCalledWith('/host/listings/12', {
      tenCSLT: 'A',
      moTa: null,
      lienHe: null,
      gia: null,
    });
  });

  it('SVC-10: uploads one file as multipart with progress and signal', async () => {
    const onProgress = vi.fn();
    const signal = new AbortController().signal;
    const file = new File(['img'], 'phong-1.jpg', { type: 'image/jpeg' });
    axiosClient.post.mockResolvedValue({ mediaId: 7, soAnh: 1 });

    await uploadListingMedia(12, { file, type: 'IMAGE' }, { onProgress, signal });

    const [path, body, config] = axiosClient.post.mock.calls[0];
    expect(path).toBe('/host/listings/12/media');
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('file')).toBeInstanceOf(File);
    expect(body.get('type')).toBe('IMAGE');
    expect(config.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
    expect(config.signal).toBe(signal);

    config.onUploadProgress({ loaded: 50, total: 100 });
    expect(onProgress).toHaveBeenCalledWith(50);
  });

  it('SVC-11: DELETE /host/listings/:maCSLT/media/:mediaId', async () => {
    axiosClient.delete.mockResolvedValue({ soAnh: 3 });
    await deleteListingMedia(12, 7);
    expect(axiosClient.delete).toHaveBeenCalledWith('/host/listings/12/media/7');
  });

  it('SVC-12: POST /host/listings/:maCSLT/submit-review', async () => {
    axiosClient.post.mockResolvedValue({ trangThai: 'PENDING' });
    await submitListingForReview(12);
    expect(axiosClient.post).toHaveBeenCalledWith('/host/listings/12/submit-review');
  });

  it('SVC-13: POST /host/listings/:maCSLT/withdraw', async () => {
    axiosClient.post.mockResolvedValue({ trangThai: 'DRAFT' });
    await withdrawListing(12);
    expect(axiosClient.post).toHaveBeenCalledWith('/host/listings/12/withdraw');
  });

  it('SVC-14: DELETE /host/listings/:maCSLT', async () => {
    axiosClient.delete.mockResolvedValue({ message: 'Xóa cơ sở thành công' });
    await deleteHostListing(12);
    expect(axiosClient.delete).toHaveBeenCalledWith('/host/listings/12');
  });

  it('SVC-15: GET /filter-options with signal', async () => {
    const signal = new AbortController().signal;
    axiosClient.get.mockResolvedValue({ wards: [] });
    await getFilterOptions({ signal });
    expect(axiosClient.get).toHaveBeenCalledWith('/filter-options', { signal });
  });

  it.each([undefined, 0, -1, 1.5, 'abc', '12a'])('SVC-16: rejects invalid id %s without calling the network', async (badId) => {
    const errors = await Promise.all([
      catchError(getHostListingDetail(badId)),
      catchError(updateHostListing(badId, { tenCSLT: 'A' })),
      catchError(deleteHostListing(badId)),
      catchError(withdrawListing(badId)),
      catchError(submitListingForReview(badId)),
      catchError(deleteListingMedia(12, badId)),
      catchError(uploadListingMedia(badId, { file: new File(['x'], 'a.jpg'), type: 'IMAGE' })),
    ]);

    errors.forEach((err) => expect(err.code).toBe('VALIDATION_ERROR'));
    expect(axiosClient.get).not.toHaveBeenCalled();
    expect(axiosClient.put).not.toHaveBeenCalled();
    expect(axiosClient.post).not.toHaveBeenCalled();
    expect(axiosClient.delete).not.toHaveBeenCalled();
  });

  it('SVC-16b: accepts a numeric id string from the URL', async () => {
    axiosClient.get.mockResolvedValue({ maCSLT: 12 });
    await getHostListingDetail('12');
    expect(axiosClient.get).toHaveBeenCalledWith('/host/listings/12', { signal: undefined });
  });

  it('SVC-17: rejects with ApiError carrying the server code', async () => {
    axiosClient.post.mockRejectedValueOnce(
      httpError(422, apiErrorBody('CHECKLIST_INCOMPLETE', 'Vui lòng hoàn thiện các trường bắt buộc trước khi gửi/duyệt.', [
        { field: 'anhToiThieu3', message: 'Cần ít nhất 3 ảnh' },
      ])),
    );
    const checklistErr = await catchError(submitListingForReview(12));
    expect(checklistErr).toBeInstanceOf(ApiError);
    expect(checklistErr.code).toBe('CHECKLIST_INCOMPLETE');
    expect(checklistErr.details).toHaveLength(1);

    axiosClient.post.mockRejectedValueOnce(httpError(413, ''));
    const tooLarge = await catchError(uploadListingMedia(12, { file: new File(['x'], 'a.jpg'), type: 'IMAGE' }));
    expect(tooLarge.code).toBe('FILE_TOO_LARGE');

    axiosClient.post.mockRejectedValueOnce(httpError(415, apiErrorBody('UNSUPPORTED_MEDIA_TYPE', 'Định dạng không được hỗ trợ: ảnh .jpg/.png/.webp, video .mp4.')));
    const badType = await catchError(uploadListingMedia(12, { file: new File(['x'], 'a.gif'), type: 'IMAGE' }));
    expect(badType.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });
});
