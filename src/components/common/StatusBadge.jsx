import { HOTEL_STATUS, HOTEL_STATUS_LABELS } from '../../constants/enums';
import { CheckCircle2, Clock, AlertCircle, FileEdit } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case HOTEL_STATUS.APPROVED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
          <CheckCircle2 size={14} />
          {HOTEL_STATUS_LABELS[status]}
        </span>
      );

    case HOTEL_STATUS.PENDING:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE8A8] text-[#B45309]">
          <Clock size={14} />
          {HOTEL_STATUS_LABELS[status]}
        </span>
      );

    case HOTEL_STATUS.REJECTED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4A9A9] text-[#DC2626]">
          <AlertCircle size={14} />
          {HOTEL_STATUS_LABELS[status]}
        </span>
      );

    case HOTEL_STATUS.DRAFT:
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#CBD5E1] text-[#475569]">
          <FileEdit size={14} />
          {HOTEL_STATUS_LABELS[status] || 'Bản nháp'}
        </span>
      );
  }
};
