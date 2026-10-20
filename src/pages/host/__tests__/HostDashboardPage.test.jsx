import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HostDashboardPage } from '../HostDashboardPage';

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <HostDashboardPage {...props} />
    </BrowserRouter>
  );
};

describe('HostDashboardPage (TDD Suite: DASH-01 -> DASH-10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // DASH-01: Render 4 stats cards with correct numbers (7, 2, 2, 1) and Dev Kit colors
  it('DASH-01: renders 4 overview stat cards with correct metrics and tokens', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByText('Tổng số cơ sở')).toBeInTheDocument();
      expect(screen.getAllByText('Đang hiển thị')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Chờ duyệt')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Bị từ chối')[0]).toBeInTheDocument();
    });

    // Check count values in the cards: Total 7, Approved 2, Pending 2, Rejected 1
    const totalCount = screen.getByTestId('stat-total-count');
    const approvedCount = screen.getByTestId('stat-approved-count');
    const pendingCount = screen.getByTestId('stat-pending-count');
    const rejectedCount = screen.getByTestId('stat-rejected-count');

    expect(totalCount).toHaveTextContent('7');
    expect(approvedCount).toHaveTextContent('2');
    expect(pendingCount).toHaveTextContent('2');
    expect(rejectedCount).toHaveTextContent('1');
  });

  // DASH-02: Render Mobile Card View with cards, thumbnail, title, badge, action bar
  it('DASH-02: renders mobile card view with thumbnails, info and action bar', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      const mobileCards = screen.getAllByTestId('mobile-hotel-card');
      expect(mobileCards.length).toBe(7);
    });

    const mobileList = screen.getByTestId('mobile-hotel-list');
    expect(mobileList).toBeInTheDocument();
    expect(screen.getAllByText('Sea Breeze Homestay')[0]).toBeInTheDocument();
  });

  // DASH-03: Render Desktop Data Table with columns: Cơ sở lưu trú, Ngày tạo, Trạng thái, Thao tác
  it('DASH-03: renders desktop data table with full headers and rows', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('desktop-data-table')).toBeInTheDocument();
    });

    expect(screen.getByText('Cơ sở lưu trú')).toBeInTheDocument();
    expect(screen.getByText('Ngày tạo')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.getByText('Thao tác')).toBeInTheDocument();

    const tableRows = screen.getAllByTestId('desktop-table-row');
    expect(tableRows.length).toBe(7);
  });

  // DASH-04: Action buttons for DRAFT: Chỉnh sửa, Gửi duyệt, Xóa bài. No withdraw button
  it('DASH-04: provides correct dynamic action buttons for DRAFT status', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('actions-h-104')).toBeInTheDocument();
    });

    const draftActions = screen.getByTestId('actions-h-104');
    expect(draftActions.querySelector('[data-action="edit"]')).toBeInTheDocument();
    expect(draftActions.querySelector('[data-action="submit-moderation"]')).toBeInTheDocument();
    expect(draftActions.querySelector('[data-action="delete"]')).toBeInTheDocument();
    expect(draftActions.querySelector('[data-action="withdraw"]')).not.toBeInTheDocument();
  });

  // DASH-05: Action buttons for PENDING: Xem trước, Rút lại. No direct delete
  it('DASH-05: provides correct dynamic action buttons for PENDING status', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('actions-h-102')).toBeInTheDocument();
    });

    const pendingActions = screen.getByTestId('actions-h-102');
    expect(pendingActions.querySelector('[data-action="preview"]')).toBeInTheDocument();
    expect(pendingActions.querySelector('[data-action="withdraw"]')).toBeInTheDocument();
    expect(pendingActions.querySelector('[data-action="delete"]')).not.toBeInTheDocument();
  });

  // DASH-06: Warning modal when clicking Edit on APPROVED hotel (SRS FR-15)
  it('DASH-06: opens warning modal when clicking edit on an APPROVED hotel', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('actions-h-101')).toBeInTheDocument();
    });

    const approvedActions = screen.getByTestId('actions-h-101');
    const editBtn = approvedActions.querySelector('[data-action="edit"]');
    expect(editBtn).toBeInTheDocument();

    fireEvent.click(editBtn);

    // Warning modal pops up with FR-15 message
    expect(screen.getByTestId('approved-edit-warning-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/chuyển về trạng thái.*Chờ duyệt/i)
    ).toBeInTheDocument();
  });

  // DASH-07: Rejection reason modal when clicking view reason on REJECTED hotel
  it('DASH-07: opens rejection reason modal displaying exact admin feedback on REJECTED hotel', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('actions-h-103')).toBeInTheDocument();
    });

    const rejectedActions = screen.getByTestId('actions-h-103');
    const reasonBtn = rejectedActions.querySelector('[data-action="view-rejection-reason"]');
    expect(reasonBtn).toBeInTheDocument();

    fireEvent.click(reasonBtn);

    expect(screen.getByTestId('rejection-reason-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Ảnh giấy phép kinh doanh bị mờ/i)
    ).toBeInTheDocument();
  });

  // DASH-08: Filter by status tab (clicking "Chờ duyệt" shows 2 PENDING hotels)
  it('DASH-08: filters hotels when switching status chips', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('filter-chip-PENDING')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filter-chip-PENDING'));

    const tableRows = screen.getAllByTestId('desktop-table-row');
    expect(tableRows.length).toBe(2);
    expect(screen.getAllByText('Hòn Chồng Boutique Hotel')[0]).toBeInTheDocument();
  });

  // DASH-09: EmptyState displayed when list is empty, with Black CTA button
  it('DASH-09: renders EmptyState with black CTA button when hotel list is empty', async () => {
    renderComponent({ initialHotels: [], initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('host-empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('Bạn chưa có cơ sở lưu trú nào')).toBeInTheDocument();
    const ctaButton = screen.getByTestId('empty-state-cta-button');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveTextContent('Đăng ký cơ sở ngay');
    expect(ctaButton.className).toMatch(/bg-black/);
  });

  // DASH-10: Dev Kit black color check (primary button and empty state CTA have bg-black text-white)
  it('DASH-10: enforces Dev Kit black color (#000000) for primary CTA and headings', async () => {
    renderComponent({ initialLoading: false });

    await waitFor(() => {
      expect(screen.getByTestId('add-hotel-button')).toBeInTheDocument();
    });

    const addBtn = screen.getByTestId('add-hotel-button');
    expect(addBtn.className).toMatch(/bg-black/);
    expect(addBtn.className).toMatch(/text-white/);
    expect(addBtn.className).not.toMatch(/102A3A/);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title.className).toMatch(/text-black/);
  });
});
