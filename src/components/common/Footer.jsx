import { Link } from 'react-router-dom';
import { Palmtree, MapPin, Mail, Phone } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#CBD5E1] pt-12 pb-8 text-[#64748B] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* BRAND */}
          <div className="space-y-4">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-lg text-black">
              <Palmtree className="text-[#D97706]" size={24} />
              <span>Hotel Nha Trang</span>
            </Link>
            <p className="text-xs leading-relaxed">
              Nền tảng tra cứu, định vị và khám phá cơ sở lưu trú uy tín tại thành phố biển Nha Trang. Không qua trung gian đặt phòng.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="font-bold text-black mb-3 text-sm">Khám phá</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to={ROUTES.HOME} className="hover:text-black">Trang chủ</Link></li>
              <li><Link to={ROUTES.SEARCH} className="hover:text-black">Tìm kiếm khách sạn</Link></li>
              <li><Link to={ROUTES.SEARCH} className="hover:text-black">Khu vực trung tâm</Link></li>
              <li><Link to={ROUTES.SEARCH} className="hover:text-black">Khách sạn ven biển</Link></li>
            </ul>
          </div>

          {/* FOR PARTNERS */}
          <div>
            <h4 className="font-bold text-black mb-3 text-sm">Dành cho Chủ cơ sở</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to={ROUTES.LOGIN} className="hover:text-black">Đăng nhập Host</Link></li>
              <li><Link to={ROUTES.REGISTER} className="hover:text-black">Đăng ký trở thành Host</Link></li>
              <li><Link to={ROUTES.LOGIN} className="hover:text-black">Quy định kiểm duyệt</Link></li>
              <li><Link to={ROUTES.ADMIN.LOGIN} className="hover:text-black">Cổng quản trị nội bộ</Link></li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h4 className="font-bold text-black mb-3 text-sm">Liên hệ hỗ trợ</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-black flex-shrink-0" />
                <span>TP. Nha Trang, Khánh Hòa</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-black flex-shrink-0" />
                <span>support@hotelnt.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-black flex-shrink-0" />
                <span>1900 xxxx (8:00 - 20:00)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#CBD5E1] text-center text-xs text-[#64748B]">
          © {new Date().getFullYear()} WebApp Hotel Nha Trang. Bản quyền thuộc về đội ngũ phát triển.
        </div>
      </div>
    </footer>
  );
};
