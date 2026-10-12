import { useState } from 'react';
import { Lock, User, Phone, Mail, CreditCard, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const HostProfilePage = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Nguyễn Văn Host');
  const [phone, setPhone] = useState(user?.phone || '0905123456');

  // CÁC TRƯỜNG READ-ONLY THEO CHUẨN SRS (FR-13)
  const readonlyEmail = user?.email || 'host@nhatrang.com';
  const readonlyCccd = '056098765432'; // CCCD định danh cố định

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('Cập nhật thông tin Họ tên và Số điện thoại thành công!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert('Xác nhận mật khẩu mới không khớp.');
    }
    alert('Đổi mật khẩu thành công!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-black">Quản Lý Tài Khoản Host</h1>
        <p className="text-sm text-[#64748B]">
          Xem thông tin pháp lý định danh và cập nhật kênh liên lạc
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORM 1: THÔNG TIN CÁ NHÂN */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white p-8 rounded-2xl border border-[#CBD5E1] shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2 font-bold text-base text-black pb-3 border-b border-[#CBD5E1]">
            <User size={18} />
            <span>Thông tin liên lạc</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Họ và tên chủ cơ sở</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
            />
          </div>

          {/* TRƯỜNG EMAIL READ-ONLY (FR-13) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#64748B]">Email định danh (Chỉ đọc)</label>
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Lock size={12} /> Bị khóa
              </span>
            </div>
            <div className="w-full px-4 py-2.5 bg-[#CBD5E1]/40 border border-[#CBD5E1] rounded-xl text-sm text-[#64748B] flex items-center justify-between">
              <span>{readonlyEmail}</span>
              <Lock size={14} className="text-[#64748B]" />
            </div>
          </div>

          {/* TRƯỜNG CCCD READ-ONLY (FR-13) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#64748B]">Số CCCD pháp lý (Chỉ đọc)</label>
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Lock size={12} /> Bị khóa
              </span>
            </div>
            <div className="w-full px-4 py-2.5 bg-[#CBD5E1]/40 border border-[#CBD5E1] rounded-xl text-sm text-[#64748B] flex items-center justify-between">
              <span>{readonlyCccd.slice(0, 4)}********{readonlyCccd.slice(-2)}</span>
              <Lock size={14} className="text-[#64748B]" />
            </div>
            <p className="text-[11px] text-[#64748B]">
              * Email và Số CCCD là thông tin định danh pháp lý, muốn thay đổi vui lòng liên hệ Admin.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-85 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            <span>Lưu thông tin liên lạc</span>
          </button>
        </form>

        {/* FORM 2: ĐỔI MẬT KHẨU */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white p-8 rounded-2xl border border-[#CBD5E1] shadow-xs space-y-5 h-fit"
        >
          <div className="flex items-center gap-2 font-bold text-base text-black pb-3 border-b border-[#CBD5E1]">
            <KeyRound size={18} />
            <span>Đổi mật khẩu</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Mật khẩu mới</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự..."
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl border border-black text-black text-sm font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
};
