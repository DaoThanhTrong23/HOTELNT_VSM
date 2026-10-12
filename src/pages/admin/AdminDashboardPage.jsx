import { Link } from 'react-router-dom';
import { ClipboardCheck, Users, Hotel, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const AdminDashboardPage = () => {
  const stats = [
    { label: 'Cơ sở chờ duyệt', value: '3', icon: ClipboardCheck, color: 'text-[#B45309]', link: ROUTES.ADMIN.MODERATION },
    { label: 'Cơ sở đang hiển thị', value: '148', icon: Hotel, color: 'text-[#15803D]', link: ROUTES.ADMIN.MODERATION },
    { label: 'Tổng tài khoản Host', value: '52', icon: Users, color: 'text-black', link: ROUTES.ADMIN.HOST_MANAGEMENT },
    { label: 'Hệ thống AI & SEO', value: 'Hoạt động', icon: ShieldCheck, color: 'text-[#D97706]', link: ROUTES.ADMIN.SYSTEM_CONFIG },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Tổng Quan Hệ Thống Quản Trị</h1>
        <p className="text-sm text-[#64748B]">Theo dõi các chỉ số vận hành và kiểm duyệt nội dung</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.link}
              className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-2xs hover:border-black transition-all space-y-3 block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">{item.label}</span>
                <Icon size={20} className={item.color} />
              </div>
              <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
