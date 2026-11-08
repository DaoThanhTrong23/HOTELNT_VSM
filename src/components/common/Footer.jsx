
import { Link } from 'react-router-dom';
import { Palmtree, MapPin, Mail, Phone } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#CBD5E1] text-[#64748B]">

      <div className="
        max-w-7xl mx-auto
        px-4 sm:px-6 lg:px-8
        pt-8 sm:pt-10 md:pt-12
        pb-6 sm:pb-8
      ">

        {/* FOOTER CONTENT */}
        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-x-6
          gap-y-8
          md:gap-8
          mb-8
        ">

          {/* BRAND */}
          <div className="col-span-2 md:col-span-1 space-y-3">

            <Link
              to={ROUTES.HOME}
              className="
                flex items-center gap-2
                font-bold text-lg
                text-black
                w-fit
              "
            >
              <Palmtree
                className="text-[#D97706] flex-shrink-0"
                size={24}
              />

              <span>Hotel Nha Trang</span>
            </Link>

            <p className="
              text-xs
              leading-relaxed
              max-w-md
              text-[#64748B]
            ">
              Nền tảng tra cứu, định vị và khám phá cơ sở lưu trú uy tín
              tại thành phố biển Nha Trang. Không qua trung gian đặt phòng.
            </p>

          </div>


          {/* QUICK LINKS */}
          <div className="min-w-0">

            <h4 className="
              font-bold text-black
              mb-3
              text-sm
            ">
              Khám phá
            </h4>

            <ul className="space-y-2.5 text-xs">

              <li>
                <Link
                  to={ROUTES.HOME}
                  className="hover:text-black transition-colors"
                >
                  Trang chủ
                </Link>
              </li>

              <li>
                <Link
                  to={ROUTES.SEARCH}
                  className="hover:text-black transition-colors"
                >
                  Tìm kiếm khách sạn
                </Link>
              </li>

              <li>
                <Link
                  to={ROUTES.SEARCH}
                  className="hover:text-black transition-colors"
                >
                  Khu vực trung tâm
                </Link>
              </li>

              <li>
                <Link
                  to={ROUTES.SEARCH}
                  className="hover:text-black transition-colors"
                >
                  Khách sạn ven biển
                </Link>
              </li>

            </ul>

          </div>


          {/* FOR PARTNERS */}
          <div className="min-w-0">

            <h4 className="
              font-bold text-black
              mb-3
              text-sm
            ">
              Dành cho Chủ cơ sở
            </h4>

            <ul className="space-y-2.5 text-xs">

              <li>
                <Link
                  to={ROUTES.LOGIN}
                  className="hover:text-black transition-colors"
                >
                  Đăng nhập Host
                </Link>
              </li>

              <li>
                <Link
                  to={ROUTES.REGISTER}
                  className="hover:text-black transition-colors"
                >
                  Đăng ký trở thành Host
                </Link>
              </li>

              <li>
                <Link
                  to={ROUTES.LOGIN}
                  className="hover:text-black transition-colors"
                >
                  Quy định kiểm duyệt
                </Link>
              </li>

              <li>
                <Link
                  to={ROUTES.ADMIN.LOGIN}
                  className="hover:text-black transition-colors"
                >
                  Cổng quản trị nội bộ
                </Link>
              </li>

            </ul>

          </div>


          {/* CONTACT INFO */}
          <div className="col-span-2 md:col-span-1 min-w-0 md:text-left">
            <h4 className="
              font-bold text-black
              mb-3
              text-sm
            ">
              Liên hệ hỗ trợ
            </h4>

            <ul className="space-y-3 text-xs">

              <li className="flex items-start gap-2 ">

                <MapPin
                  size={15}
                  className="text-black flex-shrink-0 mt-0.5"
                />

                <span className="leading-relaxed">
                  TP. Nha Trang, Khánh Hòa
                </span>

              </li>

              <li className="flex items-start gap-2">

                <Mail
                  size={15}
                  className="text-black flex-shrink-0 mt-0.5"
                />

                <span className="break-all leading-relaxed">
                  support@hotelnt.com
                </span>

              </li>

              <li className="flex items-start gap-2">

                <Phone
                  size={15}
                  className="text-black flex-shrink-0 mt-0.5"
                />

                <span className="leading-relaxed">
                  1900 xxxx (8:00 - 20:00)
                </span>

              </li>

            </ul>

          </div>

        </div>


        {/* COPYRIGHT */}
        <div className="
          pt-5 sm:pt-6
          border-t border-[#CBD5E1]
          text-center
          text-[11px] sm:text-xs
          text-[#64748B]
          leading-relaxed
        ">

          © {new Date().getFullYear()} WebApp Hotel Nha Trang.

          <span className="block sm:inline sm:ml-1">
            Bản quyền thuộc về đội ngũ phát triển.
          </span>

        </div>

      </div>

    </footer>
  );
};
