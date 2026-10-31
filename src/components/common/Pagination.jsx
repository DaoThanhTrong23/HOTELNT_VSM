import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Component Phân trang tái sử dụng
 *
 * @param {Object} props
 * @param {number} props.total Tổng số item
 * @param {number} props.pageSize Số item trên 1 trang
 * @param {number} props.page Trang hiện tại (1-indexed)
 * @param {Function} props.onPageChange Callback khi đổi trang
 */
export const Pagination = ({ total, pageSize, page, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        id="page-prev-btn"
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
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
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
            p === page
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
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang kế tiếp"
        className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#CBD5E1] text-[#64748B] disabled:opacity-40 hover:border-black hover:text-black transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
};
