// Logo thương hiệu dạng SVG nội tuyến (lucide không có icon Facebook/Zalo).
export const FacebookLogo = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      fill="#fff"
      d="M16.67 15.47 17.2 12h-3.33V9.75c0-.95.47-1.87 1.96-1.87h1.51V4.92s-1.37-.23-2.69-.23c-2.74 0-4.53 1.66-4.53 4.67V12H7.08v3.47h3.04V24a12.1 12.1 0 0 0 3.75 0v-8.53h2.8Z"
    />
  </svg>
);

export const ZaloLogo = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
    <rect width="48" height="48" rx="11" fill="#0068FF" />
    <text
      x="24"
      y="29.5"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight="700"
      fontSize="15"
      fill="#fff"
    >
      Zalo
    </text>
  </svg>
);

// Icon bong bóng chat dùng cho nút mở Chatbot và avatar bot.
export const ChatBubbleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 3C6.48 3 2 6.92 2 11.75c0 2.47 1.18 4.7 3.07 6.29L4.3 21.2a.6.6 0 0 0 .86.67l3.6-1.84c1.02.31 2.11.47 3.24.47 5.52 0 10-3.92 10-8.75S17.52 3 12 3Z"
    />
    <circle cx="8" cy="11.75" r="1.25" fill="#000" />
    <circle cx="12" cy="11.75" r="1.25" fill="#000" />
    <circle cx="16" cy="11.75" r="1.25" fill="#000" />
  </svg>
);
