import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AddHotelPage } from '../AddHotelPage';
import {
  ApiError,
  createHostListing,
  getFilterOptions,
  getHostListingDetail,
  submitListingForReview,
  updateHostListing,
} from '../api/hostApi';

vi.mock('../api/hostApi', async (importOriginal) => ({
  ...(await importOriginal()),
  getFilterOptions: vi.fn(),
  getHostListingDetail: vi.fn(),
  createHostListing: vi.fn(),
  updateHostListing: vi.fn(),
  submitListingForReview: vi.fn(),
  uploadListingMedia: vi.fn(),
  deleteListingMedia: vi.fn(),
}));

const FILTER_OPTIONS = {
  wards: [
    { maPhuong: 5, tenPhuong: 'Lộc Thọ' },
    { maPhuong: 6, tenPhuong: 'Vĩnh Hải' },
  ],
  propertyTypes: [
    { maLoai: 1, tenLoai: 'Khách sạn' },
    { maLoai: 2, tenLoai: 'Homestay' },
  ],
  amenities: [
    { maTienIch: 1, tenTienIch: 'Wifi' },
    { maTienIch: 2, tenTienIch: 'Điều hòa' },
  ],
  nearbyPlaces: [{ maTienIch: 9, tenTienIch: 'Gần biển' }],
  priceRange: { giaMin: 500000, giaMax: 100000000 },
  mapBounds: { latMin: 12.1, latMax: 12.45, lngMin: 109.1, lngMax: 109.3 },
};

const ALL_DONE = { ten: true, diaChi: true, phuong: true, toaDo: true, gia: true, anhToiThieu3: true, tienIchToiThieu1: true };

const draft = (overrides = {}) => ({
  maCSLT: 12,
  tenCSLT: 'Nhà Biển Xanh',
  maLoai: 2,
  tenLoai: 'Homestay',
  maPhuong: 5,
  tenPhuong: 'Lộc Thọ',
  diaChiChiTiet: '12 Trần Phú',
  moTa: null,
  latitude: null,
  longitude: null,
  gia: null,
  lienHe: { soDienThoai: null, zalo: null, facebook: null },
  maTienIch: [],
  media: [],
  soAnh: 0,
  soVideo: 0,
  trangThai: 'DRAFT',
  ngayTao: '2026-09-25T08:00:00Z',
  ngayCapNhat: '2026-09-25T08:00:00Z',
  checklistGuiDuyet: { ...ALL_DONE, toaDo: false, gia: false, anhToiThieu3: false, tienIchToiThieu1: false },
  allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'],
  ...overrides,
});

const image = (mediaId) => ({ mediaId, url: `https://cdn.test/${mediaId}.jpg`, type: 'IMAGE', kichThuoc: 1024, thuTu: mediaId });

const completeDraft = (overrides = {}) =>
  draft({
    gia: 650000,
    maTienIch: [1],
    latitude: 12.2388,
    longitude: 109.1967,
    media: [image(1), image(2), image(3)],
    soAnh: 3,
    checklistGuiDuyet: ALL_DONE,
    ...overrides,
  });

const LocationProbe = () => {
  const location = useLocation();
  return (
    <>
      <div data-testid="location">{`${location.pathname}${location.search}`}</div>
      <div data-testid="location-state">{JSON.stringify(location.state)}</div>
    </>
  );
};

