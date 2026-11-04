import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EditHotelPage } from '../EditHotelPage';
import {
  ApiError,
  getFilterOptions,
  getHostListingDetail,
  submitListingForReview,
  updateHostListing,
  uploadListingMedia,
  withdrawListing,
} from '../api/hostApi';
import { formatDate } from '../../../utils/formatters';

vi.mock('../api/hostApi', async (importOriginal) => ({
  ...(await importOriginal()),
  getFilterOptions: vi.fn(),
  getHostListingDetail: vi.fn(),
  updateHostListing: vi.fn(),
  submitListingForReview: vi.fn(),
  withdrawListing: vi.fn(),
  uploadListingMedia: vi.fn(),
  deleteListingMedia: vi.fn(),
}));

const FILTER_OPTIONS = {
  wards: [{ maPhuong: 5, tenPhuong: 'Bắc Nha Trang' }],
  propertyTypes: [{ maLoai: 1, tenLoai: 'Khách sạn' }],
  amenities: [{ maTienIch: 1, tenTienIch: 'Wifi' }],
  nearbyPlaces: [],
  priceRange: { giaMin: 500000, giaMax: 100000000 },
};

const ALL_DONE = { ten: true, diaChi: true, phuong: true, toaDo: true, gia: true, anhToiThieu3: true, tienIchToiThieu1: true };
const image = (mediaId) => ({ mediaId, url: `https://cdn.test/${mediaId}.jpg`, type: 'IMAGE', kichThuoc: 1024, thuTu: mediaId });

const listing = (overrides = {}) => ({
  maCSLT: 12,
  tenCSLT: 'Sea Breeze Homestay',
  maLoai: 1,
  tenLoai: 'Khách sạn',
  maPhuong: 5,
  tenPhuong: 'Bắc Nha Trang',
  diaChiChiTiet: '12 Trần Phú',
  moTa: 'Homestay 8 phòng cách biển 2 phút đi bộ.',
  latitude: 12.2388,
  longitude: 109.1967,
  gia: 650000,
  lienHe: { soDienThoai: '0905123456', zalo: null, facebook: null },
  maTienIch: [1],
  media: [image(1), image(2), image(3)],
  soAnh: 3,
  soVideo: 0,
  trangThai: 'APPROVED',
  lyDoTuChoi: null,
  lyDoViPham: null,
  ngayTao: '2026-09-12T08:00:00Z',
  ngayCapNhat: '2026-09-24T08:00:00Z',
  checklistGuiDuyet: ALL_DONE,
  allowedActions: ['PREVIEW', 'EDIT'],
  ...overrides,
});

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location-state">{JSON.stringify(location.state)}</div>;
};

