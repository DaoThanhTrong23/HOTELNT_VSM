import axiosClient from './axiosClient';

export const aiService = {
  // FR-10: Gửi tin nhắn đến Chatbot AI và nhận phản hồi kèm gợi ý phòng (ProductCard)
  sendMessage: (message, conversationHistory = []) => {
    return axiosClient.post('/ai/chat', {
      message,
      history: conversationHistory,
    });
  },
};
