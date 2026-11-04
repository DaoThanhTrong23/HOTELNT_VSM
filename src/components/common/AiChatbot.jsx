import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Phone } from 'lucide-react';
import { aiService, CHATBOT_MAX_LENGTH } from '../../services/aiService';
import { buildTelLink, buildZaloLink } from '../../utils/contactLinks';
import { ChatBubbleIcon, ZaloLogo } from './icons/BrandIcons';

const SESSION_KEY = 'hotelnt_chatbot_session';

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'bot',
  text: 'Chào bạn! Mình có thể gợi ý khách sạn hoặc homestay theo ngân sách của bạn ở Nha Trang.',
};

// Lỗi hiển thị ngay trong khung chat (không chặn cuộc trò chuyện)
const INLINE_ERRORS = {
  429: 'Bạn đang gửi tin nhắn hơi nhanh. Vui lòng đợi một chút rồi thử lại nhé!',
  400: `Tin nhắn không hợp lệ. Vui lòng nhập từ 1 đến ${CHATBOT_MAX_LENGTH} ký tự.`,
};

const readSessionId = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};
const writeSessionId = (id) => {
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* trình duyệt chặn storage: bỏ qua */
  }
};

const formatPrice = (v) => (v === null || v === undefined ? 'Liên hệ' : `${Number(v).toLocaleString('vi-VN')}đ`);

const BotAvatar = ({ size = 'sm' }) => (
  <div
    className={`rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 ${
      size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'
    }`}
  >
    <ChatBubbleIcon size={size === 'lg' ? 20 : 14} />
  </div>
);

