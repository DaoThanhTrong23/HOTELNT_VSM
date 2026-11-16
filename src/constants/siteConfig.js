
export const SITE_CONFIG = {
  // ── 1. THÔNG TIN THƯƠNG HIỆU & WEBSITE ─────────────────────────────────────
  brand: {
    name: 'HOTELNT',
    shortName: 'HOTELNT',

    tagline: 'Nền tảng tra cứu và kết nối cơ sở lưu trú uy tín tại Nha Trang',

    // Mô tả ngắn gọn về website dùng ở Header, Footer, SEO
    description:
      'Nền tảng tra cứu, định vị và khám phá cơ sở lưu trú uy tín tại thành phố biển Nha Trang. Kết nối trực tiếp giữa du khách và chủ cơ sở, không qua trung gian đặt phòng.',

    // Tên miền chính thức của website
    domain: 'hotelnt.vn',

    // URL trang web đầy đủ
    websiteUrl: 'https://hotelnt.vn',
  },

  // ── 2. CẤU HÌNH LOGO & FAVICON ─────────────────────────────────────────────
  logo: {
    /**
     * Chế độ hiển thị logo:
     * - 'icon': Dùng icon biểu tượng (Palmtree/Hotel) kết hợp chữ tên thương hiệu (mặc định hiện tại)
     * - 'image': Dùng file ảnh logo chính thức do công ty cung cấp (PNG, SVG, WebP)
     * - 'text': Chỉ hiển thị chữ
     */
    displayMode: 'text', 

    imageUrl: '', 

    // Logo phiên bản nền tối (nếu có logo âm bản cho header/footer đen)
    imageUrlDark: '',

    // Logo biểu tượng vuông nhỏ gọn (dùng trên mobile hoặc favicon)
    iconUrl: '', // VD: '/favicon.ico' hoặc '/icon-192.png'

    // Kích thước hiển thị đề xuất của ảnh logo (pixel hoặc CSS string)
    width: 'auto',
    height: '36px',

    // Thuộc tính alt text của logo để tối ưu SEO
    altText: 'Logo HotelNT - Cơ sở lưu trú Nha Trang',
  },

  // ── 3. THÔNG TIN LIÊN HỆ & TỔNG ĐÀI HỖ TRỢ ────────────────────────────────
  contact: {
    // Hotline hiển thị ra giao diện
    hotline: '1900 xxxx',

    // Chuỗi số điện thoại dùng cho thẻ link <a href="tel:...">
    hotlineRaw: '1900xxxx',

    // Số điện thoại hỗ trợ khẩn cấp
    emergencyPhone: '0901 234 567',

    // Khung giờ làm việc của tổng đài hỗ trợ
    workingHours: '8:00 - 20:00 (Thứ 2 - Chủ Nhật)',

    // Danh sách email chính thức theo từng bộ phận
    emails: {
      // Email hỗ trợ khách hàng và du khách chung
      support: 'support@hotelnt.com',

      // Email tiếp nhận thông tin đối tác, đăng ký Host
      partnership: 'partner@hotelnt.com',

      // Email liên hệ công việc, truyền thông, quảng cáo
      contact: 'contact@hotelnt.com',
    },

    // Địa chỉ trụ sở / Văn phòng đại diện
    address: {
      // Địa chỉ ngắn gọn (hiển thị trên thẻ nhỏ, navbar, mobile)
      short: 'TP. Nha Trang, Khánh Hòa',

      // Địa chỉ đầy đủ hiển thị ở Footer
      full: 'Đường Trần Phú, Phường Lộc Thọ, Thành phố Nha Trang, Tỉnh Khánh Hòa',

      // Link bản đồ vị trí văn phòng trên Google Maps
      googleMapsUrl: 'https://maps.google.com/?q=Nha+Trang,+Khánh+Hòa',
    },
  },

  // ── 4. THÔNG TIN DOANH NGHIỆP & PHÁP LÝ (CHO FOOTER DOANH NGHIỆP) ─────────
  company: {
    // Tên pháp nhân đầy đủ của công ty chủ quản
    legalName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ & DU LỊCH HOTEL NHA TRANG',

    // Mã số thuế / Mã số doanh nghiệp (MST)
    taxCode: 'Chưa cập nhật (Đang cập nhật)',

    // Giấy phép kinh doanh / Giấy phép hoạt động
    businessLicense: 'Giấy chứng nhận ĐKDN số: Đang cập nhật do Sở Kế hoạch và Đầu tư Tỉnh Khánh Hòa cấp',

    // Người đại diện theo pháp luật
    representative: 'Đang cập nhật',

    // Ngày thành lập / ngày cấp phép
    establishedDate: '2026',
  },

  // ── 5. MẠNG XÃ HỘI & CÁC KÊNH TRUYỀN THÔNG (SOCIAL LINKS) ───────────────────
  social: {
    // Trang Fanpage Facebook chính thức
    facebook: {
      name: 'Facebook',
      url: 'https://facebook.com/hotelnhatrang',
      active: true,
    },

    // Trang / Số điện thoại Zalo Official Account
    zalo: {
      name: 'Zalo',
      url: 'https://zalo.me/hotelnhatrang',
      active: true,
    },

    // Kênh YouTube giới thiệu du lịch Nha Trang (nếu có)
    youtube: {
      name: 'YouTube',
      url: '',
      active: false,
    },

    // Kênh TikTok (nếu có)
    tiktok: {
      name: 'TikTok',
      url: '',
      active: false,
    },

    // Trang Instagram
    instagram: {
      name: 'Instagram',
      url: '',
      active: false,
    },
  },

  // ── 6. THÔNG TIN CHÂN TRANG (FOOTER DETAILS) ──────────────────────────────
  footer: {
    // Đoạn giới thiệu hiển thị dưới logo ở Footer
    aboutText:
      'Nền tảng tra cứu, định vị và khám phá cơ sở lưu trú uy tín tại thành phố biển Nha Trang. Kết nối trực tiếp du khách và chủ cơ sở, cam kết giá thật và không qua trung gian.',

    // Bản quyền hiển thị cuối trang
    copyright: `© ${new Date().getFullYear()} Hotel Nha Trang. Bản quyền thuộc về đội ngũ phát triển.`,

    // Tuyên bố miễn trừ trách nhiệm
    disclaimer:
      'Thông tin về cơ sở lưu trú, hình ảnh và giá phòng do các chủ cơ sở cung cấp và chịu trách nhiệm theo quy định kiểm duyệt của hệ thống.',

    // Chứng nhận Bộ Công Thương / Đã đăng ký website TMĐT (khi công ty có logo huy hiệu)
    certifications: {
      showBoCongThuongBadge: false, // Bật true khi công ty có logo thông báo Bộ Công Thương
      boCongThuongUrl: '',
      showDmcaBadge: false,
    },

    // Các liên kết chính sách & điều khoản
    policyLinks: [
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Quy chế kiểm duyệt', href: '/moderation-policy' },
      { label: 'Giải quyết khiếu nại', href: '/dispute-resolution' },
    ],
  },
};

/**
 * Helper: Tạo link gọi điện thoại chuẩn click-to-call
 */
export const getSiteHotlineTel = () => `tel:${SITE_CONFIG.contact.hotlineRaw}`;

/**
 * Helper: Tạo link gửi email chuẩn mailto
 */
export const getSiteSupportMailto = () => `mailto:${SITE_CONFIG.contact.emails.support}`;

export default SITE_CONFIG;
