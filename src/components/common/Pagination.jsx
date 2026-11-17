import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Component Phân trang tái sử dụng
 * Hỗ trợ linh hoạt cả prop names: total / totalItems, page / currentPage, onPageChange / onChange
 *
 * @param {Object} props
 * @param {number} [props.total] Tổng số item
 * @param {number} [props.totalItems] Tổng số item (alias)
 * @param {number} [props.pageSize=5] Số item trên 1 trang
 * @param {number} [props.page] Trang hiện tại (1-indexed)
 * @param {number} [props.currentPage] Trang hiện tại (alias)
 * @param {Function} [props.onPageChange] Callback khi đổi trang (newPage: number)
 * @param {Function} [props.onChange] Callback khi đổi trang (alias)
 */
export const Pagination = ({
  total,
  totalItems,
  pageSize = 5,
  page,
  currentPage,
  onPageChange,
  onChange,
}) => {
  const resolvedTotal = Number(total ?? totalItems);
  const resolvedPageSize = Number(pageSize) || 5;
  const resolvedPage = Math.max(1, Number(page ?? currentPage) || 1);

  if (isNaN(resolvedTotal) || resolvedTotal <= 0) return null;

  const totalPages = Math.ceil(resolvedTotal / resolvedPageSize);
  if (totalPages <= 1) return null;

  const triggerChange = (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === resolvedPage) return;
    if (typeof onPageChange === 'function') {
      onPageChange(targetPage);
    } else if (typeof onChange === 'function') {
      onChange(targetPage);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4" aria-label="Phân trang">
      <button
        id="page-prev-btn"
        type="button"
        onClick={() => triggerChange(resolvedPage - 1)}
        disabled={resolvedPage <= 1}
        aria-label="Trang trước"
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#CBD5E1] text-[#64748B] disabled:opacity-40 hover:border-black hover:text-black transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft size={15} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          id={`page-${p}-btn`}
          type="button"
          onClick={() => triggerChange(p)}
          aria-label={`Trang ${p}`}
          aria-current={p === resolvedPage ? 'page' : undefined}
          className={`w-8 h-8 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
            p === resolvedPage
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-[#CBD5E1] hover:border-black'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        id="page-next-btn"
        type="button"
        onClick={() => triggerChange(resolvedPage + 1)}
        disabled={resolvedPage >= totalPages}
        aria-label="Trang kế tiếp"
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#CBD5E1] text-[#64748B] disabled:opacity-40 hover:border-black hover:text-black transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default Pagination;