/* Thẻ HotelCard thu nhỏ trong tin nhắn bot: ảnh, tên, giá, Xem chi tiết, gọi, Zalo */
const MiniHotelCard = ({ listing, onNavigate }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const tel = buildTelLink(listing.lienHe?.soDienThoai);
  const zalo = buildZaloLink(listing.lienHe?.zalo);
  return (
    <div className="w-[230px] flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
      <div className="h-[110px] bg-[#E5E7EB]">
        {listing.duongDanAnh && !imgFailed && (
          <img
            src={listing.duongDanAnh}
            alt={listing.tenCSLT}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-bold text-[13px] text-black leading-snug line-clamp-2">{listing.tenCSLT}</h5>
          <span className="font-bold text-[13px] text-[#E11D48] whitespace-nowrap">{formatPrice(listing.gia)}</span>
        </div>
        {listing.tenLoai && <p className="mt-1 text-[11px] text-[#94A3B8] truncate">{listing.tenLoai}</p>}
        <div className="mt-2.5 flex items-center gap-2">
          <Link
            to={`/hotel/${listing.maCSLT}`}
            onClick={onNavigate}
            className="flex-1 h-8 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center hover:opacity-85 transition-opacity"
          >
            Xem chi tiết
          </Link>
          {tel && (
            <a href={tel} aria-label="Gọi điện" className="w-8 h-8 rounded-full border border-[#CBD5E1] flex items-center justify-center text-black hover:bg-[#F8F4E8]">
              <Phone size={13} />
            </a>
          )}
          {zalo && (
            <a href={zalo} target="_blank" rel="noopener noreferrer" aria-label="Chat Zalo" className="w-8 h-8 flex items-center justify-center hover:opacity-85">
              <ZaloLogo size={26} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiDown, setAiDown] = useState(null); // tin nhắn bị lỗi khi AI không hoạt động (503 / mất kết nối)
  const sessionIdRef = useRef(readSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const sendText = async (raw, { echo = true } = {}) => {
    const userText = raw.trim();
    if (!userText || loading || userText.length > CHATBOT_MAX_LENGTH) return;

    setInputMessage('');
    setAiDown(null);
    if (echo) setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await aiService.sendMessage(userText, sessionIdRef.current);
      if (res?.sessionId) {
        sessionIdRef.current = res.sessionId;
        writeSessionId(res.sessionId);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: res?.replyText || 'Xin lỗi, mình chưa hiểu yêu cầu. Bạn có thể nói rõ hơn không?',
          listings: Array.isArray(res?.suggestedListings) ? res.suggestedListings : [],
        },
      ]);
    } catch (err) {
      const status = err?.response?.status;
      if (INLINE_ERRORS[status]) {
        setMessages((prev) => [...prev, { id: `e-${Date.now()}`, sender: 'bot', isError: true, text: INLINE_ERRORS[status] }]);
      } else {
        // 503 AI_UNAVAILABLE, 5xx hoặc mất mạng -> màn "Xảy ra lỗi với AI"
        setAiDown(userText);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendText(inputMessage);
  };

  // Trên màn nhỏ, đóng chat khi khách bấm "Xem chi tiết" để thấy trang chi tiết.
  const handleNavigate = () => {
    if (window.matchMedia('(max-width: 639px)').matches) setIsOpen(false);
  };

  return (
    <>
      {/* NÚT TRÒN NỔI CỐ ĐỊNH GÓC DƯỚI PHẢI */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở trợ lý AI"
          title="Trợ lý AI"
          className="ai-chatbot-launcher fixed z-50 bottom-5 right-5 sm:bottom-6 sm:right-6 w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-black text-white border-[3px] border-[#F59E0B] shadow-[0_6px_20px_rgba(0,0,0,0.25)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <ChatBubbleIcon size={26} />
        </button>
      )}

      {/* CỬA SỔ CHAT */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Trợ lý AI"
          className="fixed z-50 inset-x-2 bottom-2 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[600px] sm:max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <div className="px-4 py-3 bg-[#F8F4E8] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <BotAvatar size="lg" />
              <div>
                <h4 className="font-bold text-base text-black leading-tight">Trợ lý AI</h4>
                <p className="text-xs text-[#16A34A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Đang trực tuyến
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
              className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] text-[#334155] flex items-center justify-center hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {aiDown !== null ? (
            /* TRẠNG THÁI AI KHÔNG HOẠT ĐỘNG */
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-white">
              <p className="font-bold text-sm text-black leading-snug">
                Xảy ra lỗi với AI
                <br />
                Vui lòng thử lại sau
              </p>
              <button
                type="button"
                onClick={() => sendText(aiDown, { echo: false })}
                disabled={loading}
                className="mt-4 text-xs text-[#64748B] underline underline-offset-2 hover:text-black cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang thử lại...' : 'Thử lại'}
              </button>
            </div>
          ) : (
            <>
              {/* KHUNG TIN NHẮN */}
              <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4 bg-white" aria-live="polite">
                {messages.map((msg) =>
                  msg.sender === 'user' ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[78%] px-4 py-2.5 rounded-2xl bg-black text-white text-sm leading-relaxed whitespace-pre-line break-words">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <BotAvatar />
                        <div
                          className={`max-w-[82%] px-3.5 py-2 rounded-2xl border text-sm leading-relaxed whitespace-pre-line break-words ${
                            msg.isError ? 'border-[#DC2626] text-[#991B1B] bg-[#FEF2F2]' : 'border-black text-black bg-white'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>

                      {/* PRODUCT CARD THU NHỎ (FR-10) */}
                      {msg.listings?.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto snap-x -mx-4 px-4 pl-[52px] pb-2 pt-0.5">
                          {msg.listings.map((l) => (
                            <MiniHotelCard key={l.maCSLT} listing={l} onNavigate={handleNavigate} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}

                {loading && (
                  <div className="flex items-start gap-2.5">
                    <BotAvatar />
                    <div className="px-4 py-3 rounded-2xl border border-black flex gap-1" aria-label="AI đang trả lời">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ô NHẬP PROMPT */}
              <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-[#F1F5F9] flex items-center gap-2.5 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  maxLength={CHATBOT_MAX_LENGTH}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập tin nhắn tại đây..."
                  aria-label="Nhập tin nhắn"
                  className="flex-1 h-10 px-4 text-sm bg-[#F8F4E8] border border-[#E7E2D3] rounded-full placeholder-[#94A3B8] focus:outline-hidden focus:border-black"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  aria-label="Gửi"
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-85 disabled:opacity-40 transition-opacity cursor-pointer flex-shrink-0"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
