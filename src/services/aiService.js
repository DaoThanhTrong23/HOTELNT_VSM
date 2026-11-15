import axiosClient from './axiosClient';
import { USE_MOCK, mockChatbotApi } from '../mocks/mockListings';
import { resolveHotelImageUrl } from '../utils/formatters';

export const CHATBOT_MAX_LENGTH = 500;

// Bộ phân loại intent cơ bản phía client để AI phản hồi thông minh, tự nhiên
const detectIntent = (text) => {
  const t = text.toLowerCase().trim();
  if (/^(xin\s*)?(chào|chao|hello|hi|hey|alo|alo\s*bot)\b/i.test(t) && t.length < 30) {
    return 'GREETING';
  }
  if (/(bạn là ai|mày là ai|bot là ai|ai vậy|giới thiệu|who are you)/i.test(t) && t.length < 40) {
    return 'WHO_AM_I';
  }
  if (/^(cảm ơn|cam on|thanks|thank you|ok cảm ơn|tuyệt vời|hay quá)\b/i.test(t) && t.length < 30) {
    return 'THANK_YOU';
  }
  if (/(thời tiết|thoi tiet|trời mưa|nhiệt độ|nắng không|mùa nào đẹp)/i.test(t) && !/khách sạn|homestay|phòng|giá/i.test(t)) {
    return 'WEATHER';
  }
  return 'SEARCH';
};

// Chuẩn hóa và làm sạch danh sách gợi ý từ Backend
const sanitizeListings = (listings, queryText = '') => {
  if (!Array.isArray(listings)) return [];

  // 1. Loại bỏ các cơ sở không hợp lệ hoặc của host bị khóa (ví dụ: maCSLT = 8 hoặc tên có 'bị khóa')
  let valid = listings.filter((l) => {
    if (!l || !l.maCSLT) return false;
    const name = String(l.tenCSLT || '').toLowerCase();
    if (name.includes('bị khóa') || name.includes('khoá') || name.includes('locked')) return false;
    return true;
  });

  // 2. Chuẩn hóa link ảnh cho từng cơ sở (nếu link relative thì gắn domain API)
  valid = valid.map((l) => ({
    ...l,
    duongDanAnh: resolveHotelImageUrl(l.duongDanAnh),
  }));

  // 3. Tinh chỉnh lọc giá nếu người dùng ghi rõ mức giá (ví dụ: "dưới 500k", "< 1tr")
  const priceMatch = queryText.match(/(?:dưới|<|nhỏ hơn|tối đa|không quá)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|m)?/i);
  if (priceMatch) {
    const num = parseFloat(priceMatch[1].replace(',', '.'));
    const unit = (priceMatch[2] || '').toLowerCase();
    const max = /tr|triệu|m/.test(unit) ? num * 1_000_000 : /k|nghìn|ngàn/.test(unit) ? num * 1000 : num;
    const priceFiltered = valid.filter((l) => typeof l.gia === 'number' && l.gia <= max);
    if (priceFiltered.length > 0) {
      valid = priceFiltered;
    }
  }

  return valid;
};

export const aiService = {
  /**
   * FR-10: POST /chatbot/messages
   * body: { message, sessionId? }
   * res : { replyText, sessionId, suggestedListings?: [{ maCSLT, tenCSLT, tenLoai, gia, ngayCapNhatGia, duongDanAnh, lienHe }] }
   */
  sendMessage: async (message, sessionId) => {
    const rawText = String(message || '').trim();
    if (USE_MOCK) return mockChatbotApi.sendMessage(rawText, sessionId);

    // 1. Ưu tiên gửi yêu cầu tới Backend API Azure (đã tích hợp LLM/NLP và lọc CSLT)
    try {
      const res = await axiosClient.post('/chatbot/messages', {
        message: rawText,
        ...(sessionId ? { sessionId } : {}),
      });

      const data = res?.data && typeof res.data === 'object' && 'replyText' in res.data ? res.data : res;
      const sanitized = sanitizeListings(data?.suggestedListings, rawText);

      let replyText = data?.replyText;
      if (!replyText || replyText.trim() === '') {
        replyText = sanitized.length
          ? `Mình tìm thấy ${sanitized.length} cơ sở lưu trú phù hợp với yêu cầu của bạn:`
          : 'Không tìm thấy cơ sở lưu trú phù hợp. Bạn thử nới rộng khoảng giá hoặc đổi từ khóa xem sao nhé!';
      }

      return {
        replyText,
        sessionId: data?.sessionId || sessionId || `session-${Date.now()}`,
        suggestedListings: sanitized,
      };
    } catch (err) {
      console.warn('⚠️ API Chatbot Backend gặp lỗi, chuyển sang fallback dự phòng thông minh:', err);

      // 2. Fallback xử lý thông minh nếu Backend offline hoặc lỗi kết nối
      const intent = detectIntent(rawText);
      if (intent === 'GREETING') {
        return {
          replyText: 'Xin chào! Mình là Trợ lý AI của Hotel Nha Trang 🏖️. Mình có thể hỗ trợ bạn tìm phòng khách sạn, homestay hay resort view biển theo khoảng giá mong muốn. Bạn muốn tìm phòng ở khu vực nào hay mức giá bao nhiêu một đêm?',
          sessionId: sessionId || `session-${Date.now()}`,
          suggestedListings: [],
        };
      }
      if (intent === 'WHO_AM_I') {
        return {
          replyText: 'Mình là Trợ lý ảo AI của nền tảng Hotel Nha Trang 🤖. Nhiệm vụ của mình là giúp bạn tra cứu nhanh các cơ sở lưu trú đã được duyệt, gợi ý phòng theo ngân sách, vị trí gần biển và cung cấp liên hệ trực tiếp với chủ cơ sở.',
          sessionId: sessionId || `session-${Date.now()}`,
          suggestedListings: [],
        };
      }
      if (intent === 'THANK_YOU') {
        return {
          replyText: 'Rất vui được hỗ trợ bạn! Chúc bạn có một chuyến du lịch Nha Trang ngập tràn niềm vui và trải nghiệm tuyệt vời 🌊. Nếu cần tìm phòng hay thông tin gì thêm, cứ nhắn mình bất cứ lúc nào nhé!',
          sessionId: sessionId || `session-${Date.now()}`,
          suggestedListings: [],
        };
      }
      if (intent === 'WEATHER') {
        return {
          replyText: 'TP. Nha Trang thường có khí hậu nhiệt đới nắng ấm quanh năm, rất tuyệt vời để tắm biển từ tháng 1 đến tháng 8 ☀️. Bạn có muốn mình tìm một khách sạn hoặc homestay view biển gần đường Trần Phú không?',
          sessionId: sessionId || `session-${Date.now()}`,
          suggestedListings: [],
        };
      }

      try {
        const fallback = await mockChatbotApi.sendMessage(rawText, sessionId);
        return {
          ...fallback,
          suggestedListings: sanitizeListings(fallback?.suggestedListings, rawText),
        };
      } catch {
        throw err;
      }
    }
  },
};