const renderAdd = (url = '/host/hotels/new') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/host/hotels/new" element={<AddHotelPage />} />
        <Route path="/host/hotels/:id/edit" element={<div>Trang cập nhật</div>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

const nameInput = () => screen.getByLabelText(/^Tên cơ sở lưu trú/);
const fillStepOne = ({ name = 'Nhà Biển Xanh', type = '2', ward = '5', address = '12 Trần Phú' } = {}) => {
  fireEvent.change(nameInput(), { target: { value: name } });
  if (type) fireEvent.change(screen.getByLabelText(/^Loại hình/), { target: { value: type } });
  if (ward) fireEvent.change(screen.getByLabelText(/^Phường\/Xã/), { target: { value: ward } });
  fireEvent.change(screen.getByLabelText(/^Địa chỉ cụ thể/), { target: { value: address } });
};
const stepButton = (label) => screen.getByRole('button', { name: new RegExp(`^${label}`) });

describe('AddHotelPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFilterOptions.mockResolvedValue(FILTER_OPTIONS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ADD-01: loads filter options and locks steps 2–4 before the first save', async () => {
    renderAdd();

    expect(await screen.findByRole('heading', { name: 'Thêm cơ sở lưu trú' })).toBeInTheDocument();
    expect(getFilterOptions).toHaveBeenCalledTimes(1);
    expect(within(screen.getByLabelText(/^Loại hình/)).getByRole('option', { name: 'Homestay' })).toBeInTheDocument();
    expect(within(screen.getByLabelText(/^Phường\/Xã/)).getByRole('option', { name: 'Vĩnh Hải' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Tỉnh\/Thành phố/)).toBeDisabled();
    ['Giá & tiện ích', 'Hình ảnh & video', 'Bản đồ'].forEach((label) => {
      expect(stepButton(label)).toHaveAttribute('aria-disabled', 'true');
      expect(stepButton(label)).toHaveTextContent('Mở sau khi lưu bước 1');
    });
    expect(screen.getByText('Lưu để nhận mã cơ sở và mở khóa bước 2–4')).toBeInTheDocument();
    expect(screen.getByText('Hoàn thành 7 điều kiện bên phải để gửi kiểm duyệt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gửi kiểm duyệt' })).toBeDisabled();
    expect(getHostListingDetail).not.toHaveBeenCalled();
  });

  it('ADD-02: shows ErrorState when /filter-options fails and retries', async () => {
    getFilterOptions
      .mockRejectedValueOnce(new ApiError({ status: 500, code: 'INTERNAL_ERROR' }))
      .mockResolvedValueOnce(FILTER_OPTIONS);
    renderAdd();

    expect(await screen.findByText('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByRole('heading', { name: 'Thêm cơ sở lưu trú' })).toBeInTheDocument();
    expect(getFilterOptions).toHaveBeenCalledTimes(2);
  });

  it('ADD-03: validates step 1 with Figma 12.2 messages before calling the API', async () => {
    renderAdd();
    await screen.findByRole('heading', { name: 'Thêm cơ sở lưu trú' });

    fillStepOne({ type: '', ward: '' });
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '09051234' } });
    fireEvent.change(screen.getByLabelText('Facebook'), { target: { value: 'facebook.com/x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu tạo mới' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Chưa lưu được — có 4 trường cần sửa');
    expect(screen.getByText('Vui lòng chọn loại hình')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn phường/xã')).toBeInTheDocument();
    expect(screen.getByText('Số điện thoại phải gồm đúng 10 chữ số')).toBeInTheDocument();
    expect(screen.getByText('Link phải bắt đầu bằng https://facebook.com/')).toBeInTheDocument();
    expect(screen.getByLabelText('Số điện thoại')).toHaveAttribute('aria-invalid', 'true');
    expect(createHostListing).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Đến trường cần sửa' }));
    expect(screen.getByLabelText(/^Loại hình/)).toHaveFocus();
  });

  it('ADD-04: creates the draft, puts the id in the URL and unlocks steps 2–4', async () => {
    createHostListing.mockResolvedValue({ maCSLT: 12, trangThai: 'DRAFT', ngayTao: '2026-09-25T08:00:00Z' });
    getHostListingDetail.mockResolvedValue(draft());
    renderAdd();
    await screen.findByRole('heading', { name: 'Thêm cơ sở lưu trú' });

    fillStepOne({ name: '  Nhà Biển Xanh ' });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu tạo mới' }));

    await waitFor(() =>
      expect(createHostListing).toHaveBeenCalledWith({
        tenCSLT: 'Nhà Biển Xanh',
        maLoai: 2,
        maPhuong: 5,
        diaChiChiTiet: '12 Trần Phú',
      }),
    );
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/host/hotels/new?id=12&step=2'));
    expect(await screen.findByRole('heading', { name: 'Nhà Biển Xanh' })).toBeInTheDocument();
    expect(screen.getByText('Bản nháp')).toBeInTheDocument();
    expect(screen.getByText('Mã cơ sở đã được tạo — bạn có thể nhập tiếp các bước còn lại')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Giá tham khảo' })).toBeInTheDocument();
    expect(stepButton('Bản đồ')).not.toHaveAttribute('aria-disabled');
    await waitFor(() => expect(getHostListingDetail).toHaveBeenCalledWith(12, expect.anything()));
  });

  it('ADD-05: shows server VALIDATION_ERROR details under the field', async () => {
    createHostListing.mockRejectedValue(
      new ApiError({ status: 400, code: 'VALIDATION_ERROR', details: [{ field: 'tenCSLT', message: 'Tên cơ sở đã tồn tại' }] }),
    );
    renderAdd();
    await screen.findByRole('heading', { name: 'Thêm cơ sở lưu trú' });

    fillStepOne();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu tạo mới' }));

    expect(await screen.findByText('Tên cơ sở đã tồn tại')).toBeInTheDocument();
    expect(nameInput()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Chưa lưu được — có 1 trường cần sửa');
  });

  it('ADD-06: resumes a draft from ?id=&step= without creating a new one', async () => {
    getHostListingDetail.mockResolvedValue(draft());
    renderAdd('/host/hotels/new?id=12&step=3');

    expect(await screen.findByRole('heading', { name: 'Hình ảnh' })).toBeInTheDocument();
    expect(getHostListingDetail).toHaveBeenCalledWith(12, expect.anything());
    expect(stepButton('Hình ảnh & video')).toHaveAttribute('aria-current', 'step');
    expect(createHostListing).not.toHaveBeenCalled();
  });

  it('ADD-06b: shows not-found for an invalid id in the URL', () => {
    renderAdd('/host/hotels/new?id=abc');
    expect(screen.getByText('Không tìm thấy cơ sở lưu trú.')).toBeInTheDocument();
    expect(getHostListingDetail).not.toHaveBeenCalled();
  });

  it('ADD-07: sends a non-draft listing to the edit page', async () => {
    getHostListingDetail.mockResolvedValue(draft({ trangThai: 'PENDING', allowedActions: ['PREVIEW'] }));
    renderAdd('/host/hotels/new?id=12');

    expect(await screen.findByText('Trang cập nhật')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/host/hotels/12/edit');
  });

  it('ADD-08: saves step 2 with a numeric price and amenities, then moves on', async () => {
    getHostListingDetail.mockResolvedValue(draft());
    updateHostListing.mockResolvedValue({ maCSLT: 12, trangThai: 'DRAFT', thayDoiTrangThai: false, message: 'Cập nhật thành công' });
    renderAdd('/host/hotels/new?id=12&step=2');
    await screen.findByRole('heading', { name: 'Giá tham khảo' });

    fireEvent.change(screen.getByLabelText(/^Giá tham khảo/), { target: { value: '650000' } });
    expect(screen.getByLabelText(/^Giá tham khảo/)).toHaveValue('650.000');
    fireEvent.click(screen.getByLabelText('Wifi'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu & tiếp tục' }));

    await waitFor(() => expect(updateHostListing).toHaveBeenCalledTimes(1));
    const [id, payload] = updateHostListing.mock.calls[0];
    expect(id).toBe(12);
    expect(payload).toMatchObject({ tenCSLT: 'Nhà Biển Xanh', maLoai: 2, maPhuong: 5, gia: 650000, maTienIch: [1] });
    expect(await screen.findByRole('heading', { name: 'Hình ảnh' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('step=3');
  });

  it('ADD-09: shows LOCATION_OUT_OF_RANGE on the coordinate fields', async () => {
    getHostListingDetail.mockResolvedValue(draft());
    updateHostListing.mockRejectedValue(
      new ApiError({ status: 400, code: 'LOCATION_OUT_OF_RANGE', message: 'Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.' }),
    );
    renderAdd('/host/hotels/new?id=12&step=4');
    await screen.findByRole('heading', { name: 'Vị trí trên bản đồ' });

    fireEvent.change(screen.getByLabelText('Vĩ độ (lat)'), { target: { value: '12.2388' } });
    fireEvent.change(screen.getByLabelText('Kinh độ (lng)'), { target: { value: '109.1967' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu nháp' }));

    expect(await screen.findByText('Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.')).toBeInTheDocument();
    expect(screen.getByLabelText('Vĩ độ (lat)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('ADD-10: keeps submit disabled at 6/7 conditions', async () => {
    getHostListingDetail.mockResolvedValue(
      completeDraft({ media: [image(1), image(2)], soAnh: 2, checklistGuiDuyet: { ...ALL_DONE, anhToiThieu3: false } }),
    );
    renderAdd('/host/hotels/new?id=12&step=1');
    await screen.findByRole('heading', { name: 'Nhà Biển Xanh' });

    expect(screen.getByText('6/7 đã hoàn thành')).toBeInTheDocument();
    expect(screen.getByText('Còn 1 điều kiện chưa hoàn thành')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gửi kiểm duyệt' })).toBeDisabled();
  });

  it('ADD-11: saves pending changes before submitting, then goes to the edit page with a toast', async () => {
    getHostListingDetail.mockResolvedValue(completeDraft());
    updateHostListing.mockResolvedValue({ maCSLT: 12, trangThai: 'DRAFT', thayDoiTrangThai: false });
    let finishSubmit;
    submitListingForReview.mockReturnValue(
      new Promise((resolve) => {
        finishSubmit = resolve;
      }),
    );
    renderAdd('/host/hotels/new?id=12&step=1');
    await screen.findByRole('heading', { name: 'Nhà Biển Xanh' });

    fireEvent.change(screen.getByLabelText('Mô tả'), { target: { value: 'Homestay 8 phòng gần biển' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi kiểm duyệt' }));

    await waitFor(() => expect(submitListingForReview).toHaveBeenCalledWith(12));
    expect(updateHostListing).toHaveBeenCalledWith(12, expect.objectContaining({ moTa: 'Homestay 8 phòng gần biển' }));
    expect(updateHostListing.mock.invocationCallOrder[0]).toBeLessThan(submitListingForReview.mock.invocationCallOrder[0]);
    expect(screen.getByRole('button', { name: 'Đang gửi…' })).toBeDisabled();
    expect(screen.getByText('Đang gửi yêu cầu kiểm duyệt…')).toBeInTheDocument();

    finishSubmit({ maCSLT: 12, trangThai: 'PENDING' });
    expect(await screen.findByText('Trang cập nhật')).toBeInTheDocument();
    expect(screen.getByTestId('location-state')).toHaveTextContent('Đã gửi kiểm duyệt');
  });

  it('ADD-12: lists 422 CHECKLIST_INCOMPLETE details under the checklist', async () => {
    getHostListingDetail.mockResolvedValue(completeDraft());
    submitListingForReview.mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'CHECKLIST_INCOMPLETE',
        message: 'Vui lòng hoàn thiện các trường bắt buộc trước khi gửi/duyệt.',
        details: [{ field: 'anhToiThieu3', message: 'Cần tối thiểu 3 ảnh hợp lệ' }],
      }),
    );
    renderAdd('/host/hotels/new?id=12&step=1');
    await screen.findByRole('heading', { name: 'Nhà Biển Xanh' });

    fireEvent.click(screen.getByRole('button', { name: 'Gửi kiểm duyệt' }));

    expect(await screen.findByText('Cần tối thiểu 3 ảnh hợp lệ')).toBeInTheDocument();
    expect(screen.getByText('Máy chủ báo còn thiếu:')).toBeInTheDocument();
    expect(document.querySelector('[data-checklist-key="anhToiThieu3"]')).toHaveAttribute('data-done', 'false');
  });

  it('ADD-13: guards unsaved changes with beforeunload until they are saved', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    createHostListing.mockResolvedValue({ maCSLT: 12, trangThai: 'DRAFT' });
    getHostListingDetail.mockResolvedValue(draft());
    renderAdd();
    await screen.findByRole('heading', { name: 'Thêm cơ sở lưu trú' });

    fillStepOne();
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    const handler = addSpy.mock.calls.find(([name]) => name === 'beforeunload')[1];

    fireEvent.click(screen.getByRole('button', { name: 'Lưu tạo mới' }));
    await waitFor(() => expect(removeSpy).toHaveBeenCalledWith('beforeunload', handler));
  });
});
