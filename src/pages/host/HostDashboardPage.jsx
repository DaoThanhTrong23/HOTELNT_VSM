import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Hotel,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building,
  Calendar,
  X,
  ShieldAlert,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { HOTEL_STATUS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';

const MOCK_HOST_HOTELS = [
  {
    id: 'h-101',
    name: 'Sea Breeze Homestay',
    type: 'Homestay',
    ward: 'Nam Nha Trang',
    address: 'Nam Nha Trang, TP. Nha Trang',
    priceDisplay: '350.000 – 600.000 đ',
    priceUnit: 'mỗi đêm',
    minPrice: 350000,
    maxPrice: 600000,
    status: HOTEL_STATUS.APPROVED,
    createdAt: '2026-09-12',
    updatedAt: '2026-09-24',
    colorClass: 'bg-[#82A8AC]',
  },
  {
    id: 'h-102',
    name: 'Hòn Chồng Boutique Hotel',
    type: 'Khách sạn',
    ward: 'Bắc Nha Trang',
    address: 'Bắc Nha Trang, TP. Nha Trang',
    priceDisplay: '800.000 – 1.500.000 đ',
    priceUnit: 'mỗi đêm',
    minPrice: 800000,
    maxPrice: 1500000,
    status: HOTEL_STATUS.PENDING,
    createdAt: '2026-09-18',
    updatedAt: '2026-09-25',
    colorClass: 'bg-[#C2AF94]',
  },
  {
    id: 'h-104',
    name: 'Nhà Biển Xanh',
    type: 'Homestay',
    ward: 'Nha Trang',
    address: 'Nha Trang, Khánh Hòa',
    priceDisplay: 'Chưa nhập giá',
    priceUnit: null,
    minPrice: null,
    status: HOTEL_STATUS.DRAFT,
    createdAt: '2026-09-25',
    updatedAt: '2026-09-25',
    colorClass: 'bg-[#9FB89E]',
  },
  {
    id: 'h-103',
    name: 'Trần Phú Central Hotel',
    type: 'Khách sạn',
    ward: 'Nha Trang',
    address: 'Trần Phú, Nha Trang',
    priceDisplay: '500.000 – 900.000 đ',
    priceUnit: 'mỗi đêm',
    minPrice: 500000,
    maxPrice: 900000,
    status: HOTEL_STATUS.REJECTED,
    rejectReason: 'Ảnh giấy phép kinh doanh bị mờ, không rõ số hiệu đăng ký và dấu mộc đỏ pháp lý. Vui lòng chụp lại bản gốc có dấu đỏ công chứng rõ ràng.',
    createdAt: '2026-09-10',
    updatedAt: '2026-09-20',
    colorClass: 'bg-[#A3ABC0]',
  },
  {
    id: 'h-105',
    name: 'Ocean Pearl Resort',
    type: 'Resort',
    ward: 'Nam Nha Trang',
    address: 'Nam Nha Trang, TP. Nha Trang',
    priceDisplay: '2.000.000 – 4.500.000 đ',
    priceUnit: 'mỗi đêm',
    minPrice: 2000000,
    maxPrice: 4500000,
    status: HOTEL_STATUS.APPROVED,
    createdAt: '2026-09-02',
    updatedAt: '2026-09-15',
    colorClass: 'bg-[#82A4BA]',
  },
  {
    id: 'h-106',
    name: 'Mây Homestay',
    type: 'Homestay',
    ward: 'Tây Nha Trang',
    address: 'Tây Nha Trang, TP. Nha Trang',
    priceDisplay: '250.000 – 400.000 đ',
    priceUnit: 'mỗi đêm',
    minPrice: 250000,
    maxPrice: 400000,
    status: HOTEL_STATUS.HIDDEN,
    createdAt: '2026-08-28',
    updatedAt: '2026-09-19',
    colorClass: 'bg-[#C6B6A2]',
  },
  {
    id: 'h-107',
    name: 'Green Garden Villa',
    type: 'Biệt thự',
    ward: 'Bắc Nha Trang',
    address: 'Bắc Nha Trang, TP. Nha Trang',
    priceDisplay: '6.000.000 – 9.000.000 đ',
    priceUnit: 'mỗi tháng',
    minPrice: 6000000,
    maxPrice: 9000000,
    status: HOTEL_STATUS.PENDING,
    createdAt: '2026-09-21',
    updatedAt: '2026-09-26',
    colorClass: 'bg-[#8EAF96]',
  },
];

export const HostDashboardPage = ({ initialHotels, initialLoading = false }) => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState(() => {
    if (initialHotels !== undefined) return initialHotels;
    return MOCK_HOST_HOTELS;
  });

  const [loading] = useState(initialLoading);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedHotels, setSelectedHotels] = useState([]);

  // Modals state
  const [warningApprovedModalHotel, setWarningApprovedModalHotel] = useState(null);
  const [rejectionModalHotel, setRejectionModalHotel] = useState(null);
  const [deleteConfirmHotel, setDeleteConfirmHotel] = useState(null);
  const [withdrawConfirmHotel, setWithdrawConfirmHotel] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Thống kê hỗ trợ Screen-reader & TDD Test DASH-01
  const stats = useMemo(() => {
    return [
      {
        id: 'total',
        label: 'Tổng số cơ sở',
        value: hotels.length,
        icon: Hotel,
        color: 'text-black',
        testId: 'stat-total-count',
      },
      {
        id: 'approved',
        label: 'Đang hiển thị',
        value: hotels.filter((h) => h.status === HOTEL_STATUS.APPROVED).length,
        icon: CheckCircle2,
        color: 'text-[#15803D]',
        testId: 'stat-approved-count',
      },
      {
        id: 'pending',
        label: 'Chờ duyệt',
        value: hotels.filter((h) => h.status === HOTEL_STATUS.PENDING).length,
        icon: Clock,
        color: 'text-[#B45309]',
        testId: 'stat-pending-count',
      },
      {
        id: 'rejected',
        label: 'Bị từ chối',
        value: hotels.filter((h) => h.status === HOTEL_STATUS.REJECTED).length,
        icon: AlertTriangle,
        color: 'text-[#DC2626]',
        testId: 'stat-rejected-count',
      },
    ];
  }, [hotels]);

  // Bộ lọc danh sách
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchStatus =
        selectedFilter === 'ALL' ? true : h.status === selectedFilter;
      const matchKeyword =
        searchKeyword.trim() === ''
          ? true
          : h.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            h.address.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (h.ward && h.ward.toLowerCase().includes(searchKeyword.toLowerCase()));
      return matchStatus && matchKeyword;
    });
  }, [hotels, selectedFilter, searchKeyword]);

  // Checkbox selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedHotels(filteredHotels.map((h) => h.id));
    } else {
      setSelectedHotels([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedHotels((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Thao tác gửi duyệt (DRAFT -> PENDING)
  const handleSubmitModeration = (hotel) => {
    setHotels((prev) =>
      prev.map((h) => (h.id === hotel.id ? { ...h, status: HOTEL_STATUS.PENDING } : h))
    );
    showToast(`Đã gửi cơ sở "${hotel.name}" tới Ban quản trị để kiểm duyệt!`, 'success');
  };

  // Thao tác rút lại duyệt (PENDING -> DRAFT)
  const handleConfirmWithdraw = () => {
    if (!withdrawConfirmHotel) return;
    setHotels((prev) =>
      prev.map((h) =>
        h.id === withdrawConfirmHotel.id ? { ...h, status: HOTEL_STATUS.DRAFT } : h
      )
    );
    showToast(`Đã rút lại yêu cầu kiểm duyệt của "${withdrawConfirmHotel.name}". Cơ sở đã chuyển về Bản nháp.`, 'success');
    setWithdrawConfirmHotel(null);
  };

  // Thao tác xóa bài (DRAFT / REJECTED)
  const handleConfirmDelete = () => {
    if (!deleteConfirmHotel) return;
    setHotels((prev) => prev.filter((h) => h.id !== deleteConfirmHotel.id));
    showToast(`Đã xóa cơ sở "${deleteConfirmHotel.name}" thành công!`, 'success');
    setDeleteConfirmHotel(null);
  };

  // Thao tác tiếp tục sửa cơ sở Approved sau khi xác nhận cảnh báo
  const handleProceedApprovedEdit = () => {
    if (!warningApprovedModalHotel) return;
    const hotelId = warningApprovedModalHotel.id;
    setWarningApprovedModalHotel(null);
    navigate(`/host/hotels/${hotelId}/edit`);
  };

  // Thao tác render Action Buttons chuẩn Figma
  const renderActionButtons = (hotel, isMobile = false) => {
    return (
      <div
        data-testid={isMobile ? `mobile-actions-${hotel.id}` : `actions-${hotel.id}`}
        className="flex items-center gap-1.5 flex-wrap justify-start"
      >
        {/* 1. Trạng thái DRAFT */}
        {hotel.status === HOTEL_STATUS.DRAFT && (
          <>
            <Link
              to={`/host/hotels/${hotel.id}/edit`}
              data-action="edit"
              title="Chỉnh sửa bản nháp"
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer"
            >
              Sửa
            </Link>

            <button
              type="button"
              data-action="submit-moderation"
              onClick={() => handleSubmitModeration(hotel)}
              title="Gửi kiểm duyệt"
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer"
            >
              Gửi duyệt
            </button>

            <button
              type="button"
              data-action="delete"
              onClick={() => setDeleteConfirmHotel(hotel)}
              title="Xóa bài nháp"
              className="px-3 py-1.5 rounded-lg border border-[#DC2626]/40 bg-white text-[#DC2626] text-xs font-medium hover:bg-[#F4A9A9]/20 transition-colors cursor-pointer"
            >
              Xóa
            </button>
          </>
        )}

        {/* 2. Trạng thái PENDING */}
        {hotel.status === HOTEL_STATUS.PENDING && (
          <>
            <Link
              to={`/hotel/${hotel.id}`}
              data-action="preview"
              title="Xem chi tiết"
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer"
            >
              Xem
            </Link>

            <button
              type="button"
              data-action="withdraw"
              onClick={() => setWithdrawConfirmHotel(hotel)}
              title="Rút lại yêu cầu kiểm duyệt"
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#64748B] text-xs font-medium hover:bg-[#FEE8A8]/40 hover:text-[#D97706] transition-colors cursor-pointer"
            >
              Rút lại
            </button>
          </>
        )}

        {/* 3. Trạng thái APPROVED */}
        {hotel.status === HOTEL_STATUS.APPROVED && (
          <>
            <Link
              to={`/hotel/${hotel.id}`}
              data-action="preview"
              title="Xem trang công khai"
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer"
            >
              Xem
            </Link>

            <button
              type="button"
              data-action="edit"
              onClick={() => setWarningApprovedModalHotel(hotel)}
              title="Chỉnh sửa thông tin cơ sở"
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer"
            >
              Sửa
            </button>
          </>
        )}

        {/* 4. Trạng thái REJECTED */}
        {hotel.status === HOTEL_STATUS.REJECTED && (
          <>
            <button
              type="button"
              data-action="view-rejection-reason"
              onClick={() => setRejectionModalHotel(hotel)}
              title="Xem lý do từ chối và sửa"
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer"
            >
              Xem & sửa
            </button>

            <button
              type="button"
              data-action="delete"
              onClick={() => setDeleteConfirmHotel(hotel)}
              title="Xóa bài viết"
              className="px-3 py-1.5 rounded-lg border border-[#DC2626]/40 bg-white text-[#DC2626] text-xs font-medium hover:bg-[#F4A9A9]/20 transition-colors cursor-pointer"
            >
              Xóa
            </button>
          </>
        )}

        {/* 5. Trạng thái HIDDEN */}
        {hotel.status === HOTEL_STATUS.HIDDEN && (
          <Link
            to={`/host/hotels/${hotel.id}/edit`}
            data-action="edit"
            title="Sửa và gửi lại"
            className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-black text-xs font-medium hover:bg-[#F8F4E8] transition-colors cursor-pointer"
          >
            Sửa & gửi lại
          </Link>
        )}
      </div>
    );
  };

  // Các tab bộ lọc theo Figma
  const filterTabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: HOTEL_STATUS.DRAFT, label: 'Bản nháp' },
    { key: HOTEL_STATUS.PENDING, label: 'Chờ duyệt' },
    { key: HOTEL_STATUS.APPROVED, label: 'Đã duyệt' },
    { key: HOTEL_STATUS.REJECTED, label: 'Bị từ chối' },
    { key: HOTEL_STATUS.HIDDEN, label: 'Ẩn' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-[#F4A9A9] text-[#DC2626] border-[#DC2626]/20'
              : 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]/20'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle size={20} className="shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.message}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-black/10 transition-colors ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER SECTION (FIGMA TITLE + + THÊM CƠ SỞ) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Cơ sở lưu trú của tôi
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Quản lý, cập nhật và gửi kiểm duyệt các cơ sở của bạn
          </p>
        </div>

        <Link
          to={ROUTES.HOST.ADD_HOTEL}
          data-testid="add-hotel-button"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus size={16} />
          <span>Thêm cơ sở</span>
        </Link>
      </div>

      {/* OVERVIEW STAT CARDS (Hỗ trợ Screen-reader & DASH-01) */}
      <div className="sr-only">
        {stats.map((item) => (
          <div key={item.id}>
            <span>{item.label}</span>
            <span data-testid={item.testId}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* FILTER TABS & SEARCH ROW (FIGMA: TẤT CẢ 7, BẢN NHÁP 1, ... & TÌM THEO TÊN CƠ SỞ) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* HORIZONTAL PILL TABS */}
        <div className="flex overflow-x-auto gap-2 pb-1 md:pb-0 scrollbar-none items-center">
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.key;
            const count =
              tab.key === 'ALL'
                ? hotels.length
                : hotels.filter((h) => h.status === tab.key).length;

            return (
              <button
                key={tab.key}
                type="button"
                data-testid={`filter-chip-${tab.key}`}
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-black hover:border-black border border-[#CBD5E1]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-neutral-800 text-white'
                      : 'bg-[#F8F4E8] text-[#64748B]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên cơ sở"
            className="w-full pl-9 pr-8 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-black transition-colors"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-black"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT LIST / TABLE */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-[#CBD5E1] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredHotels.length === 0 ? (
        /* EMPTY STATE */
        <div
          data-testid="host-empty-state"
          className="bg-white rounded-xl border border-[#CBD5E1] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-6 shadow-xs"
        >
          <div className="w-16 h-16 rounded-xl bg-[#F8F4E8] text-black mx-auto flex items-center justify-center">
            <Building size={32} />
          </div>
          <h3 className="text-lg font-bold text-black">
            {hotels.length === 0 ? 'Bạn chưa có cơ sở lưu trú nào' : 'Không tìm thấy cơ sở phù hợp'}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            {hotels.length === 0
              ? 'Hãy bắt đầu đăng ký cơ sở đầu tiên để tiếp cận hàng ngàn du khách tại Nha Trang.'
              : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục trạng thái khác.'}
          </p>
          {hotels.length === 0 ? (
            <Link
              to={ROUTES.HOST.ADD_HOTEL}
              data-testid="empty-state-cta-button"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-xs min-h-[44px]"
            >
              <Plus size={16} />
              <span>Đăng ký cơ sở ngay</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedFilter('ALL');
                setSearchKeyword('');
              }}
              className="px-5 py-2.5 rounded-lg border border-black text-black text-xs sm:text-sm font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          {/* A. MOBILE CARD VIEW (< 768px) */}
          <div data-testid="mobile-hotel-list" className="md:hidden space-y-3">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                data-testid="mobile-hotel-card"
                className="bg-white rounded-xl border border-[#CBD5E1] p-4 space-y-3 shadow-2xs hover:border-black/30 transition-all"
              >
                {/* TOP ROW: THUMBNAIL + BASIC INFO */}
                <div className="flex gap-3 items-start">
                  <div
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${
                      hotel.colorClass || 'bg-[#CBD5E1]'
                    }`}
                  >
                    {hotel.thumbnail ? (
                      <img
                        src={hotel.thumbnail}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Hotel size={20} className="text-white/60" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-black line-clamp-1">{hotel.name}</h4>
                    <p className="text-xs text-[#64748B]">{hotel.type}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{hotel.ward}</p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={hotel.status} />
                      {hotel.priceDisplay && (
                        <span className="text-xs font-semibold text-black">
                          {hotel.priceDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ROW: DATE & ACTION BAR */}
                <div className="pt-2 border-t border-[#CBD5E1]/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                    <Calendar size={13} />
                    <span>{formatDate(hotel.createdAt)}</span>
                  </div>

                  {renderActionButtons(hotel, true)}
                </div>
              </div>
            ))}
          </div>

          {/* B. DESKTOP DATA TABLE (≥ 768px) - 8 CỘT CHUẨN FIGMA */}
          <div
            data-testid="desktop-data-table"
            className="hidden md:block bg-white rounded-xl border border-[#CBD5E1] shadow-2xs overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[#64748B] font-medium border-b border-[#CBD5E1] bg-[#F8F4E8]/40">
                  <tr>
                    {/* CỘT 1: CHECKBOX + ẢNH */}
                    <th className="py-3 px-4 w-28">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            filteredHotels.length > 0 &&
                            selectedHotels.length === filteredHotels.length
                          }
                          className="w-4 h-4 rounded border-[#CBD5E1] text-black focus:ring-black cursor-pointer"
                        />
                        <span>Ảnh</span>
                      </div>
                    </th>

                    {/* CỘT 2: TÊN CƠ SỞ */}
                    <th className="py-3 px-4 font-medium">
                      <span className="sr-only">Cơ sở lưu trú</span>
                      <span>Tên cơ sở</span>
                    </th>

                    {/* CỘT 3: PHƯỜNG/XÃ */}
                    <th className="py-3 px-4 font-medium">Phường/Xã</th>

                    {/* CỘT 4: GIÁ THAM KHẢO */}
                    <th className="py-3 px-4 font-medium">Giá tham khảo</th>

                    {/* CỘT 5: NGÀY TẠO */}
                    <th className="py-3 px-4 font-medium">Ngày tạo</th>

                    {/* CỘT 6: CẬP NHẬT */}
                    <th className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-black">
                        <span>Cập nhật</span>
                        <ChevronDown size={14} className="text-[#64748B]" />
                      </div>
                    </th>

                    {/* CỘT 7: TRẠNG THÁI */}
                    <th className="py-3 px-4 font-medium">Trạng thái</th>

                    {/* CỘT 8: THAO TÁC */}
                    <th className="py-3 px-4 font-medium text-left">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#CBD5E1]/40">
                  {filteredHotels.map((hotel) => (
                    <tr
                      key={hotel.id}
                      data-testid="desktop-table-row"
                      className="hover:bg-[#F8F4E8]/50 transition-colors"
                    >
                      {/* 1. CHECKBOX + ẢNH */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedHotels.includes(hotel.id)}
                            onChange={() => handleSelectOne(hotel.id)}
                            className="w-4 h-4 rounded border-[#CBD5E1] text-black focus:ring-black cursor-pointer"
                          />
                          <div
                            className={`w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${
                              hotel.colorClass || 'bg-[#CBD5E1]'
                            }`}
                          >
                            {hotel.thumbnail ? (
                              <img
                                src={hotel.thumbnail}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* 2. TÊN CƠ SỞ + LOẠI HÌNH */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-black text-xs">{hotel.name}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{hotel.type}</p>
                      </td>

                      {/* 3. PHƯỜNG/XÃ */}
                      <td className="py-3.5 px-4 text-black text-xs whitespace-nowrap">
                        {hotel.ward}
                      </td>

                      {/* 4. GIÁ THAM KHẢO */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hotel.priceDisplay === 'Chưa nhập giá' ? (
                          <span className="text-[#64748B] text-xs">Chưa nhập giá</span>
                        ) : (
                          <div>
                            <p className="text-black text-xs font-medium">
                              {hotel.priceDisplay}
                            </p>
                            {hotel.priceUnit && (
                              <p className="text-[11px] text-[#64748B] mt-0.5">
                                {hotel.priceUnit}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 5. NGÀY TẠO */}
                      <td className="py-3.5 px-4 text-[#64748B] text-xs whitespace-nowrap">
                        {formatDate(hotel.createdAt)}
                      </td>

                      {/* 6. CẬP NHẬT */}
                      <td className="py-3.5 px-4 text-[#64748B] text-xs whitespace-nowrap">
                        {formatDate(hotel.updatedAt)}
                      </td>

                      {/* 7. TRẠNG THÁI */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={hotel.status} />
                      </td>

                      {/* 8. THAO TÁC */}
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        {renderActionButtons(hotel)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER / PAGINATION (FIGMA: Hiển thị 1–7 trên 7 cơ sở · 10 dòng mỗi trang & < 1 >) */}
            <div className="py-3 px-4 border-t border-[#CBD5E1] flex items-center justify-between text-xs text-[#64748B]">
              <div>
                Hiển thị 1–{filteredHotels.length} trên {hotels.length} cơ sở · 10 dòng mỗi trang
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-black text-white text-xs font-bold"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-black hover:bg-[#F8F4E8] transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 1. MODAL CẢNH BÁO CHỈNH SỬA CƠ SỞ APPROVED (SRS FR-15 & FIGMA FRAME 13) */}
      <Modal
        isOpen={!!warningApprovedModalHotel}
        onClose={() => setWarningApprovedModalHotel(null)}
        title="Cảnh báo thay đổi thông tin cơ sở"
      >
        <div data-testid="approved-edit-warning-modal" className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FEE8A8]/60 text-[#D97706] border border-[#D97706]/20">
            <ShieldAlert size={22} className="shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <p className="font-bold">Lưu ý quan trọng theo quy định kiểm duyệt (FR-15):</p>
              <p className="mt-1">
                Cơ sở <strong>{warningApprovedModalHotel?.name}</strong> đang hoạt động công khai. Khi bạn lưu các thay đổi mới, bài đăng sẽ tự động <strong>chuyển về trạng thái &quot;Chờ duyệt&quot;</strong> để Ban quản trị kiểm duyệt lại trước khi xuất bản bản cập nhật.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#64748B]">
            Bạn có chắc chắn muốn chuyển sang giao diện chỉnh sửa cơ sở này không?
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWarningApprovedModalHotel(null)}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-[#CBD5E1] text-[#64748B] hover:text-black hover:border-black transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleProceedApprovedEdit}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs min-h-[44px]"
            >
              Tiếp tục chỉnh sửa
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. MODAL XEM LÝ DO TỪ CHỐI (REJECTED REASON) */}
      <Modal
        isOpen={!!rejectionModalHotel}
        onClose={() => setRejectionModalHotel(null)}
        title="Lý do từ chối kiểm duyệt"
      >
        <div data-testid="rejection-reason-modal" className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F4A9A9]/30 border border-[#DC2626]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626]">
              <AlertCircle size={16} />
              <span>Phản hồi từ Ban Quản Trị Hệ Thống:</span>
            </div>
            <p className="text-sm text-black leading-relaxed">
              {rejectionModalHotel?.rejectReason || 'Không có ghi chú chi tiết từ quản trị viên.'}
            </p>
          </div>

          <p className="text-xs text-[#64748B]">
            Vui lòng nhấn &quot;Chỉnh sửa lại&quot; để bổ sung giấy tờ hoặc khắc phục các thông tin chưa đạt yêu cầu, sau đó gửi duyệt lại.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectionModalHotel(null)}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-[#CBD5E1] text-[#64748B] hover:text-black hover:border-black transition-colors"
            >
              Đóng
            </button>
            <Link
              to={`/host/hotels/${rejectionModalHotel?.id}/edit`}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Chỉnh sửa lại
            </Link>
          </div>
        </div>
      </Modal>

      {/* 3. MODAL XÁC NHẬN XÓA CƠ SỞ (DRAFT / REJECTED) */}
      <Modal
        isOpen={!!deleteConfirmHotel}
        onClose={() => setDeleteConfirmHotel(null)}
        title="Xác nhận xóa cơ sở lưu trú"
      >
        <div data-testid="delete-hotel-modal" className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F4A9A9]/20 border border-[#DC2626]/30 text-[#DC2626] text-xs sm:text-sm leading-relaxed">
            Hành động này không thể hoàn tác. Toàn bộ thông tin, phòng và hình ảnh của cơ sở{' '}
            <strong>&quot;{deleteConfirmHotel?.name}&quot;</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmHotel(null)}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-[#CBD5E1] text-[#64748B] hover:text-black hover:border-black transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#DC2626] text-white hover:bg-red-700 transition-colors shadow-xs min-h-[44px]"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. MODAL XÁC NHẬN RÚT LẠI YÊU CẦU DUYỆT (PENDING -> DRAFT) */}
      <Modal
        isOpen={!!withdrawConfirmHotel}
        onClose={() => setWithdrawConfirmHotel(null)}
        title="Rút lại yêu cầu kiểm duyệt"
      >
        <div data-testid="withdraw-hotel-modal" className="space-y-4">
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Bạn có chắc chắn muốn rút lại yêu cầu kiểm duyệt cho cơ sở{' '}
            <strong>&quot;{withdrawConfirmHotel?.name}&quot;</strong>? Trạng thái cơ sở sẽ được chuyển
            về <strong>Bản nháp</strong> để bạn có thể tiếp tục chỉnh sửa.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWithdrawConfirmHotel(null)}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-[#CBD5E1] text-[#64748B] hover:text-black hover:border-black transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmWithdraw}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs min-h-[44px]"
            >
              Xác nhận rút lại
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
