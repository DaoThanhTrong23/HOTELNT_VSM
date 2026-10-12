import { useState } from 'react';
import { Check, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const HotelModerationPage = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'live'

  // MODAL STATES
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hideReason, setHideReason] = useState('');

  const [pendingHotels, setPendingHotels] = useState([
    {
      id: 'p-1',
      name: 'Nha Trang Chill House Homestay',
      hostName: 'Nguyễn Văn B',
      ward: 'Vạn Thạnh',
      submittedAt: '10/10/2026',
    },
    {
      id: 'p-2',
      name: 'Khách sạn Biển Xanh Luxury',
      hostName: 'Trần Thị C',
      ward: 'Lộc Thọ',
      submittedAt: '11/10/2026',
    },
  ]);

  const [liveHotels, setLiveHotels] = useState([
    {
      id: 'l-1',
      name: 'Khách sạn Mường Thanh Luxury',
      hostName: 'Nguyễn Văn A',
      ward: 'Lộc Thọ',
      approvedAt: '01/10/2026',
    },
  ]);

  // DUYỆT (FR-22)
  const handleApprove = (hotel) => {
    alert(`Đã duyệt cơ sở "${hotel.name}". Cơ sở đã được public ngay lập tức cho Tourist tìm kiếm.`);
    setPendingHotels(pendingHotels.filter((h) => h.id !== hotel.id));
    setLiveHotels([...liveHotels, { ...hotel, approvedAt: 'Hôm nay' }]);
  };

  // TỪ CHỐI (FR-23)
  const handleConfirmReject = () => {
    alert(
      `Đã từ chối cơ sở "${selectedHotel?.name}". Hệ thống đã gửi email thông báo cho Host${
        rejectReason ? ` kèm lý do: "${rejectReason}"` : ''
      }.`
    );
    setPendingHotels(pendingHotels.filter((h) => h.id !== selectedHotel.id));
    setRejectModalOpen(false);
    setRejectReason('');
  };

  // ẨN / GỠ NỘI DUNG VI PHẠM (FR-24)
  const handleConfirmHide = () => {
    alert(`Đã ẩn cơ sở "${selectedHotel?.name}" khỏi ứng dụng công khai do vi phạm: "${hideReason}".`);
    setLiveHotels(liveHotels.filter((h) => h.id !== selectedHotel.id));
    setHideModalOpen(false);
    setHideReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Kiểm Duyệt & Quản Lý Nội Dung</h1>
        <p className="text-sm text-[#64748B]">
          Phê duyệt cơ sở mới đăng ký hoặc xử lý bài đăng vi phạm chính sách
        </p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[#CBD5E1] bg-white rounded-t-2xl px-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-4 px-6 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'border-black text-black'
              : 'border-transparent text-[#64748B] hover:text-black'
          }`}
        >
          <span>Danh sách Chờ duyệt</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#FEE8A8] text-[#B45309]">
            {pendingHotels.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`py-4 px-6 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer ${
            activeTab === 'live'
              ? 'border-black text-black'
              : 'border-transparent text-[#64748B] hover:text-black'
          }`}
        >
          <span>Đang hiển thị (Live)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#DCFCE7] text-[#15803D]">
            {liveHotels.length}
          </span>
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-b-2xl border border-t-0 border-[#CBD5E1] overflow-hidden shadow-xs">
        {activeTab === 'pending' ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAFAFA] text-[#64748B] text-xs uppercase font-semibold border-b border-[#CBD5E1]">
              <tr>
                <th className="py-4 px-6">Tên cơ sở</th>
                <th className="py-4 px-6">Chủ cơ sở</th>
                <th className="py-4 px-6">Khu vực</th>
                <th className="py-4 px-6">Ngày gửi</th>
                <th className="py-4 px-6 text-right">Hành động kiểm duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]/60">
              {pendingHotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-[#F8F4E8]/50">
                  <td className="py-4 px-6 font-bold text-black">{hotel.name}</td>
                  <td className="py-4 px-6 text-[#64748B]">{hotel.hostName}</td>
                  <td className="py-4 px-6 text-[#64748B]">{hotel.ward}</td>
                  <td className="py-4 px-6 text-[#64748B] text-xs">{hotel.submittedAt}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(hotel)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1 hover:opacity-85 cursor-pointer"
                      >
                        <Check size={14} /> Duyệt
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setRejectModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-semibold flex items-center gap-1 hover:opacity-85 cursor-pointer"
                      >
                        <X size={14} /> Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAFAFA] text-[#64748B] text-xs uppercase font-semibold border-b border-[#CBD5E1]">
              <tr>
                <th className="py-4 px-6">Tên cơ sở</th>
                <th className="py-4 px-6">Chủ cơ sở</th>
                <th className="py-4 px-6">Khu vực</th>
                <th className="py-4 px-6">Ngày duyệt</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]/60">
              {liveHotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-[#F8F4E8]/50">
                  <td className="py-4 px-6 font-bold text-black">{hotel.name}</td>
                  <td className="py-4 px-6 text-[#64748B]">{hotel.hostName}</td>
                  <td className="py-4 px-6 text-[#64748B]">{hotel.ward}</td>
                  <td className="py-4 px-6 text-[#64748B] text-xs">{hotel.approvedAt}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedHotel(hotel);
                        setHideModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-[#DC2626] text-[#DC2626] text-xs font-semibold flex items-center gap-1 hover:bg-[#F4A9A9]/20 ml-auto cursor-pointer"
                    >
                      <EyeOff size={14} /> Ẩn / Gỡ nội dung
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP TỪ CHỐI DUYỆT (FR-23) */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Từ Chối Kiểm Duyệt Cơ Sở"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B]">
            Cơ sở <span className="font-bold text-black">{selectedHotel?.name}</span> sẽ bị chuyển về trạng thái Bị từ chối. Host có thể sửa đổi và gửi duyệt lại.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">
              Lý do từ chối (Tùy chọn - Sẽ gửi qua email cho Host):
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Hình ảnh mờ, tọa độ ghim chưa chuẩn xác..."
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-4 py-2 rounded-lg bg-[#DC2626] text-white text-xs font-semibold hover:opacity-85"
            >
              Xác nhận từ chối
            </button>
          </div>
        </div>
      </Modal>

      {/* POPUP ẨN BÀI ĐĂNG VI PHẠM (FR-24) */}
      <Modal
        isOpen={hideModalOpen}
        onClose={() => setHideModalOpen(false)}
        title="Gỡ Bài Đăng Vi Phạm Khỏi Ứng Dụng"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B]">
            Cơ sở <span className="font-bold text-black">{selectedHotel?.name}</span> sẽ lập tức ngừng hiển thị trên ứng dụng của Khách du lịch.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Lý do vi phạm *</label>
            <textarea
              rows={3}
              required
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              placeholder="VD: Báo cáo thông tin sai lệch, hình ảnh không phù hợp..."
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setHideModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmHide}
              disabled={!hideReason.trim()}
              className="px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:opacity-85 disabled:opacity-50"
            >
              Xác nhận gỡ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
