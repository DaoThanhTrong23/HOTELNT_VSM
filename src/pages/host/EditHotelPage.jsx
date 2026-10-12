import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const EditHotelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [minPrice, setMinPrice] = useState(1200000);
  const [maxPrice, setMaxPrice] = useState(3500000);
  const [isApproved, setIsApproved] = useState(true); // Demo: bài viết đang ở trạng thái Đã duyệt

  useEffect(() => {
    // Mock load
    setName('Khách sạn Mường Thanh Luxury');
  }, [id]);

  const handleSave = (e) => {
    e.preventDefault();
    if (isApproved) {
      const confirmReset = window.confirm(
        'CẢNH BÁO: Vì cơ sở này đang ở trạng thái [ĐÃ DUYỆT], việc lưu chỉnh sửa sẽ đưa bài viết về trạng thái [CHỜ DUYỆT] để Admin kiểm duyệt lại từ đầu. Bạn có chắc chắn muốn lưu?'
      );
      if (!confirmReset) return;
    }

    alert('Cập nhật thành công! Trạng thái đã chuyển về Chờ duyệt.');
    navigate(ROUTES.HOST.DASHBOARD);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.HOST.DASHBOARD)}
          className="p-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8F4E8] cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black">Chỉnh Sửa Cơ Sở Lưu Trú</h1>
          <p className="text-xs text-[#64748B]">Mã cơ sở: {id}</p>
        </div>
      </div>

      {isApproved && (
        <div className="p-4 rounded-xl bg-[#FEE8A8]/50 border border-[#FFC107] text-xs text-[#B45309] flex items-center gap-3">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <span>
            Lưu ý: Mọi chỉnh sửa trên cơ sở đã duyệt sẽ kích hoạt quy trình kiểm duyệt lại của Quản trị viên (FR-15, FR-17).
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-[#CBD5E1] space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-black">Tên cơ sở lưu trú</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Giá từ (VNĐ)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black">Giá đến (VNĐ)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-85 cursor-pointer"
        >
          <Save size={16} />
          <span>Lưu thay đổi</span>
        </button>
      </form>
    </div>
  );
};
