
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Users,
  Hotel,
  ShieldCheck,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Bot,
  Globe,
  ChevronRight,
  Eye,
  Building2,
  TrendingUp,
  CalendarDays,
  Settings,
  Sparkles,
  FileCheck,
} from 'lucide-react';

import { ROUTES } from '../../constants/routes';

const stats = [
  {
    label: 'Cơ sở chờ duyệt',
    value: '03',
    description: 'Cần được kiểm duyệt',
    icon: ClipboardCheck,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    link: ROUTES.ADMIN.MODERATION,
    tag: 'Cần xử lý',
  },
  {
    label: 'Cơ sở đang hiển thị',
    value: '148',
    description: 'Đang hoạt động công khai',
    icon: Hotel,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    link: ROUTES.ADMIN.MODERATION,
    tag: 'Đang hoạt động',
  },
  {
    label: 'Tổng tài khoản Host',
    value: '52',
    description: 'Đối tác trên hệ thống',
    icon: Users,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    link: ROUTES.ADMIN.HOST_MANAGEMENT,
    tag: 'Đối tác',
  },
  {
    label: 'Yêu cầu cần chú ý',
    value: '03',
    description: 'Công việc đang chờ xử lý',
    icon: AlertCircle,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    link: ROUTES.ADMIN.MODERATION,
    tag: 'Chờ xử lý',
  },
];

const weeklyData = [
  { day: 'T2', value: 35 },
  { day: 'T3', value: 55 },
  { day: 'T4', value: 42 },
  { day: 'T5', value: 75 },
  { day: 'T6', value: 60 },
  { day: 'T7', value: 90 },
  { day: 'CN', value: 68 },
];

const pendingHotels = [
  {
    id: 'HT001',
    name: 'Sea View Hotel Nha Trang',
    host: 'Nguyễn Văn An',
    type: 'Khách sạn',
    date: '31/10/2026',
    status: 'Chờ duyệt',
  },
  {
    id: 'HT002',
    name: 'Ocean Pearl Homestay',
    host: 'Trần Minh Khang',
    type: 'Homestay',
    date: '30/10/2026',
    status: 'Chờ duyệt',
  },
  {
    id: 'HT003',
    name: 'Sunrise Beach Resort',
    host: 'Lê Hoàng Nam',
    type: 'Resort',
    date: '29/10/2026',
    status: 'Chờ duyệt',
  },
];

