import { useState } from 'react';

const initialSeo = {
  metaTitle: 'Khách Sạn Nha Trang - Đặt Phòng Trực Tiếp Không Qua Trung Gian',
  metaDescription:
    'Hệ thống tra cứu, khám phá và định vị cơ sở lưu trú uy tín nhất TP. Nha Trang. Liên hệ trực tiếp với chủ khách sạn.',
  ogImageUrl: 'https://hotelnt.com/banner-og.jpg',
};

const initialAi = {
  enabled: true,
  systemPrompt:
    'Bạn là trợ lý ảo AI thông minh của WebApp Hotel Nha Trang. Nhiệm vụ của bạn là hỗ trợ khách du lịch tìm kiếm cơ sở lưu trú, gợi ý khách sạn theo khoảng giá, vị trí gần biển và tiện ích phù hợp.',
  maxTokens: 500,
};

export const SystemConfigPage = () => {
  const [activeTab, setActiveTab] = useState('seo');
  const [seo, setSeo] = useState(initialSeo);
  const [ai, setAi] = useState(initialAi);
  const [saved, setSaved] = useState(false);

  const [savedSeo, setSavedSeo] = useState(initialSeo);
  const [savedAi, setSavedAi] = useState(initialAi);

  const updateSeo = (field, value) => {
    setSeo((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const updateAi = (field, value) => {
    setAi((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (activeTab === 'seo') {
      if (!seo.metaTitle.trim() || !seo.metaDescription.trim()) {
        alert('Vui lòng nhập đầy đủ Meta Title và Meta Description.');
        return;
      }

      setSavedSeo({ ...seo });
    } else {
      if (!ai.systemPrompt.trim()) {
        alert('Vui lòng nhập System Prompt.');
        return;
      }

      setSavedAi({ ...ai });
    }

    setSaved(true);
  };

  const titleLength = seo.metaTitle.length;
  const descriptionLength = seo.metaDescription.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      {/* HEADER */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#B45309]">
          ADMIN / CẤU HÌNH HỆ THỐNG
        </p>

        <h1 className="text-2xl font-bold text-[#171717] sm:text-3xl">
          Cấu hình SEO & AI Chatbot
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Quản lý khả năng tối ưu tìm kiếm và thiết lập trợ lý ảo của Hotel Nha Trang.
        </p>
      </div>

      {/* OVERVIEW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Trạng thái cấu hình SEO
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xl font-bold text-emerald-700">
              Đã cấu hình
            </p>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Hoạt động
            </span>
          </div>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Meta Title, Description và OpenGraph.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#64748B]">
            Trạng thái AI Chatbot
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className={`text-xl font-bold ${ai.enabled ? 'text-emerald-700' : 'text-red-600'}`}>
              {ai.enabled ? 'Đang bật' : 'Đang tắt'}
            </p>

            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              ai.enabled
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {ai.enabled ? 'Hoạt động' : 'Ngừng hoạt động'}
            </span>
          </div>

          <p className="mt-2 text-xs text-[#94A3B8]">
            Thiết lập hướng dẫn và giới hạn phản hồi AI.
          </p>
        </div>
      </div>

      {/* CONFIGURATION TABS */}
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-wrap border-b border-[#E5E7EB] px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('seo');
              setSaved(false);
            }}
            className={`border-b-2 px-4 py-4 text-sm font-semibold transition sm:px-6 ${
              activeTab === 'seo'
                ? 'border-[#B45309] text-[#B45309]'
                : 'border-transparent text-[#64748B] hover:text-[#171717]'
            }`}
          >
            Cấu hình SEO (FR-25)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ai');
              setSaved(false);
            }}
            className={`border-b-2 px-4 py-4 text-sm font-semibold transition sm:px-6 ${
              activeTab === 'ai'
                ? 'border-[#B45309] text-[#B45309]'
                : 'border-transparent text-[#64748B] hover:text-[#171717]'
            }`}
          >
            Cấu hình AI Chatbot (FR-26)
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 sm:p-7">
          {activeTab === 'seo' ? (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {/* SEO FORM */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1E293B]">
                    Thiết lập thông tin SEO
                  </h2>

                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Cấu hình thông tin mặc định cho công cụ tìm kiếm.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-semibold text-[#334155]">
                      Default Meta Title
                    </label>

                    <span className={`text-xs ${
                      titleLength > 60 ? 'text-red-600' : 'text-[#94A3B8]'
                    }`}>
                      {titleLength}/60 ký tự
                    </span>
                  </div>

                  <input
                    type="text"
                    value={seo.metaTitle}
                    onChange={(e) => updateSeo('metaTitle', e.target.value)}
                    placeholder="Nhập tiêu đề website..."
                    maxLength={120}
                    className="w-full rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm outline-none transition focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/10"
                  />

                  <p className="text-xs text-[#94A3B8]">
                    Khuyến nghị tiêu đề khoảng 50–60 ký tự.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-semibold text-[#334155]">
                      Default Meta Description
                    </label>

                    <span className={`text-xs ${
                      descriptionLength > 160 ? 'text-red-600' : 'text-[#94A3B8]'
                    }`}>
                      {descriptionLength}/160 ký tự
                    </span>
                  </div>

                  <textarea
                    rows={5}
                    value={seo.metaDescription}
                    onChange={(e) => updateSeo('metaDescription', e.target.value)}
                    placeholder="Nhập mô tả website..."
                    maxLength={320}
                    className="w-full resize-none rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/10"
                  />

                  <p className="text-xs text-[#94A3B8]">
                    Khuyến nghị mô tả khoảng 120–160 ký tự.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#334155]">
                    OpenGraph Image URL
                  </label>

                  <input
                    type="url"
                    value={seo.ogImageUrl}
                    onChange={(e) => updateSeo('ogImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm outline-none transition focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/10"
                  />

                  <p className="text-xs text-[#94A3B8]">
                    Đường dẫn hình ảnh khi chia sẻ website trên mạng xã hội.
                  </p>
                </div>
              </div>

              {/* SEO PREVIEW */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1E293B]">
                    Xem trước kết quả tìm kiếm
                  </h2>

                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Mô phỏng cách website hiển thị trên Google.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-5 sm:p-6">
                  <p className="text-xs text-[#64748B]">
                    hotelnt.com
                  </p>

                  <h3 className="mt-2 break-words text-xl font-medium text-[#1A0DAB]">
                    {seo.metaTitle || 'Tiêu đề website'}
                  </h3>

                  <p className="mt-2 break-words text-sm leading-relaxed text-[#4D5156]">
                    {seo.metaDescription || 'Mô tả website sẽ hiển thị tại đây.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <p className="mb-3 text-sm font-semibold text-[#334155]">
                    Hình ảnh chia sẻ
                  </p>

                  {seo.ogImageUrl ? (
                    <img
                      src={seo.ogImageUrl}
                      alt="OpenGraph Preview"
                      className="h-44 w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center rounded-xl bg-[#FAFAF9] text-sm text-[#94A3B8]">
                      Chưa có hình ảnh xem trước
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#1E293B]">
                  Thiết lập AI Chatbot
                </h2>

                <p className="mt-1 text-sm text-[#94A3B8]">
                  Quản lý hành vi và nội dung phản hồi của trợ lý ảo.
                </p>
              </div>

              {/* ENABLE AI */}
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-[#1E293B]">
                    Kích hoạt AI Chatbot
                  </p>

                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Cho phép trợ lý ảo hỗ trợ khách hàng trên website.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={ai.enabled}
                  onClick={() => updateAi('enabled', !ai.enabled)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    ai.enabled ? 'bg-emerald-600' : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      ai.enabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* SYSTEM PROMPT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#334155]">
                  System Prompt (Chỉ dẫn AI)
                </label>

                <textarea
                  rows={8}
                  value={ai.systemPrompt}
                  onChange={(e) => updateAi('systemPrompt', e.target.value)}
                  placeholder="Nhập nội dung hướng dẫn cho AI Chatbot..."
                  className="w-full resize-y rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/10"
                />

                <p className="text-xs text-[#94A3B8]">
                  Nội dung này định hướng cách AI giao tiếp và hỗ trợ khách hàng.
                </p>
              </div>

              {/* MAX TOKENS */}
              <div className="max-w-sm space-y-2">
                <label className="text-sm font-semibold text-[#334155]">
                  Max Tokens phản hồi
                </label>

                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="100"
                  value={ai.maxTokens}
                  onChange={(e) =>
                    updateAi('maxTokens', Math.min(2000, Math.max(100, Number(e.target.value) || 100)))
                  }
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#FAFAF9] px-4 py-3 text-sm font-semibold text-[#334155] outline-none transition focus:border-[#B45309]"
                />

                <p className="text-xs text-[#94A3B8]">
                  Giới hạn độ dài phản hồi. Phạm vi mô phỏng: 100–2000 tokens.
                </p>
              </div>

              {/* AI SUMMARY */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="font-bold text-[#1E293B]">
                  Thông tin cấu hình hiện tại
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#94A3B8]">
                      Trạng thái
                    </p>

                    <p className={`mt-1 text-sm font-semibold ${
                      ai.enabled ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {ai.enabled ? 'Đang kích hoạt' : 'Đang tắt'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8]">
                      Giới hạn phản hồi
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#334155]">
                      {ai.maxTokens} tokens
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SAVE */}
          <div className="mt-8 flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {saved ? (
                <p className="font-medium text-emerald-700">
                  Đã lưu cấu hình trên giao diện thành công.
                </p>
              ) : (
                <p className="text-[#94A3B8]">
                  Các thay đổi chưa được lưu.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#333333]"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </section>

      <p className="text-xs leading-relaxed text-[#94A3B8]">
        Lưu ý: Đây là giao diện quản trị Frontend sử dụng dữ liệu minh họa.
        Cấu hình được lưu trong trạng thái của React, chưa đồng bộ với Backend
        hoặc dịch vụ AI thực tế.
      </p>
    </div>
  );
};
