
import { useMemo, useState } from 'react';
import { Modal } from '../../components/common/Modal';

const initialPendingHotels = [
  {
    id: 'p-1',
    name: 'Nha Trang Chill House Homestay',
    hostName: 'Nguyễn Văn B',
    hostEmail: 'hostb@example.com',
    hostPhone: '0901234567',
    ward: 'Vạn Thạnh',
    address: '12 Nguyễn Thiện Thuật, Vạn Thạnh, Nha Trang',
    submittedAt: '10/10/2026',
    type: 'Homestay',
    description: 'Cơ sở lưu trú gần trung tâm thành phố Nha Trang, phù hợp cho khách du lịch và gia đình.',
    price: '650.000 VNĐ / đêm',
    capacity: '20 khách',
    status: 'Chờ duyệt',
  },
  {
    id: 'p-2',
    name: 'Khách sạn Biển Xanh Luxury',
    hostName: 'Trần Thị C',
    hostEmail: 'hostc@example.com',
    hostPhone: '0912345678',
    ward: 'Lộc Thọ',
    address: '25 Trần Phú, Lộc Thọ, Nha Trang',
    submittedAt: '11/10/2026',
    type: 'Khách sạn',
    description: 'Khách sạn có vị trí gần biển, cung cấp dịch vụ nghỉ dưỡng và lưu trú.',
    price: '1.200.000 VNĐ / đêm',
    capacity: '80 khách',
    status: 'Chờ duyệt',
  },
];

const initialLiveHotels = [
  {
    id: 'l-1',
    name: 'Khách sạn Mường Thanh Luxury',
    hostName: 'Nguyễn Văn A',
    hostEmail: 'hosta@example.com',
    hostPhone: '0987654321',
    ward: 'Lộc Thọ',
    address: '60 Trần Phú, Lộc Thọ, Nha Trang',
    approvedAt: '01/10/2026',
    type: 'Khách sạn',
    description: 'Khách sạn đang được hiển thị công khai trên hệ thống.',
    price: '1.500.000 VNĐ / đêm',
    capacity: '100 khách',
    status: 'Đang hiển thị',
  },
];

const Field = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
    <p className="break-words text-sm font-medium text-[#334155]">
      {value || 'Chưa cập nhật'}
    </p>
  </div>
);

