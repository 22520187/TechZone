import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { Input, Button } from 'antd';

const { TextArea } = Input;

const ChatModal = ({ isOpen, onClose }) => {
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: getBotResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('sản phẩm') || input.includes('product')) {
      return 'TechZone có nhiều sản phẩm công nghệ như laptop, điện thoại, phụ kiện... Bạn đang tìm loại sản phẩm nào cụ thể?';
    } else if (input.includes('giá') || input.includes('price')) {
      return 'Chúng tôi có nhiều mức giá phù hợp với mọi ngân sách. Bạn có thể xem chi tiết giá sản phẩm trên trang chủ hoặc cho tôi biết sản phẩm cụ thể bạn quan tâm.';
    } else if (input.includes('giao hàng') || input.includes('shipping')) {
      return 'TechZone hỗ trợ giao hàng toàn quốc với thời gian 1-3 ngày làm việc. Miễn phí giao hàng cho đơn hàng trên 500.000đ.';
    } else if (input.includes('bảo hành') || input.includes('warranty')) {
      return 'Tất cả sản phẩm tại TechZone đều có chế độ bảo hành chính hãng từ 12-24 tháng tùy theo từng loại sản phẩm.';
    } else {
      return 'Cảm ơn bạn đã liên hệ! Tôi sẽ cố gắng hỗ trợ bạn tốt nhất. Bạn có thể hỏi tôi về sản phẩm, giá cả, giao hàng, bảo hành hoặc bất kỳ thông tin nào về TechZone.';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
