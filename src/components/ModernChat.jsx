import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import langflowApi from '../services/langflowApi';

const ModernChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
      avatar: '🤖'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    checkConnection();
    scrollToBottom();
  }, [messages]);

  const checkConnection = async () => {
    try {
      const connected = await langflowApi.checkHealth();
      setIsConnected(connected);
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isConnected) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      avatar: '👤'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await langflowApi.sendMessage(userMessage.content);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date(),
        avatar: '🤖'
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if voice is enabled
      if (isVoiceEnabled) {
        speakText(response);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I'm sorry, I encountered an issue: ${error.message}. Please try again or check your connection.`,
        timestamp: new Date(),
        avatar: '⚠️',
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isVoiceEnabled) {
      speechSynthesis.cancel();
    }
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
          message.type === 'user' 
            ? 'bg-primary-500 text-white' 
            : message.isError 
              ? 'bg-error-500 text-white'
              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
        }`}>
          {message.avatar}
        </div>

        {/* Message Content */}
        <div className={`rounded-2xl px-4 py-3 ${
          message.type === 'user'
            ? 'bg-primary-500 text-white'
            : message.isError
              ? 'bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 border border-error-200 dark:border-error-700'
              : 'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700'
        } shadow-soft`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className={`text-xs mt-2 ${
            message.type === 'user' ? 'text-primary-100' : 'text-secondary-500 dark:text-secondary-400'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-lg">
          🤖
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-2xl px-4 py-3 border border-secondary-200 dark:border-secondary-700 shadow-soft">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce-gentle"></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Floating Chat Button */}
      {!showChat && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-large flex items-center justify-center transition-all duration-300 z-50"
        >
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
        </motion.button>
      )}

      {/* Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-700 z-50 flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-white">AI Assistant</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`}></div>
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isLoading && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading || !isConnected}
                    className="flex-1 px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-2xl bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    disabled={isRecording || !isConnected}
                    className={`p-3 rounded-2xl transition-all duration-200 ${
                      isRecording
                        ? 'bg-error-500 text-white animate-pulse'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                    }`}
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim() || !isConnected}
                    className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-300 dark:disabled:bg-secondary-600 text-white rounded-2xl transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Voice Controls */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                      isVoiceEnabled
                        ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                        : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                    }`}
                  >
                    {isVoiceEnabled ? (
                      <>
                        <SpeakerWaveIcon className="w-4 h-4" />
                        <span>Voice On</span>
                      </>
                    ) : (
                      <>
                        <SpeakerXMarkIcon className="w-4 h-4" />
                        <span>Voice Off</span>
                      </>
                    )}
                  </button>
                  
                  {!isConnected && (
                    <span className="text-xs text-error-600 dark:text-error-400">
                      ⚠️ Not connected to AI service
                    </span>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModernChat;





