import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { Input, Button, Modal, message as antMessage } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { 
  saveChatMessage, 
  getRecentChatHistory,
  deleteChatHistory,
  clearChatHistory,
  chatWithGemini
} from '../../../features/Chatbot/Chatbot';
import { getAuthCookies } from '../../../features/AxiosInstance/Cookies/CookiesHelper';

const { TextArea } = Input;

const ChatModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const chatbotState = useSelector((state) => state.chatbot);
  const chatHistory = chatbotState?.chatHistory || [];
  const authCookies = getAuthCookies();
  const userId = authCookies.userID ? parseInt(authCookies.userID) : null;
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm, dịch vụ và hỗ trợ mua sắm. Bạn cần hỗ trợ gì?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      const loadChatHistory = async () => {
        setIsLoadingHistory(true);
        try {
          await dispatch(getRecentChatHistory({ userId, limit: 50 })).unwrap();
        } catch (error) {
          console.error("Error loading chat history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      };

      loadChatHistory();
    }
  }, [isOpen, userId, dispatch]);

  // Convert chat history to messages format
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0 && isOpen) {
      const convertedMessages = chatHistory
        .filter(chat => chat.message || chat.response) // Filter out empty records
        .map((chat, index) => {
          // If both message and response exist, create two separate messages
          if (chat.message && chat.response) {
            return [
              {
                id: `user-${chat.chatHistoryId || index}-${chat.createdAt || Date.now()}`,
                type: 'user',
                content: chat.message,
                timestamp: new Date(chat.createdAt)
              },
              {
                id: `bot-${chat.chatHistoryId || index}-${chat.createdAt || Date.now()}`,
                type: 'bot',
                content: chat.response,
                timestamp: new Date(chat.createdAt)
              }
            ];
          }
          // Otherwise, use messageType to determine type
          const messageType = chat.messageType || (chat.message ? 'user' : 'bot');
          return {
            id: `${messageType}-${chat.chatHistoryId || index}-${chat.createdAt || Date.now()}`,
            type: messageType,
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
            content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm, dịch vụ và hỗ trợ mua sắm. Bạn cần hỗ trợ gì?',
            timestamp: new Date()
          },
          ...convertedMessages
        ]);
      } else {
        setMessages(convertedMessages);
      }
    } else if (chatHistory && chatHistory.length === 0 && !isLoadingHistory && isOpen) {
      // Reset to welcome message if no history
      setMessages([
        {
          id: 0,
          type: 'bot',
          content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm, dịch vụ và hỗ trợ mua sắm. Bạn cần hỗ trợ gì?',
          timestamp: new Date()
        }
      ]);
    }
  }, [chatHistory, isOpen, isLoadingHistory]);

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

    try {
      // Call Gemini AI API
      const response = await dispatch(chatWithGemini({
        message: userMessageContent,
        userId: userId,
        historyLimit: 5
      })).unwrap();

      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: response.response || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      // Refresh chat history to include the new messages
      if (userId) {
        try {
          await dispatch(getRecentChatHistory({ userId, limit: 50 })).unwrap();
        } catch (error) {
          console.error("Error refreshing chat history:", error);
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Fallback response if API fails
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: "Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      antMessage.error('Không thể kết nối với AI. Vui lòng thử lại.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
                content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm, dịch vụ và hỗ trợ mua sắm. Bạn cần hỗ trợ gì?',
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
              content: 'Xin chào! Tôi là AI Assistant của TechZone. Tôi có thể giúp bạn tìm hiểu về các sản phẩm, dịch vụ và hỗ trợ mua sắm. Bạn cần hỗ trợ gì?',
              timestamp: new Date()
            }
          ]);
          antMessage.success('Đã xóa lịch sử chat');
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-end p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-opacity-20"
          onClick={onClose}
        />

        {/* Chat Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            height: isMinimized ? 'auto' : '600px'
          }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          transition={{ duration: 0.3 }}
          className={`relative bg-white rounded-lg shadow-2xl ${
            isMinimized ? 'w-80' : 'w-96'
          } max-w-full flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold">TechZone AI Assistant</h3>
                <p className="text-xs opacity-90">Always ready to support you</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
            {!isMinimized && chatHistory && chatHistory.length > 0 && (
                <button
                  onClick={handleDeleteHistory}
                  className="p-1 hover:text-red-300 rounded transition-colors cursor-pointer"
                  title="Xóa lịch sử chat"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-black rounded transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:text-red-500 rounded transition-colors cursor-pointer text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && (
                          <Bot size={16} className="text-primary mt-1 flex-shrink-0" />
                        )}
                        {message.type === 'user' && (
                          <User size={16} className="text-white mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-white opacity-70' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
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
                    <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot size={16} className="text-primary" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-2">
                  <TextArea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your message..."
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    className="flex-1"
                  />
                  <Button
                    type="primary"
                    icon={<Send size={16} />}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-primary hover:bg-primary-600 border-primary"
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatModal;

