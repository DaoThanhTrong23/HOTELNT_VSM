import { useState } from 'react';
import { Globe, Bot, Save } from 'lucide-react';

export const SystemConfigPage = () => {
  const [activeTab, setActiveTab] = useState('seo');

  // SEO CONFIG STATES (FR-25)
  const [seo, setSeo] = useState({
    metaTitle: 'Khách Sạn Nha Trang - Đặt Phòng Trực Tiếp Không Qua Trung Gian',
    metaDescription: 'Hệ thống tra cứu, khám phá và định vị cơ sở lưu trú uy tín nhất TP. Nha Trang. Liên hệ trực tiếp với chủ khách sạn.',
    ogImageUrl: 'https://hotelnt.com/banner-og.jpg',
  });

  // AI CONFIG STATES (FR-26)
  const [ai, setAi] = useState({
    systemPrompt:
      'Bạn là trợ lý ảo AI thông minh của WebApp Hotel Nha Trang. Nhiệm vụ của bạn là hỗ trợ khách du lịch tìm kiếm cơ sở lưu trú, gợi ý khách sạn theo khoảng giá, vị trí gần biển và tiện ích phù hợp.',
    maxTokens: 500,
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Đã lưu cấu hình hệ thống thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Cấu Hình Hệ Thống</h1>
        <p className="text-sm text-[#64748B]">Tối ưu hóa công cụ tìm kiếm (SEO) và thiết lập Chatbot AI</p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[#CBD5E1] bg-white rounded-t-2xl px-4">
        <button
          onClick={() => setActiveTab('seo')}
          className={`py-4 px-6 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer ${
            activeTab === 'seo'
              ? 'border-black text-black'
              : 'border-transparent text-[#64748B] hover:text-black'
          }`}
        >
          <Globe size={18} />
          <span>Cấu hình SEO (FR-25)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`py-4 px-6 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer ${
            activeTab === 'ai'
              ? 'border-black text-black'
              : 'border-transparent text-[#64748B] hover:text-black'
          }`}
        >
          <Bot size={18} />
          <span>Cấu hình AI Chatbot (FR-26)</span>
        </button>
      </div>

      {/* FORM CONTENT */}
      <form onSubmit={handleSave} className="bg-white p-8 rounded-b-2xl border border-t-0 border-[#CBD5E1] space-y-6 shadow-xs">
        {activeTab === 'seo' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black">Default Meta Title</label>
              <input
                type="text"
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black">Default Meta Description</label>
              <textarea
                rows={3}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black">OpenGraph Image URL</label>
              <input
                type="url"
                value={seo.ogImageUrl}
                onChange={(e) => setSeo({ ...seo, ogImageUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black">System Prompt (Chỉ dẫn AI)</label>
              <textarea
                rows={5}
                value={ai.systemPrompt}
                onChange={(e) => setAi({ ...ai, systemPrompt: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-1.5 max-w-xs">
              <label className="text-xs font-semibold text-black">Max Tokens phản hồi</label>
              <input
                type="number"
                value={ai.maxTokens}
                onChange={(e) => setAi({ ...ai, maxTokens: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-[#F8F4E8] border border-[#CBD5E1] rounded-xl text-sm font-bold"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-85 cursor-pointer"
        >
          <Save size={16} />
          <span>Lưu cấu hình</span>
        </button>
      </form>
    </div>
  );
};