const renderEdit = ({ id = '12', state } = {}) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: `/host/hotels/${id}/edit`, state }]}>
      <Routes>
        <Route path="/host/hotels/:id/edit" element={<EditHotelPage />} />
        <Route path="/host/dashboard" element={<div>Danh sách cơ sở</div>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

const nameInput = () => screen.getByLabelText(/^Tên cơ sở lưu trú/);
const waitForTitle = (name = 'Sea Breeze Homestay') => screen.findByRole('heading', { level: 1, name });
const stepButton = (label) => screen.getByRole('button', { name: new RegExp(`^${label}`) });

describe('EditHotelPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFilterOptions.mockResolvedValue(FILTER_OPTIONS);
  });

  it('EDIT-01: shows the Figma 13.5 screen for NOT_OWNER', async () => {
    getHostListingDetail.mockRejectedValue(
      new ApiError({ status: 403, code: 'NOT_OWNER', message: 'Bạn không có quyền thao tác trên cơ sở lưu trú này.' }),
    );
    renderEdit();

    expect(await screen.findByText('Bạn không có quyền truy cập')).toBeInTheDocument();
    expect(screen.getByText('Bạn không có quyền chỉnh sửa cơ sở lưu trú này.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về danh sách cơ sở' })).toHaveAttribute('href', '/host/dashboard');
  });

  it('EDIT-02: shows not-found for 404 and for a non-numeric id', async () => {
    getHostListingDetail.mockRejectedValue(new ApiError({ status: 404, code: 'LISTING_NOT_FOUND', message: 'Không tìm thấy cơ sở lưu trú.' }));
    const { unmount } = renderEdit();
    expect(await screen.findByRole('heading', { name: 'Không tìm thấy cơ sở lưu trú.' })).toBeInTheDocument();
    unmount();

    vi.clearAllMocks();
    renderEdit({ id: 'abc' });
    expect(screen.getByRole('heading', { name: 'Không tìm thấy cơ sở lưu trú.' })).toBeInTheDocument();
    expect(getHostListingDetail).not.toHaveBeenCalled();
  });

  it('EDIT-03: APPROVED loads values, shows the last update and keeps save disabled until a change', async () => {
    getHostListingDetail.mockResolvedValue(listing());
    renderEdit();
    await waitForTitle();

    expect(nameInput()).toHaveValue('Sea Breeze Homestay');
    expect(screen.getByLabelText('Số điện thoại')).toHaveValue('0905123456');
    expect(screen.getByText(`Cập nhật lần cuối: ${formatDate('2026-09-24T08:00:00Z')}`)).toBeInTheDocument();
    expect(screen.getByText('Lưu thay đổi sẽ đưa cơ sở về trạng thái Chờ duyệt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
    expect(screen.getByText('Cơ sở lưu trú').closest('nav')).toHaveTextContent('Cơ sở lưu trú / Cập nhật');
    ['Giá & tiện ích', 'Hình ảnh & video', 'Bản đồ'].forEach((label) => expect(stepButton(label)).toHaveTextContent('Đã xong'));
  });

  it('EDIT-04: APPROVED save asks for confirmation, then reloads into read-only', async () => {
    getHostListingDetail
      .mockResolvedValueOnce(listing())
      .mockResolvedValueOnce(listing({ tenCSLT: 'Sea Breeze Homestay & Spa', trangThai: 'PENDING', allowedActions: ['PREVIEW'] }));
    updateHostListing.mockResolvedValue({
      maCSLT: 12,
      trangThai: 'PENDING',
      trangThaiTruoc: 'APPROVED',
      thayDoiTrangThai: true,
      message: 'Đã lưu. Cơ sở chuyển sang Chờ duyệt.',
    });
    renderEdit();
    await waitForTitle();

    fireEvent.change(nameInput(), { target: { value: 'Sea Breeze Homestay & Spa' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    let dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText('Lưu thay đổi cho cơ sở đã duyệt?')).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        'Nếu bạn lưu, cơ sở này sẽ chuyển về trạng thái Chờ duyệt và cần Quản trị viên duyệt lại trước khi hiển thị thông tin mới.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Quay lại' }));
    expect(updateHostListing).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Vẫn lưu' }));

    await waitFor(() =>
      expect(updateHostListing).toHaveBeenCalledWith(12, expect.objectContaining({ tenCSLT: 'Sea Breeze Homestay & Spa' })),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Đã lưu. Cơ sở chuyển sang Chờ duyệt.');
    expect(await screen.findByText('Cơ sở đang chờ duyệt')).toBeInTheDocument();
    expect(getHostListingDetail).toHaveBeenCalledTimes(2);
    expect(screen.queryByLabelText(/^Tên cơ sở lưu trú/)).not.toBeInTheDocument();
  });

  it('EDIT-05: APPROVED media change asks first; cancelling uploads nothing', async () => {
    getHostListingDetail.mockResolvedValue(listing());
    renderEdit();
    await waitForTitle();

    fireEvent.click(stepButton('Hình ảnh & video'));
    fireEvent.change(screen.getByLabelText('Chọn ảnh từ máy'), {
      target: { files: [new File(['x'], 'moi.jpg', { type: 'image/jpeg' })] },
    });

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Thay đổi ảnh/video của cơ sở đã duyệt?')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Quay lại' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(uploadListingMedia).not.toHaveBeenCalled();
    expect(screen.queryByText('moi.jpg')).not.toBeInTheDocument();
  });

  it('EDIT-06: PENDING is read-only with the Figma 13.3 banner', async () => {
    getHostListingDetail.mockResolvedValue(
      listing({ trangThai: 'PENDING', ngayGuiDuyet: '2026-09-25T08:00:00Z', allowedActions: ['PREVIEW'] }),
    );
    renderEdit();
    await waitForTitle();

    expect(screen.getByText('Cơ sở đang chờ duyệt')).toBeInTheDocument();
    expect(
      screen.getByText('Bạn chưa thể chỉnh sửa cho đến khi Quản trị viên duyệt hoặc từ chối. Kết quả sẽ được gửi qua email.'),
    ).toBeInTheDocument();
    expect(screen.getByText(`Gửi kiểm duyệt ngày ${formatDate('2026-09-25T08:00:00Z')}`)).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    expect(screen.getByText('Zalo').nextElementSibling).toHaveTextContent('—');
    expect(screen.queryByRole('button', { name: /Lưu/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gửi kiểm duyệt/ })).not.toBeInTheDocument();
  });

  it('EDIT-07: PENDING with WITHDRAW can be pulled back to draft', async () => {
    getHostListingDetail
      .mockResolvedValueOnce(listing({ trangThai: 'PENDING', allowedActions: ['PREVIEW', 'WITHDRAW'] }))
      .mockResolvedValueOnce(listing({ trangThai: 'DRAFT', allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'] }));
    withdrawListing.mockResolvedValue({ maCSLT: 12, trangThai: 'DRAFT' });
    renderEdit();
    await waitForTitle();

    fireEvent.click(screen.getByRole('button', { name: 'Rút lại yêu cầu' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Rút lại' }));

    await waitFor(() => expect(withdrawListing).toHaveBeenCalledWith(12));
    expect(await screen.findByLabelText(/^Tên cơ sở lưu trú/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gửi kiểm duyệt' })).toBeEnabled();
  });

  it('EDIT-08: REJECTED shows the reason and can be resubmitted', async () => {
    getHostListingDetail
      .mockResolvedValueOnce(
        listing({
          tenCSLT: 'Trần Phú Central Hotel',
          trangThai: 'REJECTED',
          ngayCapNhat: '2026-09-20T08:00:00Z',
          lyDoTuChoi: 'Ảnh bìa không đúng với cơ sở.',
          allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'],
        }),
      )
      .mockResolvedValueOnce(listing({ tenCSLT: 'Trần Phú Central Hotel', trangThai: 'PENDING', allowedActions: ['PREVIEW'] }));
    submitListingForReview.mockResolvedValue({ maCSLT: 12, trangThai: 'PENDING' });
    renderEdit();
    await waitForTitle('Trần Phú Central Hotel');

    expect(screen.getByText('Quản trị viên đã từ chối cơ sở này')).toBeInTheDocument();
    expect(screen.getByText('Lý do: Ảnh bìa không đúng với cơ sở.')).toBeInTheDocument();
    expect(screen.getByText(`Từ chối ngày ${formatDate('2026-09-20T08:00:00Z')}`)).toBeInTheDocument();
    expect(screen.getByText('Sau khi gửi lại, cơ sở chuyển sang Chờ duyệt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Gửi kiểm duyệt lại' }));

    await waitFor(() => expect(submitListingForReview).toHaveBeenCalledWith(12));
    expect(updateHostListing).not.toHaveBeenCalled();
    expect(await screen.findByRole('status')).toHaveTextContent('Đã gửi kiểm duyệt');
    expect(await screen.findByText('Cơ sở đang chờ duyệt')).toBeInTheDocument();
  });

  it('EDIT-09: HIDDEN shows the violation reason', async () => {
    getHostListingDetail.mockResolvedValue(
      listing({ trangThai: 'HIDDEN', lyDoViPham: 'Thông tin giá không đúng thực tế.', allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT'] }),
    );
    renderEdit();
    await waitForTitle();

    expect(screen.getByText('Quản trị viên đã ẩn cơ sở này')).toBeInTheDocument();
    expect(screen.getByText('Lý do: Thông tin giá không đúng thực tế.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gửi kiểm duyệt lại' })).toBeEnabled();
  });

  it('EDIT-10: LISTING_LOCKED_PENDING on save shows a banner and reloads', async () => {
    getHostListingDetail.mockResolvedValue(listing({ trangThai: 'DRAFT', allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'] }));
    updateHostListing.mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'LISTING_LOCKED_PENDING',
        message: 'Cơ sở đang chờ duyệt nên không thể chỉnh sửa. Hãy rút lại yêu cầu duyệt trước.',
      }),
    );
    renderEdit();
    await waitForTitle();

    fireEvent.change(nameInput(), { target: { value: 'Tên mới' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu nháp' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cơ sở đang chờ duyệt nên không thể chỉnh sửa. Hãy rút lại yêu cầu duyệt trước.',
    );
    await waitFor(() => expect(getHostListingDetail).toHaveBeenCalledTimes(2));
  });

  it('EDIT-11: LISTING_REMOVED on save switches to read-only', async () => {
    getHostListingDetail.mockResolvedValue(
      listing({ trangThai: 'REJECTED', lyDoTuChoi: 'Sai địa chỉ.', allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'] }),
    );
    updateHostListing.mockRejectedValue(new ApiError({ status: 409, code: 'LISTING_REMOVED', message: 'Cơ sở đã bị gỡ khỏi hệ thống.' }));
    renderEdit();
    await waitForTitle();

    fireEvent.change(nameInput(), { target: { value: 'Tên mới' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cơ sở đã bị gỡ khỏi hệ thống.');
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /Gửi kiểm duyệt/ })).not.toBeInTheDocument();
  });

  it('EDIT-12: shows a toast handed over by navigation once and clears it', async () => {
    getHostListingDetail.mockResolvedValue(listing({ trangThai: 'PENDING', allowedActions: ['PREVIEW'] }));
    renderEdit({
      state: {
        toast: {
          type: 'success',
          title: 'Đã gửi kiểm duyệt',
          message: 'Cơ sở chuyển sang Chờ duyệt. Kết quả sẽ được gửi qua email.',
        },
      },
    });

    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent('Đã gửi kiểm duyệt');
    expect(toast).toHaveTextContent('Cơ sở chuyển sang Chờ duyệt. Kết quả sẽ được gửi qua email.');
    await waitFor(() => expect(screen.getByTestId('location-state')).toHaveTextContent('null'));
  });
});
