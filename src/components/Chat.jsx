import React, { useState, useRef, useEffect } from 'react';
import langflowApi from '../services/langflowApi';
import weatherApi from '../services/weatherApi';
import voiceService from '../services/voiceService';
import VoiceControls from './VoiceControls';
import { getWeatherApiKey } from '../config.js';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `🤖 **Hello! I'm your intelligent AI assistant powered by Langflow!**\n\nI can help with:\n💡 General Q&A • 📊 Data Analysis • 🧮 Math & Logic\n🌐 Knowledge • ✍️ Writing Help • 🎯 Smart Suggestions\n🎤 **Voice Assistant** - Talk to me naturally!\n\n**Try asking:**\n- "What is machine learning?"\n- "Weather in New York"\n- "Solve: 2x + 5 = 15"\n- "Help me write an email"\n\n**Voice:** Click 🎤 to speak, 🔊 to hear responses\n\n⚠️ **Note:** Currently experiencing Google API rate limits. Responses may be delayed. The service will resume automatically.\n\nWhat would you like to explore? 🌟`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [conversationContext, setConversationContext] = useState({
    lastTopic: '',
    userPreferences: {},
    interactionCount: 0
  });
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  // Check Langflow connection and set weather API key on component mount
  useEffect(() => {
    checkConnection();
    setWeatherApiKey(getWeatherApiKey());
    scrollToBottom();
  }, [messages]);

  // Handle voice input
  const handleVoiceInput = (transcript) => {
    setInputValue(transcript);
    // Automatically submit voice input after a short delay
    setTimeout(() => {
      if (transcript.trim()) {
        handleSubmit(new Event('submit'));
      }
    }, 500);
  };

  // Keyboard shortcuts for voice control
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl/Cmd + Space to toggle voice input
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
        event.preventDefault();
        // Trigger voice input
        if (voiceService.isSupported()) {
          voiceService.startListening();
        }
      }
      
      // Ctrl/Cmd + V to toggle voice output
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyV') {
        event.preventDefault();
        handleVoiceToggle(!isVoiceEnabled);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVoiceEnabled]);

  // Handle voice output toggle
  const handleVoiceToggle = (enabled) => {
    setIsVoiceEnabled(enabled);
    
    // If enabling voice output, speak the last bot message
    if (enabled && messages.length > 0) {
      const lastBotMessage = messages.filter(m => m.type === 'bot').pop();
      if (lastBotMessage) {
        voiceService.speak(lastBotMessage.content);
      }
    } else if (!enabled) {
      // Stop any current speech
      voiceService.stopSpeaking();
    }
  };

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const connected = await langflowApi.checkHealth();
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      if (!connected) {
        console.warn('Langflow is not accessible. Make sure it\'s running on localhost:7860');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setConnectionStatus('error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enhanced conversation context tracking
  const updateConversationContext = (userMessage, botResponse) => {
    setConversationContext(prev => ({
      ...prev,
      lastTopic: extractTopic(userMessage),
      interactionCount: prev.interactionCount + 1,
      userPreferences: updateUserPreferences(userMessage, prev.userPreferences)
    }));
  };

  // Extract conversation topic for context
  const extractTopic = (message) => {
    const topics = {
      'weather': ['weather', 'temperature', 'forecast', 'climate', 'rain', 'snow', 'sunny', 'cloudy'],
      'math': ['calculate', 'solve', 'equation', 'math', 'number', 'percent', 'ratio'],
      'writing': ['write', 'email', 'story', 'caption', 'essay', 'letter', 'content'],
      'fitness': ['fitness', 'exercise', 'workout', 'health', 'diet', 'nutrition'],
      'technology': ['ai', 'machine learning', 'programming', 'software', 'computer'],
      'general': ['what', 'how', 'why', 'when', 'where', 'explain', 'tell me']
    };

    const lowerMessage = message.toLowerCase();
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return topic;
      }
    }
    return 'general';
  };

  // Update user preferences based on interactions
  const updateUserPreferences = (message, currentPreferences) => {
    const newPreferences = { ...currentPreferences };
    
    // Detect if user prefers detailed or concise answers
    if (message.toLowerCase().includes('detailed') || message.toLowerCase().includes('explain more')) {
      newPreferences.detailLevel = 'detailed';
    } else if (message.toLowerCase().includes('brief') || message.toLowerCase().includes('summarize')) {
      newPreferences.detailLevel = 'concise';
    }

    // Detect preferred format
    if (message.toLowerCase().includes('table') || message.toLowerCase().includes('list')) {
      newPreferences.format = 'structured';
    } else if (message.toLowerCase().includes('story') || message.toLowerCase().includes('creative')) {
      newPreferences.format = 'creative';
    }

    return newPreferences;
  };

  // Generate proactive suggestions based on context
  const generateProactiveSuggestions = (topic, userMessage) => {
    const suggestions = {
      weather: [
        "🌤️ **Proactive Weather Tips:**\n• Check the 5-day forecast for better planning\n• Consider clothing suggestions based on conditions\n• Get sunrise/sunset times for outdoor activities",
        "Would you like me to suggest appropriate clothing for today's weather?"
      ],
      math: [
        "🧮 **Math Help Available:**\n• Step-by-step solutions\n• Multiple solving methods\n• Practice problems with explanations",
        "Would you like me to explain the solution step by step?"
      ],
      writing: [
        "✍️ **Writing Assistance:**\n• Tone adjustment (formal/casual)\n• Grammar and style improvements\n• Creative variations",
        "Would you like me to suggest different writing styles or tones?"
      ],
      fitness: [
        "💪 **Fitness & Health Tips:**\n• Personalized workout suggestions\n• Nutrition advice\n• Progress tracking ideas",
        "Would you like me to create a personalized fitness plan?"
      ],
      technology: [
        "🚀 **Tech Insights:**\n• Latest developments\n• Practical applications\n• Learning resources",
        "Would you like me to suggest learning resources or practical examples?"
      ],
      general: [
        "💡 **I can help with:**\n• Detailed explanations\n• Multiple perspectives\n• Related topics",
        "Is there a specific aspect you'd like me to focus on?"
      ]
    };

    return suggestions[topic] || suggestions.general;
  };

  // Enhanced response processing with intelligent behaviors
  const processResponse = (response, userMessage, topic) => {
    let enhancedResponse = response;

    // Add proactive suggestions for weather
    if (topic === 'weather' && weatherApiKey && weatherApiKey !== 'your-openweathermap-api-key-here') {
      const suggestions = generateProactiveSuggestions(topic, userMessage);
      enhancedResponse += `\n\n${suggestions[0]}\n\n${suggestions[1]}`;
    }

    // Add helpful follow-ups for other topics
    if (topic !== 'weather') {
      const suggestions = generateProactiveSuggestions(topic, userMessage);
      enhancedResponse += `\n\n${suggestions[0]}\n\n${suggestions[1]}`;
    }

    // Add conversation continuity
    enhancedResponse += `\n\n💭 **Keep the conversation going!** What else would you like to explore?`;
    
    return enhancedResponse;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const topic = extractTopic(userMessage.content);
      
      // Check if it's a weather request
      if (weatherApi.isWeatherRequest(userMessage.content)) {
        const weatherResponse = await handleWeatherRequest(userMessage.content);
        const enhancedResponse = processResponse(weatherResponse, userMessage.content, 'weather');
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: enhancedResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        updateConversationContext(userMessage.content, enhancedResponse);
        
        // Speak the response if voice is enabled
        if (isVoiceEnabled) {
          voiceService.speak(enhancedResponse);
        }
      } else {
        // Send to Langflow for AI response
        const response = await langflowApi.sendMessage(userMessage.content);
        const enhancedResponse = processResponse(response, userMessage.content, topic);
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: enhancedResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        updateConversationContext(userMessage.content, enhancedResponse);
        
        // Speak the response if voice is enabled
        if (isVoiceEnabled) {
          voiceService.speak(enhancedResponse);
        }
      }
    } catch (error) {
      let errorContent = '';
      
      // Handle specific API errors
      if (error.message.includes('quota') || error.message.includes('429')) {
        errorContent = `❌ **Google API Quota Exceeded**\n\n${error.message}\n\n🔧 **This means:**\n• Your Google Gemini API has hit its rate limit\n• The free tier has usage restrictions\n• You may need to wait or upgrade your plan\n\n💡 **Solutions:**\n• Wait a few minutes and try again\n• Check your Google AI Studio billing\n• Consider upgrading to a paid plan\n• The service will resume automatically\n\n**Status:** Temporarily unavailable due to API limits`;
      } else if (error.message.includes('Failed to get response')) {
        errorContent = `❌ **API Connection Issue**\n\n${error.message}\n\n🔧 **Let me help you troubleshoot:**\n• Check your internet connection\n• Verify the Langflow service is running\n• Try rephrasing your question\n\n💡 **Alternative approaches:**\n• Ask a different question\n• Use simpler language\n• Check the connection status above\n\nWhat would you like to try next?`;
      } else {
        errorContent = `❌ **I encountered an issue**\n\n${error.message}\n\n🔧 **Let me help you troubleshoot:**\n• Check your internet connection\n• Verify the service is running\n• Try rephrasing your question\n\n💡 **Alternative approaches:**\n• Ask a different question\n• Use simpler language\n• Check the connection status above\n\nWhat would you like to try next?`;
      }

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorContent,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle weather requests
  const handleWeatherRequest = async (message) => {
    try {
      // Check if weather API key is set
      if (!weatherApiKey || weatherApiKey === 'your-openweathermap-api-key-here') {
        return `🌤️ **Weather Service Not Configured**\n\nTo get weather information, you need to:\n\n1. **Get a free API key** from [OpenWeatherMap](https://openweathermap.org/api)\n2. **Update the config** in \`src/config.js\`\n3. **Replace** \`your-openweathermap-api-key-here\` with your actual key\n\nOnce configured, you can ask:\n- "Weather in New York"\n- "Temperature in London"\n- "Forecast for Tokyo"\n- "How's the weather in Paris?"`;
      }

      // Extract location from message
      const location = weatherApi.extractLocation(message);
      
      if (!location) {
        return `🌤️ **Location Required**\n\nPlease specify a location for weather information. Try:\n\n- "Weather in New York"\n- "Temperature in London"\n- "Forecast for Tokyo"\n- "How's the weather in Paris?"`;
      }

      // Check if user wants forecast or current weather
      const wantsForecast = message.toLowerCase().includes('forecast') || 
                           message.toLowerCase().includes('tomorrow') ||
                           message.toLowerCase().includes('week');

      if (wantsForecast) {
        const forecast = await weatherApi.getWeatherForecast(location, 5);
        return formatWeatherForecast(forecast);
      } else {
        const weather = await weatherApi.getCurrentWeather(location);
        return formatCurrentWeather(weather);
      }

    } catch (error) {
      return `❌ **Weather Error**\n\n${error.message}\n\nPlease check:\n- Location spelling\n- API key configuration\n- Internet connection`;
    }
  };

  // Format current weather response
  const formatCurrentWeather = (weather) => {
    return `🌤️ **Current Weather in ${weather.location}, ${weather.country}**\n\n` +
           `**Temperature:** ${weather.temperature}°C (feels like ${weather.feelsLike}°C)\n` +
           `**Conditions:** ${weather.description}\n` +
           `**Humidity:** ${weather.humidity}%\n` +
           `**Wind:** ${weather.windSpeed} km/h ${weather.windDirection}\n` +
           `**Pressure:** ${weather.pressure} hPa\n` +
           `**Sunrise:** ${weather.sunrise}\n` +
           `**Sunset:** ${weather.sunset}\n\n` +
           `*Updated: ${weather.timestamp}*`;
  };

  // Format weather forecast response
  const formatWeatherForecast = (forecast) => {
    let response = `🌤️ **5-Day Forecast for ${forecast.location}, ${forecast.country}**\n\n`;
    
    forecast.forecasts.forEach(day => {
      response += `**${day.dayName}**\n` +
                  `Temperature: ${day.temperature}°C\n` +
                  `Conditions: ${day.description}\n` +
                  `Humidity: ${day.humidity}%\n` +
                  `Wind: ${day.windSpeed} km/h\n\n`;
    });
    
    return response;
  };

  // Test function to debug API responses
  const testApiConnection = async () => {
    try {
      setIsLoading(true);
      const response = await langflowApi.sendMessage('Test message - please respond with a simple hello');
      
      const testMessage = {
        id: Date.now(),
        type: 'bot',
        content: `🧪 **API Test Successful!**\n\nResponse: ${response}\n\n✅ Your Langflow integration is working perfectly!\n\n💡 **Ready to help with:**\n• AI questions\n• Weather information\n• Writing assistance\n• Math problems\n• And much more!\n\nWhat would you like to explore? 🌟`,
        timestamp: new Date(),
        isTest: true
      };

      setMessages(prev => [...prev, testMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: `❌ **API Test Failed**\n\n${error.message}\n\n🔧 **Troubleshooting steps:**\n• Check if Langflow is running\n• Verify your API key\n• Check the connection status\n\n💡 **Need help?** Try refreshing the connection above.`,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking connection...';
      case 'connected':
        return 'Connected to Langflow';
      case 'disconnected':
        return 'Langflow not accessible';
      case 'error':
        return 'Connection error';
      default:
        return 'Unknown status';
    }
  };

  // Enhanced message formatting function
  const formatMessageContent = (content) => {
    if (!content) return '';
    
    // Convert content to string if it's not already
    const text = typeof content === 'string' ? content : String(content);
    
    // Split content into paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    return (
      <div className="formatted-content">
        {paragraphs.map((paragraph, index) => {
          const trimmed = paragraph.trim();
          
          // Handle different paragraph types
          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            // Bold text
            return (
              <p key={index} className="paragraph bold">
                <strong>{trimmed.slice(2, -2)}</strong>
              </p>
            );
          } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
            // Italic text
            return (
              <p key={index} className="paragraph italic">
                <em>{trimmed.slice(1, -1)}</em>
              </p>
            );
          } else if (trimmed.startsWith('### ')) {
            // H3 heading
            return (
              <h3 key={index} className="heading h3">
                {trimmed.slice(4)}
              </h3>
            );
          } else if (trimmed.startsWith('## ')) {
            // H2 heading
            return (
              <h2 key={index} className="heading h2">
                {trimmed.slice(3)}
              </h2>
            );
          } else if (trimmed.startsWith('# ')) {
            // H1 heading
            return (
              <h1 key={index} className="heading h1">
                {trimmed.slice(2)}
              </h1>
            );
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            // List item
            return (
              <p key={index} className="paragraph list-item">
                • {trimmed.slice(2)}
              </p>
            );
          } else if (trimmed.startsWith('1. ')) {
            // Numbered list item
            return (
              <p key={index} className="paragraph numbered-item">
                {trimmed}
              </p>
            );
          } else if (trimmed.includes('**') && trimmed.includes('**')) {
            // Inline bold
            const parts = trimmed.split('**');
            return (
              <p key={index} className="paragraph">
                {parts.map((part, partIndex) => 
                  partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
                )}
              </p>
            );
          } else if (trimmed.includes('*') && trimmed.includes('*')) {
            // Inline italic
            const parts = trimmed.split('*');
            return (
              <p key={index} className="paragraph">
                {parts.map((part, partIndex) => 
                  partIndex % 2 === 1 ? <em key={partIndex}>{part}</em> : part
                )}
              </p>
            );
          } else if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
            // Code block
            return (
              <pre key={index} className="code-block">
                <code>{trimmed.slice(3, -3)}</code>
              </pre>
            );
          } else if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
            // Inline code
            return (
              <p key={index} className="paragraph">
                <code className="inline-code">{trimmed.slice(1, -1)}</code>
              </p>
            );
          } else if (trimmed.startsWith('> ')) {
            // Quote
            return (
              <blockquote key={index} className="quote">
                {trimmed.slice(2)}
              </blockquote>
            );
          } else if (trimmed === '---' || trimmed === '***') {
            // Horizontal rule
            return <hr key={index} className="divider" />;
          } else {
            // Regular paragraph
            return (
              <p key={index} className="paragraph">
                {trimmed}
              </p>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="chat-container">
      {/* Connection Status */}
      <div className={`connection-status ${connectionStatus}`}>
        <div className="status-indicator"></div>
        <span>{getConnectionStatusText()}</span>
        <button 
          onClick={checkConnection} 
          className="refresh-button"
          title="Refresh connection status"
        >
          🔄
        </button>
      </div>

      {/* API Status Banner */}
      {connectionStatus === 'connected' && (
        <div className="api-status-banner">
          <span className="api-icon">⚠️</span>
          <span>Google Gemini API experiencing rate limits. Responses may be delayed.</span>
          <span className="api-tip">Service will resume automatically</span>
        </div>
      )}

      {/* Voice Controls */}
      <VoiceControls 
        onVoiceInput={handleVoiceInput}
        onVoiceToggle={handleVoiceToggle}
        isVoiceEnabled={isVoiceEnabled}
      />

      {/* Voice Status Banner */}
      {isVoiceEnabled && (
        <div className="voice-status-banner">
          <span className="voice-icon">🔊</span>
          <span>Voice Output Enabled - I'll speak my responses!</span>
          <span className="voice-tip">Press Ctrl/Cmd + V to toggle</span>
        </div>
      )}

      {/* Test API Button */}
      <div className="test-section">
        <button 
          onClick={testApiConnection} 
          disabled={isLoading || !isConnected}
          className="test-api-button"
        >
          🧪 Test API Connection
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type} ${message.isError ? 'error' : ''} ${message.isTest ? 'test' : ''}`}>
            <div className="message-avatar">
              {message.type === 'user' ? (
                <div className="user-avatar">👤</div>
              ) : (
                <div className="bot-avatar">🤖</div>
              )}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.type === 'bot' ? formatMessageContent(message.content) : message.content}
              </div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">
              <div className="bot-avatar">🤖</div>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything or use voice! 🎤 Type or speak naturally..."
            disabled={isLoading || !isConnected}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !inputValue.trim() || !isConnected}
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
        
        {!isConnected && (
          <div className="connection-warning">
            ⚠️ Make sure Langflow is running on localhost:7860
          </div>
        )}
        
        {/* Helpful message during API issues */}
        {isConnected && (
          <div className="input-help">
            <span>💡 <strong>Note:</strong> Due to Google API rate limits, responses may be delayed. The service will resume automatically.</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Chat;
