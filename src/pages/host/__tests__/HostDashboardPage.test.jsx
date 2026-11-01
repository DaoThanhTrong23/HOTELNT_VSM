import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HostDashboardPage } from '../HostDashboardPage';
import { ApiError, deleteHostListing, getHostListings, withdrawListing } from '../api/hostApi';
import { formatCurrency, formatDate } from '../../../utils/formatters';

vi.mock('../api/hostApi', async (importOriginal) => ({
  ...(await importOriginal()),
  getHostListings: vi.fn(),
  deleteHostListing: vi.fn(),
  withdrawListing: vi.fn(),
}));

const STATUSES = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'];

const listing = (overrides = {}) => ({
  maCSLT: 1,
  tenCSLT: 'Sea Breeze Homestay',
  tenLoai: 'Homestay',
  tenPhuong: 'Nam Nha Trang',
  gia: 350000,
  duongDanAnh: 'https://cdn.hotelnt.test/1.jpg',
  trangThai: 'APPROVED',
  lyDoTuChoi: null,
  lyDoViPham: null,
  ngayTao: '2026-09-12T08:00:00Z',
  ngayCapNhat: '2026-09-24T08:00:00Z',
  allowedActions: ['PREVIEW', 'EDIT'],
  ...overrides,
});

const ITEMS = [
  listing({ maCSLT: 11, tenCSLT: 'Sea Breeze Homestay', trangThai: 'APPROVED', allowedActions: ['PREVIEW', 'EDIT'] }),
  listing({ maCSLT: 13, tenCSLT: 'Hòn Chồng Boutique Hotel', tenLoai: 'Khách sạn', trangThai: 'PENDING', allowedActions: ['PREVIEW'] }),
  listing({ maCSLT: 12, tenCSLT: 'Nhà Biển Xanh', trangThai: 'DRAFT', gia: null, allowedActions: ['EDIT', 'SUBMIT', 'DELETE', 'PREVIEW'] }),
  listing({ maCSLT: 14, tenCSLT: 'Trần Phú Central Hotel', trangThai: 'REJECTED', allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT', 'DELETE'] }),
  listing({ maCSLT: 16, tenCSLT: 'Mây Homestay', trangThai: 'HIDDEN', allowedActions: ['PREVIEW', 'EDIT', 'SUBMIT'] }),
];

const COUNTS = { DRAFT: 1, PENDING: 2, APPROVED: 2, REJECTED: 1, HIDDEN: 1 };

const page = (items, { totalItems = items.length, currentPage = 1, limit = 10 } = {}) => ({
  items,
  pagination: { totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)), currentPage, limit },
});

// Count calls use limit: 1, everything else is a list call.
const mockListings = ({ list = () => page(ITEMS), counts = COUNTS } = {}) => {
  getHostListings.mockImplementation((params) => {
    if (params.limit === 1) {
      const value = counts[params.trangThai];
      if (value instanceof Error) return Promise.reject(value);
      return Promise.resolve(page([], { totalItems: value ?? 0, limit: 1 }));
    }
    return Promise.resolve(list(params));
  });
};

