import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Navigation,
  Building2,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
  ExternalLink,
  Loader2,
  ImageOff,
  ArrowLeft,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { AmenityIcon } from '../../components/common/AmenityIcon';
import { listingService } from '../../services/listingService';
import {
  getCurrentPosition,
  getGeolocationPermission,
  formatDistance,
  googleMapsEmbedUrl,
  googleMapsDirectionsUrl,
} from '../../utils/geo';
import {
  buildTelLink,
  buildZaloLink,
  buildFacebookLink,
  formatPhoneDisplay,
} from '../../utils/contactLinks';
import { ROUTES } from '../../constants/routes';

const FacebookIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* CAROUSEL ẢNH LỚN + HÀNG THUMBNAIL CUỘN                              */
/* ------------------------------------------------------------------ */
const ImageGallery = ({ images, name }) => {
  const [active, setActive] = useState(0);
  const thumbRefs = useRef([]);
  const touchStartX = useRef(null);
  const total = images.length;

  const go = useCallback((idx) => setActive(((idx % total) + total) % total), [total]);

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  if (!total) {
    return (
      <div className="aspect-video sm:aspect-21/9 rounded-3xl bg-[#CBD5E1]/60 flex flex-col items-center justify-center gap-2 text-[#64748B]">
        <ImageOff size={32} />
        <span className="text-sm">Cơ sở chưa có hình ảnh</span>
      </div>
    );
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    if (e.key === 'ArrowRight') go(active + 1);
  };
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return (
    <section className="space-y-3" aria-label="Thư viện ảnh">
      <div
        className="relative aspect-video sm:aspect-21/9 rounded-3xl overflow-hidden bg-[#CBD5E1] group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((img, idx) => (
          <img
            key={img.mediaId ?? idx}
            src={img.url}
            alt={`${name} - ảnh ${idx + 1}`}
            loading={idx === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 w-full h-full object-cover text-transparent transition-opacity duration-500 ${
              idx === active ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-black shadow-md flex items-center justify-center hover:bg-white cursor-pointer sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Ảnh tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-black shadow-md flex items-center justify-center hover:bg-white cursor-pointer sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-semibold tabular-nums">
          {active + 1} / {total}
        </span>
      </div>

      {total > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x" role="tablist" aria-label="Chọn ảnh">
          {images.map((img, idx) => (
            <button
              key={img.mediaId ?? idx}
              ref={(el) => (thumbRefs.current[idx] = el)}
              type="button"
              role="tab"
              aria-selected={active === idx}
              aria-label={`Xem ảnh ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 snap-start cursor-pointer transition-all ${
                active === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover text-transparent" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* BADGE KHOẢNG CÁCH THỰC TẾ (FR-06)                                   */
/* ------------------------------------------------------------------ */
const DistanceBadge = ({ status, distance, onLocate }) => {
  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F4E8] border border-[#CBD5E1] text-xs font-semibold text-[#64748B]">
        <Loader2 size={13} className="animate-spin" /> Đang xác định vị trí...
      </span>
    );
  }
  if (status === 'done' && distance !== null && distance !== undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold">
        <Navigation size={13} className="text-[#FBBF24]" />
        Cách bạn {formatDistance(distance)} đường đi
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onLocate}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black text-xs font-semibold text-black hover:bg-[#F8F4E8] cursor-pointer"
      title={status === 'denied' ? 'Bạn đã chặn quyền vị trí. Hãy cho phép trong cài đặt trình duyệt rồi thử lại.' : undefined}
    >
      <LocateFixed size={13} />
      {status === 'denied' ? 'Chưa có quyền vị trí. Thử lại' : 'Xem khoảng cách từ vị trí của bạn'}
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* CỤM 3 NÚT LIÊN HỆ (FR-08, FR-09)                                    */
/* ------------------------------------------------------------------ */
const useContactActions = (lienHe) =>
  useMemo(() => {
    const tel = buildTelLink(lienHe?.soDienThoai);
    const zalo = buildZaloLink(lienHe?.zalo);
    const facebook = buildFacebookLink(lienHe?.facebook);
    return [
      tel && {
        key: 'tel',
        href: tel,
        label: 'Gọi Hotline',
        sub: formatPhoneDisplay(lienHe.soDienThoai),
        Icon: Phone,
        className: 'bg-black text-white hover:opacity-85',
      },
      zalo && {
        key: 'zalo',
        href: zalo,
        label: 'Chat Zalo',
        Icon: MessageCircle,
        external: true,
        className: 'bg-[#0068FF] text-white hover:opacity-90',
      },
      facebook && {
        key: 'facebook',
        href: facebook,
        label: 'Fanpage',
        Icon: FacebookIcon,
        external: true,
        className: 'bg-white text-[#1877F2] border border-[#CBD5E1] hover:bg-[#F8F4E8]',
      },
    ].filter(Boolean);
  }, [lienHe]);

const ContactLink = ({ action, compact = false }) => {
  const { href, label, sub, Icon, external, className } = action;
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${
        compact ? 'flex-1 flex-col gap-0.5 py-2 text-[11px]' : 'w-full py-3.5 px-4 text-sm'
      } ${className}`}
    >
      <Icon size={compact ? 20 : 18} />
      <span>{label}</span>
      {!compact && sub && <span className="font-normal opacity-75">({sub})</span>}
    </a>
  );
};

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */
export const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [reloadKey, setReloadKey] = useState(0);

  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distanceStatus, setDistanceStatus] = useState('idle'); // idle | loading | done | denied | error

  // FR-07: tải chi tiết CSLT
  useEffect(() => {
    let cancelled = false;
    listingService
      .getListingDetail(id)
      .then((data) => {
        if (cancelled) return;
        setHotel(data);
        setDistance(data?.khoangCach ?? null);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        const code = err?.response?.status;
        setStatus(code === 404 || code === 400 ? 'notfound' : 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    if (hotel?.tenCSLT) document.title = `${hotel.tenCSLT} | Hotel Nha Trang`;
  }, [hotel?.tenCSLT]);

  // FR-06: lấy vị trí khách rồi để backend tính khoảng cách đường đi thực tế
  const locateAndMeasure = useCallback(async () => {
    setDistanceStatus('loading');
    try {
      const location = await getCurrentPosition();
      setUserLocation(location);
      const preview = await listingService.getListingPreview(id, location);
      setDistance(preview?.khoangCach ?? null);
      setDistanceStatus(preview?.khoangCach !== null && preview?.khoangCach !== undefined ? 'done' : 'error');
    } catch (err) {
      setDistanceStatus(err?.code === 1 ? 'denied' : 'error'); // 1 = PERMISSION_DENIED
    }
  }, [id]);

  // Tự tính khoảng cách nếu khách đã cấp quyền vị trí từ trước (không bật popup xin quyền).
  useEffect(() => {
    if (status !== 'ready') return;
    let cancelled = false;
    getGeolocationPermission().then((perm) => {
      if (!cancelled && perm === 'granted') locateAndMeasure();
    });
    return () => {
      cancelled = true;
    };
  }, [status, locateAndMeasure]);

  const images = useMemo(
    () => [...(hotel?.hinhAnh || [])].sort((a, b) => (a.thuTu ?? 0) - (b.thuTu ?? 0)),
    [hotel?.hinhAnh]
  );
  const videos = useMemo(
    () => [...(hotel?.video || [])].sort((a, b) => (a.thuTu ?? 0) - (b.thuTu ?? 0)),
    [hotel?.video]
  );
  const amenityGroups = useMemo(() => {
    const list = hotel?.tienIch || [];
    return [
      { key: 'TIEN_NGHI', title: 'Tiện ích tại cơ sở', items: list.filter((t) => t.nhom !== 'LAN_CAN') },
      { key: 'LAN_CAN', title: 'Địa điểm lân cận', items: list.filter((t) => t.nhom === 'LAN_CAN') },
    ].filter((g) => g.items.length);
  }, [hotel?.tienIch]);
  const contactActions = useContactActions(hotel?.lienHe);

  if (status === 'loading') return <LoadingSpinner text="Đang tải thông tin cơ sở lưu trú..." />;
  if (status === 'notfound') {
    return (
      <div className="px-4 py-16">
        <EmptyState
          title="Không tìm thấy cơ sở lưu trú"
          message="Cơ sở này không tồn tại, chưa được duyệt hoặc đã tạm ẩn. Bạn hãy thử tìm cơ sở khác nhé."
          actionText="Về trang chủ"
          onAction={() => navigate(ROUTES.HOME)}
        />
      </div>
    );
  }
  if (status === 'error' || !hotel) {
    return (
      <div className="px-4 py-16">
        <ErrorState
          message="Không thể tải thông tin cơ sở lưu trú. Vui lòng kiểm tra kết nối và thử lại."
          onAction={() => {
            setStatus('loading');
            setReloadKey((k) => k + 1);
          }}
        />
      </div>
    );
  }

  const hasCoords = hotel.latitude !== null && hotel.latitude !== undefined && hotel.longitude !== null && hotel.longitude !== undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12 space-y-8">
      {/* BREADCRUMB + HEADER */}
      <div className="space-y-3">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-black"
        >
          <ArrowLeft size={16} /> Quay lại
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {hotel.tenLoai && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">{hotel.tenLoai}</span>
          )}
          {hotel.tenPhuong && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#CBD5E1] text-[#64748B]">
              {hotel.tenPhuong}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-black leading-tight">{hotel.tenCSLT}</h1>
        <div className="flex items-start gap-2 text-sm text-[#64748B]">
          <MapPin size={16} className="text-black flex-shrink-0 mt-0.5" />
          <span>{hotel.diaChiChiTiet}</span>
        </div>
      </div>

      <ImageGallery images={images} name={hotel.tenCSLT} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* GIÁ + ĐẠI DIỆN (hiện trên mobile, desktop nằm trong cột phải) */}
          <div className="lg:hidden bg-white p-6 rounded-3xl border border-[#CBD5E1] space-y-4">
            <PriceBlock hotel={hotel} />
            <HostBlock hostName={hotel.chuCoSo?.hoTen} />
          </div>

          {hotel.moTa && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD5E1] space-y-3">
              <h2 className="text-xl font-bold text-black">Giới thiệu</h2>
              <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-line">{hotel.moTa}</p>
            </section>
          )}

          {/* GRID TIỆN ÍCH KÈM ICON */}
          {amenityGroups.length > 0 && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD5E1] space-y-6">
              {amenityGroups.map((group) => (
                <div key={group.key} className="space-y-4">
                  <h2 className="text-xl font-bold text-black">{group.title}</h2>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {group.items.map((item) => (
                      <li
                        key={item.maTienIch}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8F4E8] border border-[#CBD5E1]/60 text-sm text-black"
                      >
                        <span className="w-9 h-9 rounded-xl bg-white text-[#B45309] flex items-center justify-center flex-shrink-0 border border-[#CBD5E1]/60">
                          <AmenityIcon icon={item.icon} name={item.tenTienIch} size={18} />
                        </span>
                        <span className="leading-snug">{item.tenTienIch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {videos.length > 0 && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
              <h2 className="text-xl font-bold text-black">Video</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((v) => (
                  <video key={v.mediaId} src={v.url} controls preload="metadata" className="w-full rounded-2xl bg-black aspect-video" />
                ))}
              </div>
            </section>
          )}

          {/* BẢN ĐỒ + BADGE KHOẢNG CÁCH (FR-05, FR-06) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD5E1] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-black">Vị trí trên bản đồ</h2>
              <DistanceBadge status={distance !== null && distanceStatus === 'idle' ? 'done' : distanceStatus} distance={distance} onLocate={locateAndMeasure} />
            </div>
            {distanceStatus === 'error' && (
              <p className="text-xs text-[#DC2626]">Không tính được khoảng cách lúc này. Bạn thử lại sau nhé.</p>
            )}

            {hasCoords ? (
              <>
                <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] bg-[#CBD5E1]">
                  <iframe
                    title={`Bản đồ ${hotel.tenCSLT}`}
                    src={googleMapsEmbedUrl(hotel.latitude, hotel.longitude)}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <a
                  href={googleMapsDirectionsUrl(hotel.latitude, hotel.longitude, userLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:text-[#B45309]"
                >
                  <Navigation size={16} /> Chỉ đường bằng Google Maps <ExternalLink size={14} />
                </a>
              </>
            ) : (
              <div className="h-48 rounded-2xl bg-[#F8F4E8] flex items-center justify-center text-sm text-[#64748B]">
                Cơ sở chưa cập nhật vị trí trên bản đồ
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN (DESKTOP): GIÁ, ĐẠI DIỆN, CỤM NÚT LIÊN HỆ CỐ ĐỊNH */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white p-7 rounded-3xl border border-[#CBD5E1] shadow-lg sticky top-28 space-y-5">
            <PriceBlock hotel={hotel} />
            <HostBlock hostName={hotel.chuCoSo?.hoTen} />
            {contactActions.length > 0 ? (
              <div className="space-y-3">
                {contactActions.map((a) => (
                  <ContactLink key={a.key} action={a} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">Cơ sở chưa cập nhật thông tin liên hệ.</p>
            )}
            <p className="text-[11px] text-[#64748B] text-center leading-relaxed">
              Liên hệ trực tiếp với chủ cơ sở, không qua trung gian, không thu phí hoa hồng.
            </p>
          </div>
        </aside>
      </div>

      {/* MOBILE: THANH 3 NÚT CỐ ĐỊNH ĐÁY MÀN HÌNH (chừa chỗ bên phải cho nút Chatbot) */}
      {contactActions.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#CBD5E1] pl-3 pr-[84px] py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {contactActions.map((a) => (
            <ContactLink key={a.key} action={a} compact />
          ))}
        </div>
      )}
    </div>
  );
};

const PriceBlock = ({ hotel }) => (
  <div>
    <span className="text-xs text-[#64748B] block mb-1">Giá tham khảo từ</span>
    <div className="text-2xl sm:text-3xl font-black text-black">
      {formatCurrency(hotel.gia)}
    </div>
    {hotel.ngayCapNhatGia && (
      <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-2">
        <Calendar size={14} />
        <span>Cập nhật giá ngày {formatDate(hotel.ngayCapNhatGia)}</span>
      </div>
    )}
  </div>
);

const HostBlock = ({ hostName }) =>
  hostName ? (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F8F4E8] border border-[#CBD5E1]">
      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
        {hostName.trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Building2 size={13} /> Đại diện cơ sở
        </div>
        <p className="font-bold text-sm text-black">{hostName}</p>
      </div>
    </div>
  ) : null;
