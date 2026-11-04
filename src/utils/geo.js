// Lấy vị trí hiện tại của khách (FR-06). Trả về { latitude, longitude }.
export const getCurrentPosition = (options = {}) =>
  new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(Object.assign(new Error('Trình duyệt không hỗ trợ định vị'), { code: 'UNSUPPORTED' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000, ...options }
    );
  });

// Kiểm tra quyền định vị đã được cấp trước đó chưa (để tự động tính khoảng cách mà không bật popup).
export const getGeolocationPermission = async () => {
  try {
    if (!navigator.permissions?.query) return 'prompt';
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state; // 'granted' | 'prompt' | 'denied'
  } catch {
    return 'prompt';
  }
};

// Khoảng cách đường chim bay (km) - chỉ dùng cho dữ liệu mock, khoảng cách thật do backend trả về.
export const haversineKm = (a, b) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const formatDistance = (km) => {
  if (km === null || km === undefined || Number.isNaN(Number(km))) return '';
  const n = Number(km);
  if (n < 1) return `${Math.round(n * 1000)} m`;
  return `${n.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km`;
};

export const googleMapsEmbedUrl = (lat, lng, zoom = 16) =>
  `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=vi&output=embed`;

export const googleMapsDirectionsUrl = (lat, lng, origin) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` +
  (origin ? `&origin=${origin.latitude},${origin.longitude}` : '') +
  '&travelmode=driving';