const listCalls = () => getHostListings.mock.calls.filter(([params]) => params.limit !== 1).map(([params]) => params);
const countCalls = () => getHostListings.mock.calls.filter(([params]) => params.limit === 1).map(([params]) => params);

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const renderPage = (url = '/host/dashboard') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/host/dashboard" element={<HostDashboardPage />} />
        <Route path="/host/hotels/new" element={<div>Trang thêm mới</div>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

// Matches an element whose whole text (including child spans) equals the expected string.
const byFullText = (expected) => (_, element) =>
  element?.textContent === expected && Array.from(element.children).every((child) => child.textContent !== expected);

const desktop = () => screen.getByTestId('desktop-data-table');
const desktopRow = (name) => within(desktop()).getByText(name).closest('tr');
const waitForRows = () => screen.findAllByTestId('desktop-table-row');

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('HostDashboardPage: listing data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('DASH-01: loads page 1 and the 5 status counts on first visit', async () => {
    mockListings();
    renderPage();
    await waitForRows();

    expect(listCalls()).toEqual([{ trangThai: 'ALL', keyword: '', page: 1, limit: 10 }]);
    expect(countCalls()).toEqual(STATUSES.map((trangThai) => ({ trangThai, page: 1, limit: 1 })));
  });

  it('DASH-02: renders rows with API fields on desktop and mobile', async () => {
    mockListings();
    renderPage();
    const rows = await waitForRows();

    expect(rows).toHaveLength(ITEMS.length);
    expect(screen.getAllByTestId('mobile-hotel-card')).toHaveLength(ITEMS.length);
    const row = desktopRow('Sea Breeze Homestay');
    expect(within(row).getByText('Homestay')).toBeInTheDocument();
    expect(within(row).getByText(formatCurrency(350000).replace(/\s+/g, ' '))).toBeInTheDocument();
    expect(within(row).getByText(formatDate('2026-09-12T08:00:00Z'))).toBeInTheDocument();
    expect(within(row).getByText('Đã duyệt')).toBeInTheDocument();
    expect(within(row).getByRole('img', { name: 'Sea Breeze Homestay' })).toHaveAttribute('loading', 'lazy');
  });

  it('DASH-03: handles missing price, image and ward', async () => {
    mockListings({ list: () => page([listing({ maCSLT: 5, tenCSLT: 'Nhà Trống', gia: null, duongDanAnh: null, tenPhuong: undefined })]) });
    renderPage();
    await waitForRows();

    const row = desktopRow('Nhà Trống');
    expect(within(row).getByText('Chưa nhập giá')).toBeInTheDocument();
    expect(within(row).getByTestId('thumbnail-placeholder')).toBeInTheDocument();
    expect(within(row).getByText('—')).toBeInTheDocument();
  });

  it('DASH-04: shows tab counts from totalItems and "—" when a count fails', async () => {
    mockListings({ counts: { ...COUNTS, HIDDEN: new ApiError({ code: 'INTERNAL_ERROR' }) } });
    renderPage();
    await waitForRows();

    await waitFor(() => expect(screen.getByTestId('filter-chip-PENDING')).toHaveTextContent('Chờ duyệt2'));
    expect(screen.getByTestId('filter-chip-DRAFT')).toHaveTextContent('Bản nháp1');
    expect(screen.getByTestId('filter-chip-HIDDEN')).toHaveTextContent('Ẩn—');
    expect(screen.getByTestId('filter-chip-ALL')).toHaveTextContent('Tất cả—');
    expect(screen.queryByTestId('stat-total-count')).not.toBeInTheDocument();
  });

  it('DASH-04b: "Tất cả" is the sum of the 5 statuses', async () => {
    mockListings();
    renderPage();
    await waitFor(() => expect(screen.getByTestId('filter-chip-ALL')).toHaveTextContent('Tất cả7'));
  });

  it('DASH-05: clicking a tab filters on the server and updates the URL', async () => {
    mockListings();
    renderPage();
    await waitForRows();

    fireEvent.click(screen.getByTestId('filter-chip-PENDING'));

    await waitFor(() => expect(listCalls().at(-1)).toEqual({ trangThai: 'PENDING', keyword: '', page: 1, limit: 10 }));
    expect(screen.getByTestId('location')).toHaveTextContent('trangThai=PENDING');
    expect(screen.getByTestId('filter-chip-PENDING')).toHaveAttribute('aria-pressed', 'true');
  });

  it('DASH-06: debounces the keyword search', async () => {
    mockListings();
    renderPage();
    await waitForRows();
    const search = screen.getByPlaceholderText('Tìm theo tên cơ sở');

    fireEvent.change(search, { target: { value: 's' } });
    fireEvent.change(search, { target: { value: 'se' } });
    fireEvent.change(search, { target: { value: '  sea ' } });
    expect(listCalls()).toHaveLength(1);

    await waitFor(() => expect(listCalls()).toHaveLength(2), { timeout: 1500 });
    expect(listCalls()[1]).toEqual({ trangThai: 'ALL', keyword: 'sea', page: 1, limit: 10 });
    expect(search).toHaveAttribute('maxLength', '100');
  });

  it('DASH-07: reads status, page and keyword from the URL', async () => {
    mockListings({ list: () => page(ITEMS.slice(0, 2), { totalItems: 12, currentPage: 2 }) });
    renderPage('/host/dashboard?trangThai=REJECTED&page=2&keyword=sea');
    await waitForRows();

    expect(listCalls()[0]).toEqual({ trangThai: 'REJECTED', keyword: 'sea', page: 2, limit: 10 });
    expect(screen.getByTestId('filter-chip-REJECTED')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByPlaceholderText('Tìm theo tên cơ sở')).toHaveValue('sea');
  });

  it('DASH-08: falls back to ALL and page 1 for invalid URL values', async () => {
    mockListings();
    renderPage('/host/dashboard?trangThai=XYZ&page=-3');
    await waitForRows();

    expect(listCalls()[0]).toEqual({ trangThai: 'ALL', keyword: '', page: 1, limit: 10 });
  });

  it('DASH-09: paginates with the API pagination', async () => {
    const tenItems = Array.from({ length: 10 }, (_, i) => listing({ maCSLT: 100 + i, tenCSLT: `Cơ sở ${i}` }));
    mockListings({
      list: (params) =>
        params.page === 3
          ? page(tenItems.slice(0, 5), { totalItems: 25, currentPage: 3 })
          : page(tenItems, { totalItems: 25, currentPage: params.page }),
    });
    renderPage('/host/dashboard?page=2');
    await waitForRows();

    expect(screen.getByText('Hiển thị 11–20 trên 25 cơ sở · 10 dòng mỗi trang')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 2' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    await waitFor(() => expect(listCalls().at(-1)).toMatchObject({ page: 3 }));
    expect(await screen.findByText('Hiển thị 21–25 trên 25 cơ sở · 10 dòng mỗi trang')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
  });

  it('DASH-10: shows the Figma 11.2 empty state when the host has no listing', async () => {
    mockListings({ list: () => page([]), counts: { DRAFT: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, HIDDEN: 0 } });
    renderPage();

    expect(await screen.findByText('Bạn chưa có cơ sở lưu trú nào')).toBeInTheDocument();
    expect(screen.getByText('Thêm cơ sở đầu tiên để khách du lịch tìm thấy bạn trên bản đồ.')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-cta-button')).toHaveAttribute('href', '/host/hotels/new');
    expect(screen.queryByTestId('filter-chip-ALL')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Tìm theo tên cơ sở')).not.toBeInTheDocument();
  });

  it('DASH-11: shows a filtered empty state and clears the filters', async () => {
    mockListings({ list: (params) => (params.trangThai === 'HIDDEN' ? page([]) : page(ITEMS)) });
    renderPage('/host/dashboard?trangThai=HIDDEN&keyword=xyz');

    expect(await screen.findByText('Không tìm thấy cơ sở phù hợp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }));

    await waitFor(() => expect(listCalls().at(-1)).toEqual({ trangThai: 'ALL', keyword: '', page: 1, limit: 10 }));
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/host\/dashboard$/);
    expect(screen.getByPlaceholderText('Tìm theo tên cơ sở')).toHaveValue('');
  });

  it('DASH-11b: offers to go back to page 1 when the page is past the end', async () => {
    mockListings({ list: (params) => (params.page === 99 ? page([], { totalItems: 7, currentPage: 99 }) : page(ITEMS)) });
    renderPage('/host/dashboard?page=99');

    expect(await screen.findByText('Trang này không còn dữ liệu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Về trang đầu' }));
    await waitFor(() => expect(listCalls().at(-1)).toMatchObject({ page: 1 }));
  });

  it('DASH-12: shows ErrorState on 500 and reloads on retry', async () => {
    let fail = true;
    getHostListings.mockImplementation((params) => {
      if (params.limit === 1) return Promise.resolve(page([], { totalItems: 1, limit: 1 }));
      if (fail) return Promise.reject(new ApiError({ status: 500, code: 'INTERNAL_ERROR' }));
      return Promise.resolve(page(ITEMS));
    });
    renderPage();

    expect(await screen.findByText('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.')).toBeInTheDocument();
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await waitForRows()).toHaveLength(ITEMS.length);
  });

  it('DASH-13: shows the API message for ACCOUNT_LOCKED', async () => {
    getHostListings.mockRejectedValue(
      new ApiError({ status: 403, code: 'ACCOUNT_LOCKED', message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' }),
    );
    renderPage();

    expect(await screen.findByText('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.')).toBeInTheDocument();
  });

  it('DASH-14: ignores a stale response after a quick tab switch', async () => {
    const first = deferred();
    getHostListings.mockImplementation((params, options) => {
      if (params.limit === 1) return Promise.resolve(page([], { totalItems: 0, limit: 1 }));
      if (params.trangThai === 'ALL') return first.promise;
      expect(options.signal).toBeInstanceOf(AbortSignal);
      return Promise.resolve(page([listing({ maCSLT: 13, tenCSLT: 'Chỉ chờ duyệt', trangThai: 'PENDING', allowedActions: ['PREVIEW'] })]));
    });
    renderPage();

    fireEvent.click(screen.getByTestId('filter-chip-PENDING'));
    expect(await screen.findAllByText('Chỉ chờ duyệt')).not.toHaveLength(0);

    await act(async () => {
      first.resolve(page(ITEMS));
    });
    expect(screen.queryByText('Sea Breeze Homestay')).not.toBeInTheDocument();
    const firstListCall = getHostListings.mock.calls.find(([params]) => params.limit !== 1 && params.trangThai === 'ALL');
    expect(firstListCall[1].signal.aborted).toBe(true);
  });
});

describe('HostDashboardPage: row actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete window.matchMedia;
  });

  const actionLabels = (name) =>
    Array.from(within(desktopRow(name)).getByTestId(/^actions-/).querySelectorAll('a, button')).map((el) => el.textContent);

  it('ACT-01: shows Figma labels per status and never "Gửi duyệt"', async () => {
    mockListings();
    renderPage();
    await waitForRows();

    expect(actionLabels('Sea Breeze Homestay')).toEqual(['Xem', 'Sửa']);
    expect(actionLabels('Hòn Chồng Boutique Hotel')).toEqual(['Xem']);
    expect(actionLabels('Nhà Biển Xanh')).toEqual(['Sửa', 'Xóa']);
    expect(actionLabels('Trần Phú Central Hotel')).toEqual(['Xem & sửa', 'Xóa']);
    expect(actionLabels('Mây Homestay')).toEqual(['Sửa & gửi lại']);
    expect(screen.queryByText('Gửi duyệt')).not.toBeInTheDocument();
  });

  it('ACT-02: links to the public page for APPROVED and to the edit page otherwise', async () => {
    mockListings();
    renderPage();
    await waitForRows();

    const approved = within(desktopRow('Sea Breeze Homestay'));
    expect(approved.getByRole('link', { name: 'Xem' })).toHaveAttribute('href', '/hotel/11');
    expect(approved.getByRole('link', { name: 'Sửa' })).toHaveAttribute('href', '/host/hotels/11/edit');
    expect(within(desktopRow('Hòn Chồng Boutique Hotel')).getByRole('link', { name: 'Xem' })).toHaveAttribute('href', '/host/hotels/13/edit');
    expect(within(desktopRow('Trần Phú Central Hotel')).getByRole('link', { name: 'Xem & sửa' })).toHaveAttribute('href', '/host/hotels/14/edit');
    expect(within(desktopRow('Mây Homestay')).getByRole('link', { name: 'Sửa & gửi lại' })).toHaveAttribute('href', '/host/hotels/16/edit');
  });

  it('ACT-03: falls back by status when allowedActions is missing and ignores unknown values', async () => {
    mockListings({
      list: () =>
        page([
          listing({ maCSLT: 21, tenCSLT: 'Không có quyền', trangThai: 'PENDING', allowedActions: undefined }),
          listing({ maCSLT: 22, tenCSLT: 'Quyền lạ', trangThai: 'DRAFT', allowedActions: ['EDIT', 'FLY'] }),
        ]),
    });
    renderPage();
    await waitForRows();

    expect(actionLabels('Không có quyền')).toEqual(['Xem', 'Rút lại']);
    expect(actionLabels('Quyền lạ')).toEqual(['Sửa']);
  });

  it('ACT-04: withdraws a pending listing after confirmation', async () => {
    mockListings({ list: () => page([listing({ maCSLT: 13, tenCSLT: 'Hòn Chồng', trangThai: 'PENDING', allowedActions: ['PREVIEW', 'WITHDRAW'] })]) });
    withdrawListing.mockResolvedValue({ maCSLT: 13, trangThai: 'DRAFT' });
    renderPage();
    await waitForRows();
    const callsBefore = listCalls().length;

    fireEvent.click(within(desktopRow('Hòn Chồng')).getByRole('button', { name: 'Rút lại' }));
    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText('Rút lại yêu cầu kiểm duyệt?')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Rút lại' }));

    await waitFor(() => expect(withdrawListing).toHaveBeenCalledWith(13));
    expect(await screen.findByRole('status')).toHaveTextContent('Đã rút lại yêu cầu kiểm duyệt');
    await waitFor(() => expect(listCalls().length).toBe(callsBefore + 1));
  });

  it('ACT-05: reports a 409 on withdraw and reloads', async () => {
    mockListings({ list: () => page([listing({ maCSLT: 13, tenCSLT: 'Hòn Chồng', trangThai: 'PENDING', allowedActions: ['PREVIEW', 'WITHDRAW'] })]) });
    withdrawListing.mockRejectedValue(
      new ApiError({ status: 409, code: 'INVALID_STATE_TRANSITION', message: 'Trạng thái hiện tại của cơ sở không cho phép thao tác này.' }),
    );
    renderPage();
    await waitForRows();
    const callsBefore = listCalls().length;

    fireEvent.click(within(desktopRow('Hòn Chồng')).getByRole('button', { name: 'Rút lại' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Rút lại' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Trạng thái hiện tại của cơ sở không cho phép thao tác này.');
    await waitFor(() => expect(listCalls().length).toBe(callsBefore + 1));
  });

  it('ACT-06: deletes one listing after confirmation', async () => {
    mockListings();
    deleteHostListing.mockResolvedValue({ message: 'Xóa cơ sở thành công' });
    renderPage();
    await waitForRows();
    const callsBefore = listCalls().length;

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('button', { name: 'Xóa' }));
    let dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText('Xóa “Nhà Biển Xanh”?')).toBeInTheDocument();
    expect(within(dialog).getByText('Bản nháp này cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này.')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(deleteHostListing).not.toHaveBeenCalled();

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('button', { name: 'Xóa' }));
    dialog = screen.getByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xóa cơ sở' }));

    await waitFor(() => expect(deleteHostListing).toHaveBeenCalledWith(12));
    expect(await screen.findByRole('status')).toHaveTextContent('Xóa cơ sở thành công');
    await waitFor(() => expect(listCalls().length).toBe(callsBefore + 1));
  });

  it('ACT-07: goes back one page after deleting the last row of page 2', async () => {
    mockListings({
      list: (params) =>
        params.page === 2
          ? page([listing({ maCSLT: 12, tenCSLT: 'Nhà Biển Xanh', trangThai: 'DRAFT', allowedActions: ['EDIT', 'DELETE'] })], { totalItems: 11, currentPage: 2 })
          : page(ITEMS, { totalItems: 10 }),
    });
    deleteHostListing.mockResolvedValue({ message: 'Xóa cơ sở thành công' });
    renderPage('/host/dashboard?page=2');
    await waitForRows();

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('button', { name: 'Xóa' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa cơ sở' }));

    await waitFor(() => expect(listCalls().at(-1)).toMatchObject({ page: 1 }));
  });

  it('ACT-08: shows LISTING_NOT_DELETABLE as an error toast', async () => {
    mockListings();
    deleteHostListing.mockRejectedValue(
      new ApiError({ status: 409, code: 'LISTING_NOT_DELETABLE', message: 'Không thể xóa cơ sở ở trạng thái hiện tại.' }),
    );
    renderPage();
    await waitForRows();

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('button', { name: 'Xóa' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa cơ sở' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể xóa cơ sở ở trạng thái hiện tại.');
  });

  it('ACT-09: shows the bulk bar with an indeterminate header checkbox', async () => {
    mockListings();
    renderPage();
    await waitForRows();

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('checkbox'));
    fireEvent.click(within(desktopRow('Sea Breeze Homestay')).getByRole('checkbox'));

    expect(screen.getByText(byFullText('Đã chọn 2 cơ sở · chỉ xóa được Bản nháp và Bị từ chối'))).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Chọn tất cả cơ sở trên trang' }).indeterminate).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ chọn' }));
    expect(screen.queryByText(/Đã chọn/)).not.toBeInTheDocument();
  });

  it('ACT-10: bulk delete only targets deletable rows', async () => {
    mockListings();
    deleteHostListing.mockResolvedValue({ message: 'Xóa cơ sở thành công' });
    renderPage();
    await waitForRows();

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('checkbox'));
    fireEvent.click(within(desktopRow('Sea Breeze Homestay')).getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Xóa 1 cơ sở' }));

    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText('Xóa 1 cơ sở?')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xóa 1 cơ sở' }));

    await waitFor(() => expect(deleteHostListing).toHaveBeenCalledTimes(1));
    expect(deleteHostListing).toHaveBeenCalledWith(12);
    expect(await screen.findByRole('status')).toHaveTextContent('Đã xóa 1 cơ sở');
  });

  it('ACT-11: bulk delete runs sequentially and reports partial failures', async () => {
    mockListings();
    const firstDelete = deferred();
    deleteHostListing
      .mockImplementationOnce(() => firstDelete.promise)
      .mockImplementationOnce(() =>
        Promise.reject(new ApiError({ status: 409, code: 'LISTING_NOT_DELETABLE', message: 'Không thể xóa cơ sở ở trạng thái hiện tại.' })),
      );
    renderPage();
    await waitForRows();

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('checkbox'));
    fireEvent.click(within(desktopRow('Trần Phú Central Hotel')).getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Xóa 2 cơ sở' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa 2 cơ sở' }));

    await waitFor(() => expect(deleteHostListing).toHaveBeenCalledTimes(1));
    expect(deleteHostListing).toHaveBeenLastCalledWith(12);
    await act(async () => {
      firstDelete.resolve({ message: 'Xóa cơ sở thành công' });
    });
    await waitFor(() => expect(deleteHostListing).toHaveBeenCalledTimes(2));
    expect(deleteHostListing).toHaveBeenLastCalledWith(14);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Đã xóa 1/2 cơ sở. 1 cơ sở không xóa được: Trần Phú Central Hotel');
  });

  it('ACT-12: confirming twice calls the API once', async () => {
    mockListings();
    deleteHostListing.mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitForRows();

    fireEvent.click(within(desktopRow('Nhà Biển Xanh')).getByRole('button', { name: 'Xóa' }));
    const confirm = within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa cơ sở' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    expect(deleteHostListing).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveTextContent('Đang xử lý...');
    expect(confirm).toBeDisabled();
  });

  it('ACT-13: uses a bottom sheet on mobile, closes on Escape and restores focus', async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    mockListings();
    renderPage();
    await waitForRows();

    const opener = within(desktopRow('Nhà Biển Xanh')).getByRole('button', { name: 'Xóa' });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('data-layout', 'sheet');
    expect(within(dialog).getByText('Bản nháp cùng toàn bộ ảnh, video đã tải lên sẽ bị xóa vĩnh viễn. Không thể hoàn tác.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Hủy' })).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
