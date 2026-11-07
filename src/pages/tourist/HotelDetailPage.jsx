import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, X, Phone, MapPin, Loader2, Navigation, ImageOff } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AmenityIcon } from '../../components/common/AmenityIcon';
import { FacebookLogo, ZaloLogo } from '../../components/common/icons/BrandIcons';
import { listingService } from '../../services/listingService';
import {
  getCurrentPosition,
  getGeolocationPermission,
  formatDistance,
  estimateDriveMinutes,
  googleMapsEmbedUrl,
  googleMapsDirectionsUrl,
} from '../../utils/geo';
import { buildTelLink, buildZaloLink, buildFacebookLink } from '../../utils/contactLinks';

const BODY_CLASS_BOTTOM_BAR = 'has-mobile-bottom-bar';

// Giá theo định dạng thiết kế: 999.999đ
const formatPrice = (value) =>
  value === null || value === undefined ? 'Liên hệ' : `${Number(value).toLocaleString('vi-VN')}đ`;

// Số điện thoại theo định dạng 0123.456.789
const formatPhoneDots = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length === 10) return `${d.slice(0, 4)}.${d.slice(4, 7)}.${d.slice(7)}`;
  if (d.length === 11) return `${d.slice(0, 4)}.${d.slice(4, 7)}.${d.slice(7)}`;
  return phone;
};

