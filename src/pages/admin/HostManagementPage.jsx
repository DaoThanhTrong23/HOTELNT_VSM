import { useState } from 'react';
import { Search, Lock, Unlock, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const HostManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [lockReason, setLockReason] = useState('');

  const [hosts, setHosts] = useState([
    {
      id: 'h-1',
      name: 'Nguyễn Văn Host 1',
      phone: '0905123456',
      email: 'host1@hotelnt.com',
      hotelCount: 3,
      isLocked: false,
    },
    {
      id: 'h-2',
      name: 'Trần Thị Host 2',
      phone: '0987654321',
      email: 'host2@hotelnt.com',
      hotelCount: 1,
      isLocked: true,
    },
  ]);

  const handleToggleLock = () => {
    setHosts(
      hosts.map((h) =>
        h.id === selectedHost.id ? { ...h, isLocked: !h.isLocked } : h
      )
    );
    alert(
      `Đã ${selectedHost.isLocked ? 'mở khóa' : 'khóa'} tài khoản Host "${selectedHost.name}"!`
    );
    setLockModalOpen(false);
    setLockReason('');
  };

  const filteredHosts = hosts.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.phone.includes(searchTerm) ||
      h.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Quản Lý Tài Khoản Chủ Cơ Sở</h1>
        <p className="text-sm text-[#64748B]">Tìm kiếm, theo dõi và khóa tài khoản Host vi phạm (FR-20)</p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-md relative flex items-center">
        <Search className="absolute left-3.5 text-[#64748B]" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Tên, SĐT hoặc Email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAFAFA] text-[#64748B] text-xs uppercase font-semibold border-b border-[#CBD5E1]">
            <tr>
              <th className="py-4 px-6">Tên chủ cơ sở</th>
              <th className="py-4 px-6">Liên hệ</th>
              <th className="py-4 px-6">Số lượng CSLT</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CBD5E1]/60">
            {filteredHosts.map((host) => (
              <tr key={host.id} className="hover:bg-[#F8F4E8]/50">
                <td className="py-4 px-6 font-bold text-black">{host.name}</td>
                <td className="py-4 px-6 text-xs text-[#64748B]">
                  <p>{host.phone}</p>
                  <p>{host.email}</p>
                </td>
                <td className="py-4 px-6 font-semibold text-black">{host.hotelCount} cơ sở</td>
                <td className="py-4 px-6">
                  {host.isLocked ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F4A9A9] text-[#DC2626]">
                      Bị khóa
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                      Hoạt động
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => {
                      setSelectedHost(host);
                      setLockModalOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                      host.isLocked
                        ? 'bg-[#15803D] text-white hover:opacity-85'
                        : 'border border-[#DC2626] text-[#DC2626] hover:bg-[#F4A9A9]/20'
                    }`}
                  >
                    {host.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                    <span>{host.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP XÁC NHẬN KHÓA/MỞ KHÓA */}
      <Modal
        isOpen={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        title={selectedHost?.isLocked ? 'Mở Khóa Tài Khoản Host' : 'Khóa Tài Khoản Host'}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B]">
            Bạn có chắc chắn muốn {selectedHost?.isLocked ? 'mở khóa' : 'khóa'} tài khoản đối tác{' '}
            <span className="font-bold text-black">{selectedHost?.name}</span>?
          </p>

          {!selectedHost?.isLocked && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black">Lý do khóa tài khoản *</label>
              <textarea
                rows={3}
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản..."
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setLockModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleToggleLock}
              className={`px-4 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-85 ${
                selectedHost?.isLocked ? 'bg-[#15803D]' : 'bg-[#DC2626]'
              }`}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