export const HotelModerationPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');

  const [pendingHotels, setPendingHotels] = useState(initialPendingHotels);
  const [liveHotels, setLiveHotels] = useState(initialLiveHotels);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [hideModalOpen, setHideModalOpen] = useState(false);

  const [rejectReason, setRejectReason] = useState('');
  const [hideReason, setHideReason] = useState('');

  const currentHotels = activeTab === 'pending'
    ? pendingHotels
    : liveHotels;

  const filteredHotels = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return currentHotels;

    return currentHotels.filter((hotel) =>
      hotel.name.toLowerCase().includes(keyword) ||
      hotel.hostName.toLowerCase().includes(keyword) ||
      hotel.ward.toLowerCase().includes(keyword)
    );
  }, [currentHotels, search]);

  const openDetail = (hotel) => {
    setSelectedHotel(hotel);
    setDetailModalOpen(true);
  };

  const handleApprove = (hotel) => {
    const approvedHotel = {
      ...hotel,
      status: 'Đang hiển thị',
      approvedAt: new Date().toLocaleDateString('vi-VN'),
    };

    setPendingHotels((prev) =>
      prev.filter((item) => item.id !== hotel.id)
    );

    setLiveHotels((prev) => [...prev, approvedHotel]);

    setDetailModalOpen(false);
    setSelectedHotel(null);

    alert(
      `Đã duyệt cơ sở "${hotel.name}".\nĐây là thao tác mô phỏng trên giao diện.`
    );
  };

  const openReject = (hotel) => {
    setSelectedHotel(hotel);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = () => {
    if (!selectedHotel) return;

    const hotelName = selectedHotel.name;

    setPendingHotels((prev) =>
      prev.filter((item) => item.id !== selectedHotel.id)
    );

    setRejectModalOpen(false);
    setDetailModalOpen(false);
    setSelectedHotel(null);
    setRejectReason('');

    alert(
      `Đã từ chối cơ sở "${hotelName}".\nLý do: ${rejectReason.trim() || 'Không cung cấp'}.\nĐây là thao tác mô phỏng trên giao diện.`
    );
  };

  const openHide = (hotel) => {
    setSelectedHotel(hotel);
    setHideReason('');
    setHideModalOpen(true);
  };

  const handleHide = () => {
    if (!selectedHotel || !hideReason.trim()) return;

    const hotelName = selectedHotel.name;

    setLiveHotels((prev) =>
      prev.filter((item) => item.id !== selectedHotel.id)
    );

    setHideModalOpen(false);
    setSelectedHotel(null);
    setHideReason('');

    alert(
      `Đã gỡ cơ sở "${hotelName}".\nLý do: ${hideReason.trim()}.\nĐây là thao tác mô phỏng trên giao diện.`
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#B45309]">
          ADMIN / QUẢN LÝ NỘI DUNG
        </p>

        <h1 className="text-2xl font-bold text-[#171717] sm:text-3xl">
          Kiểm duyệt cơ sở lưu trú
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Kiểm tra thông tin, phê duyệt cơ sở mới và xử lý nội dung vi phạm.
        </p>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Cơ sở đang chờ duyệt
          </p>

          <p className="mt-3 text-3xl font-bold text-[#B45309]">
            {pendingHotels.length.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Yêu cầu cần Admin kiểm tra
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Cơ sở đang hiển thị
          </p>

          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {liveHotels.length.toString().padStart(2, '0')}
          </p>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Cơ sở được công khai trên hệ thống
          </p>
        </div>
      </div>

      {/* TABS AND SEARCH */}
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('pending');
                setSearch('');
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === 'pending'
                  ? 'bg-black text-white'
                  : 'border border-[#E5E7EB] text-[#64748B] hover:bg-[#F8F4E8]'
              }`}
            >
              Chờ duyệt ({pendingHotels.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('live');
                setSearch('');
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === 'live'
                  ? 'bg-black text-white'
                  : 'border border-[#E5E7EB] text-[#64748B] hover:bg-[#F8F4E8]'
              }`}
            >
              Đang hiển thị ({liveHotels.length})
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#1E293B]">
                {activeTab === 'pending'
                  ? 'Danh sách cơ sở chờ duyệt'
                  : 'Danh sách cơ sở đang hiển thị'}
              </h2>

              <p className="mt-1 text-xs text-[#94A3B8]">
                Có {filteredHotels.length} kết quả
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên cơ sở, Host, khu vực..."
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#B45309] sm:max-w-xs"
            />
          </div>
        </div>

        {/* TABLE */}
        {filteredHotels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#FAFAF9] text-xs font-semibold uppercase text-[#64748B]">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4">
                    Tên cơ sở
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Chủ cơ sở
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Khu vực
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    {activeTab === 'pending' ? 'Ngày gửi' : 'Ngày duyệt'}
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
                {filteredHotels.map((hotel) => (
                  <tr
                    key={hotel.id}
                    className="transition hover:bg-[#FFFCF6]"
                  >
                    <td className="max-w-[260px] px-5 py-4">
                      <p className="font-semibold text-[#1E293B]">
                        {hotel.name}
                      </p>

                      <p className="mt-1 text-xs text-[#94A3B8]">
                        {hotel.id} · {hotel.type}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[#64748B]">
                      {hotel.hostName}
                    </td>

                    <td className="px-5 py-4 text-[#64748B]">
                      {hotel.ward}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-[#64748B]">
                      {activeTab === 'pending'
                        ? hotel.submittedAt
                        : hotel.approvedAt}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                          activeTab === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {hotel.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(hotel)}
                          className="whitespace-nowrap rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#475569] transition hover:bg-[#F8F4E8]"
                        >
                          Chi tiết
                        </button>

                        {activeTab === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(hotel)}
                              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                            >
                              Duyệt
                            </button>

                            <button
                              onClick={() => openReject(hotel)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                            >
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openHide(hotel)}
                            className="whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Ẩn / Gỡ
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
              {search
                ? 'Không tìm thấy cơ sở phù hợp'
                : 'Chưa có cơ sở nào trong danh sách'}
            </p>

            <p className="mt-2 text-sm text-[#94A3B8]">
              {search
                ? 'Thử thay đổi từ khóa tìm kiếm.'
                : 'Dữ liệu sẽ được hiển thị tại đây khi có yêu cầu mới.'}
            </p>
          </div>
        )}
      </section>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi tiết cơ sở lưu trú"
        maxWidth="max-w-2xl"
      >
        {selectedHotel && (
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
            <div className="border-b border-[#E5E7EB] pb-4">
              <span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-semibold text-[#A16207]">
                {selectedHotel.status}
              </span>

              <h3 className="mt-3 text-xl font-bold text-[#1E293B]">
                {selectedHotel.name}
              </h3>

              <p className="mt-1 text-sm text-[#64748B]">
                Mã cơ sở: {selectedHotel.id}
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold text-[#1E293B]">
                Thông tin cơ sở
              </h4>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Loại hình" value={selectedHotel.type} />
                <Field label="Khu vực" value={selectedHotel.ward} />
                <Field label="Địa chỉ" value={selectedHotel.address} />
                <Field label="Sức chứa" value={selectedHotel.capacity} />
                <Field label="Giá tham khảo" value={selectedHotel.price} />
                <Field
                  label="Ngày gửi yêu cầu"
                  value={selectedHotel.submittedAt || selectedHotel.approvedAt}
                />
              </div>

              <div className="mt-5">
                <Field
                  label="Mô tả"
                  value={selectedHotel.description}
                />
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-5">
              <h4 className="mb-4 text-sm font-bold text-[#1E293B]">
                Thông tin chủ cơ sở
              </h4>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Họ tên Host" value={selectedHotel.hostName} />
                <Field label="Email" value={selectedHotel.hostEmail} />
                <Field label="Số điện thoại" value={selectedHotel.hostPhone} />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFAF9] p-4">
              <p className="text-sm font-semibold text-[#334155]">
                Hình ảnh và hồ sơ cơ sở
              </p>

              <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                Chưa có dữ liệu hình ảnh hoặc tài liệu đính kèm trong dữ liệu minh họa.
                Khi tích hợp dữ liệu thực tế, khu vực này sẽ hiển thị hồ sơ do Host cung cấp.
              </p>
            </div>

            {activeTab === 'pending' && pendingHotels.some((item) => item.id === selectedHotel.id) && (
              <div className="flex flex-col-reverse gap-2 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    openReject(selectedHotel);
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Từ chối
                </button>

                <button
                  onClick={() => handleApprove(selectedHotel)}
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Xác nhận duyệt
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Từ chối kiểm duyệt cơ sở"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#64748B]">
            Bạn đang từ chối cơ sở:
            <span className="ml-1 font-bold text-[#1E293B]">
              {selectedHotel?.name}
            </span>
          </p>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#334155]">
              Lý do từ chối (không bắt buộc)
            </label>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do để Host biết và chỉnh sửa thông tin..."
              className="w-full resize-none rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm outline-none focus:border-[#B45309]"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#475569]"
            >
              Hủy
            </button>

            <button
              onClick={handleReject}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Xác nhận từ chối
            </button>
          </div>
        </div>
      </Modal>

      {/* HIDE MODAL */}
      <Modal
        isOpen={hideModalOpen}
        onClose={() => setHideModalOpen(false)}
        title="Gỡ cơ sở khỏi hệ thống công khai"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#64748B]">
            Cơ sở
            <span className="mx-1 font-bold text-[#1E293B]">
              {selectedHotel?.name}
            </span>
            sẽ không còn được hiển thị công khai sau thao tác này.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#334155]">
              Lý do vi phạm <span className="text-red-600">*</span>
            </label>

            <textarea
              rows={4}
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              placeholder="Nhập lý do vi phạm..."
              className="w-full resize-none rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm outline-none focus:border-[#B45309]"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setHideModalOpen(false)}
              className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#475569]"
            >
              Hủy
            </button>

            <button
              onClick={handleHide}
              disabled={!hideReason.trim()}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Xác nhận gỡ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