const systemServices = [
  {
    name: 'AI Chatbot',
    description: 'Hỗ trợ tư vấn khách hàng',
    icon: Bot,
    status: 'Đã cấu hình',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
  },
  {
    name: 'SEO Configuration',
    description: 'Cấu hình tối ưu tìm kiếm',
    icon: Globe,
    status: 'Đã cấu hình',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
];

export const AdminDashboardPage = () => {
  const currentDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-full space-y-7 pb-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B45309]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Admin Dashboard
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
            Tổng quan hệ thống
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Theo dõi hoạt động và quản lý vận hành Hotel Nha Trang.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#E7E0D3] bg-white px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F3E8] text-[#B45309]">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-xs text-[#94A3B8]">Hôm nay</p>
            <p className="text-sm font-semibold capitalize text-[#334155]">
              {currentDate}
            </p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1E293B]">
            Chỉ số tổng quan
          </h2>
          <span className="text-xs text-[#94A3B8]">
            Dữ liệu minh họa
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.link}
                className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D6B77A] hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="text-[#CBD5E1] transition-colors group-hover:text-[#B45309]"
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-[#64748B]">
                  {item.label}
                </p>

                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className={`text-3xl font-extrabold tracking-tight ${item.color}`}>
                    {item.value}
                  </p>

                  <span className={`mb-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.bg} ${item.color}`}>
                    {item.tag}
                  </span>
                </div>

                <p className="mt-2 text-xs text-[#94A3B8]">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#1E293B]">
                Tổng quan hoạt động
              </h2>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Biểu đồ minh họa số lượng cơ sở được tiếp nhận trong tuần
              </p>
            </div>

            <span className="rounded-lg bg-[#F8F3E8] px-3 py-2 text-xs font-semibold text-[#A16207]">
              7 ngày gần đây
            </span>
          </div>

          <div className="mt-7 flex h-48 items-end justify-between gap-3 border-b border-[#E5E7EB] px-2">
            {weeklyData.map((item) => (
              <div
                key={item.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] font-semibold text-[#94A3B8]">
                  {item.value}
                </span>

                <div
                  className="w-full max-w-12 rounded-t-lg bg-[#D6B77A] transition-all duration-300 hover:bg-[#B45309]"
                  style={{ height: `${item.value}%` }}
                  title={`${item.value} cơ sở (minh họa)`}
                />

                <span className="mb-[-24px] text-xs font-medium text-[#64748B]">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#D6B77A]" />
            <span className="text-xs text-[#64748B]">
              Số cơ sở tiếp nhận (dữ liệu minh họa)
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1E293B]">
                Công việc cần xử lý
              </h2>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Những việc cần Admin quan tâm
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <ClipboardCheck size={20} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              to={ROUTES.ADMIN.MODERATION}
              className="group flex items-center gap-3 rounded-xl border border-[#F1E5CC] bg-[#FFFBF2] p-3 transition hover:border-[#D6B77A]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <FileCheck size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#334155]">
                  Kiểm duyệt cơ sở
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  03 cơ sở đang chờ duyệt
                </p>
              </div>

              <ChevronRight size={18} className="text-[#94A3B8] group-hover:text-[#B45309]" />
            </Link>

            <Link
              to={ROUTES.ADMIN.HOST_MANAGEMENT}
              className="group flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3 transition hover:border-[#CBD5E1] hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Users size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#334155]">
                  Quản lý Host
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Quản lý tài khoản đối tác
                </p>
              </div>

              <ChevronRight size={18} className="text-[#94A3B8] group-hover:text-blue-700" />
            </Link>

            <Link
              to={ROUTES.ADMIN.SYSTEM_CONFIG}
              className="group flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3 transition hover:border-[#CBD5E1] hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <Settings size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#334155]">
                  Cấu hình hệ thống
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Kiểm tra thiết lập AI và SEO
                </p>
              </div>

              <ChevronRight size={18} className="text-[#94A3B8] group-hover:text-violet-700" />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] p-5">
            <div>
              <h2 className="font-bold text-[#1E293B]">
                Cơ sở lưu trú mới gửi duyệt
              </h2>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Danh sách dữ liệu minh họa
              </p>
            </div>

            <Link
              to={ROUTES.ADMIN.MODERATION}
              className="flex items-center gap-1 text-xs font-semibold text-[#B45309] transition hover:text-[#92400E]"
            >
              Xem tất cả
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="bg-[#FAFAF9] text-xs text-[#94A3B8]">
                  <th className="px-5 py-3 font-semibold">Cơ sở lưu trú</th>
                  <th className="px-5 py-3 font-semibold">Host</th>
                  <th className="px-5 py-3 font-semibold">Ngày gửi</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold">Chi tiết</th>
                </tr>
              </thead>

              <tbody>
                {pendingHotels.map((hotel) => (
                  <tr
                    key={hotel.id}
                    className="border-t border-[#F1F5F9] transition hover:bg-[#FFFCF6]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F3E8] text-[#A16207]">
                          <Building2 size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#334155]">
                            {hotel.name}
                          </p>
                          <p className="mt-1 text-[11px] text-[#94A3B8]">
                            {hotel.id} · {hotel.type}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#64748B]">
                      {hotel.host}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#64748B]">
                      {hotel.date}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        <Clock3 size={12} />
                        {hotel.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={ROUTES.ADMIN.MODERATION}
                        title="Xem trang kiểm duyệt"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F8F3E8] hover:text-[#B45309]"
                      >
                        <Eye size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1E293B]">
                Trạng thái hệ thống
              </h2>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Cấu hình các dịch vụ
              </p>
            </div>

            <ShieldCheck size={22} className="text-emerald-600" />
          </div>

          <div className="mt-5 space-y-3">
            {systemServices.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.name}
                  className="rounded-xl border border-[#F1F5F9] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${service.bg} ${service.color}`}>
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#334155]">
                        {service.name}
                      </p>
                      <p className="mt-1 text-[11px] text-[#94A3B8]">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 size={14} />
                      {service.status}
                    </span>

                    <Link
                      to={ROUTES.ADMIN.SYSTEM_CONFIG}
                      className="text-xs font-semibold text-[#B45309] hover:underline"
                    >
                      Cấu hình
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl bg-[#F8F3E8] p-3">
            <div className="flex items-start gap-2">
              <Sparkles size={17} className="mt-0.5 shrink-0 text-[#B45309]" />
              <p className="text-xs leading-relaxed text-[#78716C]">
                Quản lý và theo dõi các thiết lập AI Chatbot, SEO tại khu vực cấu hình hệ thống.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col justify-between gap-2 border-t border-[#E5E7EB] pt-5 text-xs text-[#94A3B8] sm:flex-row sm:items-center">
        <p>Hotel Nha Trang · Admin Portal</p>
        <p>Giao diện quản trị hệ thống</p>
      </div>
    </div>
  );
};
