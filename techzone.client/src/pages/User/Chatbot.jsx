import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Input, Button, Card, Modal, message as antMessage } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import GradientText from '../../components/ReactBitsComponent/GradientText';
import {
  saveChatMessage,
  getRecentChatHistory,
  deleteChatHistory,
  clearChatHistory
} from '../../features/Chatbot/Chatbot';
import { getAuthCookies } from '../../features/AxiosInstance/Cookies/CookiesHelper';

const { TextArea } = Input;

const Chatbot = () => {
  const dispatch = useDispatch();
  const chatbotState = useSelector((state) => state.chatbot);
  const chatHistory = chatbotState?.chatHistory || [];
  const authCookies = getAuthCookies();
  const userId = authCookies.userID ? parseInt(authCookies.userID) : null;
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm công nghệ, tư vấn mua sắm, và trả lời mọi câu hỏi về dịch vụ của chúng tôi. Bạn cần hỗ trợ gì hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (userId) {
        setIsLoadingHistory(true);
        try {
          await dispatch(getRecentChatHistory({ userId, limit: 50 })).unwrap();
        } catch (error) {
          console.error("Error loading chat history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    loadChatHistory();
  }, [userId, dispatch]);

  // Convert chat history to messages format
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const convertedMessages = chatHistory
        .filter(chat => chat.message || chat.response) // Filter out empty records
        .map((chat, index) => {
          // If both message and response exist, create two separate messages
          if (chat.message && chat.response) {
            return [
              {
                id: chat.chatHistoryId * 2 || index * 2 + 1,
                type: 'user',
                content: chat.message,
                timestamp: new Date(chat.createdAt)
              },
              {
                id: chat.chatHistoryId * 2 + 1 || index * 2 + 2,
                type: 'bot',
                content: chat.response,
                timestamp: new Date(chat.createdAt)
              }
            ];
          }
          // Otherwise, use messageType to determine type
          return {
            id: chat.chatHistoryId || index + 1,
            type: chat.messageType || (chat.message ? 'user' : 'bot'),
            content: chat.message || chat.response,
            timestamp: new Date(chat.createdAt)
          };
        })
        .flat() // Flatten array if we created pairs
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp

      // Add welcome message if no history or first time
      if (convertedMessages.length === 0 ||
        !convertedMessages.some(m => m.type === 'bot' && m.content.includes('Xin chào'))) {
        setMessages([
          {
            id: 0,
            type: 'bot',
            content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm công nghệ, tư vấn mua sắm, và trả lời mọi câu hỏi về dịch vụ của chúng tôi. Bạn cần hỗ trợ gì hôm nay?',
            timestamp: new Date()
          },
          ...convertedMessages
        ]);
      } else {
        setMessages(convertedMessages);
      }
    } else if (chatHistory && chatHistory.length === 0 && !isLoadingHistory) {
      // Reset to welcome message if no history
      setMessages([
        {
          id: 0,
          type: 'bot',
          content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm công nghệ, tư vấn mua sắm, và trả lời mọi câu hỏi về dịch vụ của chúng tôi. Bạn cần hỗ trợ gì hôm nay?',
          timestamp: new Date()
        }
      ]);
    }
  }, [chatHistory, isLoadingHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessageContent = inputMessage.trim();

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: userMessageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Get bot response
    const botResponseContent = getBotResponse(userMessageContent);

    // Simulate AI response delay
    setTimeout(async () => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      // Save to database
      if (userId) {
        try {
          // Save user message
          await dispatch(saveChatMessage({
            message: userMessageContent,
            response: '',
            messageType: 'user'
          })).unwrap();

          // Save bot response
          await dispatch(saveChatMessage({
            message: '',
            response: botResponseContent,
            messageType: 'bot'
          })).unwrap();
        } catch (error) {
          console.error("Error saving chat message:", error);
        }
      }
    }, 1500);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (input.includes('laptop') || input.includes('máy tính')) {
      return 'TechZone có nhiều dòng laptop từ gaming, văn phòng đến workstation. Một số thương hiệu nổi bật như ASUS, Dell, HP, Lenovo với giá từ 10 triệu đến 50 triệu. Bạn cần laptop cho mục đích gì?';
    } else if (input.includes('điện thoại') || input.includes('phone')) {
      return 'Chúng tôi có đầy đủ các dòng smartphone từ iPhone, Samsung Galaxy, Xiaomi, OPPO... với nhiều phân khúc giá. Bạn có ngân sách bao nhiêu và cần tính năng gì đặc biệt?';
    } else if (input.includes('gaming') || input.includes('game')) {
      return 'TechZone chuyên cung cấp gear gaming: PC gaming, laptop gaming, chuột, bàn phím cơ, tai nghe, ghế gaming... Bạn đang tìm thiết bị gaming nào cụ thể?';
    } else if (input.includes('giá') || input.includes('price')) {
      return 'Giá sản phẩm tại TechZone rất cạnh tranh với nhiều chương trình khuyến mãi. Bạn có thể cho tôi biết sản phẩm cụ thể để tôi tư vấn giá tốt nhất?';
    } else if (input.includes('giao hàng') || input.includes('shipping')) {
      return 'TechZone hỗ trợ giao hàng toàn quốc:\n• Nội thành: 1-2 ngày\n• Tỉnh thành: 2-3 ngày\n• Miễn phí ship cho đơn từ 500k\n• Giao hàng nhanh trong 2h (phí 30k)';
    } else if (input.includes('bảo hành') || input.includes('warranty')) {
      return 'Chế độ bảo hành tại TechZone:\n• Laptop: 12-24 tháng\n• Điện thoại: 12 tháng\n• Phụ kiện: 6-12 tháng\n• Bảo hành chính hãng, đổi mới trong 7 ngày đầu';
    } else if (input.includes('khuyến mãi') || input.includes('sale')) {
      return 'Hiện tại TechZone đang có nhiều chương trình:\n• Giảm 10-20% laptop gaming\n• Mua phone tặng phụ kiện\n• Trade-in máy cũ lên đời\n• Trả góp 0% lãi suất';
    } else {
      return 'Cảm ơn bạn đã quan tâm đến TechZone! Tôi có thể hỗ trợ bạn về:\n• Tư vấn sản phẩm công nghệ\n• Thông tin giá cả và khuyến mãi\n• Chính sách bảo hành, giao hàng\n• So sánh sản phẩm\nBạn cần hỗ trợ gì cụ thể?';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'Laptop gaming tốt nhất',
    'iPhone mới nhất',
    'PC build gaming 20 triệu',
    'Khuyến mãi tháng này',
    'Chính sách bảo hành'
  ];

  const handleDeleteHistory = () => {
    Modal.confirm({
      title: 'Xóa lịch sử chat',
      content: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        if (userId) {
          try {
            await dispatch(deleteChatHistory(userId)).unwrap();
            dispatch(clearChatHistory());
            setMessages([
              {
                id: 0,
                type: 'bot',
                content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm công nghệ, tư vấn mua sắm, và trả lời mọi câu hỏi về dịch vụ của chúng tôi. Bạn cần hỗ trợ gì hôm nay?',
                timestamp: new Date()
              }
            ]);
            antMessage.success('Đã xóa lịch sử chat thành công');
          } catch (error) {
            antMessage.error('Có lỗi xảy ra khi xóa lịch sử chat');
            console.error("Error deleting chat history:", error);
          }
        } else {
          // Nếu chưa đăng nhập, chỉ xóa local state
          dispatch(clearChatHistory());
          setMessages([
            {
              id: 0,
              type: 'bot',
              content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm công nghệ, tư vấn mua sắm, và trả lời mọi câu hỏi về dịch vụ của chúng tôi. Bạn cần hỗ trợ gì hôm nay?',
              timestamp: new Date()
            }
          ]);
          antMessage.success('Đã xóa lịch sử chat');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-full mr-4">
              <MessageCircle className="text-white" size={32} />
            </div>
            <GradientText
              colors={["#50bbf5", "#5069f5", "#50bbf5", "#5069f5", "#50bbf5"]}
              className="text-4xl"
              animationSpeed={3}
              showBorder={false}
            >
              TechZone AI Assistant
            </GradientText>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Trợ lý AI thông minh giúp bạn tìm kiếm sản phẩm, tư vấn công nghệ và hỗ trợ mua sắm tại TechZone
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-xl border-0 overflow-hidden">
            {/* Header with Delete Button */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
              <h3 className="text-lg font-semibold text-gray-800">Chat với AI Assistant</h3>
              {chatHistory && chatHistory.length > 0 && (
                <Button
                  type="text"
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={handleDeleteHistory}
                  className="flex items-center gap-2"
                >
                  Xóa lịch sử
                </Button>
              )}
            </div>
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
              <div className="space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}>
                        {message.type === 'user' ? (
                          <User size={20} className="text-white" />
                        ) : (
                          <Bot size={20} className="text-white" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`px-4 py-3 rounded-2xl ${message.type === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                        }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {message.content}
                        </p>
                        <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white opacity-70' : 'text-gray-500'
                          }`}>
                          {message.timestamp.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Sparkles size={16} className="text-purple-500" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Questions */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-600 mb-3">Câu hỏi gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t">
              <div className="flex space-x-4">
                <TextArea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn về sản phẩm, giá cả, tư vấn..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="flex-1 text-base"
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<Send size={18} />}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-primary to-secondary border-0 hover:opacity-90 px-6"
                >
                  Gửi
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;