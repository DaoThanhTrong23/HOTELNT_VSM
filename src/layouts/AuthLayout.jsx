import { Outlet } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { SITE_CONFIG, getSiteSupportMailto } from '../constants/siteConfig';

export const AuthLayout = () => {
  const { contact } = SITE_CONFIG;

  return (
    <div className="min-h-screen bg-[#F8F4E8] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* BRAND HEADER */}
      <div className="mb-8">
        <BrandLogo size="lg" />
      </div>

      {/* CARD CONTAINER */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#CBD5E1] shadow-xl p-8">
        <Outlet />
      </div>

      {/* FOOTER */}
      <p className="mt-8 text-xs text-[#64748B]">
        Cần hỗ trợ? Liên hệ{' '}
        <a
          href={getSiteSupportMailto()}
          className="text-black font-semibold underline hover:text-[#D97706] transition-colors"
        >
          {contact.emails.support}
        </a>
      </p>
    </div>
  );
};
