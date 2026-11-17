import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../constants/siteConfig';
import { ROUTES } from '../../constants/routes';

/**
 * Component BrandLogo
 * - Chế độ mặc định: Hiển thị chữ thương hiệu "HOTELNT" đậm nét, hiện đại chuẩn phong cách Figma.
 * - Khi công ty cung cấp file ảnh logo (SITE_CONFIG.logo.displayMode = 'image' & có imageUrl):
 *   Tự động render thẻ <img> với kích thước phù hợp và hỗ trợ fallback sang text.
 */
export const BrandLogo = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  showText = true,
  className = '',
  textClassName = '',
  to = ROUTES.HOME,
  variant = 'default', // 'default' | 'dark' | 'white'
  id,
}) => {
  const { brand, logo } = SITE_CONFIG;

  const sizeMap = {
    sm: { imgHeight: 'h-6', text: 'text-base font-black tracking-tight' },
    md: { imgHeight: 'h-8 sm:h-9', text: 'text-lg sm:text-xl font-black tracking-tight' },
    lg: { imgHeight: 'h-10 sm:h-12', text: 'text-2xl sm:text-3xl font-black tracking-tight' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center ${className}`}>
      {logo?.displayMode === 'image' && logo?.imageUrl ? (
        <img
          src={variant === 'dark' && logo.imageUrlDark ? logo.imageUrlDark : logo.imageUrl}
          alt={logo.altText || brand.name}
          className={`${currentSize.imgHeight} w-auto object-contain`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}

      {showText && (
        <span
          className={`
            ${currentSize.text}
            ${variant === 'white' ? 'text-white' : 'text-black'}
            font-black tracking-tight select-none
            ${textClassName}
          `}
        >
          {brand?.name || 'HOTELNT'}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} id={id} className="inline-flex items-center hover:opacity-85 transition-opacity">
        {content}
      </Link>
    );
  }

  return <div id={id}>{content}</div>;
};

export default BrandLogo;
