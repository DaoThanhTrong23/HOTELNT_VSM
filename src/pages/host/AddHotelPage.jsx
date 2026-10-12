import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { PRICE_LIMITS, MEDIA_LIMITS, NHA_TRANG_MAP_BOUNDS } from '../../constants/enums';
import { isInsideNhaTrang } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const AddHotelPage = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [listingId, setListingId] = useState(null); // UUID sinh ra sau khi lưu Tab 1
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // FORM DATA STATES
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    type: 'Khách sạn',
    ward: 'Lộc Thọ',
    address: '',
    description: '',
    phone: '',
    zalo: '',
    facebook: '',
  });

  const [priceAndAmenities, setPriceAndAmenities] = useState({
    minPrice: 500000,
    maxPrice: 1500000,
    amenities: ['Wifi miễn phí'],
  });

  const [images, setImages] = useState([]);
  const [coordinates, setCoordinates] = useState({
    lat: NHA_TRANG_MAP_BOUNDS.DEFAULT_CENTER.lat,
    lng: NHA_TRANG_MAP_BOUNDS.DEFAULT_CENTER.lng,
  });

  const wardsInNhaTrang = [
    'Lộc Thọ',
    'Vạn Thạnh',
    'Vĩnh Hải',
    'Vĩnh Hòa',
    'Vĩnh Phước',
    'Vĩnh Thọ',
    'Phước Hải',
    'Tân Lập',
    'Phước Tân',
    'Phương Sài',
  ];

  const standardAmenities = [
    'Wifi miễn phí',
    'Hồ bơi vô cực',
    'Giáp biển',
    'Chỗ đỗ xe ô tô',
    'Điều hòa nhiệt độ',
    'Buffet sáng',
    'Thang máy',
    'Lễ tân 24/7',
  ];

  // TAB 1: LƯU TẠO MỚI ĐỂ LẤY UUID (FR-14)
  const handleSaveDraft = (e) => {
    e?.preventDefault();
    if (!basicInfo.name || !basicInfo.address) {
      return setError('Vui lòng điền đầy đủ Tên cơ sở và Địa chỉ cụ thể.');
    }

    setError('');
    // Giả lập lưu tạo bản nháp và sinh UUID
    const generatedId = 'uuid-' + Date.now();
    setListingId(generatedId);
    setSuccess('Đã lưu bản nháp thành công! Bạn có thể tiếp tục cập nhật Media và Tọa độ.');
    setTimeout(() => setSuccess(''), 3000);
  };

  // CHECKLIST ĐIỀU KIỆN ĐỂ BẤM "GỬI KIỂM DUYỆT" (FR-18)
  const handleSubmitModeration = () => {
    setError('');

    if (!listingId) {
      return setError('Vui lòng lưu bản nháp ở Tab 1 trước khi gửi duyệt.');
    }
    if (images.length < MEDIA_LIMITS.IMAGE_MIN) {
      return setError(`Cần tải lên tối thiểu ${MEDIA_LIMITS.IMAGE_MIN} hình ảnh của cơ sở.`);
    }
    if (priceAndAmenities.minPrice < PRICE_LIMITS.MIN_VND || priceAndAmenities.maxPrice > PRICE_LIMITS.MAX_VND) {
      return setError('Khoảng giá phải nằm trong giới hạn 50.000 đ đến 100.000.000 đ.');
    }
    if (!isInsideNhaTrang(coordinates.lat, coordinates.lng)) {
      return setError('Vị trí chọn nằm ngoài khu vực hỗ trợ TP. Nha Trang (Vĩ độ: 12.1-12.45, Kinh độ: 109.1-109.3).');
    }

    // Gửi duyệt thành công -> Chuyển về Dashboard
    alert('Gửi yêu cầu kiểm duyệt thành công! Cơ sở đã chuyển sang trạng thái "Chờ duyệt" và bị khóa sửa đổi.');
    navigate(ROUTES.HOST.DASHBOARD);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-black">Thêm Cơ Sở Lưu Trú Mới</h1>
        <p className="text-sm text-[#64748B]">
          Thực hiện lần lượt 4 bước theo đúng quy chuẩn để được Ban quản trị phê duyệt
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#F4A9A9]/50 border border-[#DC2626] text-[#DC2626] text-sm flex items-center gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#15803D] text-[#15803D] text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-[#CBD5E1] bg-white rounded-t-2xl px-4 overflow-x-auto">
        {[
          { id: 1, label: '1. Thông tin cơ bản', icon: FileText },
          { id: 2, label: '2. Giá & Tiện ích', icon: DollarSign },
          { id: 3, label: '3. Hình ảnh & Video', icon: ImageIcon },
          { id: 4, label: '4. Ghim bản đồ', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 py-4 px-6 border-b-2 font-semibold text-sm whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-[#64748B] hover:text-black'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TABS CONTENT */}
      <div className="bg-white p-8 rounded-b-2xl border border-t-0 border-[#CBD5E1] shadow-xs">
        {/* TAB 1: THÔNG TIN CƠ BẢN (FR-14, FR-15) */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Tên cơ sở lưu trú *</label>
                <input
                  type="text"
                  required
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  placeholder="Khách sạn / Homestay..."
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Loại hình</label>
                <select
                  value={basicInfo.type}
                  onChange={(e) => setBasicInfo({ ...basicInfo, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden"
                >
                  <option value="Khách sạn">Khách sạn</option>
                  <option value="Homestay">Homestay</option>
                  <option value="Resort">Resort</option>
                  <option value="Căn hộ du lịch">Căn hộ du lịch</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Phường / Xã (TP. Nha Trang) *</label>
                <select
                  value={basicInfo.ward}
                  onChange={(e) => setBasicInfo({ ...basicInfo, ward: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden"
                >
                  {wardsInNhaTrang.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Địa chỉ cụ thể *</label>
                <input
                  type="text"
                  required
                  value={basicInfo.address}
                  onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Số điện thoại Hotline gọi điện</label>
                <input
                  type="tel"
                  value={basicInfo.phone}
                  onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                  placeholder="0258xxxxxx"
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Số điện thoại / Link Zalo</label>
                <input
                  type="text"
                  value={basicInfo.zalo}
                  onChange={(e) => setBasicInfo({ ...basicInfo, zalo: e.target.value })}
                  placeholder="0905xxxxxx hoặc zalo.me/..."
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black">Mô tả giới thiệu chi tiết</label>
              <textarea
                rows={4}
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                placeholder="Mô tả không gian, phòng ốc và các dịch vụ đi kèm..."
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* TAB 2: GIÁ & TIỆN ÍCH (FR-17) */}
        {activeTab === 2 && (
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-sm text-black mb-4">Khoảng giá tham khảo (VNĐ)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B]">Giá từ (Tối thiểu 50.000 đ)</label>
                  <input
                    type="number"
                    min={PRICE_LIMITS.MIN_VND}
                    value={priceAndAmenities.minPrice}
                    onChange={(e) =>
                      setPriceAndAmenities({ ...priceAndAmenities, minPrice: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B]">Giá đến (Tối đa 100.000.000 đ)</label>
                  <input
                    type="number"
                    max={PRICE_LIMITS.MAX_VND}
                    value={priceAndAmenities.maxPrice}
                    onChange={(e) =>
                      setPriceAndAmenities({ ...priceAndAmenities, maxPrice: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-black mb-3">Danh mục tiện ích chuẩn (Chọn tối thiểu 1)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {standardAmenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 p-3 rounded-xl border border-[#CBD5E1] bg-[#F8F4E8]/40 hover:bg-[#F8F4E8] cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={priceAndAmenities.amenities.includes(amenity)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPriceAndAmenities((prev) => ({
                          ...prev,
                          amenities: checked
                            ? [...prev.amenities, amenity]
                            : prev.amenities.filter((a) => a !== amenity),
                        }));
                      }}
                      className="rounded-sm accent-black"
                    />
                    <span className="font-semibold text-black">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDIA (FR-16) */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-10 text-center bg-[#F8F4E8]/40 hover:bg-[#F8F4E8] transition-colors cursor-pointer">
              <Upload size={36} className="mx-auto text-[#64748B] mb-3" />
              <p className="font-bold text-sm text-black">Kéo thả hình ảnh hoặc video vào đây để tải lên</p>
              <p className="text-xs text-[#64748B] mt-1">
                Yêu cầu: Tối thiểu 3 ảnh (tối đa 100 ảnh, &le;10MB/ảnh) &middot; Tối đa 5 video (&le;100MB/video)
              </p>
            </div>

            {/* MOCK UPLOADED IMAGES */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#64748B]">Ảnh đã tải lên (Demo):</span>
              <div className="flex gap-3">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="w-24 h-20 rounded-xl bg-[#CBD5E1] border border-[#CBD5E1] overflow-hidden flex items-center justify-center text-xs text-[#64748B]">
                    Ảnh {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BẢN ĐỒ & GHIM TỌA ĐỘ (FR-18) */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#FEE8A8]/40 border border-[#FFC107] text-xs text-[#B45309] flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>
                Quy tắc bắt buộc: Tọa độ ghim phải nằm trong phạm vi TP. Nha Trang (Vĩ độ: 12.1 đến 12.45, Kinh độ: 109.1 đến 109.3).
              </span>
            </div>

            <div className="h-80 bg-[#CBD5E1] rounded-2xl flex flex-col items-center justify-center text-[#64748B] border border-[#CBD5E1]">
              <MapPin size={36} className="text-[#DC2626] animate-bounce mb-2" />
              <p className="text-sm font-semibold">Tích hợp Google Maps Ghim Tọa Độ</p>
              <p className="text-xs mt-1">
                Tọa độ hiện tại: Lat {coordinates.lat}, Lng {coordinates.lng}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM ACTION PANEL */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#CBD5E1] px-6 py-4 shadow-lg z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-xs text-[#64748B]">
            {listingId ? `Mã bản nháp: ${listingId}` : 'Chưa lưu bản ghi'}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black text-black font-semibold text-sm hover:bg-[#F8F4E8] cursor-pointer"
            >
              <Save size={16} />
              <span>Lưu bản nháp</span>
            </button>

            <button
              onClick={handleSubmitModeration}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-85 cursor-pointer shadow-xs"
            >
              <Send size={16} />
              <span>Gửi kiểm duyệt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
