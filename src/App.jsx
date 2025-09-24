import React, { useState, useEffect } from 'react';
import AuthModal from './components/Auth/AuthModal';
import UserProfile from './components/Auth/UserProfile';
import DomainSwitcher from './components/DomainSwitcher';
import DomainIndicator from './components/DomainIndicator';
import ComplianceChecker from './components/ComplianceChecker';
import DomainWorkflow from './components/DomainWorkflow';
import domainService from './services/domainService';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStockAnalysis, setShowStockAnalysis] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('general');
  const [showDomainSwitcher, setShowDomainSwitcher] = useState(false);
  const [complianceChecks, setComplianceChecks] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [error, setError] = useState(null);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error) => {
      console.error('App Error:', error);
      setError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show error if there's one
  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c00' }}>
        <h2>Error Loading App</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedDomain = localStorage.getItem('currentDomain');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    if (savedDomain) {
      setCurrentDomain(savedDomain);
      if (domainService && domainService.setCurrentDomain) {
        domainService.setCurrentDomain(savedDomain);
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowChat(false);
    setShowHistory(false);
    setShowStockAnalysis(false);
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleDomainChange = (domainKey) => {
    if (domainKey === 'switch') {
      setShowDomainSwitcher(true);
    } else {
      setCurrentDomain(domainKey);
      if (domainService && domainService.setCurrentDomain) {
        domainService.setCurrentDomain(domainKey);
      }
      localStorage.setItem('currentDomain', domainKey);
    }
  };

  const handleComplianceResult = (checks) => {
    setComplianceChecks(checks);
  };

  const handleWorkflowSelect = (workflow) => {
    setSelectedWorkflow(workflow);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleStartChat = () => {
    setShowChat(true);
    setShowHistory(false);
    setShowStockAnalysis(false);
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m Zeno, your AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  const openHistory = () => {
    setShowHistory(true);
    setShowChat(false);
    setShowStockAnalysis(false);
  };

  const openStockAnalysis = () => {
    setShowStockAnalysis(true);
    setShowChat(false);
    setShowHistory(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the real chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          userId: user?.id || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.response) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'No response received');
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToHome = () => {
    setShowChat(false);
    setShowHistory(false);
    setShowStockAnalysis(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-bounce" style={{animationDuration: '6s'}} />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Glassmorphism Header */}
      <header className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white text-3xl">🤖</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Zeno
                </h1>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Next-Gen Intelligence
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DomainIndicator 
                currentDomain={currentDomain}
                onDomainChange={handleDomainChange}
              />
              
              {/* Back to Home Button - Always visible */}
              {(showChat || showHistory || showStockAnalysis) && (
                <button
                  onClick={goBackToHome}
                  className="group relative px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center space-x-2">
                    <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                    <span className="text-sm font-medium">Home</span>
                  </span>
                </button>
              )}
              
              <button
                onClick={toggleTheme}
                className="group relative p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-110 border border-white/20 dark:border-gray-600/50 shadow-lg hover:shadow-xl"
              >
                <span className="text-2xl group-hover:rotate-180 transition-transform duration-500">
                  {isDarkMode ? '☀️' : '🌙'}
                </span>
              </button>
              
              {user ? (
                <UserProfile 
                  user={user} 
                  onLogout={handleLogout}
                  onUpdateProfile={handleUpdateProfile}
                />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Floating Back Button */}
      {(showChat || showHistory || showStockAnalysis) && (
        <div className="fixed top-24 right-6 z-50">
          <button
            onClick={goBackToHome}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-blue-500/25 animate-bounceGentle"
          >
            <span className="flex items-center space-x-2">
              <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">🏠</span>
              <span className="font-medium">Back to Home</span>
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      {(showChat || showHistory || showStockAnalysis) && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={goBackToHome}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              🏠 Home
            </button>
            <span>›</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {showChat && 'Chat with Zeno'}
              {showHistory && 'Chat History'}
              {showStockAnalysis && 'Stock Analysis'}
            </span>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {!showChat && !showHistory && !showStockAnalysis ? (
          <div className="text-center space-y-16 relative">
            {/* Hero Section */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative p-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="space-y-8">
                  <div className="relative">
                    <h2 className="text-7xl sm:text-8xl lg:text-9xl font-black mb-8 leading-tight">
                      <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        The Future of
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-pulse">
                        Conversation
                      </span>
                    </h2>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 animate-bounce"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                  </div>
                  
                  <p className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-200 font-light max-w-5xl mx-auto leading-relaxed">
                    Experience the next generation of AI chatbots with 
                    <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> cutting-edge technology</span>, 
                    neural networks, and quantum-inspired responses that feel truly human.
                  </p>
                  
                  <div className="flex justify-center space-x-4 mt-12">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
              <button 
                onClick={handleStartChat}
                className="group relative px-16 py-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-110 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center space-x-4">
                  <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                  <span>Start Chatting with Zeno</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              </button>
              
              <button 
                onClick={openHistory}
                className="group relative px-16 py-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-110 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center space-x-4">
                  <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">📚</span>
                  <span>View Chat History</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              </button>
              
              <button 
                onClick={openStockAnalysis}
                className="group relative px-16 py-8 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-110 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center space-x-4">
                  <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">📈</span>
                  <span>Stock Market Analysis</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              </button>
            </div>
            
            {/* Quick Access Buttons */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDomainSwitcher(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Switch Domain</span>
                  </span>
                </button>
                
                {user && (
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🧠</div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent mb-4">Neural Networks</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">Advanced AI processing with deep learning capabilities and quantum-inspired algorithms</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-yellow-600 dark:from-white dark:to-yellow-400 bg-clip-text text-transparent mb-4">Real-time Processing</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">Instant responses with lightning-fast AI computation and optimized performance</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🔮</div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent mb-4">Predictive AI</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">Smart suggestions and intelligent conversation flow with contextual understanding</p>
                </div>
              </div>
            </div>
          </div>
        ) : showChat ? (
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">💬</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                        Chat with Zeno
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        AI Assistant Online
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={goBackToHome}
                    className="group/back px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="group-hover/back:-translate-x-1 transition-transform duration-300">←</span>
                      <span>Back to Home</span>
                    </span>
                  </button>
                </div>
                
                    <div className="space-y-6 mb-8 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                          <div className={`max-w-lg px-6 py-4 rounded-3xl shadow-lg ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white border border-white/20 dark:border-gray-600/50'
                          }`}>
                            <div className="flex items-start space-x-3">
                              {message.type === 'bot' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                  <span className="text-white text-sm">🤖</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-medium opacity-70">
                                    {message.type === 'user' ? 'You' : 'Zeno'}
                                  </p>
                                  {message.type === 'bot' && currentDomain !== 'general' && domainService && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-xs text-blue-600 dark:text-blue-400 rounded-full">
                                      {domainService.getDomain ? domainService.getDomain(currentDomain).name : currentDomain}
                                    </span>
                                  )}
                                </div>
                                <p className="leading-relaxed">{message.content}</p>
                                
                                {/* Domain-specific compliance checks */}
                                {message.type === 'user' && (
                                  <ComplianceChecker
                                    message={message.content}
                                    domain={currentDomain}
                                    onComplianceResult={handleComplianceResult}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white px-6 py-4 rounded-3xl shadow-lg border border-white/20 dark:border-gray-600/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">🤖</span>
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                    {/* Domain Workflow Section */}
                    {currentDomain !== 'general' && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <DomainWorkflow
                          domain={currentDomain}
                          onWorkflowSelect={handleWorkflowSelect}
                        />
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder={`Type your message here... ${currentDomain !== 'general' && domainService && domainService.getDomain ? `(${domainService.getDomain(currentDomain).name} mode)` : ''}`}
                          className="w-full px-6 py-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/20 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg transition-all duration-300"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                      >
                        <span className="flex items-center space-x-2">
                          <span>Send</span>
                          <span className="text-lg">🚀</span>
                        </span>
                      </button>
                    </form>
              </div>
            </div>
          </div>
        ) : showHistory ? (
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">📚</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 dark:from-white dark:to-emerald-400 bg-clip-text text-transparent">
                        Chat History
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">Your conversation archive</p>
                    </div>
                  </div>
                  <button
                    onClick={goBackToHome}
                    className="group/back px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="group-hover/back:-translate-x-1 transition-transform duration-300">←</span>
                      <span>Back to Home</span>
                    </span>
                  </button>
                </div>
                
                    <div className="text-center py-16">
                      <div className="text-8xl mb-8 animate-bounce">📚</div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-emerald-600 dark:from-gray-300 dark:to-emerald-400 bg-clip-text text-transparent mb-4">
                        No Chat History Yet
                      </h3>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        Start a conversation with Zeno to see your chat history here. All your interactions will be saved and accessible.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={handleStartChat}
                          className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xl font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <span className="flex items-center space-x-3">
                            <span>Start Chatting</span>
                            <span className="text-2xl">🚀</span>
                          </span>
                        </button>
                        
                        <button
                          onClick={goBackToHome}
                          className="px-12 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-xl font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <span className="flex items-center space-x-3">
                            <span>←</span>
                            <span>Back to Home</span>
                          </span>
                        </button>
                      </div>
                    </div>
              </div>
            </div>
          </div>
        ) : showStockAnalysis ? (
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">📈</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-600 dark:from-white dark:to-green-400 bg-clip-text text-transparent">
                        Stock Market Analysis
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">AI-powered financial insights</p>
                    </div>
                  </div>
                  <button
                    onClick={goBackToHome}
                    className="group/back px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="group-hover/back:-translate-x-1 transition-transform duration-300">←</span>
                      <span>Back to Home</span>
                    </span>
                  </button>
                </div>
                
                <div className="text-center py-16">
                  <div className="text-8xl mb-8 animate-pulse">📈</div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-green-600 dark:from-gray-300 dark:to-green-400 bg-clip-text text-transparent mb-4">
                    Stock Analysis Coming Soon
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                    Advanced stock market analysis with real-time data, technical indicators, and AI-powered insights.
                  </p>
                  
                      <div className="mt-12 p-8 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-3xl border border-green-200/50 dark:border-green-700/50">
                        <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                          🚀 Upcoming Features
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">📊</span>
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">Real-time stock quotes and charts</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">📈</span>
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">Technical analysis indicators (RSI, MACD, Bollinger Bands)</span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">🏢</span>
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">Fundamental data and company insights</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">🤖</span>
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">AI-powered trading recommendations</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex justify-center">
                          <button
                            onClick={goBackToHome}
                            className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <span className="flex items-center space-x-2">
                              <span>←</span>
                              <span>Back to Home</span>
                            </span>
                          </button>
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      
      {/* Footer */}
      <footer className="relative mt-32 py-16">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                Powered by Advanced AI Technology
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Next-Gen Intelligence</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Zeno. Built with React, Vite & TailwindCSS
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Version 2.0
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Domain Switcher Modal */}
      <DomainSwitcher
        currentDomain={currentDomain}
        onDomainChange={handleDomainChange}
        isOpen={showDomainSwitcher}
        onClose={() => setShowDomainSwitcher(false)}
      />
    </div>
  );
}

export default App;
