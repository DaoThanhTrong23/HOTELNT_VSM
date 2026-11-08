import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../../services';
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
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'live'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('NEWEST');

  // Listings state from API
  const [listings, setListings] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(12);
  const [liveTotal, setLiveTotal] = useState(86);

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

  // --- FETCH LISTINGS FROM API (theo API_DESIGN Row 42) ---
  const fetchListings = useCallback(async () => {
    try {
      const trangThai = activeTab === 'pending' ? 'PENDING' : 'APPROVED';
      const data = await adminService.getListings({
        trangThai,
        keyword: search,
        page: currentPage,
        limit: pageSize,
      });

      const items = data.items || data || [];
      setListings(items);

      if (activeTab === 'pending') {
        setPendingTotal(data.pagination?.totalItems || items.length);
      } else {
        setLiveTotal(data.pagination?.totalItems || items.length);
      }

      // Automatically select first item if none is selected
      if (items.length > 0 && !selectedHotel) {
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
    } catch (err) {
      showToast('Có lỗi xảy ra khi từ chối cơ sở qua API.');
    }
  };

  // Extract display images safely
  const displayImages = useMemo(() => {
    if (!selectedHotel) return [];
    if (selectedHotel.media && selectedHotel.media.length > 0) {
      return selectedHotel.media.map((m) => m.url);
    }
    if (selectedHotel.images && selectedHotel.images.length > 0) {
      return selectedHotel.images;
    }
    if (selectedHotel.duongDanAnh) {
      return [selectedHotel.duongDanAnh];
    }
    return ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'];
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
      <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 lg:p-8 space-y-5">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="hover:text-black cursor-pointer">Admin</span>
          <span>&gt;</span>
          <span className="font-semibold text-black">Quản lý &amp; Kiểm duyệt</span>
        </div>

        {/* PAGE TITLE */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Quản lý &amp; Kiểm duyệt
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Duyệt các cơ sở lưu trú do Host gửi lên hệ thống.
          </p>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-[#E2E8F0] pt-1">
          <button
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
        </div>

        {/* TOOLBAR: SEARCH & DROPDOWNS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
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
              placeholder="Tìm theo tên cơ sở, tên host, địa chỉ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black placeholder:text-[#94A3B8] focus:outline-none focus:border-black transition shadow-2xs"
            />
          </div>

          {/* Filter: Loại hình */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full sm:w-auto px-4 py-2.5 pr-9 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium text-black focus:outline-none focus:border-black transition cursor-pointer shadow-2xs"
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
              className="appearance-none w-full sm:w-auto px-4 py-2.5 pr-9 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium text-black focus:outline-none focus:border-black transition cursor-pointer shadow-2xs"
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

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs overflow-hidden">
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
                              src={hotel.duongDanAnh || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                              alt={hotel.tenCSLT}
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