const SafeImage = ({ src, alt, className = '', ...rest }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-[#E5E7EB] text-[#94A3B8] ${className}`}>
        <ImageOff size={24} />
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${className}`} {...rest} />;
};

/* ================================================================== */
/* LIGHTBOX: CAROUSEL ẢNH LỚN + HÀNG THUMBNAIL CUỘN                    */
/* ================================================================== */
const Lightbox = ({ images, startIndex, name, onClose }) => {
  const [active, setActive] = useState(startIndex);
  const thumbRefs = useRef([]);
  const touchX = useRef(null);
  const total = images.length;
  const go = useCallback((i) => setActive(((i % total) + total) % total), [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setActive((a) => (a - 1 + total) % total);
      if (e.key === 'ArrowRight') setActive((a) => (a + 1) % total);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, total]);

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Thư viện ảnh" className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white">
        <span className="text-sm font-medium truncate pr-4">{name}</span>
        <div className="flex items-center gap-4">
          <span className="text-sm tabular-nums text-white/70">
            {active + 1}/{total} ảnh
          </span>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer">
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        <SafeImage key={active} src={images[active]?.url} alt={`${name} - ảnh ${active + 1}`} className="max-w-full max-h-full rounded-lg object-contain" />
        {total > 1 && (
          <>
            <button type="button" onClick={() => go(active - 1)} aria-label="Ảnh trước" className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-black items-center justify-center hover:bg-white cursor-pointer">
              <ChevronLeft size={24} />
            </button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Ảnh tiếp theo" className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-black items-center justify-center hover:bg-white cursor-pointer">
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 sm:px-6 py-4 justify-start sm:justify-center">
          {images.map((img, idx) => (
            <button
              key={img.mediaId ?? idx}
              ref={(el) => (thumbRefs.current[idx] = el)}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Xem ảnh ${idx + 1}`}
              className={`w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-opacity ${
                idx === active ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-90'
              }`}
            >
              <SafeImage src={img.url} alt="" loading="lazy" className="w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================================================================== */
/* ẢNH: LƯỚI 5 ẢNH (WEB) + CAROUSEL VUỐT (MOBILE)                      */
/* ================================================================== */
const DesktopGallery = ({ images, name, onOpen }) => {
  const [main, ...rest] = images;
  const tiles = Array.from({ length: 4 }, (_, i) => rest[i]);
  return (
    <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-1 h-[340px] lg:h-[400px] rounded-2xl overflow-hidden border border-black bg-white">
      <button type="button" onClick={() => onOpen(0)} className="col-span-2 row-span-2 cursor-pointer overflow-hidden group">
        <SafeImage src={main?.url} alt={name} className="w-full h-full transition-transform duration-500 group-hover:scale-[1.03]" />
      </button>
      {tiles.map((img, i) => {
        const index = i + 1;
        const isLast = i === 3;
        return (
          <button
            key={img?.mediaId ?? `empty-${i}`}
            type="button"
            onClick={() => (img ? onOpen(index) : isLast && images.length > 1 && onOpen(0))}
            disabled={!img && !(isLast && images.length > 1)}
            className="relative overflow-hidden group cursor-pointer disabled:cursor-default"
          >
            {img ? (
              <SafeImage src={img.url} alt={`${name} - ảnh ${index + 1}`} loading="lazy" className="w-full h-full transition-transform duration-500 group-hover:scale-[1.05]" />
            ) : (
              <div className="w-full h-full bg-[#F1EEE4]" />
            )}
            {isLast && images.length > 1 && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="px-5 py-2.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/70 transition-colors">
                  Xem thêm ảnh
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const MobileGallery = ({ images, name, onOpen }) => {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <div className="md:hidden relative -mx-4 sm:-mx-6">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory aspect-[4/3] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(images.length ? images : [null]).map((img, idx) => (
          <button key={img?.mediaId ?? idx} type="button" onClick={() => img && onOpen(idx)} className="w-full h-full flex-shrink-0 snap-center">
            <SafeImage src={img?.url} alt={`${name} - ảnh ${idx + 1}`} loading={idx === 0 ? 'eager' : 'lazy'} className="w-full h-full" />
          </button>
        ))}
      </div>
      {images.length > 0 && (
        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/60 text-white text-xs font-medium tabular-nums">
          {active + 1}/{images.length} ảnh
        </span>
      )}
    </div>
  );
};

/* ================================================================== */
/* CARD WRAPPER                                                        */
/* ================================================================== */
const Card = ({ className = '', children }) => (
  <section className={`bg-white rounded-3xl border border-[#E7E2D3] shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}>{children}</section>
);

const DistanceText = ({ distance, status, onLocate, prefix = 'Cách vị trí của bạn:', approx = false }) => {
  if (distance !== null && distance !== undefined) {
    const minutes = estimateDriveMinutes(distance);
    return (
      <span>
        {prefix} {approx ? '~' : ''}
        {formatDistance(distance)}
        {minutes ? ` (khoảng ${minutes} phút đi xe)` : ''}
      </span>
    );
  }
  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[#64748B] font-medium">
        <Loader2 size={13} className="animate-spin" /> Đang xác định vị trí của bạn...
      </span>
    );
  }
  return (
    <button type="button" onClick={onLocate} className="inline-flex items-center gap-1.5 underline underline-offset-2 cursor-pointer hover:text-[#B45309]">
      {/* <Navigation size={13} /> */}
      {status === 'denied'
        ? 'Bạn chưa cho phép truy cập vị trí. Bấm để thử lại'
        : status === 'error'
          ? 'Chưa tính được khoảng cách. Bấm để thử lại'
          : 'Xem khoảng cách từ vị trí của bạn'}
    </button>
  );
};

/* ================================================================== */
/* PAGE                                                                */
/* ================================================================== */
export const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

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
  }, [id]);

  useEffect(() => {
    if (hotel?.tenCSLT) document.title = `${hotel.tenCSLT} | Hotel Nha Trang`;
  }, [hotel?.tenCSLT]);

  // Mobile có thanh liên hệ cố định dưới đáy -> đẩy nút Chatbot lên trên (xem index.css)
  useEffect(() => {
    if (status !== 'ready') return;
    document.body.classList.add(BODY_CLASS_BOTTOM_BAR);
    return () => document.body.classList.remove(BODY_CLASS_BOTTOM_BAR);
  }, [status]);

  // FR-06: lấy vị trí khách, backend tính khoảng cách đường đi thực tế
  const locateAndMeasure = useCallback(async () => {
    setDistanceStatus('loading');
    try {
      const location = await getCurrentPosition();
      setUserLocation(location);
      const preview = await listingService.getListingPreview(id, location);
      const km = preview?.khoangCach;
      setDistance(km ?? null);
      setDistanceStatus(km !== null && km !== undefined ? 'done' : 'error');
    } catch (err) {
      setDistanceStatus(err?.code === 1 ? 'denied' : 'error'); // 1 = PERMISSION_DENIED
    }
  }, [id]);

  // Tự tính nếu khách đã cấp quyền vị trí trước đó (không bật popup xin quyền khi vừa vào trang)
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
  const facilities = useMemo(() => (hotel?.tienIch || []).filter((t) => t.nhom !== 'LAN_CAN'), [hotel?.tienIch]);
  const nearby = useMemo(() => (hotel?.tienIch || []).filter((t) => t.nhom === 'LAN_CAN'), [hotel?.tienIch]);

  const tel = buildTelLink(hotel?.lienHe?.soDienThoai);
  const zalo = buildZaloLink(hotel?.lienHe?.zalo);
  const facebook = buildFacebookLink(hotel?.lienHe?.facebook);

  if (status === 'loading') return <LoadingSpinner text="Đang tải thông tin cơ sở lưu trú..." />;
  if (status !== 'ready' || !hotel) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 text-center">
        <p className="font-bold text-sm sm:text-base text-black">
          {status === 'notfound' ? 'Không tìm thấy cơ sở lưu trú' : 'Lỗi không thể tải dữ liệu'}
        </p>
      </div>
    );
  }

  const hasCoords = hotel.latitude !== null && hotel.latitude !== undefined && hotel.longitude !== null && hotel.longitude !== undefined;
  const hostName = hotel.chuCoSo?.hoTen;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 md:pt-12 pb-32 lg:pb-16">
      <MobileGallery images={images} name={hotel.tenCSLT} onOpen={setLightboxIndex} />
      <DesktopGallery images={images} name={hotel.tenCSLT} onOpen={setLightboxIndex} />

      <div className="mt-4 md:mt-11 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4 md:gap-6 lg:gap-16 items-start">
        {/* ================= CỘT TRÁI ================= */}
        <div className="space-y-4 md:space-y-6">
          {/* THẺ THÔNG TIN CHÍNH */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold">
                Đã duyệt <Check size={12} strokeWidth={3} />
              </span>
              {hotel.ngayCapNhatGia && (
                <span className="text-[11px] text-[#64748B]">• Cập nhật giá: {formatDate(hotel.ngayCapNhatGia)}</span>
              )}
            </div>

            <h1 className="mt-3 text-xl sm:text-2xl font-bold text-black leading-tight">{hotel.tenCSLT}</h1>
            <p className="mt-1 flex items-start gap-1 text-xs text-[#64748B]">
              <MapPin size={13} className="text-[#DC2626] fill-[#DC2626]/15 flex-shrink-0 mt-px" />
              <span>{hotel.diaChiChiTiet}</span>
            </p>

            <p className="mt-3 text-[11px] sm:text-xs font-semibold text-black leading-relaxed">
              <DistanceText distance={distance} status={distanceStatus} onLocate={locateAndMeasure} />
              {nearby.length > 0 && (
                <span className="font-semibold">
                  {' • '}
                  {nearby
                    .slice(0, 2)
                    .map((n) => n.tenTienIch)
                    .join(' • ')}
                </span>
              )}
            </p>

            {hostName && (
              <>
                <hr className="my-4 border-t border-[#94A3B8]/70" />
                <div className="flex items-center gap-4 pl-1">
                  <div className="w-9 h-9 rounded-full bg-[#60A5FA] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-white shadow">
                    {hostName.trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{hostName}</p>
                    <p className="text-[11px] text-[#64748B]">Tài khoản đã được xác minh</p>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* TIỆN ÍCH (FR-05) */}
          {facilities.length > 0 && (
            <Card className="p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-semibold text-black mb-3">Tiện ích</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {facilities.map((item) => (
                  <li key={item.maTienIch} className="flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-lg bg-[#F5F4F0] text-xs text-black">
                    <AmenityIcon icon={item.icon} name={item.tenTienIch} size={15} className="text-[#64748B] flex-shrink-0" />
                    <span className="truncate">{item.tenTienIch}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* VỊ TRÍ & KHOẢNG CÁCH (FR-05, FR-06) */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-xs sm:text-sm text-black mb-3">Vị trí &amp; khoảng cách</h2>
            {hasCoords ? (
              <div className="relative h-24 sm:h-32 md:h-[126px] rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#E5E7EB]">
                <iframe
                  title={`Bản đồ ${hotel.tenCSLT}`}
                  src={googleMapsEmbedUrl(hotel.latitude, hotel.longitude)}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={googleMapsDirectionsUrl(hotel.latitude, hotel.longitude, userLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 bottom-2 px-3 py-1.5 rounded-full bg-white text-[11px] font-semibold text-black shadow hover:bg-[#F8F4E8]"
                >
                  Chỉ đường
                </a>
              </div>
            ) : (
              <div className="h-24 sm:h-32 rounded-xl bg-[#E5E7EB] border border-[#CBD5E1] flex flex-col items-center justify-center text-xs font-semibold text-black">
                <MapPin size={20} className="text-[#DC2626] fill-[#DC2626] mb-1" />
                Chưa cập nhật vị trí
              </div>
            )}
            <p className="mt-3 flex items-start gap-1 text-[11px] sm:text-xs font-semibold text-black">
              <MapPin size={13} className="text-[#DC2626] fill-[#DC2626]/15 flex-shrink-0 mt-px" />
              <DistanceText distance={distance} status={distanceStatus} onLocate={locateAndMeasure} approx />
            </p>
          </Card>
        </div>

        {/* ================= CỘT PHẢI (WEB): GIÁ + LIÊN HỆ ================= */}
        <aside className="hidden lg:block sticky top-28">
          <Card className="px-5 pt-6 pb-2">
            <p className="text-[11px] text-[#64748B]">Giá tham khảo chỉ từ</p>
            <p className="mt-1 text-xl font-bold text-black">
              {formatPrice(hotel.gia)}
              <span className="text-[11px] font-normal text-[#64748B]">/đêm</span>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#15803D]">
              <span className="w-1 h-1 rounded-full bg-[#22C55E]" /> Giá niêm yết trực tiếp từ Host
            </p>

            <div className="mt-4 space-y-2">
              {tel && (
                <a href={tel} className="flex items-center justify-center gap-2 h-[30px] rounded-full border border-[#64748B] bg-[#EEF0F6] text-[10px] font-semibold text-black hover:bg-[#E2E5EE] transition-colors">
                  Liên hệ: {formatPhoneDots(hotel.lienHe.soDienThoai)}
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Fanpage Facebook" title="Fanpage Facebook" className="flex items-center justify-center h-[30px] rounded-full border border-[#64748B] bg-[#F8F4E8] hover:bg-[#F1EBD8] transition-colors">
                  <div class='m-3'>
                                      <FacebookLogo size={24} />

                  </div>
                  Facebook
                </a>
              )}
              {zalo && (
                <a href={zalo} target="_blank" rel="noopener noreferrer" aria-label="Chat Zalo" title="Chat Zalo" className="flex items-center justify-center h-[30px] rounded-full border border-[#64748B] bg-white hover:bg-[#F8F4E8] transition-colors">
                  <div class='m-3'>
                    <ZaloLogo size={24} />

                  </div>
                  Zalo
                </a>
              )}
              {!tel && !facebook && !zalo && (
                <p className="text-[11px] text-[#64748B] text-center py-2">Cơ sở chưa cập nhật thông tin liên hệ</p>
              )}
            </div>
            <p className="mt-2 mb-1 text-center text-[11px] text-[#64748B]">Liên hệ trực tiếp, không qua trung gian</p>
          </Card>
        </aside>
      </div>

      {/* ================= THANH CỐ ĐỊNH ĐÁY (MOBILE) ================= */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#E7E2D3] rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#94A3B8]">Giá chỉ từ</p>
          <p className="text-base font-bold text-black truncate">
            {hotel.gia === null || hotel.gia === undefined ? 'Liên hệ' : `${Number(hotel.gia).toLocaleString('vi-VN')}/đêm`}
          </p>
        </div>
        {tel && (
          <a href={tel} aria-label="Gọi Hotline" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
            <Phone size={16} className="fill-white" />
          </a>
        )}
        {facebook && (
          <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Fanpage Facebook" className="w-10 h-10 rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
            <FacebookLogo size={22} />
          </a>
        )}
        {zalo && (
          <a href={zalo} target="_blank" rel="noopener noreferrer" className="h-10 px-5 rounded-full border border-[#64748B] bg-[#F8F4E8] flex items-center gap-2 text-sm font-medium text-black flex-shrink-0 active:scale-95 transition-transform">
            <ZaloLogo size={22} /> Zalo
          </a>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={images} startIndex={lightboxIndex} name={hotel.tenCSLT} onClose={closeLightbox} />
      )}
    </div>
  );
};
