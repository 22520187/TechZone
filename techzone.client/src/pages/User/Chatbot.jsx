import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, Modal, message as antMessage, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import GradientText from '../../components/ReactBitsComponent/GradientText';
import {
  saveChatMessage,
  getRecentChatHistory,
  deleteChatHistory,
  clearChatHistory,
  chatWithGemini
} from '../../features/Chatbot/Chatbot';
import { getAuthCookies } from '../../features/AxiosInstance/Cookies/CookiesHelper';
import { MessageCircle, User, Bot, Sparkles, Send, Trash2, ExternalLink, ShoppingCart } from 'lucide-react';

const { TextArea } = Input;

const Chatbot = () => {
  console.log('🎯 Chatbot component loaded!');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatbotState = useSelector((state) => state.chatbot);
  const chatHistory = chatbotState?.chatHistory || [];
  const authCookies = getAuthCookies();
  const userId = authCookies.userID ? parseInt(authCookies.userID) : null;
  
  console.log('👤 User ID:', userId);
  console.log('💬 Chat history length:', chatHistory.length);
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

  // Function to parse message content and convert /product/{id} links to clickable links
  const parseMessageContent = (content) => {
    if (!content) return content;
    
    // Split content by lines to preserve formatting
    const lines = content.split('\n');
    
    return lines.map((line, lineIndex) => {
      const parts = [];
      const linkRegex = /(\/?product\/(\d+))/g;
      let lastIndex = 0;
      let match;
      
      while ((match = linkRegex.exec(line)) !== null) {
        // Add text before link
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        
        // Add clickable link
        const productId = match[2];
        parts.push(
          <a
            key={`link-${lineIndex}-${match.index}`}
            href={`/products/${productId}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/products/${productId}`);
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold"
            style={{ textDecoration: 'underline' }}
          >
            {match[1]}
          </a>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      return (
        <div key={`line-${lineIndex}`}>
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };

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
    console.log('📝 [useEffect] chatHistory changed, length:', chatHistory?.length);
    console.log('📝 [useEffect] isLoadingHistory:', isLoadingHistory);
    console.log('📝 [useEffect] Current messages count:', messages.length);
    
    // Only update messages from history on initial load or when history actually changes
    // Skip if user is currently typing or just received a response
    if (isTyping) {
      console.log('⏸️ Skip history update - currently typing');
      return;
    }

    if (chatHistory && chatHistory.length > 0) {
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
                timestamp: new Date(chat.createdAt),
                // History messages don't have products, keep null
                products: null
              }
            ];
          }
          // Otherwise, use messageType to determine type
          const messageType = chat.messageType || (chat.message ? 'user' : 'bot');
          return {
            id: `${messageType}-${chat.chatHistoryId || index}-${chat.createdAt || Date.now()}`,
            type: messageType,
            content: chat.message || chat.response,
            timestamp: new Date(chat.createdAt),
            products: null
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory, isLoadingHistory]); // REMOVED isTyping from dependencies!

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    console.log('🚀 handleSendMessage called');
    
    if (!inputMessage.trim()) {
      console.log('❌ Empty message, returning');
      return;
    }

    const userMessageContent = inputMessage.trim();
    console.log('📝 User message:', userMessageContent);

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: userMessageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    console.log('🔄 Calling API...');

    try {
      // Call Gemini AI API
      const response = await dispatch(chatWithGemini({
        message: userMessageContent,
        userId: userId,
        historyLimit: 5
      })).unwrap();

      console.log('=== AI RESPONSE DEBUG ===');
      console.log('Full response:', JSON.stringify(response, null, 2));
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      console.log('Has products?:', 'products' in response);
      console.log('Products value:', response.products);
      console.log('Products type:', typeof response.products);
      console.log('Products is array?:', Array.isArray(response.products));
      console.log('Products length:', response.products?.length);
      console.log('========================');

      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: response.response || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
        timestamp: new Date(),
        products: response.products || null
      };

      console.log('Bot Response with products:', botResponse);

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      // DO NOT refresh chat history immediately after sending message
      // because it will overwrite the message with products
      // The history will be loaded on next page refresh
      
      /* Commented out to prevent overwriting products
      if (userId) {
        try {
          await dispatch(getRecentChatHistory({ userId, limit: 50 })).unwrap();
        } catch (error) {
          console.error("Error refreshing chat history:", error);
        }
      }
      */
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
            <div className="h-[600px] overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
              <div className="space-y-6 max-w-full">{/* Changed max-w-2xl to max-w-full */}
                {messages.map((message) => {
                  // Debug logging for each message render
                  if (message.type === 'bot') {
                    console.log(`[Render] Message ID: ${message.id}`);
                    console.log(`[Render] Has products?: ${message.products ? 'YES' : 'NO'}`);
                    console.log(`[Render] Products count: ${message.products?.length || 0}`);
                    if (message.products) {
                      console.log(`[Render] Products:`, message.products);
                    }
                  }
                  
                  return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'max-w-2xl flex-row-reverse space-x-reverse' : 'max-w-4xl'}`}>
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
                      <div className={`flex flex-col space-y-2 flex-1 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl ${message.type === 'user'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                          }`}>
                          <div className="text-sm leading-relaxed whitespace-pre-line">
                            {message.type === 'bot' ? parseMessageContent(message.content) : message.content}
                          </div>
                          <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white opacity-70' : 'text-gray-500'
                            }`}>
                            {message.timestamp.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Product Cards - Only show for bot messages */}
                        {message.type === 'bot' && message.products && message.products.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
                            {console.log('Rendering products:', message.products)}
                            {message.products.map((product) => (
                              <motion.div
                                key={product.productId}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/products/${product.productId}`)}
                              >
                                <div className="relative h-40 bg-gray-100">
                                  {product.imageUrl ? (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-2"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <ShoppingCart size={48} />
                                    </div>
                                  )}
                                  {product.stockQuantity !== null && product.stockQuantity !== undefined && (
                                    <div className="absolute top-2 right-2">
                                      <Tag color={product.stockQuantity > 0 ? 'green' : 'red'}>
                                        {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
                                      </Tag>
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">
                                      {product.brand && `${product.brand} • `}
                                      {product.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary">
                                      {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                      }).format(product.price)}
                                    </span>
                                    <Button
                                      type="link"
                                      size="small"
                                      icon={<ExternalLink size={14} />}
                                      className="text-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/products/${product.productId}`);
                                      }}
                                    >
                                      Chi tiết
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )})}

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