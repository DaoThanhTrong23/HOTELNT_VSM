import { HOTEL_STATUS, HOTEL_STATUS_LABELS } from '../../constants/enums';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case HOTEL_STATUS.APPROVED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
          {HOTEL_STATUS_LABELS[status] || 'Đã duyệt'}
        </span>
      );

    case HOTEL_STATUS.PENDING:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          {HOTEL_STATUS_LABELS[status] || 'Chờ duyệt'}
        </span>
      );

    case HOTEL_STATUS.REJECTED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#DC2626]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          {HOTEL_STATUS_LABELS[status] || 'Bị từ chối'}
        </span>
      );

    case HOTEL_STATUS.HIDDEN:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
          {HOTEL_STATUS_LABELS[status] || 'Ẩn'}
        </span>
      );

    case HOTEL_STATUS.DRAFT:
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
          {HOTEL_STATUS_LABELS[status] || 'Bản nháp'}
        </span>
      );
  }
};
