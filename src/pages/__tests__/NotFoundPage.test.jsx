import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from '../NotFoundPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotFoundPage', () => {
  it('renders 404 heading, message, and navigation actions', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeInTheDocument();
    expect(screen.getByText(/Đường dẫn bạn đang truy cập không tồn tại/)).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Quay lại trang chủ/ });
    expect(homeLink).toHaveAttribute('href', '/');

    const backButton = screen.getByRole('button', { name: /Quay lại trang trước/ });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
