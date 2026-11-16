import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { adminService } from '../../services';
import { resolveHotelImageUrl, FALLBACK_HOTEL_IMAGE } from '../../utils/formatters';
import {
  HotelDetailDrawer,
  ApproveListingModal,
  RejectListingModal,
} from '../../components/admin';

// Helper badge renderer for hotel type
const TypeBadge = ({ type }) => {
  switch (type) {
    case 'Hotel':
    case 'Khách sạn':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
          Hotel
        </span>
      );
    case 'Homestay':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          Homestay
        </span>
      );
    case 'Resort':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 border border-cyan-200">
          Resort
        </span>
      );
    case 'Căn hộ':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">
          Căn hộ
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
          {type}
        </span>
      );
  }
};

export const HotelModerationPage = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'live' | 'rejected'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('NEWEST');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Listings state from API
  const [listings, setListings] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [liveTotal, setLiveTotal] = useState(0);
  const [rejectedTotal, setRejectedTotal] = useState(0);

  // Selected hotel for detail drawer
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selection checkboxes
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals matching Figma popups
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- GET DETAIL FROM API (theo API_DESIGN Row 43) ---
  const loadDetail = useCallback(async (maCSLT) => {
    try {
      const detail = await adminService.getListingDetail(maCSLT);
      setSelectedHotel(detail);
      setActiveImageIndex(0);
      setSelectedIds([detail.maCSLT]);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết cơ sở từ API:', err);
    }
  }, []);

  // --- FETCH COUNTS FOR ALL TABS ---
  const fetchCounts = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.allSettled([
        adminService.getListings({ trangThai: 'PENDING', limit: 1 }),
        adminService.getListings({ trangThai: 'APPROVED', limit: 1 }),
        adminService.getListings({ trangThai: 'REJECTED', limit: 1 }),
      ]);
      if (pendingRes.status === 'fulfilled' && pendingRes.value) {
        const val = pendingRes.value;
        setPendingTotal(val.pagination?.totalItems ?? (Array.isArray(val) ? val.length : (val.items?.length || 0)));
      }
      if (approvedRes.status === 'fulfilled' && approvedRes.value) {
        const val = approvedRes.value;
        setLiveTotal(val.pagination?.totalItems ?? (Array.isArray(val) ? val.length : (val.items?.length || 0)));
      }
      if (rejectedRes.status === 'fulfilled' && rejectedRes.value) {
        const val = rejectedRes.value;
        setRejectedTotal(val.pagination?.totalItems ?? (Array.isArray(val) ? val.length : (val.items?.length || 0)));
      }
    } catch (e) {
      console.warn('Lỗi khi tải số lượng kiểm duyệt:', e);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // --- FETCH LISTINGS FROM API (theo API_DESIGN Row 42) ---
  const fetchListings = useCallback(async () => {
    try {
      const trangThai =
        activeTab === 'pending'
          ? 'PENDING'
          : activeTab === 'live'
          ? 'APPROVED'
          : 'REJECTED';
      const data = await adminService.getListings({
        trangThai,
        keyword: search,
        page: currentPage,
        limit: pageSize,
      });

      const items = data.items || data || [];
      setListings(items);

      const total = data.pagination?.totalItems || items.length;
      if (activeTab === 'pending') {
        setPendingTotal(total);
      } else if (activeTab === 'live') {
        setLiveTotal(total);
      } else {
        setRejectedTotal(total);
      }

      // Automatically select first item if none is selected (desktop only)
      if (items.length > 0 && !selectedHotel && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        loadDetail(items[0].maCSLT);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách kiểm duyệt từ API:', err);
    }
  }, [activeTab, search, currentPage, selectedHotel, pageSize, loadDetail]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Filter listings by type
  const filteredListings = useMemo(() => {
    let result = [...listings];
    if (typeFilter !== 'ALL') {
      result = result.filter((h) => h.tenLoai === typeFilter);
    }
    if (timeFilter === 'OLDEST') {
      result.reverse();
    }
    return result;
  }, [listings, typeFilter, timeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize));

  const handleRowClick = (hotel) => {
    loadDetail(hotel.maCSLT);
  };

  const toggleSelectId = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredListings.map((h) => h.maCSLT));
    } else {
      setSelectedIds([]);
    }
  };

  // --- DUYỆT CƠ SỞ (theo API_DESIGN Row 44) ---
  const handleConfirmApprove = async () => {
    if (!selectedHotel) return;
    try {
      await adminService.moderateListing(selectedHotel.maCSLT, {
        action: 'APPROVE',
      });
      showToast(`Đã duyệt cơ sở "${selectedHotel.tenCSLT}" thành công!`);
      setApproveModalOpen(false);
      setSelectedHotel(null);
      fetchListings();
      fetchCounts();
    } catch (err) {
      showToast('Có lỗi xảy ra khi duyệt cơ sở qua API.');
    }
  };

  // --- TỪ CHỐI CƠ SỞ (theo API_DESIGN Row 44) ---
  const handleConfirmReject = async () => {
    if (!selectedHotel) return;
    try {
      await adminService.moderateListing(selectedHotel.maCSLT, {
        action: 'REJECT',
        lyDoTuChoi: rejectReason,
      });
      showToast(`Đã từ chối kiểm duyệt cơ sở "${selectedHotel.tenCSLT}".`);
      setRejectModalOpen(false);
      setSelectedHotel(null);
      setRejectReason('');
      fetchListings();
      fetchCounts();
    } catch (err) {
      showToast('Có lỗi xảy ra khi từ chối cơ sở qua API.');
    }
  };

  // Extract display images safely
  const displayImages = useMemo(() => {
    if (!selectedHotel) return [FALLBACK_HOTEL_IMAGE];
    let custom = null;
    try {
      const rawStored = localStorage.getItem(`hotelnt_custom_media_${selectedHotel.maCSLT}`);
      if (rawStored) custom = JSON.parse(rawStored);
    } catch {
      /* ignore */
    }

    const rawList =
      (custom && custom.length > 0 && custom) ||
      (selectedHotel.media && selectedHotel.media.length > 0 && selectedHotel.media) ||
      (selectedHotel.hinhAnh && selectedHotel.hinhAnh.length > 0 && selectedHotel.hinhAnh) ||
      (selectedHotel.danhSachAnh && selectedHotel.danhSachAnh.length > 0 && selectedHotel.danhSachAnh) ||
      (selectedHotel.images && selectedHotel.images.length > 0 && selectedHotel.images) ||
      (selectedHotel.duongDanAnh ? [{ url: selectedHotel.duongDanAnh }] : []);

    const raw = rawList
      .map((m) => {
        if (typeof m === 'string') return m;
        return m.dataUrl || m.localPreviewUrl || m.url || m.duongDan || m.duongDanAnh || '';
      })
      .filter(Boolean);

    if (raw.length === 0) return [FALLBACK_HOTEL_IMAGE];
    return raw.map((u, i) => resolveHotelImageUrl(u, i) || FALLBACK_HOTEL_IMAGE);
  }, [selectedHotel]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full min-h-0 bg-[#F8F4E8] overflow-hidden relative">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-black text-white text-sm shadow-xl animate-fade-in border border-neutral-700">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT COLUMN: MODERATION TABLE & FILTERS */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 lg:p-8 space-y-4 sm:space-y-5">
        {/* BREADCRUMB (Desktop only) */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B]">
          <span className="hover:text-black cursor-pointer">Admin</span>
          <span>&gt;</span>
          <span className="text-black">Quản lý và kiểm duyệt</span>
        </div>

        {/* PAGE TITLE & SUBTITLE */}
        <div>
          {/* Mobile Title matching Figma Frame 16 */}
          <div className="sm:hidden">
            <h1 className="text-xl font-black text-black tracking-tight">
              {activeTab === 'rejected'
                ? 'Từ chối cơ sở'
                : activeTab === 'pending'
                ? 'Chờ duyệt'
                : 'Cơ sở đã duyệt'}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {activeTab === 'rejected'
                ? 'Các hồ sơ chưa đáp ứng điều kiện.'
                : activeTab === 'pending'
                ? 'Xem xét và phê duyệt các cơ sở lưu trú mới.'
                : 'Các cơ sở lưu trú đang hiển thị công khai.'}
            </p>
          </div>

          {/* Desktop Title */}
          <h1 className="hidden sm:block text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Quản lý và kiểm duyệt
          </h1>
        </div>

        {/* MOBILE STATUS SWITCHER PILLS (Figma Frame 16) */}
        <div className="flex sm:hidden items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
              setSelectedHotel(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-[#64748B] border border-[#CBD5E1] hover:text-black'
            }`}
          >
            Chờ duyệt ({pendingTotal})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('live');
              setCurrentPage(1);
              setSelectedHotel(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'live'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-[#64748B] border border-[#CBD5E1] hover:text-black'
            }`}
          >
            Đã duyệt ({liveTotal})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('rejected');
              setCurrentPage(1);
              setSelectedHotel(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-[#64748B] border border-[#CBD5E1] hover:text-black'
            }`}
          >
            Từ chối ({rejectedTotal})
          </button>
        </div>

        {/* DESKTOP TABS */}
        <div className="hidden sm:flex items-center gap-6 border-b border-[#E2E8F0] pt-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
              activeTab === 'pending'
                ? 'text-black'
                : 'text-[#64748B] hover:text-black'
            }`}
          >
            Chờ duyệt ({pendingTotal})
            {activeTab === 'pending' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('live');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
              activeTab === 'live'
                ? 'text-black'
                : 'text-[#64748B] hover:text-black'
            }`}
          >
            Đã duyệt / Đang hiển thị ({liveTotal})
            {activeTab === 'live' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('rejected');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
              activeTab === 'rejected'
                ? 'text-black'
                : 'text-[#64748B] hover:text-black'
            }`}
          >
            Đã từ chối ({rejectedTotal})
            {activeTab === 'rejected' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
            )}
          </button>
        </div>

        {/* TOOLBAR: SEARCH & DROPDOWNS (Matches Figma 16.5) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search box with filter button on mobile */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm cơ sở..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black placeholder:text-[#94A3B8] focus:outline-none focus:border-black transition shadow-2xs"
              />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              aria-label="Bộ lọc"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className={`sm:hidden p-2.5 rounded-xl border transition cursor-pointer shrink-0 shadow-2xs ${
                mobileFilterOpen || typeFilter !== 'ALL' || timeFilter !== 'NEWEST'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-[#64748B] border-[#CBD5E1] hover:text-black'
              }`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Filter: Loại hình */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none px-4 py-2.5 pr-9 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium text-black focus:outline-none focus:border-black transition cursor-pointer shadow-2xs"
              >
                <option value="ALL">Tất cả loại hình</option>
                <option value="Hotel">Khách sạn (Hotel)</option>
                <option value="Homestay">Homestay</option>
                <option value="Resort">Resort</option>
                <option value="Căn hộ">Căn hộ</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
              />
            </div>

            {/* Filter: Thời gian gửi */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-9 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium text-black focus:outline-none focus:border-black transition cursor-pointer shadow-2xs"
              >
                <option value="NEWEST">Thời gian gửi ▾</option>
                <option value="OLDEST">Cũ nhất trước</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* MOBILE COLLAPSIBLE FILTER DROPDOWN */}
        {mobileFilterOpen && (
          <div className="sm:hidden p-3.5 bg-white rounded-xl border border-[#CBD5E1] shadow-xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-black border-b border-[#F1F5F9] pb-2">
              <span>Bộ lọc nâng cao</span>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('ALL');
                  setTimeFilter('NEWEST');
                }}
                className="text-[11px] text-[#2563EB] hover:underline"
              >
                Đặt lại
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Loại hình</label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-medium text-black bg-white focus:outline-none focus:border-black"
                >
                  <option value="ALL">Tất cả loại hình</option>
                  <option value="Hotel">Khách sạn</option>
                  <option value="Homestay">Homestay</option>
                  <option value="Resort">Resort</option>
                  <option value="Căn hộ">Căn hộ</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Thứ tự</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-medium text-black bg-white focus:outline-none focus:border-black"
                >
                  <option value="NEWEST">Mới nhất</option>
                  <option value="OLDEST">Cũ nhất</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY COUNT & SELECT ALL (Figma 16.5) */}
        <div className="flex items-center justify-between text-xs font-medium pt-1">
          <span className="font-bold text-black">
            {filteredListings.length} cơ sở{' '}
            {activeTab === 'rejected'
              ? 'đã từ chối'
              : activeTab === 'pending'
              ? 'chờ duyệt'
              : 'đã duyệt'}
          </span>

          <label className="flex items-center gap-2 cursor-pointer text-[#475569] font-medium select-none">
            <input
              type="checkbox"
              checked={
                filteredListings.length > 0 &&
                filteredListings.every((h) => selectedIds.includes(h.maCSLT))
              }
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer"
            />
            <span>Chọn tất cả</span>
          </label>
        </div>

        {/* MOBILE CARD LIST (Figma Frame 16.5) */}
        <div className="md:hidden space-y-3">
          {filteredListings.length > 0 ? (
            filteredListings.map((hotel) => {
              const isChecked = selectedIds.includes(hotel.maCSLT);
              const isSelected = selectedHotel?.maCSLT === hotel.maCSLT;
              const initials =
                hotel.initials ||
                (hotel.tenCSLT
                  ? hotel.tenCSLT
                      .split(' ')
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'NT');

              return (
                <div
                  key={hotel.maCSLT}
                  className={`bg-white rounded-2xl p-4 border transition-all ${
                    isSelected
                      ? 'border-black shadow-md ring-1 ring-black'
                      : 'border-[#E2E8F0] shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelectId(hotel.maCSLT, e)}
                        className="w-4 h-4 rounded border-[#CBD5E1] accent-black cursor-pointer shrink-0"
                      />

                      {/* Initials Circle */}
                      <div className="w-11 h-11 rounded-full bg-[#E8DDD9] text-[#78350F] font-bold text-xs flex items-center justify-center shrink-0 tracking-wider">
                        {initials}
                      </div>

                      {/* Hotel Info */}
                      <div className="min-w-0">
                        <h3 className="font-bold text-black text-sm truncate leading-tight">
                          {hotel.tenCSLT}
                        </h3>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">
                          {hotel.diaChiChiTiet || hotel.tenPhuong || 'Trần Phú, Nha Trang'}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          {activeTab === 'rejected'
                            ? 'Hồ sơ đã xử lý'
                            : activeTab === 'pending'
                            ? 'Chờ kiểm duyệt'
                            : 'Đang hoạt động'}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {activeTab === 'rejected' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                              Từ chối
                            </span>
                          )}
                          {activeTab === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                              Chờ duyệt
                            </span>
                          )}
                          {activeTab === 'live' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                              Đã duyệt
                            </span>
                          )}
                          <span className="text-[10px] text-[#94A3B8]">
                            · {hotel.tenLoai}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Xem Button */}
                    <button
                      type="button"
                      onClick={() => handleRowClick(hotel)}
                      className="shrink-0 px-4 py-1.5 rounded-xl bg-[#1E293B] text-white text-xs font-semibold hover:bg-black transition cursor-pointer shadow-xs active:scale-95"
                    >
                      Xem
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-[#64748B] text-sm border border-[#E2E8F0]">
              Không có cơ sở lưu trú nào phù hợp.
            </div>
          )}

          {/* Mobile Pagination */}
          <div className="flex flex-col items-center justify-center gap-2 pt-3 pb-2 text-xs text-[#64748B]">
            <p>
              Hiển thị {filteredListings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredListings.length)} trong{' '}
              {filteredListings.length} cơ sở
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white flex items-center justify-center text-black hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-black text-white shadow-xs'
                      : 'border border-[#CBD5E1] bg-white hover:bg-neutral-100 text-black'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white flex items-center justify-center text-black hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP DATA TABLE (hidden on mobile, visible on sm/md+) */}
        <div className="hidden md:block bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white text-[11px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredListings.length > 0 &&
                        filteredListings.every((h) => selectedIds.includes(h.maCSLT))
                      }
                      className="rounded border-[#CBD5E1] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Cơ sở lưu trú</th>
                  <th className="py-3.5 px-4">Host</th>
                  <th className="py-3.5 px-4">Loại hình</th>
                  <th className="py-3.5 px-4">
                    {activeTab === 'pending' ? 'Ngày gửi' : 'Ngày duyệt'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredListings.length > 0 ? (
                  filteredListings.map((hotel) => {
                    const isSelected = selectedHotel?.maCSLT === hotel.maCSLT;
                    const isChecked = selectedIds.includes(hotel.maCSLT);

                    return (
                      <tr
                        key={hotel.maCSLT}
                        onClick={() => handleRowClick(hotel)}
                        className={`transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFF6FF] border-l-4 border-l-[#2563EB]'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => toggleSelectId(hotel.maCSLT, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-[#CBD5E1] cursor-pointer"
                          />
                        </td>

                        {/* Cơ sở lưu trú */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveHotelImageUrl(hotel.duongDanAnh) || FALLBACK_HOTEL_IMAGE}
                              alt={hotel.tenCSLT}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_HOTEL_IMAGE;
                              }}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E2E8F0]"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-black text-xs sm:text-sm truncate">
                                {hotel.tenCSLT}
                              </p>
                              <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                                {hotel.diaChiChiTiet || hotel.tenPhuong || 'Nha Trang'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Host */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${hotel.bgColor || 'bg-purple-100 text-purple-700'}`}
                            >
                              {hotel.initials || hotel.hoTen?.[0] || 'H'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-black text-xs truncate">
                                {hotel.hoTen}
                              </p>
                              <p className="text-[11px] text-[#64748B] truncate">
                                {hotel.emailHost || hotel.soDienThoaiHost}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Loại hình */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <TypeBadge type={hotel.tenLoai} />
                        </td>

                        {/* Ngày gửi */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-xs text-black font-medium">
                            {hotel.ngayGuiDuyet ? new Date(hotel.ngayGuiDuyet).toLocaleDateString('vi-VN') : '26/09/2026'}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {hotel.ngayGuiDuyet ? new Date(hotel.ngayGuiDuyet).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '12:30'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#64748B]">
                      Không có cơ sở lưu trú nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-[#E2E8F0] gap-3 bg-white text-xs text-[#64748B]">
            <div>
              Hiển thị {filteredListings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredListings.length)} trong{' '}
              {filteredListings.length} cơ sở
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-[#CBD5E1] flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'border border-[#CBD5E1] hover:bg-neutral-100 text-black'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-[#CBD5E1] flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SLIDE-OVER / DETAIL PANEL (FIGMA FRAME 16) */}
      <HotelDetailDrawer
        hotel={selectedHotel}
        onClose={() => setSelectedHotel(null)}
        onApproveClick={() => setApproveModalOpen(true)}
        onRejectClick={() => setRejectModalOpen(true)}
      />

      {/* POPUP 1: DUYỆT CƠ SỞ NÀY? (FIGMA FRAME 16) */}
      <ApproveListingModal
        isOpen={approveModalOpen}
        hotel={selectedHotel}
        displayImage={displayImages[0]}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
      />

      {/* POPUP 2: TỪ CHỐI CƠ SỞ (FIGMA FRAME 16) */}
      <RejectListingModal
        isOpen={rejectModalOpen}
        hotel={selectedHotel}
        displayImage={displayImages[0]}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};
