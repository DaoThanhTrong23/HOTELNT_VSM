/**
 * Deeplink liên hệ trực tiếp (FR-08, FR-09).
 * Trường liên hệ null/rỗng => trả null để FE ẩn nút tương ứng.
 */
const clean = (v) => (typeof v === 'string' ? v.trim() : v ? String(v) : '');

// tel: mở trình gọi điện trên điện thoại
export const buildTelLink = (phone) => {
  const v = clean(phone).replace(/[^\d+]/g, '');
  return v ? `tel:${v}` : null;
};

// zalo.me/<sđt> mở chat Zalo (app nếu đã cài, web nếu chưa)
export const buildZaloLink = (zalo) => {
  const v = clean(zalo);
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^zalo\.me\//i.test(v)) return `https://${v}`;
  let digits = v.replace(/\D/g, '');
  if (digits.startsWith('84')) digits = `0${digits.slice(2)}`;
  return digits ? `https://zalo.me/${digits}` : null;
};

// Link Fanpage Facebook: chấp nhận URL đầy đủ, "facebook.com/xxx" hoặc chỉ username
export const buildFacebookLink = (facebook) => {
  const v = clean(facebook);
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(www\.|m\.)?(facebook|fb)\.com\//i.test(v)) return `https://${v}`;
  return `https://www.facebook.com/${v.replace(/^@/, '')}`;
};

export const formatPhoneDisplay = (phone) => {
  const d = clean(phone).replace(/\D/g, '');
  if (d.length === 10) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  if (d.length === 11) return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
  return clean(phone);
};
