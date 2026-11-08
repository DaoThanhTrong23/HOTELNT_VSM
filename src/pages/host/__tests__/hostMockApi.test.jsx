import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import axiosClient from '../../../services/axiosClient';
import { AddHotelPage } from '../AddHotelPage';
import {
  createHostListing,
  deleteListingMedia,
  getFilterOptions,
  getHostListingDetail,
  getHostListings,
  submitListingForReview,
  updateHostListing,
  uploadListingMedia,
  withdrawListing,
} from '../api/hostApi';
import { hostMockApi, resetHostMockStore } from '../api/hostMockApi';
import { FALLBACK_ACTIONS } from '../components/listingActions';
import { DEFAULT_PRICE_RANGE } from '../components/listing-form/listingFormModel';

vi.mock('../../../mocks/mockListings', () => ({ USE_MOCK: true }));

// Any network call in mock mode is a bug, except the listing table, listing delete and profile,
// which stay on the real API.
vi.mock('../../../services/axiosClient', () => {
  const offline = () => {
    throw new Error('axiosClient must not be called in mock mode');
  };
  return {
    default: { get: vi.fn(offline), post: vi.fn(offline), put: vi.fn(offline), patch: vi.fn(offline), delete: vi.fn(offline) },
  };
});

const catchError = async (promise) => {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  throw new Error('Expected promise to reject');
};

const jpg = () => new File(['x'], 'a.jpg', { type: 'image/jpeg' });
const NEW_LISTING = { tenCSLT: 'Nhà Mới', maLoai: 2, maPhuong: 1, diaChiChiTiet: '1 Trần Phú' };
const expectNoNetwork = () => Object.values(axiosClient).forEach((method) => expect(method).not.toHaveBeenCalled());

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

