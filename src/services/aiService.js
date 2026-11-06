import axiosClient from './axiosClient';
import { USE_MOCK, mockChatbotApi } from '../mocks/mockListings';

export const CHATBOT_MAX_LENGTH = 500;

export const aiService = {
  /**
   * FR-10: POST /chatbot/messages
   * body: { message, sessionId? }
   * res : { replyText, sessionId, suggestedListings?: [{ maCSLT, tenCSLT, tenLoai, gia, ngayCapNhatGia, duongDanAnh, lienHe }] }
   */
  sendMessage: async (message, sessionId) => {
    if (USE_MOCK) return mockChatbotApi.sendMessage(message, sessionId);
    try {
      const res = await axiosClient.post('/chatbot/messages', {
        message,
        ...(sessionId ? { sessionId } : {}),
      });
      return res?.data && typeof res.data === 'object' && 'replyText' in res.data ? res.data : res;
    } catch (err) {
      try {
        return await mockChatbotApi.sendMessage(message, sessionId);
      } catch {
        throw err;
      }
    }
  },
};
