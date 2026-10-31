import { useMemo, useState } from 'react';
import { Modal } from '../../components/common/Modal';

const initialHosts = [
  {
    id: 'HOST001',
    name: 'Nguyễn Văn Host 1',
    phone: '0905123456',
    email: 'host1@hotelnt.com',
    hotelCount: 3,
    createdAt: '15/08/2026',
    isLocked: false,
    hotels: [
      'Sea View Hotel Nha Trang',
      'Ocean Pearl Homestay',
      'Sunrise Beach Resort',
    ],
  },
  {
    id: 'HOST002',
    name: 'Trần Thị Host 2',
    phone: '0987654321',
    email: 'host2@hotelnt.com',
    hotelCount: 1,
    createdAt: '20/08/2026',
    isLocked: true,
    lockReason: 'Vi phạm chính sách đăng tải thông tin.',
    hotels: ['Biển Xanh Luxury Hotel'],
  },
  {
    id: 'HOST003',
    name: 'Lê Hoàng Nam',
    phone: '0912345678',
    email: 'nam@hotelnt.com',
    hotelCount: 2,
    createdAt: '05/09/2026',
    isLocked: false,
    hotels: ['Nha Trang Central Hotel', 'Blue Ocean Homestay'],
  },
  {
    id: 'HOST004',
    name: 'Phạm Minh Anh',
    phone: '0934567890',
    email: 'minhanh@hotelnt.com',
    hotelCount: 1,
    createdAt: '12/09/2026',
    isLocked: false,
    hotels: ['Golden Sand Resort'],
  },
  {
    id: 'HOST005',
    name: 'Trần Quốc Bảo',
    phone: '0978123456',
    email: 'bao@hotelnt.com',
    hotelCount: 0,
    createdAt: '20/09/2026',
    isLocked: true,
    lockReason: 'Tài khoản có dấu hiệu đăng tải thông tin không chính xác.',
    hotels: [],
  },
];

