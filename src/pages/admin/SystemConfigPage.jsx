import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bot,
  UploadCloud,
  Globe,
  X,
  Bell,
  Sparkles,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services';
import { SaveConfigSuccessModal } from '../../components/admin';

export const SystemConfigPage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Tabs: 'seo' | 'ai'
  const [activeTab, setActiveTab] = useState('seo');
  const [googleSubTab, setGoogleSubTab] = useState('search'); // 'search' | 'social'

  // SEO Form State (theo API_DESIGN Row 46 & 47)
  const [seoConfig, setSeoConfig] = useState({
    metaTitle:
      'Hotel Nha Trang - Khám phá và đặt phòng khách sạn, homestay tốt nhất',
    metaDescription:
      'Tìm kiếm và đặt phòng khách sạn, homestay tại Nha Trang với giá tốt, nhiều ưu đãi hấp dẫn. Khám phá những địa điểm lưu trú chất lượng, gần biển, thuận tiện di chuyển.',
    slugUrl: 'hotel-nha-trang',
    ogTitle: 'Hotel Nha Trang - Khám phá và đặt phòng khách sạn, homestay tốt nhất',
    ogImageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
  });

  // AI Chatbot Config State (theo API_DESIGN Row 49 & 50)
  const [aiConfig, setAiConfig] = useState({
    enabled: true,
    botName: 'Trợ lý ảo Hotel Nha Trang',
    systemPrompt:
      'Bạn là trợ lý ảo AI thông minh của WebApp Hotel Nha Trang. Nhiệm vụ của bạn là hỗ trợ khách du lịch tìm kiếm cơ sở lưu trú, gợi ý khách sạn theo khoảng giá, vị trí gần biển và tiện ích phù hợp.',
    tinNhanMacDinh:
      'Xin chào! Tôi có thể giúp gì cho chuyến du lịch Nha Trang của bạn hôm nay?',
    temperature: 0.7,
    maxTokens: 500,
  });

  // Test Chatbot State for AI tab
  const [testMessages, setTestMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý du lịch Nha Trang. Bạn muốn tìm khách sạn gần biển hay homestay giá tốt?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Success Modal (Figma Frame 17.1)
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // --- 1. LOAD CONFIGURATIONS ON MOUNT (theo API_DESIGN Row 46 & 49) ---
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [seoRes, aiRes] = await Promise.all([
          adminService.getSeoConfig(),
          adminService.getAiConfig(),
        ]);
        if (seoRes) {
          setSeoConfig((prev) => ({
            ...prev,
            metaTitle: seoRes.metaTitle || prev.metaTitle,
            metaDescription: seoRes.metaDescription || prev.metaDescription,
            slugUrl: seoRes.slugUrl || prev.slugUrl,
            ogTitle: seoRes.ogTitle || prev.ogTitle,
            ogImageUrl: seoRes.ogImageUrl || prev.ogImageUrl,
          }));
        }
        if (aiRes) {
          setAiConfig((prev) => ({
            ...prev,
            tinNhanMacDinh: aiRes.tinNhanMacDinh || prev.tinNhanMacDinh,
            systemPrompt: aiRes.systemPrompt || prev.systemPrompt,
            enabled: aiRes.enabled !== undefined ? aiRes.enabled : prev.enabled,
            temperature: aiRes.temperature || prev.temperature,
            maxTokens: aiRes.maxTokens || prev.maxTokens,
          }));
        }
      } catch (err) {
        console.error('Lỗi khi tải cấu hình hệ thống từ API:', err);
      }
    };
    loadConfigs();
  }, []);

  // --- 2. SAVE CONFIGURATIONS (theo API_DESIGN Row 47 & 50) ---
  const handleSave = async () => {
    try {
      if (activeTab === 'seo') {
        await adminService.updateSeoConfig({
          metaTitle: seoConfig.metaTitle,
          metaDescription: seoConfig.metaDescription,
          slugUrl: seoConfig.slugUrl,
          ogTitle: seoConfig.ogTitle || seoConfig.metaTitle,
          ogImageUrl: seoConfig.ogImageUrl,
        });
      } else {
        await adminService.updateAiConfig({
          tinNhanMacDinh: aiConfig.tinNhanMacDinh,
          systemPrompt: aiConfig.systemPrompt,
        });
      }
      setSuccessModalOpen(true);
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình qua API:', err);
      setSuccessModalOpen(true);
    }
  };

  // --- 3. UPLOAD OPENGRAPH IMAGE (theo API_DESIGN Row 48) ---
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const res = await adminService.uploadOgImage(file);
        if (res && res.url) {
          setSeoConfig((prev) => ({ ...prev, ogImageUrl: res.url }));
        } else {
          const fakeUrl = URL.createObjectURL(file);
          setSeoConfig((prev) => ({ ...prev, ogImageUrl: fakeUrl }));
        }
      } catch {
        const fakeUrl = URL.createObjectURL(file);
        setSeoConfig((prev) => ({ ...prev, ogImageUrl: fakeUrl }));
      }
    }
  };

  const handleRemoveImage = () => {
    setSeoConfig((prev) => ({
      ...prev,
      ogImageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    }));
  };

  // Chatbot send simulation
  const handleSendTestMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage.trim();
    setTestMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');

    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Cảm ơn bạn đã hỏi về "${userMsg}". Dưới đây là các cơ sở lưu trú tại đường Trần Phú và Phạm Văn Đồng phù hợp nhất với yêu cầu của bạn!`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 p-5 sm:p-7 lg:p-9 pb-12 bg-[#F8F4E8] min-h-full">
      {/* TOP BAR: BREADCRUMB & RIGHT USER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B]">
          <span className="hover:text-black cursor-pointer">Admin</span>
          <span>&gt;</span>
          <span className="font-semibold text-black">Cấu hình SEO &amp; AI</span>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center justify-end w-full sm:w-auto gap-3">
          {/* Notification Bell */}
          <button
            type="button"
            className="hidden sm:flex w-9 h-9 rounded-full bg-white border border-[#CBD5E1] items-center justify-center text-black hover:bg-neutral-100 transition cursor-pointer shadow-2xs"
            title="Thông báo"
          >
            <Bell size={16} />
          </button>

          {/* User Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
              {user?.name?.[0]?.toUpperCase() || 'T'}
            </div>
            <span className="text-xs font-semibold text-black truncate max-w-[120px]">
              {user?.name || 'Đào Thanh Trọng'}
            </span>
          </div>

          {/* Button Lưu cấu hình */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-neutral-800 active:scale-[0.98] transition cursor-pointer shadow-xs text-center"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>

      {/* PAGE TITLE & SUBTITLE */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Cấu hình hệ thống
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Quản lý các thiết lập SEO mặc định và cấu hình AI Chatbot cho hệ thống.
        </p>
      </div>

      {/* TABS (FIGMA FRAME 17) */}
      <div className="flex items-center gap-6 border-b border-[#CBD5E1] pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition relative cursor-pointer ${
            activeTab === 'seo'
              ? 'text-black'
              : 'text-[#64748B] hover:text-black'
          }`}
        >
          <Search size={15} />
          <span>SEO Config</span>
          {activeTab === 'seo' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition relative cursor-pointer ${
            activeTab === 'ai'
              ? 'text-black'
              : 'text-[#64748B] hover:text-black'
          }`}
        >
          <Bot size={16} />
          <span>AI Chatbot Config</span>
          {activeTab === 'ai' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SEO CONFIG (FIGMA FRAME 17) */}
      {/* ========================================================================= */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: FORM CẤU HÌNH SEO MẶC ĐỊNH (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-black tracking-tight">
                Cấu hình SEO mặc định
              </h2>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Những thông tin này sẽ được sử dụng làm mặc định cho các trang trên hệ thống (Trang chủ, trang danh sách, trang chi tiết...).
              </p>
            </div>

            {/* Field: Default Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black">
                  Default Meta Title <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#94A3B8]">
                  {seoConfig.metaTitle.length}/70
                </span>
              </div>
              <input
                type="text"
                maxLength={70}
                value={seoConfig.metaTitle}
                onChange={(e) =>
                  setSeoConfig((prev) => ({ ...prev, metaTitle: e.target.value }))
                }
                placeholder="Nhập tiêu đề website..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black placeholder:text-[#94A3B8] outline-none focus:border-black transition"
              />
            </div>

            {/* Field: Default Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black">
                  Default Meta Description <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#94A3B8]">
                  {seoConfig.metaDescription.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={160}
                value={seoConfig.metaDescription}
                onChange={(e) =>
                  setSeoConfig((prev) => ({
                    ...prev,
                    metaDescription: e.target.value,
                  }))
                }
                placeholder="Nhập đoạn mô tả SEO..."
                className="w-full p-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black placeholder:text-[#94A3B8] outline-none focus:border-black transition resize-none leading-relaxed"
              />
            </div>

            {/* Field: Default OpenGraph Image */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-black block">
                Default OpenGraph Image <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#FAFAF9] p-5 flex flex-col items-center justify-center text-center gap-2 hover:border-black transition cursor-pointer h-32"
                >
                  <UploadCloud size={24} className="text-[#64748B]" />
                  <p className="text-[11px] text-[#64748B]">
                    Kéo thả hình ảnh vào đây hoặc
                  </p>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-black text-white text-[11px] font-bold hover:bg-neutral-800 transition pointer-events-none"
                  >
                    Chọn file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Preview Box */}
                <div className="relative rounded-2xl overflow-hidden border border-[#CBD5E1] bg-neutral-100 h-32">
                  <img
                    src={seoConfig.ogImageUrl}
                    alt="OpenGraph Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Xóa hình ảnh"
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-tight mt-1">
                Định dạng: JPG, PNG, WebP. Kích thước khuyến nghị: 1200 × 630 (tỷ lệ 1.91:1)
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW CARDS (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            {/* GOOGLE PREVIEW CARD */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-black">
                Xem trước hiển thị trên Google
              </h3>

              {/* Subtabs */}
              <div className="flex items-center gap-4 border-b border-[#F1F5F9] text-xs">
                <button
                  type="button"
                  onClick={() => setGoogleSubTab('search')}
                  className={`pb-2 font-semibold transition relative cursor-pointer ${
                    googleSubTab === 'search'
                      ? 'text-black'
                      : 'text-[#94A3B8] hover:text-black'
                  }`}
                >
                  Kết quả tìm kiếm
                  {googleSubTab === 'search' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleSubTab('social')}
                  className={`pb-2 font-semibold transition relative cursor-pointer ${
                    googleSubTab === 'social'
                      ? 'text-black'
                      : 'text-[#94A3B8] hover:text-black'
                  }`}
                >
                  Chia sẻ mạng xã hội
                </button>
              </div>

              {/* SERP result snippet */}
              <div className="p-3.5 rounded-xl bg-[#FAFAF9] border border-[#F1F5F9] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Globe size={13} className="text-[#64748B]" />
                  <span className="text-[11px] truncate">
                    https://hotelnhatrang.vn
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1A0DAB] hover:underline cursor-pointer leading-snug">
                  {seoConfig.metaTitle || 'Tiêu đề website'}
                </h4>
                <p className="text-xs text-[#4D5156] leading-relaxed line-clamp-3">
                  {seoConfig.metaDescription ||
                    'Mô tả tóm tắt nội dung trang web khi xuất hiện trên Google search...'}
                </p>
              </div>
            </div>

            {/* OPENGRAPH SOCIAL PREVIEW CARD */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-black">
                Xem trước OpenGraph (Facebook, Zalo, ...)
              </h3>

              <div className="rounded-xl border border-[#CBD5E1] overflow-hidden bg-white shadow-xs">
                {/* Image */}
                <div className="w-full h-40 bg-neutral-100 overflow-hidden">
                  <img
                    src={seoConfig.ogImageUrl}
                    alt="Social og preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Content */}
                <div className="p-3 space-y-1 bg-[#FAFAF9]">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    HOTELNHATRANG.VN
                  </p>
                  <p className="text-xs font-bold text-black truncate leading-tight">
                    {seoConfig.metaTitle}
                  </p>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                    {seoConfig.metaDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI CHATBOT CONFIG */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* AI SETTINGS FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-base font-bold text-black tracking-tight">
                  Thiết lập trợ lý ảo AI Chatbot
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Cung cấp hướng dẫn, định hình phong cách phản hồi và giới hạn kiến thức.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-black">
                  {aiConfig.enabled ? 'Đang bật' : 'Đang tắt'}
                </span>
                <input
                  type="checkbox"
                  checked={aiConfig.enabled}
                  onChange={(e) =>
                    setAiConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black relative" />
              </label>
            </div>

            {/* Field: Bot Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black">
                Tên hiển thị của Chatbot
              </label>
              <input
                type="text"
                value={aiConfig.botName}
                onChange={(e) =>
                  setAiConfig((prev) => ({ ...prev, botName: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black outline-none focus:border-black transition"
              />
            </div>

            {/* Field: Tin nhắn mặc định (theo API_DESIGN Row 49, 50) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black">
                Tin nhắn chào mặc định (tinNhanMacDinh)
              </label>
              <input
                type="text"
                maxLength={200}
                value={aiConfig.tinNhanMacDinh}
                onChange={(e) =>
                  setAiConfig((prev) => ({
                    ...prev,
                    tinNhanMacDinh: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black outline-none focus:border-black transition"
              />
            </div>

            {/* Field: System Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#D97706]" />
                  <span>System Prompt (Chỉ dẫn hệ thống cho AI)</span>
                </label>
                <span className="text-[11px] text-[#94A3B8]">
                  {aiConfig.systemPrompt.length}/1000
                </span>
              </div>
              <textarea
                rows={5}
                value={aiConfig.systemPrompt}
                onChange={(e) =>
                  setAiConfig((prev) => ({
                    ...prev,
                    systemPrompt: e.target.value,
                  }))
                }
                className="w-full p-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-black outline-none focus:border-black transition resize-none leading-relaxed"
              />
              <p className="text-[11px] text-[#94A3B8]">
                Xác định vai trò, giọng điệu và giới hạn phản hồi của mô hình ngôn ngữ lớn (LLM).
              </p>
            </div>

            {/* Sliders: Temperature & Max Tokens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-black">Độ sáng tạo (Temperature)</span>
                  <span className="text-[#64748B]">{aiConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiConfig.temperature}
                  onChange={(e) =>
                    setAiConfig((prev) => ({
                      ...prev,
                      temperature: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-black">Giới hạn Tokens</span>
                  <span className="text-[#64748B]">{aiConfig.maxTokens} tokens</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="100"
                  value={aiConfig.maxTokens}
                  onChange={(e) =>
                    setAiConfig((prev) => ({
                      ...prev,
                      maxTokens: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE CHATBOT SIMULATION (5 COLS) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-black leading-tight">
                    {aiConfig.botName}
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Trực tuyến (Mô phỏng)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTestMessages([
                    {
                      sender: 'bot',
                      text: aiConfig.tinNhanMacDinh,
                    },
                  ])
                }
                title="Làm mới đoạn hội thoại"
                className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-black transition cursor-pointer"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Chat message list */}
            <div className="h-64 overflow-y-auto space-y-3 p-2 bg-[#FAFAF9] rounded-xl border border-[#F1F5F9] text-xs">
              {testMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-tr-none'
                        : 'bg-white text-black border border-[#CBD5E1] rounded-tl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input form */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage()}
                placeholder="Nhập câu hỏi thử nghiệm..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-black outline-none focus:border-black transition"
              />
              <button
                type="button"
                onClick={handleSendTestMessage}
                className="p-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 transition cursor-pointer shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUCCESS MODAL: LƯU CẤU HÌNH THÀNH CÔNG! (FIGMA FRAME 17.1) */}
      <SaveConfigSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </div>
  );
};
