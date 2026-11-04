import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, X, Send, Sparkles, ImageOff, RotateCcw } from 'lucide-react';
import { aiService, CHATBOT_MAX_LENGTH } from '../../services/aiService';
import { formatCurrency } from '../../utils/formatters';

const SESSION_KEY = 'hotelnt_chatbot_session';

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'bot',
  text: 'Xin chào! Mình là trợ lý AI giúp bạn tìm chỗ ở tại TP. Nha Trang. Bạn muốn ở khu vực nào, loại hình gì và mức giá khoảng bao nhiêu?',
};

const QUICK_PROMPTS = ['Khách sạn gần biển dưới 1 triệu', 'Homestay giá rẻ', 'Resort có hồ bơi'];

const ERROR_MESSAGES = {
  429: 'Bạn đang gửi tin nhắn hơi nhanh. Vui lòng đợi một chút rồi thử lại nhé!',
  503: 'Trợ lý AI đang tạm thời bận. Bạn thử lại sau ít phút nhé!',
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

/* Thẻ HotelCard thu nhỏ hiển thị trong tin nhắn bot (ảnh, giá, nút xem chi tiết) */
const MiniHotelCard = ({ listing, onNavigate }) => (
  <div className="w-52 flex-shrink-0 snap-start bg-white rounded-2xl border border-[#CBD5E1] overflow-hidden shadow-xs">
    <div className="relative h-28 bg-[#CBD5E1]">
      {listing.duongDanAnh ? (
        <img src={listing.duongDanAnh} alt={listing.tenCSLT} loading="lazy" className="w-full h-full object-cover text-transparent" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#64748B]">
          <ImageOff size={20} />
        </div>
      )}
      {listing.tenLoai && (
        <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
          {listing.tenLoai}
        </span>
      )}
    </div>
    <div className="p-3 space-y-2">
      <h5 className="font-bold text-[13px] text-black leading-snug line-clamp-2 min-h-[2.4em]">{listing.tenCSLT}</h5>
      <div>
        <span className="text-[10px] text-[#64748B] block">Giá từ</span>
        <span className="font-bold text-sm text-black">{formatCurrency(listing.gia)}</span>
      </div>
      <Link
        to={`/hotel/${listing.maCSLT}`}
        onClick={onNavigate}
        className="block w-full text-center py-2 rounded-lg bg-black text-white text-xs font-semibold hover:opacity-85 transition-opacity"
      >
        Xem chi tiết
      </Link>
    </div>
  </div>
);

export const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
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

  const sendText = async (raw) => {
    const userText = raw.trim();
    if (!userText || loading || userText.length > CHATBOT_MAX_LENGTH) return;

    setInputMessage('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: userText }]);
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
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          sender: 'bot',
          isError: true,
          text: ERROR_MESSAGES[status] || 'Xin lỗi, không kết nối được tới trợ lý AI. Vui lòng thử lại sau!',
          retryText: status === 400 ? null : userText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendText(inputMessage);
  };

  const resetConversation = () => {
    sessionIdRef.current = null;
    writeSessionId(null);
    setMessages([WELCOME_MESSAGE]);
  };

  // Trên màn nhỏ, đóng chat khi khách bấm "Xem chi tiết" để thấy trang chi tiết.
  const handleNavigate = () => {
    if (window.matchMedia('(max-width: 639px)').matches) setIsOpen(false);
  };

  const remaining = CHATBOT_MAX_LENGTH - inputMessage.length;
  const showQuickPrompts = messages.length === 1 && !loading;

  return (
    <>
      {/* NÚT TRÒN NỔI CỐ ĐỊNH GÓC DƯỚI PHẢI */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở trợ lý AI tìm phòng"
          title="Hỏi trợ lý AI"
          className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full bg-[#D97706]/40 animate-ping [animation-duration:2.5s]" aria-hidden="true" />
          <span className="relative w-full h-full rounded-full bg-black flex items-center justify-center">
            <Bot size={28} />
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#D97706] border-2 border-white flex items-center justify-center">
            <Sparkles size={10} />
          </span>
        </button>
      )}

      {/* CỬA SỔ POPUP CHAT */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Trợ lý AI tìm phòng"
          className="fixed z-50 inset-x-2 bottom-2 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <div className="px-4 py-3.5 bg-black text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#D97706] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Trợ lý AI Nha Trang</h4>
                <p className="text-[11px] text-[#CBD5E1] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Gợi ý chỗ ở theo yêu cầu của bạn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetConversation}
                aria-label="Bắt đầu cuộc trò chuyện mới"
                title="Cuộc trò chuyện mới"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng chat"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* KHUNG TIN NHẮN */}
          <div className="flex-1 px-3 py-4 overflow-y-auto space-y-4 bg-[#F8F4E8]/60" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line break-words ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-br-md'
                        : msg.isError
                          ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#F4A9A9] rounded-bl-md'
                          : 'bg-white text-black border border-[#CBD5E1] rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                    {msg.retryText && (
                      <button
                        type="button"
                        onClick={() => sendText(msg.retryText)}
                        disabled={loading}
                        className="mt-2 flex items-center gap-1 text-xs font-semibold underline cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw size={12} /> Gửi lại
                      </button>
                    )}
                  </div>
                </div>

                {/* PRODUCT CARD THU NHỎ TRONG TIN NHẮN (FR-10) */}
                {msg.listings?.length > 0 && (
                  <div className="w-full mt-2.5 pl-9 -mr-3">
                    <div className="flex gap-2.5 overflow-x-auto pb-2 pr-3 snap-x">
                      {msg.listings.map((l) => (
                        <MiniHotelCard key={l.maCSLT} listing={l} onNavigate={handleNavigate} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-[#CBD5E1] flex gap-1" aria-label="AI đang trả lời">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 rounded-full bg-[#64748B] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {showQuickPrompts && (
              <div className="flex flex-wrap gap-2 pl-9">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendText(p)}
                    className="px-3 py-1.5 rounded-full border border-[#CBD5E1] bg-white text-xs text-black hover:border-black cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô NHẬP PROMPT */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#CBD5E1] flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputMessage}
                maxLength={CHATBOT_MAX_LENGTH}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    sendText(inputMessage);
                  }
                }}
                placeholder="VD: Khách sạn gần biển dưới 500k..."
                aria-label="Nhập yêu cầu tìm phòng"
                className="flex-1 resize-none max-h-28 px-4 py-2.5 text-sm bg-[#F8F4E8] border border-[#CBD5E1] rounded-2xl focus:outline-hidden focus:border-black focus:bg-white field-sizing-content"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                aria-label="Gửi"
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-85 disabled:opacity-40 transition-opacity cursor-pointer flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            {remaining <= 100 && (
              <p className={`text-[11px] mt-1 text-right ${remaining <= 20 ? 'text-[#DC2626]' : 'text-[#64748B]'}`}>
                Còn {remaining} ký tự
              </p>
            )}
          </form>
        </div>
      )}
    </>
  );
};