export const HostManagementPage = () => {
  const [hosts, setHosts] = useState(initialHosts);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedHost, setSelectedHost] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const [lockReason, setLockReason] = useState('');

  const activeCount = hosts.filter((host) => !host.isLocked).length;
  const lockedCount = hosts.filter((host) => host.isLocked).length;

  const filteredHosts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return hosts.filter((host) => {
      const matchesSearch =
        host.name.toLowerCase().includes(keyword) ||
        host.email.toLowerCase().includes(keyword) ||
        host.phone.includes(keyword) ||
        host.id.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !host.isLocked) ||
        (statusFilter === 'locked' && host.isLocked);

      return matchesSearch && matchesStatus;
    });
  }, [hosts, searchTerm, statusFilter]);

  const openDetail = (host) => {
    setSelectedHost(host);
    setDetailModalOpen(true);
  };

  const openLockModal = (host) => {
    setSelectedHost(host);
    setLockReason('');
    setLockModalOpen(true);
  };

  const openUnlockModal = (host) => {
    setSelectedHost(host);
    setUnlockModalOpen(true);
  };

  const handleLock = () => {
    if (!selectedHost || !lockReason.trim()) return;

    setHosts((prev) =>
      prev.map((host) =>
        host.id === selectedHost.id
          ? {
              ...host,
              isLocked: true,
              lockReason: lockReason.trim(),
            }
          : host
      )
    );

    setLockModalOpen(false);
    setDetailModalOpen(false);
    setSelectedHost(null);
    setLockReason('');

    alert('Đã khóa tài khoản Host thành công. Đây là thao tác mô phỏng Frontend.');
  };

  const handleUnlock = () => {
    if (!selectedHost) return;

    setHosts((prev) =>
      prev.map((host) =>
        host.id === selectedHost.id
          ? {
              ...host,
              isLocked: false,
              lockReason: '',
            }
          : host
      )
    );

    setUnlockModalOpen(false);
    setSelectedHost(null);

    alert('Đã mở khóa tài khoản Host thành công. Đây là thao tác mô phỏng Frontend.');
  };

  return (
    <div className="space-y-6 pb-8">
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
            {hosts.length.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Tổng đối tác trên hệ thống
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Tài khoản hoạt động
          </p>

          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {activeCount.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Đối tác có thể sử dụng hệ thống
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Tài khoản bị khóa
          </p>

          <p className="mt-3 text-3xl font-bold text-red-600">
            {lockedCount.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Tài khoản đang bị hạn chế
          </p>
        </div>
      </div>

      {/* HOST TABLE */}
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        {/* FILTER */}
        <div className="space-y-4 border-b border-[#E5E7EB] p-5">
          <div>
            <h2 className="font-bold text-[#1E293B]">
              Danh sách đối tác Host
            </h2>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Hiển thị {filteredHosts.length} / {hosts.length} tài khoản
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã Host, số điện thoại hoặc email..."
              className="min-w-0 flex-1 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B45309]"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#475569] outline-none focus:border-[#B45309] lg:w-52"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        {filteredHosts.length > 0 ? (
          <div className="overflow-x-auto">
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
                {filteredHosts.map((host) => (
                  <tr
                    key={host.id}
                    className="transition hover:bg-[#FFFCF6]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1E293B]">
                        {host.name}
                      </p>

                      <p className="mt-1 text-xs text-[#94A3B8]">
                        {host.id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-[#475569]">{host.phone}</p>
                      <p className="mt-1 text-xs text-[#94A3B8]">
                        {host.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#334155]">
                      {host.hotelCount.toString().padStart(2, '0')} cơ sở
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[#64748B]">
                      {host.createdAt}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                          host.isLocked
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {host.isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(host)}
                          className="whitespace-nowrap rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#475569] transition hover:bg-[#F8F4E8]"
                        >
                          Chi tiết
                        </button>

                        {host.isLocked ? (
                          <button
                            onClick={() => openUnlockModal(host)}
                            className="whitespace-nowrap rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                          >
                            Mở khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => openLockModal(host)}
                            className="whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Khóa tài khoản
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
            <div className="border-b border-[#E5E7EB] pb-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedHost.isLocked
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {selectedHost.isLocked ? 'Đã khóa' : 'Đang hoạt động'}
              </span>

              <h3 className="mt-3 text-xl font-bold text-[#1E293B]">
                {selectedHost.name}
              </h3>

              <p className="mt-1 text-sm text-[#94A3B8]">
                Mã tài khoản: {selectedHost.id}
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold text-[#1E293B]">
                Thông tin cá nhân
              </h4>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#94A3B8]">Họ và tên</p>
                  <p className="mt-1 text-sm font-medium text-[#334155]">
                    {selectedHost.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#94A3B8]">Số điện thoại</p>
                  <p className="mt-1 text-sm font-medium text-[#334155]">
                    {selectedHost.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#94A3B8]">Email</p>
                  <p className="mt-1 break-all text-sm font-medium text-[#334155]">
                    {selectedHost.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#94A3B8]">Ngày tham gia</p>
                  <p className="mt-1 text-sm font-medium text-[#334155]">
                    {selectedHost.createdAt}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-5">
              <h4 className="mb-3 text-sm font-bold text-[#1E293B]">
                Cơ sở lưu trú thuộc quyền quản lý
              </h4>

              <p className="mb-3 text-xs text-[#94A3B8]">
                Tổng số: {selectedHost.hotelCount} cơ sở
              </p>

              {selectedHost.hotels.length > 0 ? (
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
              ) : (
                <p className="rounded-xl bg-[#FAFAF9] p-4 text-sm text-[#94A3B8]">
                  Host hiện chưa đăng ký cơ sở lưu trú nào.
                </p>
              )}
            </div>

            {selectedHost.isLocked && selectedHost.lockReason && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Lý do khóa tài khoản
                </p>

                <p className="mt-2 text-sm leading-relaxed text-red-600">
                  {selectedHost.lockReason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* LOCK MODAL */}
      <Modal
        isOpen={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        title="Khóa tài khoản Host"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#64748B]">
            Bạn đang thực hiện khóa tài khoản của
            <span className="mx-1 font-bold text-[#1E293B]">
              {selectedHost?.name}
            </span>.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#334155]">
              Lý do khóa tài khoản
              <span className="ml-1 text-red-600">*</span>
            </label>

            <textarea
              rows={4}
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              placeholder="Nhập lý do khóa tài khoản..."
              className="w-full resize-none rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm outline-none focus:border-[#B45309]"
            />

            {!lockReason.trim() && (
              <p className="text-xs text-[#94A3B8]">
                Vui lòng nhập lý do trước khi xác nhận.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setLockModalOpen(false)}
              className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#475569]"
            >
              Hủy
            </button>

            <button
              onClick={handleLock}
              disabled={!lockReason.trim()}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Xác nhận khóa
            </button>
          </div>
        </div>
      </Modal>

      {/* UNLOCK MODAL */}
      <Modal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        title="Mở khóa tài khoản Host"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#64748B]">
            Bạn có chắc chắn muốn mở khóa tài khoản
            <span className="mx-1 font-bold text-[#1E293B]">
              {selectedHost?.name}
            </span>?
          </p>

          {selectedHost?.lockReason && (
            <div className="rounded-xl bg-[#FAFAF9] p-4">
              <p className="text-xs font-semibold text-[#64748B]">
                Lý do khóa trước đó
              </p>

              <p className="mt-2 text-sm text-[#475569]">
                {selectedHost.lockReason}
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setUnlockModalOpen(false)}
              className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#475569]"
            >
              Hủy
            </button>

            <button
              onClick={handleUnlock}
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Xác nhận mở khóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
