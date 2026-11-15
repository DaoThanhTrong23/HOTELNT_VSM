import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { SITE_CONFIG, getSiteHotlineTel, getSiteSupportMailto } from '../../constants/siteConfig';
import { BrandLogo } from './BrandLogo';

export const Footer = () => {
  const { brand, contact, footer, company, social } = SITE_CONFIG;

  return (
    <footer className="bg-white border-t border-[#CBD5E1] text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8">
        {/* FOOTER CONTENT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 md:gap-8 mb-8">
          {/* BRAND */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <BrandLogo size="md" to={ROUTES.HOME} />

            <p className="text-xs leading-relaxed max-w-md text-[#64748B]">
              {footer.aboutText || brand.description}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {social.facebook.active && social.facebook.url && (
                <a
                  href={social.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#64748B] hover:text-[#1877F2] transition-colors"
                >
                  Facebook
                </a>
              )}
              {social.zalo.active && social.zalo.url && (
                <a
                  href={social.zalo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#64748B] hover:text-[#0068FF] transition-colors"
                >
                  Zalo
                </a>
              )}
              {contact.address.googleMapsUrl && (
                <a
                  href={contact.address.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-[#64748B] hover:text-black transition-colors"
                >
                  Bản đồ <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="min-w-0">
            <h4 className="font-bold text-black mb-3 text-sm">
              Khám phá
            </h4>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-black transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SEARCH} className="hover:text-black transition-colors">
                  Tìm kiếm khách sạn
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.SEARCH}?loaiHinh=Khách sạn`} className="hover:text-black transition-colors">
                  Khách sạn trung tâm
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.SEARCH}?loaiHinh=Villa`} className="hover:text-black transition-colors">
                  Villa nghỉ dưỡng ven biển
                </Link>
              </li>
            </ul>
          </div>

          {/* FOR PARTNERS */}
          <div className="min-w-0">
            <h4 className="font-bold text-black mb-3 text-sm">
              Dành cho Chủ cơ sở
            </h4>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-black transition-colors">
                  Đăng nhập Host
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="hover:text-black transition-colors">
                  Đăng ký trở thành Host
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ADMIN.LOGIN} className="hover:text-black transition-colors">
                  Cổng quản trị nội bộ (Admin)
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${contact.emails.partnership || contact.emails.support}`}
                  className="hover:text-black transition-colors"
                >
                  Liên hệ hợp tác
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="col-span-2 md:col-span-1 min-w-0 md:text-left">
            <h4 className="font-bold text-black mb-3 text-sm">
              Liên hệ hỗ trợ
            </h4>

            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-black flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {contact.address.full || contact.address.short}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <Mail size={15} className="text-black flex-shrink-0 mt-0.5" />
                <a
                  href={getSiteSupportMailto()}
                  className="break-all leading-relaxed hover:text-black hover:underline transition-colors"
                >
                  {contact.emails.support}
                </a>
              </li>

              <li className="flex items-start gap-2">
                <Phone size={15} className="text-black flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <a
                    href={getSiteHotlineTel()}
                    className="font-bold text-black hover:underline"
                  >
                    {contact.hotline}
                  </a>
                  {contact.workingHours && (
                    <span className="block text-[11px] text-[#94A3B8] mt-0.5">
                      {contact.workingHours}
                    </span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* LEGAL COMPANY BAR (NẾU CÓ THÔNG TIN CÔNG TY) */}
        {company.legalName && (
          <div className="pt-4 pb-4 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8] leading-relaxed">
            <p className="font-semibold text-[#64748B]">{company.legalName}</p>
            {company.taxCode && !company.taxCode.includes('Chưa cập nhật') && (
              <p>Mã số doanh nghiệp: {company.taxCode} - {company.businessLicense}</p>
            )}
          </div>
        )}

        {/* COPYRIGHT & DISCLAIMER */}
        <div className="pt-5 sm:pt-6 border-t border-[#CBD5E1] text-center text-[11px] sm:text-xs text-[#64748B] leading-relaxed">
          <p>{footer.copyright}</p>
          {footer.disclaimer && (
            <p className="text-[10px] sm:text-[11px] text-[#94A3B8] mt-1 max-w-2xl mx-auto">
              {footer.disclaimer}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
