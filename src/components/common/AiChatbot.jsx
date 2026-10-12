import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { HotelCard } from './HotelCard';

export const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý ảo hỗ trợ tìm phòng tại TP. Nha Trang. Bạn đang tìm phòng ở khu vực nào hoặc mức giá bao nhiêu?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Append user message
    const newMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const response = await aiService.sendMessage(userText, messages);
      // Giả lập hoặc format phản hồi
      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response?.text || 'Tôi đã tìm thấy một số cơ sở lưu trú phù hợp với yêu cầu của bạn:',
        recommendation: response?.hotel || null,
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Xin lỗi, hệ thống AI đang bận hoặc mất kết nối. Vui lòng thử lại sau!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#D97706] text-white flex items-center justify-center">
            <Bot size={20} />
          </div>
          <span className="font-semibold text-sm">Hỏi AI Nha Trang</span>
        </button>
      )}

      {/* POPUP CHAT WINDOW */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* HEADER */}
          <div className="px-5 py-4 bg-black text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D97706] flex items-center justify-center text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Trợ lý AI Du Lịch</h4>
                <p className="text-[11px] text-[#CBD5E1]">Hỗ trợ tìm kiếm & định vị</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8F4E8]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-black text-white rounded-br-xs'
                      : 'bg-white text-black border border-[#CBD5E1] rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* PRODUCT CARD EMBEDDED (FR-10) */}
                {msg.recommendation && (
                  <div className="w-full mt-3">
                    <HotelCard hotel={msg.recommendation} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <div className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></div>
                <span>AI đang tìm kiếm cơ sở lưu trú...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#CBD5E1] flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập yêu cầu (VD: Khách sạn gần biển dưới 500k)..."
              className="flex-1 px-4 py-2.5 text-sm bg-[#F8F4E8] border border-[#CBD5E1] rounded-full focus:outline-hidden focus:border-black focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-85 disabled:opacity-50 transition-opacity cursor-pointer flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
