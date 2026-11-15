import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination Component', () => {
  it('returns null if total is 0 or missing or NaN', () => {
    const { container: c1 } = render(<Pagination total={0} pageSize={5} page={1} />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<Pagination total={undefined} pageSize={5} page={1} />);
    expect(c2.firstChild).toBeNull();

    const { container: c3 } = render(<Pagination total={NaN} pageSize={5} page={1} />);
    expect(c3.firstChild).toBeNull();
  });

  it('returns null if totalPages <= 1 (e.g. 5 items with pageSize 5)', () => {
    const { container } = render(<Pagination total={5} pageSize={5} page={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination buttons when total > pageSize (e.g. 8 items with pageSize 5 -> 2 pages)', () => {
    render(<Pagination total={8} pageSize={5} page={1} />);

    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang kế tiếp' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 2' })).toBeInTheDocument();
  });

  it('supports alias prop names: totalItems, currentPage, onChange', () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        totalItems={12}
        pageSize={5}
        currentPage={2}
        onChange={handleChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Trang 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 3' })).toBeInTheDocument();

    const page1Btn = screen.getByRole('button', { name: 'Trang 1' });
    fireEvent.click(page1Btn);
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('disables previous button on page 1 and disables next button on last page', () => {
    const handlePageChange = vi.fn();
    const { rerender } = render(
      <Pagination
        total={8}
        pageSize={5}
        page={1}
        onPageChange={handlePageChange}
      />
    );

    const prevBtn = screen.getByRole('button', { name: 'Trang trước' });
    const nextBtn = screen.getByRole('button', { name: 'Trang kế tiếp' });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    // Rerender on page 2 (last page)
    rerender(
      <Pagination
        total={8}
        pageSize={5}
        page={2}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Trang trước' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trang kế tiếp' })).toBeDisabled();
  });

  it('does not trigger onPageChange when clicking currently active page', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        total={10}
        pageSize={5}
        page={1}
        onPageChange={handlePageChange}
      />
    );

    const page1Btn = screen.getByRole('button', { name: 'Trang 1' });
    fireEvent.click(page1Btn);
    expect(handlePageChange).not.toHaveBeenCalled();
  });
});
