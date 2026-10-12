import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Hotel, Clock, CheckCircle2, AlertTriangle, Eye, Edit3, Trash2, Send, RotateCcw } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HOTEL_STATUS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';

export const HostDashboardPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Thay bằng hotelService.getHostHotels()
    setTimeout(() => {
      setHotels([
        {
          id: 'h-1',
          name: 'Khách sạn Mường Thanh Luxury',
          address: 'Trần Phú, Lộc Thọ, Nha Trang',
          status: HOTEL_STATUS.APPROVED,
          createdAt: '2026-09-15',
          thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
        },
        {
          id: 'h-2',
          name: 'Nha Trang Chill House Homestay',
          address: 'Hoàng Hoa Thám, Nha Trang',
          status: HOTEL_STATUS.PENDING,
          createdAt: '2026-10-02',
          thumbnail: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=200&auto=format&fit=crop&q=80',
        },
        {
          id: 'h-3',
          name: 'Villa Biển Gọi Bãi Tiên',
          address: 'Phạm Văn Đồng, Nha Trang',
          status: HOTEL_STATUS.REJECTED,
          createdAt: '2026-09-28',
          thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&auto=format&fit=crop&q=80',
        },
        {
          id: 'h-4',
          name: 'Căn hộ view biển Mường Thanh Viễn Triều',
          address: 'Hòn Chồng, Nha Trang',
          status: HOTEL_STATUS.DRAFT,
          createdAt: '2026-10-10',
          thumbnail: null,
        },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const stats = [
    { label: 'Tổng cơ sở', value: hotels.length, icon: Hotel, color: 'text-black' },
    {
      label: 'Đang hiển thị',
      value: hotels.filter((h) => h.status === HOTEL_STATUS.APPROVED).length,
      icon: CheckCircle2,
      color: 'text-[#15803D]',
    },
    {
      label: 'Chờ duyệt',
      value: hotels.filter((h) => h.status === HOTEL_STATUS.PENDING).length,
      icon: Clock,
      color: 'text-[#B45309]',
    },
    {
      label: 'Bị từ chối',
      value: hotels.filter((h) => h.status === HOTEL_STATUS.REJECTED).length,
      icon: AlertTriangle,
      color: 'text-[#DC2626]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Bảng Điều Khiển Host</h1>
          <p className="text-sm text-[#64748B]">Tổng quan và danh sách cơ sở lưu trú của bạn</p>
        </div>
        <Link
          to={ROUTES.HOST.ADD_HOTEL}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-85 transition-opacity"
        >
          <Plus size={18} />
          <span>Thêm cơ sở mới</span>
        </Link>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">{item.label}</span>
                <Icon size={18} className={item.color} />
              </div>
              <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* DATA TABLE (BẢNG QUẢN LÝ DỰA TRÊN TRẠNG THÁI) */}
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#CBD5E1]">
          <h3 className="font-bold text-base text-black">Danh sách cơ sở gần đây</h3>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAFA] text-[#64748B] text-xs uppercase font-semibold border-b border-[#CBD5E1]">
                <tr>
                  <th className="py-4 px-6">Cơ sở lưu trú</th>
                  <th className="py-4 px-6">Ngày tạo</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]/60">
                {hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-[#F8F4E8]/50 transition-colors">
                    {/* HOTEL INFO */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#CBD5E1] overflow-hidden flex-shrink-0">
                          {hotel.thumbnail ? (
                            <img src={hotel.thumbnail} alt={hotel.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#64748B]">
                              No img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-black">{hotel.name}</p>
                          <p className="text-xs text-[#64748B]">{hotel.address}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-[#64748B] text-xs">{hotel.createdAt}</td>

                    {/* STATUS BADGE */}
                    <td className="py-4 px-6">
                      <StatusBadge status={hotel.status} />
                    </td>

                    {/* DYNAMIC ACTIONS THEO SRS */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/hotel/${hotel.id}`}
                          title="Xem trước"
                          className="p-2 rounded-lg text-[#64748B] hover:text-black hover:bg-[#F8F4E8]"
                        >
                          <Eye size={16} />
                        </Link>

                        {/* Nếu là Đã duyệt: cho phép Sửa (Cảnh báo chuyển về chờ duyệt) */}
                        {hotel.status === HOTEL_STATUS.APPROVED && (
                          <Link
                            to={`/host/hotels/${hotel.id}/edit`}
                            title="Chỉnh sửa thông tin"
                            className="p-2 rounded-lg text-[#64748B] hover:text-black hover:bg-[#F8F4E8]"
                          >
                            <Edit3 size={16} />
                          </Link>
                        )}

                        {/* Nếu là Chờ duyệt: cho phép Rút lại */}
                        {hotel.status === HOTEL_STATUS.PENDING && (
                          <button
                            title="Rút lại yêu cầu kiểm duyệt"
                            className="p-2 rounded-lg text-[#B45309] hover:bg-[#FEE8A8]/40 cursor-pointer"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}

                        {/* Nếu là Bản nháp hoặc Bị từ chối: cho phép Edit, Submit hoặc Delete */}
                        {(hotel.status === HOTEL_STATUS.DRAFT || hotel.status === HOTEL_STATUS.REJECTED) && (
                          <>
                            <Link
                              to={`/host/hotels/${hotel.id}/edit`}
                              title="Tiếp tục chỉnh sửa"
                              className="p-2 rounded-lg text-[#64748B] hover:text-black hover:bg-[#F8F4E8]"
                            >
                              <Edit3 size={16} />
                            </Link>
                            <button
                              title="Gửi duyệt"
                              className="p-2 rounded-lg text-[#15803D] hover:bg-[#DCFCE7]/60 cursor-pointer"
                            >
                              <Send size={16} />
                            </button>
                            <button
                              title="Xóa bài viết"
                              className="p-2 rounded-lg text-[#DC2626] hover:bg-[#F4A9A9]/30 cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
