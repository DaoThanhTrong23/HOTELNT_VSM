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
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Lock,
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
  });

  const [priceAndAmenities, setPriceAndAmenities] = useState({
    minPrice: 500000,
    maxPrice: 1500000,
    amenities: ['Wifi miễn phí', 'Điều hòa nhiệt độ'],
  });

  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop&q=80',
  ]);

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

  // ĐIỀU KIỆN VALIDATE TỪNG BƯỚC ĐỂ KHÓA/MỞ KHÓA BƯỚC TIẾP THEO
  const isStep1Valid = Boolean(basicInfo.name.trim() && basicInfo.address.trim());
  const isStep2Valid =
    isStep1Valid &&
    priceAndAmenities.minPrice >= PRICE_LIMITS.MIN_VND &&
    priceAndAmenities.maxPrice <= PRICE_LIMITS.MAX_VND &&
    priceAndAmenities.minPrice <= priceAndAmenities.maxPrice &&
    priceAndAmenities.amenities.length > 0;
  const isStep3Valid = isStep2Valid && images.length >= MEDIA_LIMITS.IMAGE_MIN;
  const isStep4Valid = isStep3Valid && isInsideNhaTrang(coordinates.lat, coordinates.lng);

  const canAccessStep = (stepId) => {
    if (stepId === 1) return true;
    if (stepId === 2) return isStep1Valid;
    if (stepId === 3) return isStep1Valid && isStep2Valid;
    if (stepId === 4) return isStep1Valid && isStep2Valid && isStep3Valid;
    return false;
  };

  const isStepCompleted = (stepId) => {
    if (stepId === 1) return isStep1Valid;
    if (stepId === 2) return isStep2Valid;
    if (stepId === 3) return isStep3Valid;
    if (stepId === 4) return isStep4Valid;
    return false;
  };

  const isCurrentStepValid = () => {
    if (activeTab === 1) return isStep1Valid;
    if (activeTab === 2) return isStep2Valid;
    if (activeTab === 3) return isStep3Valid;
    if (activeTab === 4) return isStep4Valid;
    return false;
  };

  // LƯU BẢN NHÁP (FR-14)
  const handleSaveDraft = (e) => {
    e?.preventDefault();
    if (!basicInfo.name || !basicInfo.address) {
      return setError('Vui lòng điền tối thiểu Tên cơ sở và Địa chỉ cụ thể để lưu bản nháp.');
    }

    setError('');
    if (!listingId) {
      setListingId('uuid-' + Date.now().toString().slice(-6));
    }
    setSuccess('Đã lưu bản nháp thành công! Bạn có thể tiếp tục hoàn thiện các bước.');
    setTimeout(() => setSuccess(''), 3500);
  };

  // STEP BY STEP: TIẾP THEO (NEXT STEP)
  const handleNextStep = (e) => {
    e?.preventDefault();
    setError('');

    if (activeTab === 1) {
      if (!isStep1Valid) {
        return setError('Vui lòng điền đầy đủ Tên cơ sở và Địa chỉ cụ thể trước khi sang bước tiếp theo.');
      }
      if (!listingId) {
        setListingId('uuid-' + Date.now().toString().slice(-6));
      }
      setActiveTab(2);
    } else if (activeTab === 2) {
      if (!isStep2Valid) {
        return setError('Vui lòng kiểm tra khoảng giá và chọn tối thiểu 1 tiện ích trước khi tiếp tục.');
      }
      setActiveTab(3);
    } else if (activeTab === 3) {
      if (!isStep3Valid) {
        return setError(`Cần tối thiểu ${MEDIA_LIMITS.IMAGE_MIN} hình ảnh của cơ sở (hiện có ${images.length} ảnh).`);
      }
      setActiveTab(4);
    }
  };

  // STEP BY STEP: QUAY LẠI (PREV STEP)
  const handlePrevStep = () => {
    setError('');
    if (activeTab > 1) {
      setActiveTab((prev) => prev - 1);
    }
  };

  // CHECKLIST ĐIỀU KIỆN ĐỂ BẤM "GỬI KIỂM DUYỆT" (FR-18)
  const handleSubmitModeration = () => {
    setError('');

    if (!listingId) {
      return setError('Vui lòng lưu bản nháp ở Bước 1 trước khi gửi duyệt.');
    }
    if (images.length < MEDIA_LIMITS.IMAGE_MIN) {
      return setError(`Cần tải lên tối thiểu ${MEDIA_LIMITS.IMAGE_MIN} hình ảnh của cơ sở.`);
    }
    if (
      priceAndAmenities.minPrice < PRICE_LIMITS.MIN_VND ||
      priceAndAmenities.maxPrice > PRICE_LIMITS.MAX_VND
    ) {
      return setError('Khoảng giá phải nằm trong giới hạn 50.000 đ đến 100.000.000 đ.');
    }
    if (!isInsideNhaTrang(coordinates.lat, coordinates.lng)) {
      return setError('Vị trí chọn nằm ngoài khu vực hỗ trợ TP. Nha Trang (Vĩ độ: 12.1-12.45, Kinh độ: 109.1-109.3).');
    }

    // Gửi duyệt thành công -> Chuyển về Dashboard
    alert('Gửi yêu cầu kiểm duyệt thành công! Cơ sở đã chuyển sang trạng thái "Chờ duyệt" để Ban quản trị phê duyệt.');
    navigate(ROUTES.HOST.DASHBOARD);
  };

  const handleAddSampleImage = () => {
    const samplePool = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&auto=format&fit=crop&q=80',
    ];
    const nextImg = samplePool[images.length % samplePool.length];
    setImages((prev) => [...prev, nextImg]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
          Thêm Cơ Sở Lưu Trú Mới
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Hoàn thành lần lượt 4 bước theo đúng quy chuẩn kiểm duyệt của TP. Nha Trang
        </p>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="p-4 rounded-xl bg-[#F4A9A9]/50 border border-[#DC2626] text-[#DC2626] text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#15803D] text-[#15803D] text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* STEP PROGRESS NAVIGATION */}
      <div className="bg-white rounded-2xl border border-[#CBD5E1] p-2 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 1, label: 'Thông tin cơ bản', icon: FileText },
            { id: 2, label: 'Giá & Tiện ích', icon: DollarSign },
            { id: 3, label: 'Hình ảnh & Video', icon: ImageIcon },
            { id: 4, label: 'Ghim bản đồ', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            const isCompleted = isStepCompleted(tab.id);
            const isAccessible = canAccessStep(tab.id);

            return (
              <button
                key={tab.id}
                type="button"
                disabled={!isAccessible}
                title={!isAccessible ? `Vui lòng hoàn thành Bước ${tab.id - 1} để mở khóa bước này` : ''}
                onClick={() => {
                  if (isAccessible) {
                    setError('');
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl font-semibold text-xs sm:text-sm transition-all text-left ${
                  isCurrent
                    ? 'bg-black text-white shadow-xs cursor-default'
                    : isCompleted
                    ? 'bg-[#DCFCE7]/60 text-[#15803D] hover:bg-[#DCFCE7] cursor-pointer'
                    : isAccessible
                    ? 'bg-[#F8F4E8]/50 text-[#64748B] hover:text-black hover:bg-[#F8F4E8] cursor-pointer'
                    : 'bg-neutral-100/70 text-neutral-400 border border-dashed border-[#CBD5E1] opacity-50 cursor-not-allowed select-none'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-[#15803D] text-white'
                      : isAccessible
                      ? 'bg-[#CBD5E1] text-[#64748B]'
                      : 'bg-neutral-200 text-neutral-400'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 size={14} />
                  ) : !isAccessible ? (
                    <Lock size={12} />
                  ) : (
                    <Icon size={13} />
                  )}
                </div>
                <div className="truncate flex items-center gap-1.5">
                  <span className="block truncate">{tab.label}</span>
                  {!isAccessible && <Lock size={11} className="text-neutral-400 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORM CARD CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-xs p-6 sm:p-8 space-y-8">
        {/* TAB 1: THÔNG TIN CƠ BẢN (FR-14, FR-15) */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#CBD5E1] pb-3">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <FileText size={18} />
                <span>Bước 1: Thông tin cơ bản về cơ sở</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Nhập tên đại diện, loại hình và địa chỉ để đăng ký cấp mã bản nháp
              </p>
            </div>

            {!isStep1Valid && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>
                  Vui lòng điền <strong>Tên cơ sở lưu trú</strong> và <strong>Địa chỉ cụ thể</strong> để mở khóa các bước tiếp theo.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Tên cơ sở lưu trú *</label>
                <input
                  type="text"
                  required
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  placeholder="Ví dụ: Khách sạn Mường Thanh Luxury Nha Trang..."
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Loại hình cơ sở</label>
                <select
                  value={basicInfo.type}
                  onChange={(e) => setBasicInfo({ ...basicInfo, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
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
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
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
                  placeholder="Ví dụ: 60 Trần Phú, TP. Nha Trang"
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Số điện thoại Hotline gọi điện</label>
                <input
                  type="tel"
                  value={basicInfo.phone}
                  onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                  placeholder="0258xxxxxx hoặc 0905xxxxxx"
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Số điện thoại / Link Zalo</label>
                <input
                  type="text"
                  value={basicInfo.zalo}
                  onChange={(e) => setBasicInfo({ ...basicInfo, zalo: e.target.value })}
                  placeholder="0905xxxxxx hoặc https://zalo.me/..."
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black">Mô tả giới thiệu chi tiết</label>
              <textarea
                rows={4}
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                placeholder="Mô tả không gian, tầm nhìn, phòng ốc và các tiện nghi nổi bật..."
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        )}

        {/* TAB 2: GIÁ & TIỆN ÍCH (FR-17) */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#CBD5E1] pb-3">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <DollarSign size={18} />
                <span>Bước 2: Khoảng giá & Tiện ích cung cấp</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Quy định hệ thống: Giá từ 50.000 đ đến 100.000.000 đ &middot; Chọn tối thiểu 1 tiện ích
              </p>
            </div>

            {!isStep2Valid && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>
                  Vui lòng nhập khoảng giá hợp lệ (50.000 đ - 100.000.000 đ, Giá tối thiểu &le; Giá tối đa) và chọn ít nhất 1 tiện ích để mở khóa Bước 3.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Giá khởi điểm (VNĐ) *</label>
                <input
                  type="number"
                  min={PRICE_LIMITS.MIN_VND}
                  max={PRICE_LIMITS.MAX_VND}
                  step={50000}
                  value={priceAndAmenities.minPrice}
                  onChange={(e) =>
                    setPriceAndAmenities({ ...priceAndAmenities, minPrice: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm font-bold focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Giá tối đa (VNĐ) *</label>
                <input
                  type="number"
                  min={PRICE_LIMITS.MIN_VND}
                  max={PRICE_LIMITS.MAX_VND}
                  step={50000}
                  value={priceAndAmenities.maxPrice}
                  onChange={(e) =>
                    setPriceAndAmenities({ ...priceAndAmenities, maxPrice: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm font-bold focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-black">
                Danh mục tiện ích chuẩn (Đã chọn: {priceAndAmenities.amenities.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {standardAmenities.map((amenity) => {
                  const isChecked = priceAndAmenities.amenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                        isChecked
                          ? 'border-black bg-[#F8F4E8] font-bold text-black shadow-2xs'
                          : 'border-[#CBD5E1] bg-white text-[#64748B] hover:border-black/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setPriceAndAmenities((prev) => ({
                            ...prev,
                            amenities: checked
                              ? [...prev.amenities, amenity]
                              : prev.amenities.filter((a) => a !== amenity),
                          }));
                        }}
                        className="rounded-sm accent-black w-4 h-4 cursor-pointer"
                      />
                      <span>{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDIA (FR-16) */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#CBD5E1] pb-3">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <ImageIcon size={18} />
                <span>Bước 3: Tải lên hình ảnh & Video thực tế</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Yêu cầu duyệt: Tối thiểu 3 ảnh chất lượng rõ nét (Tối đa 100 ảnh, &le;10MB/ảnh)
              </p>
            </div>

            {!isStep3Valid && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>
                  Cần tải lên tối thiểu {MEDIA_LIMITS.IMAGE_MIN} ảnh thực tế của cơ sở (hiện có {images.length} ảnh) để mở khóa Bước 4.
                </span>
              </div>
            )}

            {/* DROPZONE */}
            <div
              onClick={handleAddSampleImage}
              className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-8 sm:p-10 text-center bg-[#F8F4E8]/40 hover:bg-[#F8F4E8] hover:border-black transition-all cursor-pointer group"
            >
              <Upload size={36} className="mx-auto text-[#64748B] group-hover:text-black mb-3 transition-colors" />
              <p className="font-bold text-sm text-black">Bấm vào đây để tải ảnh lên (hoặc thêm ảnh mẫu)</p>
              <p className="text-xs text-[#64748B] mt-1">
                Hỗ trợ định dạng JPG, PNG, WebP &middot; Dung lượng tối đa 10MB/tệp
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSampleImage();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Plus size={14} />
                <span>Thêm 1 ảnh mẫu</span>
              </button>
            </div>

            {/* PREVIEW IMAGES */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-black">
                  Danh sách ảnh đã tải lên ({images.length} / tối thiểu {MEDIA_LIMITS.IMAGE_MIN}):
                </span>
                {images.length >= MEDIA_LIMITS.IMAGE_MIN ? (
                  <span className="text-xs font-semibold text-[#15803D] flex items-center gap-1">
                    <CheckCircle2 size={13} /> Đủ điều kiện duyệt
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#DC2626]">
                    Thiếu {MEDIA_LIMITS.IMAGE_MIN - images.length} ảnh
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#F8F4E8] aspect-4/3"
                  >
                    <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 rounded-lg bg-white/90 text-[#DC2626] hover:bg-white transition-colors cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold">
                      Ảnh {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BẢN ĐỒ & GHIM TỌA ĐỘ (FR-18) */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#CBD5E1] pb-3">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <MapPin size={18} />
                <span>Bước 4: Ghim vị trí tọa độ trên bản đồ Nha Trang</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Tọa độ chính xác giúp du khách tính khoảng cách di chuyển thực tế (FR-06, FR-18)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FEE8A8]/50 border border-[#B45309]/30 text-xs text-[#B45309] flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>
                Quy định ràng buộc: Tọa độ phải nằm trong địa phận TP. Nha Trang (Vĩ độ: 12.1 đến 12.45, Kinh độ: 109.1 đến 109.3).
              </span>
            </div>

            {/* PRESET CHIPS */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-black">Ghim nhanh vị trí trung tâm mẫu:</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { name: 'Trung tâm Trần Phú (Lộc Thọ)', lat: 12.2388, lng: 109.1967 },
                  { name: 'Khu vực Bãi Tiên (Vĩnh Hòa)', lat: 12.2985, lng: 109.2081 },
                  { name: 'Khu vực Hòn Chồng (Vĩnh Phước)', lat: 12.2715, lng: 109.2023 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCoordinates({ lat: preset.lat, lng: preset.lng })}
                    className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-black bg-[#F8F4E8] hover:bg-black hover:text-white transition-all cursor-pointer"
                  >
                    📍 {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* MAP MOCK BOX */}
            <div className="h-72 bg-[#F8F4E8] rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-[#CBD5E1] relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center mb-3">
                <MapPin size={28} className="text-[#DC2626] animate-bounce" />
              </div>
              <p className="text-sm font-bold text-black">Bản đồ vệ tinh định vị Nha Trang</p>
              <p className="text-xs text-[#64748B] mt-1">
                Tọa độ đang ghim: <span className="font-mono font-bold text-black">Vĩ độ {coordinates.lat}</span> &middot; <span className="font-mono font-bold text-black">Kinh độ {coordinates.lng}</span>
              </p>
              <span className="mt-2 text-[11px] px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Tọa độ hợp lệ trong TP. Nha Trang
              </span>
            </div>
          </div>
        )}

        {/* ELEGANT STEP-BY-STEP ACTION FOOTER */}
        <div className="bg-[#FAFAFA] -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-6 rounded-b-2xl border-t border-[#CBD5E1] flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          {/* TRẠNG THÁI BẢN GHI (LEFT) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {listingId ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/25 px-3 py-1.5 rounded-full shadow-2xs">
                <CheckCircle2 size={14} className="text-[#15803D]" />
                <span>Bản nháp: <strong className="font-mono">{listingId}</strong></span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-medium bg-white text-[#64748B] border border-[#CBD5E1] px-3 py-1.5 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
                <span>Tự động lưu nháp khi chuyển bước</span>
              </span>
            )}
            <span className="text-xs text-[#64748B] hidden md:inline font-medium">
              &middot; Bước {activeTab} / 4
            </span>
          </div>

          {/* CỤM NÚT ĐIỀU HƯỚNG TỪNG BƯỚC (RIGHT) */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            {/* NÚT QUAY LẠI */}
            {activeTab > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:text-black hover:border-black text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] shadow-2xs"
              >
                <ArrowLeft size={16} />
                <span>Quay lại</span>
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <div className="flex items-center gap-2.5">
              {/* NÚT LƯU NHÁP */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:text-black hover:border-black hover:bg-[#F8F4E8] text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] shadow-2xs"
              >
                <Save size={16} />
                <span>Lưu nháp</span>
              </button>

              {/* NÚT TIẾP TỤC HOẶC GỬI DUYỆT */}
              {activeTab < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!isCurrentStepValid()}
                  title={!isCurrentStepValid() ? 'Vui lòng hoàn thành các thông tin bắt buộc ở bước này' : ''}
                  className={`inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] group ${
                    isCurrentStepValid()
                      ? 'bg-black text-white hover:bg-neutral-800 cursor-pointer shadow-md'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none border border-neutral-300 select-none'
                  }`}
                >
                  {!isCurrentStepValid() && <Lock size={14} className="text-neutral-400" />}
                  <span>Tiếp tục</span>
                  {isCurrentStepValid() && (
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitModeration}
                  disabled={!isCurrentStepValid()}
                  title={!isCurrentStepValid() ? 'Vui lòng hoàn thành đủ các điều kiện để gửi kiểm duyệt' : ''}
                  className={`inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] group ${
                    isCurrentStepValid()
                      ? 'bg-black text-white hover:bg-neutral-800 cursor-pointer shadow-md'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none border border-neutral-300 select-none'
                  }`}
                >
                  {!isCurrentStepValid() && <Lock size={14} className="text-neutral-400" />}
                  <Send size={16} className={isCurrentStepValid() ? "group-hover:scale-110 transition-transform" : ""} />
                  <span>Gửi kiểm duyệt ngay</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
