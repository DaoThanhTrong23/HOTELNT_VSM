import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { ErrorState, ErrorModal } from '../ErrorState';
import { SuccessState, SuccessModal } from '../SuccessState';

describe('State Components (EmptyState, ErrorState, SuccessState)', () => {
  describe('EmptyState', () => {
    it('renders default empty state for search results with reset filter action', () => {
      const handleAction = vi.fn();
      render(<EmptyState onAction={handleAction} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Không tìm thấy cơ sở phù hợp')).toBeInTheDocument();
      expect(screen.getByText(/Không tìm thấy cơ sở phù hợp với các tiêu chí bạn đã chọn/)).toBeInTheDocument();

      const btn = screen.getByRole('button', { name: 'Xóa bớt bộ lọc' });
      fireEvent.click(btn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders modal variant and handles close callback', () => {
      const handleClose = vi.fn();
      render(
        <EmptyState
          isModal={true}
          isOpen={true}
          onClose={handleClose}
          title="Không có kết quả"
          message="Vui lòng thử lại"
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Không có kết quả')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: 'Đóng' });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ErrorState', () => {
    it('renders inline error state with retry action', () => {
      const handleRetry = vi.fn();
      render(<ErrorState title="Lỗi kết nối" message="Không thể tải dữ liệu." onAction={handleRetry} />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Lỗi kết nối')).toBeInTheDocument();
      expect(screen.getByText('Không thể tải dữ liệu.')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: 'Thử lại' });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders ErrorModal popup and handles close callback', () => {
      const handleClose = vi.fn();
      render(
        <ErrorModal
          isOpen={true}
          title="Thao tác ngoài phạm vi"
          message="Tọa độ đã chọn nằm ngoài khu vực hỗ trợ TP. Nha Trang."
          onClose={handleClose}
        />,
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Thao tác ngoài phạm vi')).toBeInTheDocument();
      expect(screen.getByText('Tọa độ đã chọn nằm ngoài khu vực hỗ trợ TP. Nha Trang.')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: 'Đóng' });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('SuccessState', () => {
    it('renders inline success state with action', () => {
      const handleAction = vi.fn();
      render(<SuccessState title="Thành công" message="Đã lưu dữ liệu." onAction={handleAction} />);

      expect(screen.getByTestId('success-state')).toBeInTheDocument();
      expect(screen.getByText('Thành công')).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: 'Tiếp tục' });
      fireEvent.click(actionBtn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders SuccessModal popup', () => {
      const handleClose = vi.fn();
      render(
        <SuccessModal
          isOpen={true}
          title="Gửi duyệt thành công!"
          message="Cơ sở đã được chuyển sang Chờ duyệt."
          onClose={handleClose}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Gửi duyệt thành công!')).toBeInTheDocument();
      expect(screen.getByText('Cơ sở đã được chuyển sang Chờ duyệt.')).toBeInTheDocument();
    });
  });
});