describe('hostMockApi (VITE_USE_MOCK=true)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetHostMockStore();
  });

  it('MOCK-01: the 8 listing form endpoints answer from the mock without calling axiosClient', async () => {
    const onProgress = vi.fn();

    await expect(getFilterOptions()).resolves.toHaveProperty('wards');
    await expect(getHostListingDetail(1)).resolves.toMatchObject({ maCSLT: 1, trangThai: 'APPROVED' });
    const created = await createHostListing({ ...NEW_LISTING, khongCoTrongExcel: 'x' });
    expect(created).toEqual({ maCSLT: 1000, trangThai: 'DRAFT' });
    await expect(updateHostListing(created.maCSLT, { ...NEW_LISTING, tenCSLT: 'Nhà Mới 2' })).resolves.toMatchObject({
      thayDoiTrangThai: false,
    });
    const uploaded = await uploadListingMedia(created.maCSLT, { file: jpg(), type: 'IMAGE' }, { onProgress });
    expect(uploaded).toMatchObject({ type: 'IMAGE', soAnh: 1, soVideo: 0 });
    expect(onProgress).toHaveBeenCalledWith(100);
    await expect(deleteListingMedia(created.maCSLT, uploaded.mediaId)).resolves.toMatchObject({ soAnh: 0 });
    await expect(submitListingForReview(created.maCSLT)).resolves.toEqual({ maCSLT: created.maCSLT, trangThai: 'PENDING' });
    await expect(withdrawListing(created.maCSLT)).resolves.toEqual({ maCSLT: created.maCSLT, trangThai: 'DRAFT' });

    // Body and id rules of hostApi still run before the mock.
    expect((await getHostListingDetail(created.maCSLT)).khongCoTrongExcel).toBeUndefined();
    expect((await catchError(getHostListingDetail('abc'))).code).toBe('VALIDATION_ERROR');
    expect((await catchError(uploadListingMedia(1, { file: jpg(), type: 'GIF' }))).code).toBe('VALIDATION_ERROR');
    expectNoNetwork();
  });

  it('MOCK-02: the listing table still calls the real API in mock mode', async () => {
    axiosClient.get.mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

    await getHostListings({ page: 1, limit: 10 });

    expect(axiosClient.get).toHaveBeenCalledWith('/host/listings', expect.objectContaining({ params: { page: 1, limit: 10 } }));
  });

  it('MOCK-03: filter options have the 4 lists and the default price range', async () => {
    const options = await hostMockApi.getFilterOptions();

    ['propertyTypes', 'wards', 'amenities', 'nearbyPlaces'].forEach((key) => expect(options[key].length).toBeGreaterThan(0));
    expect(options.wards).toContainEqual({ maPhuong: 1, tenPhuong: 'Lộc Thọ' });
    expect(options.priceRange).toEqual({ giaMin: DEFAULT_PRICE_RANGE.min, giaMax: DEFAULT_PRICE_RANGE.max });
  });

  it('MOCK-04: listings 1–5 cover the five statuses, 6 is NOT_OWNER and others are LISTING_NOT_FOUND', async () => {
    const statuses = { 1: 'APPROVED', 2: 'REJECTED', 3: 'PENDING', 4: 'HIDDEN', 5: 'DRAFT' };
    for (const [id, trangThai] of Object.entries(statuses)) {
      const detail = await hostMockApi.getHostListingDetail(Number(id));
      expect(detail).toMatchObject({ maCSLT: Number(id), trangThai, allowedActions: FALLBACK_ACTIONS[trangThai] });
      expect(Object.values(detail.checklistGuiDuyet).every(Boolean)).toBe(true);
      expect(detail.soAnh).toBeGreaterThanOrEqual(3);
    }
    expect((await hostMockApi.getHostListingDetail(1)).tenCSLT).toBe('Sea Breeze Homestay');
    expect((await hostMockApi.getHostListingDetail(2)).lyDoTuChoi).toEqual(expect.any(String));
    expect((await hostMockApi.getHostListingDetail(3)).ngayGuiDuyet).toEqual(expect.any(String));
    expect((await hostMockApi.getHostListingDetail(4)).lyDoViPham).toEqual(expect.any(String));
    expect((await hostMockApi.getHostListingDetail(1)).lyDoTuChoi).toBeNull();

    expect(await catchError(hostMockApi.getHostListingDetail(6))).toMatchObject({ status: 403, code: 'NOT_OWNER' });
    expect(await catchError(hostMockApi.getHostListingDetail(999))).toMatchObject({ status: 404, code: 'LISTING_NOT_FOUND' });
  });

  it('MOCK-05: created listings get increasing ids and returned objects are copies', async () => {
    const first = await hostMockApi.createHostListing(NEW_LISTING);
    const second = await hostMockApi.createHostListing({ ...NEW_LISTING, tenCSLT: 'Nhà Thứ Hai' });
    expect([first.maCSLT, second.maCSLT]).toEqual([1000, 1001]);

    const detail = await hostMockApi.getHostListingDetail(first.maCSLT);
    expect(detail).toMatchObject({ ...NEW_LISTING, trangThai: 'DRAFT', media: [], soAnh: 0 });

    detail.tenCSLT = 'Sửa ngoài mock';
    detail.media.push({ mediaId: 1, type: 'IMAGE' });
    const reread = await hostMockApi.getHostListingDetail(first.maCSLT);
    expect(reread.tenCSLT).toBe('Nhà Mới');
    expect(reread.media).toEqual([]);
  });

  it('MOCK-06: saving keeps DRAFT, sends APPROVED to PENDING and refuses PENDING', async () => {
    await expect(hostMockApi.updateHostListing(5, { tenCSLT: 'Bản nháp mới' })).resolves.toEqual({
      maCSLT: 5,
      trangThai: 'DRAFT',
      thayDoiTrangThai: false,
    });
    expect((await hostMockApi.getHostListingDetail(5)).tenCSLT).toBe('Bản nháp mới');

    await expect(hostMockApi.updateHostListing(1, { tenCSLT: 'Sea Breeze & Spa' })).resolves.toMatchObject({
      trangThai: 'PENDING',
      thayDoiTrangThai: true,
      message: 'Đã lưu thay đổi. Cơ sở chuyển sang Chờ duyệt.',
    });
    expect((await hostMockApi.getHostListingDetail(1)).trangThai).toBe('PENDING');

    expect(await catchError(hostMockApi.updateHostListing(3, { tenCSLT: 'x' }))).toMatchObject({
      status: 409,
      code: 'LISTING_LOCKED_PENDING',
    });
  });

  it('MOCK-07: submit and withdraw follow the allowed transitions', async () => {
    await expect(hostMockApi.submitListingForReview(5)).resolves.toEqual({ maCSLT: 5, trangThai: 'PENDING' });
    expect((await hostMockApi.getHostListingDetail(5)).allowedActions).toEqual(FALLBACK_ACTIONS.PENDING);
    await expect(hostMockApi.withdrawListing(5)).resolves.toEqual({ maCSLT: 5, trangThai: 'DRAFT' });

    expect(await catchError(hostMockApi.withdrawListing(5))).toMatchObject({ status: 409, code: 'INVALID_STATE_TRANSITION' });
    expect(await catchError(hostMockApi.submitListingForReview(1))).toMatchObject({ code: 'INVALID_STATE_TRANSITION' });
  });

  it('MOCK-08: uploading and deleting media update the counts and move APPROVED to PENDING', async () => {
    const before = await hostMockApi.getHostListingDetail(1);
    const uploaded = await hostMockApi.uploadListingMedia(1, { file: jpg(), type: 'IMAGE' });
    expect(uploaded).toMatchObject({ type: 'IMAGE', soAnh: before.soAnh + 1, thayDoiTrangThai: true });
    expect(uploaded.thuTu).toBe(Math.max(...before.media.map((item) => item.thuTu)) + 1);
    expect((await hostMockApi.getHostListingDetail(1)).trangThai).toBe('PENDING');
    expect(await catchError(hostMockApi.uploadListingMedia(1, { file: jpg(), type: 'IMAGE' }))).toMatchObject({
      code: 'LISTING_LOCKED_PENDING',
    });

    const draftImage = (await hostMockApi.getHostListingDetail(5)).media.find((item) => item.type === 'IMAGE');
    const deleted = await hostMockApi.deleteListingMedia(5, draftImage.mediaId);
    expect(deleted).toMatchObject({ soAnh: before.soAnh - 1, thayDoiTrangThai: false });
    expect(await catchError(hostMockApi.deleteListingMedia(5, draftImage.mediaId))).toMatchObject({
      status: 404,
      code: 'MEDIA_NOT_FOUND',
    });
  });

  it('MOCK-09: "Thêm mới" creates a draft end to end on the mock', async () => {
    render(
      <MemoryRouter initialEntries={['/host/hotels/new']}>
        <Routes>
          <Route path="/host/hotels/new" element={<AddHotelPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { level: 1, name: 'Thêm cơ sở lưu trú' });

    fireEvent.change(screen.getByLabelText(/^Tên cơ sở lưu trú/), { target: { value: 'Nhà Mới' } });
    fireEvent.change(screen.getByLabelText(/^Loại hình/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/^Phường\/Xã/), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/^Địa chỉ cụ thể/), { target: { value: '1 Trần Phú' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu tạo mới' }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/host/hotels/new?id=1000&step=2'));
    expect(await screen.findByRole('heading', { name: 'Giá tham khảo' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: 'Nhà Mới' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expectNoNetwork();
  });
});
