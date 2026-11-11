import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import axiosClient from '../../../services/axiosClient';
import { AddHotelPage } from '../AddHotelPage';
import {
  changeHostPassword,
  createHostListing,
  deleteHostListing,
  deleteListingMedia,
  getFilterOptions,
  getHostListingDetail,
  getHostListings,
  getHostProfile,
  submitListingForReview,
  updateHostListing,
  updateHostProfile,
  uploadListingMedia,
  withdrawListing,
} from '../api/hostApi';
import { MOCK_HOST_PASSWORD, hostMockApi, resetHostMockStore } from '../api/hostMockApi';
import { FALLBACK_ACTIONS } from '../components/listingActions';
import { DEFAULT_PRICE_RANGE } from '../components/listing-form/listingFormModel';

vi.mock('../../../mocks/mockListings', () => ({ USE_MOCK: true }));

// Any network call in mock mode is a bug.
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
const NEW_PASSWORD = 'Moi@12345';
const LIST_ITEM_KEYS = [
  'allowedActions',
  'duongDanAnh',
  'gia',
  'lyDoTuChoi',
  'lyDoViPham',
  'maCSLT',
  'ngayCapNhat',
  'ngayTao',
  'tenCSLT',
  'tenLoai',
  'tenPhuong',
  'trangThai',
];
const expectNoNetwork = () => Object.values(axiosClient).forEach((method) => expect(method).not.toHaveBeenCalled());
const idsOf = (page) => page.items.map((item) => item.maCSLT);

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

  it('MOCK-02: the listing table, listing delete and profile endpoints answer from the mock too', async () => {
    await expect(getHostListings({ trangThai: 'ALL', page: 1, limit: 10 })).resolves.toMatchObject({
      pagination: { totalItems: 5 },
    });
    await expect(deleteHostListing(5)).resolves.toEqual({ message: 'Xóa cơ sở thành công' });
    await expect(getHostProfile()).resolves.toMatchObject({ hoTen: 'Nguyễn Văn Host' });
    await expect(updateHostProfile({ hoTen: 'Tên Mới', email: 'khong@gui.vn' })).resolves.toMatchObject({ hoTen: 'Tên Mới' });
    await expect(changeHostPassword({ oldPassword: MOCK_HOST_PASSWORD, newPassword: NEW_PASSWORD })).resolves.toEqual({
      message: 'Đổi mật khẩu thành công',
    });

    // hostApi rules still run before the mock.
    expect((await catchError(deleteHostListing('abc'))).code).toBe('VALIDATION_ERROR');
    expect(await catchError(updateHostProfile({ email: 'khong@gui.vn' }))).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Không có thông tin nào để cập nhật.',
    });
    expectNoNetwork();
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

  it('MOCK-10: the unfiltered list returns the 5 listings with the Excel item shape', async () => {
    const page = await hostMockApi.getHostListings();

    expect(idsOf(page)).toEqual([1, 2, 3, 4, 5]);
    expect(page.pagination).toEqual({ totalItems: 5, totalPages: 1, currentPage: 1, limit: 10 });
    page.items.forEach((item) => {
      expect(Object.keys(item).sort()).toEqual(LIST_ITEM_KEYS);
      expect(item.allowedActions).toEqual(FALLBACK_ACTIONS[item.trangThai]);
      expect(item.tenLoai).toEqual(expect.any(String));
      expect(item.tenPhuong).toEqual(expect.any(String));
      expect(item.duongDanAnh).toMatch(/^https:\/\//);
    });
    expect(page.items[0]).toMatchObject({ tenCSLT: 'Sea Breeze Homestay', tenLoai: 'Homestay', tenPhuong: 'Lộc Thọ' });
    expect(page.items[1].lyDoTuChoi).toEqual(expect.any(String));
  });

  it('MOCK-11: trangThai filters by one or several statuses and rejects unknown values', async () => {
    for (const trangThai of ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN']) {
      const page = await hostMockApi.getHostListings({ trangThai });
      expect(page.items).toHaveLength(1);
      expect(page.items[0].trangThai).toBe(trangThai);
    }
    const counted = await hostMockApi.getHostListings({ trangThai: 'PENDING', page: 1, limit: 1 });
    expect(counted.pagination).toEqual({ totalItems: 1, totalPages: 1, currentPage: 1, limit: 1 });

    expect(idsOf(await hostMockApi.getHostListings({ trangThai: 'DRAFT,REJECTED' }))).toEqual([2, 5]);
    expect(idsOf(await hostMockApi.getHostListings({ trangThai: ['DRAFT', 'REJECTED'] }))).toEqual([2, 5]);

    expect(await catchError(hostMockApi.getHostListings({ trangThai: 'ABC' }))).toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    });
    expect(await catchError(hostMockApi.getHostListings({ trangThai: 'DRAFT,ABC' }))).toMatchObject({ status: 400 });
  });

  it('MOCK-12: keyword matches names ignoring case and spaces, page and limit slice the result', async () => {
    expect(idsOf(await hostMockApi.getHostListings({ keyword: ' breeze ' }))).toEqual([1, 3, 5]);
    expect(await hostMockApi.getHostListings({ keyword: 'không có' })).toEqual({
      items: [],
      pagination: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
    });

    const second = await hostMockApi.getHostListings({ page: 2, limit: 2 });
    expect(idsOf(second)).toEqual([3, 4]);
    expect(second.pagination).toEqual({ totalItems: 5, totalPages: 3, currentPage: 2, limit: 2 });

    expect((await hostMockApi.getHostListings({ limit: 99 })).pagination.limit).toBe(50);
  });

  it('MOCK-13: only DRAFT and REJECTED listings can be deleted', async () => {
    await expect(hostMockApi.deleteHostListing(5)).resolves.toEqual({ message: 'Xóa cơ sở thành công' });
    await expect(hostMockApi.deleteHostListing(2)).resolves.toEqual({ message: 'Xóa cơ sở thành công' });
    expect(idsOf(await hostMockApi.getHostListings())).toEqual([1, 3, 4]);

    for (const id of [1, 3, 4]) {
      expect(await catchError(hostMockApi.deleteHostListing(id))).toMatchObject({
        status: 409,
        code: 'LISTING_NOT_DELETABLE',
      });
    }
    expect(await catchError(hostMockApi.deleteHostListing(6))).toMatchObject({ status: 403, code: 'NOT_OWNER' });
    expect(await catchError(hostMockApi.deleteHostListing(999))).toMatchObject({ status: 404, code: 'LISTING_NOT_FOUND' });
    expect(await catchError(hostMockApi.deleteHostListing(5))).toMatchObject({ status: 404 });
  });

  it('MOCK-14: the list and the listing form share one store', async () => {
    await withdrawListing(3);
    expect(idsOf(await getHostListings({ trangThai: 'DRAFT' }))).toEqual([3, 5]);

    await deleteHostListing(5);
    expect(await catchError(getHostListingDetail(5))).toMatchObject({ code: 'LISTING_NOT_FOUND' });

    const created = await createHostListing(NEW_LISTING);
    const [item] = (await getHostListings({ keyword: 'Nhà Mới' })).items;
    expect(item).toMatchObject({ maCSLT: created.maCSLT, trangThai: 'DRAFT', duongDanAnh: null, gia: null });
  });

  it('MOCK-15: the profile masks the CCCD, saves name and phone and validates them', async () => {
    const profile = await hostMockApi.getHostProfile();
    expect(Object.keys(profile).sort()).toEqual(
      ['cccd', 'email', 'hoTen', 'id', 'ngayTao', 'soDienThoai', 'trangThai', 'vaiTro'].sort(),
    );
    expect(profile).toMatchObject({
      vaiTro: 'HOST',
      hoTen: 'Nguyễn Văn Host',
      soDienThoai: '0905123456',
      email: 'host.demo@hotelnt.vn',
    });
    expect(profile.cccd).toHaveLength(12);
    expect(profile.cccd).toContain('*');

    const saved = await hostMockApi.updateHostProfile({ hoTen: 'Nguyễn Văn Host Mới', soDienThoai: '0905999888' });
    expect(Object.keys(saved).sort()).toEqual(['email', 'hoTen', 'id', 'ngayCapNhat', 'soDienThoai']);
    expect(await hostMockApi.getHostProfile()).toMatchObject({ hoTen: 'Nguyễn Văn Host Mới', soDienThoai: '0905999888' });

    const badPhone = await catchError(hostMockApi.updateHostProfile({ soDienThoai: '0912abc' }));
    expect(badPhone).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(badPhone.details[0].field).toBe('soDienThoai');
    expect((await catchError(hostMockApi.updateHostProfile({ hoTen: '  ' }))).details[0].field).toBe('hoTen');
    expect((await catchError(hostMockApi.updateHostProfile({ hoTen: 'a'.repeat(101) }))).details[0].field).toBe('hoTen');
    expect((await hostMockApi.getHostProfile()).soDienThoai).toBe('0905999888');

    resetHostMockStore();
    expect((await hostMockApi.getHostProfile()).hoTen).toBe('Nguyễn Văn Host');
  });

  it('MOCK-16: changing the password checks the old one and the strength of the new one', async () => {
    expect(await catchError(hostMockApi.changeHostPassword({ oldPassword: 'Sai@12345', newPassword: NEW_PASSWORD }))).toMatchObject({
      status: 400,
      code: 'OLD_PASSWORD_INCORRECT',
    });
    expect(await catchError(hostMockApi.changeHostPassword({ oldPassword: MOCK_HOST_PASSWORD, newPassword: 'abc' }))).toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    });
    expect(
      await catchError(hostMockApi.changeHostPassword({ oldPassword: MOCK_HOST_PASSWORD, newPassword: MOCK_HOST_PASSWORD })),
    ).toMatchObject({ code: 'VALIDATION_ERROR' });

    await expect(hostMockApi.changeHostPassword({ oldPassword: MOCK_HOST_PASSWORD, newPassword: NEW_PASSWORD })).resolves.toEqual({
      message: 'Đổi mật khẩu thành công',
    });
    expect(
      await catchError(hostMockApi.changeHostPassword({ oldPassword: MOCK_HOST_PASSWORD, newPassword: 'Khac@12345' })),
    ).toMatchObject({ code: 'OLD_PASSWORD_INCORRECT' });

    resetHostMockStore();
    await expect(hostMockApi.changeHostPassword({ oldPassword: MOCK_HOST_PASSWORD, newPassword: NEW_PASSWORD })).resolves.toBeDefined();
  });
});
