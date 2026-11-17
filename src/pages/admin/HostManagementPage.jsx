import { useState, useEffect, useCallback } from 'react';
import {
  MoreHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services';
import { LockHostModal, UnlockHostModal } from '../../components/admin';

const getHostInitials = (name) => {
  if (!name) return 'H';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Field = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
    <p className="break-words text-sm font-medium text-[#334155]">
      {value || 'Chưa cập nhật'}
    </p>
  </div>
);

export const HostManagementPage = () => {
  const [hosts, setHosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedHost, setSelectedHost] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [counts, setCounts] = useState({ total: 0, active: 0, locked: 0 });

  // --- FETCH HOST COUNTS (OVERALL STATS) ---
  const fetchHostCounts = useCallback(async () => {
    try {
      const [allRes, activeRes, lockedRes] = await Promise.allSettled([
        adminService.getHosts({ limit: 1 }),
        adminService.getHosts({ trangThai: 'ACTIVE', limit: 1 }),
        adminService.getHosts({ trangThai: 'LOCKED', limit: 1 }),
      ]);
      const total =
        allRes.status === 'fulfilled'
          ? (allRes.value?.pagination?.totalItems ?? (Array.isArray(allRes.value) ? allRes.value.length : 0))
          : 0;
      const active =
        activeRes.status === 'fulfilled'
          ? (activeRes.value?.pagination?.totalItems ?? (Array.isArray(activeRes.value) ? activeRes.value.length : 0))
          : 0;
      const locked =
        lockedRes.status === 'fulfilled'
          ? (lockedRes.value?.pagination?.totalItems ?? (Array.isArray(lockedRes.value) ? lockedRes.value.length : 0))
          : 0;
      setCounts({ total, active, locked });
    } catch (e) {
      console.warn('Lỗi khi tải thống kê host:', e);
    }
  }, []);

  useEffect(() => {
    fetchHostCounts();
  }, [fetchHostCounts]);

  // --- FETCH HOSTS FROM API (theo API_DESIGN Row 39) ---
  const fetchHosts = useCallback(async () => {
    try {
      const data = await adminService.getHosts({
        trangThai: statusFilter,
        keyword: searchTerm,
      });
      const list = Array.isArray(data) ? data : (data?.items || []);
      setHosts(list);
    } catch (err) {
      console.error('Lỗi khi tải danh sách Host từ API:', err);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  const activeCount = counts.active || hosts.filter((host) => host.trangThai === 'ACTIVE' || !host.isLocked).length;
  const lockedCount = counts.locked || hosts.filter((host) => host.trangThai === 'LOCKED' || host.isLocked).length;
  const totalCount = counts.total || hosts.length;

  // --- OPEN DETAIL FROM API (theo API_DESIGN Row 40) ---
  const openDetail = async (host) => {
    try {
      const detail = await adminService.getHostDetail(host.id);
      setSelectedHost(detail);
      setDetailModalOpen(true);
    } catch {
      setSelectedHost(host);
      setDetailModalOpen(true);
    }
  };

  const openLockModal = (host) => {
    setSelectedHost(host);
    setLockModalOpen(true);
  };

  const openUnlockModal = (host) => {
    setSelectedHost(host);
    setUnlockModalOpen(true);
  };

  // --- LOCK HOST VIA API (theo API_DESIGN Row 41) ---
  const handleLock = async () => {
    if (!selectedHost) return;
    const hostName = selectedHost.hoTen || selectedHost.name;

    try {
      await adminService.updateHostStatus(selectedHost.id, {
        trangThai: 'LOCKED',
        lyDoKhoa: 'Khóa tài khoản theo yêu cầu quản trị viên',
      });
      setLockModalOpen(false);
      setSelectedHost(null);
      showToast(`Đã khóa tài khoản Host "${hostName}" thành công.`);
      fetchHosts();
      fetchHostCounts();
    } catch (err) {
      showToast('Có lỗi xảy ra khi khóa tài khoản qua API.');
    }
  };

  // --- UNLOCK HOST VIA API (theo API_DESIGN Row 41) ---
  const handleUnlock = async () => {
    if (!selectedHost) return;
    const hostName = selectedHost.hoTen || selectedHost.name;

    try {
      await adminService.updateHostStatus(selectedHost.id, {
        trangThai: 'ACTIVE',
      });
      setUnlockModalOpen(false);
      setSelectedHost(null);
      showToast(`Đã mở khóa tài khoản Host "${hostName}" thành công.`);
      fetchHosts();
      fetchHostCounts();
    } catch (err) {
      showToast('Có lỗi xảy ra khi mở khóa tài khoản qua API.');
    }
  };

  return (
    <div className="space-y-6 p-6 sm:p-8 lg:p-10 pb-8 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-black text-white text-sm shadow-xl animate-fade-in border border-neutral-700">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#B45309]">
          ADMIN / QUẢN LÝ ĐỐI TÁC
        </p>

        <h1 className="text-2xl font-bold text-[#171717] sm:text-3xl">
          Quản lý tài khoản Host
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Theo dõi thông tin đối tác, quản lý tài khoản và xử lý các trường hợp vi phạm.
        </p>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Tổng tài khoản Host
          </p>

          <p className="mt-3 text-3xl font-bold text-[#171717]">
            {totalCount.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Tổng đối tác trên hệ thống
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Đang hoạt động
          </p>

          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {activeCount.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Tài khoản có quyền đăng nhập bình thường
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Đang bị khóa
          </p>

          <p className="mt-3 text-3xl font-bold text-red-600">
            {lockedCount.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Tài khoản tạm ngưng quyền truy cập
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-bold text-[#1E293B]">
              Danh sách tài khoản Host
            </h2>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Tìm thấy {hosts.length} tài khoản phù hợp
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT, mã Host..."
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#B45309] sm:w-72"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm font-medium text-[#334155] outline-none transition focus:border-[#B45309]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* TABLE (Desktop) */}
        {hosts.length > 0 ? (
          <>
            {/* MOBILE CARDS VIEW (md:hidden) */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {hosts.map((host) => {
                const isLocked = host.trangThai === 'LOCKED' || host.isLocked;
                const hostName = host.hoTen || host.name;
                const hostPhone = host.soDienThoai || host.phone;
                const hostCount = host.soLuongCSLT ?? host.hotelCount ?? 0;
                const initials = getHostInitials(hostName);

                return (
                  <div key={host.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#E8DDD9] text-[#78350F] font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-black text-sm truncate">{hostName}</p>
                          <p className="text-xs text-[#94A3B8]">HOST-{String(host.id).padStart(3, '0')}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${
                          isLocked ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isLocked ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B] bg-[#FAFAF9] p-2.5 rounded-xl border border-[#F1F5F9]">
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">SĐT</span>
                        <span className="font-medium text-black">{hostPhone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block text-[10px]">Cơ sở</span>
                        <span className="font-medium text-black">{hostCount} cơ sở</span>
                      </div>
                      <div className="col-span-2 truncate">
                        <span className="text-[#94A3B8] block text-[10px]">Email</span>
                        <span className="font-medium text-black truncate">{host.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {isLocked ? (
                        <button
                          type="button"
                          onClick={() => openUnlockModal(host)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 text-xs font-semibold text-white hover:bg-emerald-800 transition cursor-pointer"
                        >
                          Mở khóa
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openLockModal(host)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          Khóa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openDetail(host)}
                        className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-black hover:bg-[#F8F4E8] transition cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#FAFAF9] text-xs font-semibold uppercase text-[#64748B]">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4">
                    Thông tin Host
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Liên hệ
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Số cơ sở
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Ngày tham gia
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Trạng thái
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5E7EB]">
                {hosts.map((host) => {
                  const isLocked = host.trangThai === 'LOCKED' || host.isLocked;
                  const hostName = host.hoTen || host.name;
                  const hostPhone = host.soDienThoai || host.phone;
                  const hostCount = host.soLuongCSLT ?? host.hotelCount ?? 0;

                  return (
                    <tr
                      key={host.id}
                      className="transition hover:bg-[#FFFCF6]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1E293B]">
                          {hostName}
                        </p>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                          HOST-{String(host.id).padStart(3, '0')}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-[#475569]">{hostPhone}</p>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {host.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#334155]">
                        {String(hostCount).padStart(2, '0')} cơ sở
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[#64748B]">
                        {host.ngayTao
                          ? new Date(host.ngayTao).toLocaleDateString('vi-VN')
                          : host.createdAt || '—'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                            isLocked
                              ? 'bg-red-50 text-red-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isLocked ? (
                            <button
                              onClick={() => openUnlockModal(host)}
                              className="whitespace-nowrap rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 cursor-pointer"
                            >
                              Mở khóa
                            </button>
                          ) : (
                            <button
                              onClick={() => openLockModal(host)}
                              className="whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
                            >
                              Khóa tài khoản
                            </button>
                          )}

                          <button
                            onClick={() => openDetail(host)}
                            title="Xem chi tiết"
                            aria-label="Xem chi tiết"
                            className="p-2 rounded-lg border border-[#CBD5E1] text-[#475569] hover:text-black hover:border-black hover:bg-[#F8F4E8] transition cursor-pointer flex items-center justify-center shrink-0"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <p className="font-semibold text-[#334155]">
              Không tìm thấy tài khoản Host
            </p>

            <p className="mt-2 text-sm text-[#94A3B8]">
              Thử thay đổi từ khóa hoặc bộ lọc trạng thái.
            </p>
          </div>
        )}
      </section>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Thông tin chi tiết Host"
      >
        {selectedHost && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]">
                  {selectedHost.hoTen || selectedHost.name}
                </h3>

                <p className="mt-1 text-xs text-[#94A3B8]">
                  Mã tài khoản: HOST-{String(selectedHost.id).padStart(3, '0')}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedHost.trangThai === 'LOCKED' || selectedHost.isLocked
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {selectedHost.trangThai === 'LOCKED' || selectedHost.isLocked
                  ? 'Đã khóa'
                  : 'Đang hoạt động'}
              </span>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold text-[#1E293B]">
                Thông tin liên hệ &amp; Định danh
              </h4>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Số điện thoại" value={selectedHost.soDienThoai || selectedHost.phone} />
                <Field label="Email" value={selectedHost.email} />
                <Field label="CCCD (bảo mật)" value={selectedHost.cccd || '056099******'} />
                <Field
                  label="Ngày tham gia"
                  value={
                    selectedHost.ngayTao
                      ? new Date(selectedHost.ngayTao).toLocaleDateString('vi-VN')
                      : selectedHost.createdAt || 'Chưa cập nhật'
                  }
                />
                <Field
                  label="Số lượng cơ sở"
                  value={`${selectedHost.soLuongCSLT ?? selectedHost.hotelCount ?? 0} cơ sở`}
                />
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-5">
              <h4 className="mb-4 text-sm font-bold text-[#1E293B]">
                Danh sách cơ sở lưu trú của Host
              </h4>

              {selectedHost.hotels && selectedHost.hotels.length > 0 ? (
                <div className="space-y-2">
                  {selectedHost.hotels.map((hotel, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] px-4 py-3"
                    >
                      <p className="text-sm font-medium text-[#334155]">
                        {hotel}
                      </p>
                    </div>
                  ))}
                </div>
              ) : selectedHost.thongKeCSLT ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-[#FAFAF9] border border-[#E5E7EB] p-3 text-center">
                    <p className="text-xs text-[#64748B]">Đang hiển thị</p>
                    <p className="text-lg font-bold text-emerald-600 mt-1">{selectedHost.thongKeCSLT.APPROVED || 0}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAFAF9] border border-[#E5E7EB] p-3 text-center">
                    <p className="text-xs text-[#64748B]">Chờ duyệt</p>
                    <p className="text-lg font-bold text-amber-600 mt-1">{selectedHost.thongKeCSLT.PENDING || 0}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAFAF9] border border-[#E5E7EB] p-3 text-center">
                    <p className="text-xs text-[#64748B]">Bị từ chối</p>
                    <p className="text-lg font-bold text-rose-600 mt-1">{selectedHost.thongKeCSLT.REJECTED || 0}</p>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-[#FAFAF9] p-4 text-sm text-[#94A3B8]">
                  Host hiện chưa đăng ký cơ sở lưu trú nào.
                </p>
              )}
            </div>

            {(selectedHost.lyDoKhoa || selectedHost.lockReason) && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Lý do khóa tài khoản
                </p>

                <p className="mt-2 text-sm leading-relaxed text-red-600">
                  {selectedHost.lyDoKhoa || selectedHost.lockReason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* LOCK MODAL - MATCHING FIGMA POPUP */}
      <LockHostModal
        isOpen={lockModalOpen}
        host={selectedHost}
        initials={selectedHost ? getHostInitials(selectedHost.hoTen || selectedHost.name) : 'H'}
        onClose={() => setLockModalOpen(false)}
        onConfirm={handleLock}
      />

      {/* UNLOCK MODAL - MATCHING FIGMA POPUP */}
      <UnlockHostModal
        isOpen={unlockModalOpen}
        host={selectedHost}
        initials={selectedHost ? getHostInitials(selectedHost.hoTen || selectedHost.name) : 'H'}
        onClose={() => setUnlockModalOpen(false)}
        onConfirm={handleUnlock}
      />
    </div>
  );
};
