import React, { useState, useEffect } from 'react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('general');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

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
  };

  const goBackToHome = () => {
    setShowChat(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Header */}
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
              <button
                onClick={toggleTheme}
                className="group relative p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-110 border border-white/20 dark:border-gray-600/50 shadow-lg hover:shadow-xl"
              >
                <span className="text-2xl group-hover:rotate-180 transition-transform duration-500">
                  {isDarkMode ? '☀️' : '🌙'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {!showChat ? (
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
            
            {/* CTA Button */}
            <div className="flex justify-center">
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
            </div>
          </div>
        ) : (
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
                
                <div className="text-center py-16">
                  <div className="text-8xl mb-8 animate-bounce">💬</div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-blue-600 dark:from-gray-300 dark:to-blue-400 bg-clip-text text-transparent mb-4">
                    Chat Interface Ready
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                    The chat interface is working! The full domain expertise system will be available here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
