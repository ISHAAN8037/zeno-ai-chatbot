import React, { useState, useEffect } from 'react';
import voiceService from '../services/voiceService';
import VoiceSettings from './VoiceSettings';
import './VoiceControls.css';

const VoiceControls = ({ onVoiceInput, onVoiceToggle, isVoiceEnabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // idle, listening, speaking, error
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Check voice support on component mount
    try {
      const supportStatus = voiceService.getSupportStatus();
      setIsSupported(supportStatus.supported);
    } catch (error) {
      console.error('Error checking voice support:', error);
      setIsSupported(false);
    }

    // Set up event listeners for voice events
    const handleVoiceInput = (event) => {
      const { transcript, confidence } = event.detail;
      console.log('🎤 Voice input received:', transcript, 'Confidence:', confidence);
      
      if (onVoiceInput) {
        onVoiceInput(transcript);
      }
      
      setIsListening(false);
      setVoiceStatus('idle');
    };

    const handleVoiceError = (event) => {
      console.error('🎤 Voice error:', event.detail.error);
      setIsListening(false);
      setVoiceStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => setVoiceStatus('idle'), 3000);
    };

    const handleSpeakingStarted = () => {
      setIsSpeaking(true);
      setVoiceStatus('speaking');
    };

    const handleSpeakingEnded = () => {
      setIsSpeaking(false);
      setVoiceStatus('idle');
    };

    const handleSpeakingError = (event) => {
      console.error('🔊 Speaking error:', event.detail.error);
      setIsSpeaking(false);
      setVoiceStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => setVoiceStatus('idle'), 3000);
    };

    // Add event listeners
    document.addEventListener('voiceInput', handleVoiceInput);
    document.addEventListener('voiceError', handleVoiceError);
    document.addEventListener('speakingStarted', handleSpeakingStarted);
    document.addEventListener('speakingEnded', handleSpeakingEnded);
    document.addEventListener('speakingError', handleSpeakingError);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('voiceInput', handleVoiceInput);
      document.removeEventListener('voiceError', handleVoiceError);
      document.removeEventListener('speakingStarted', handleSpeakingStarted);
      document.removeEventListener('speakingEnded', handleSpeakingEnded);
      document.removeEventListener('speakingError', handleSpeakingError);
    };
  }, [onVoiceInput]);

  // Handle voice input button click
  const handleVoiceInputClick = () => {
    if (!isSupported) {
      alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      // Stop listening
      voiceService.stopListening();
      setIsListening(false);
      setVoiceStatus('idle');
    } else {
      // Start listening
      try {
        const success = voiceService.startListening();
        if (success) {
          setIsListening(true);
          setVoiceStatus('listening');
        } else {
          setVoiceStatus('error');
          setTimeout(() => setVoiceStatus('idle'), 3000);
        }
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        setVoiceStatus('error');
        setTimeout(() => setVoiceStatus('idle'), 3000);
      }
    }
  };

  // Handle voice output toggle
  const handleVoiceOutputToggle = () => {
    if (onVoiceToggle) {
      onVoiceToggle(!isVoiceEnabled);
    }
  };

  // Get status icon and color
  const getStatusDisplay = () => {
    switch (voiceStatus) {
      case 'listening':
        return { icon: '🎤', color: '#e74c3c', text: 'Listening...' };
      case 'speaking':
        return { icon: '🔊', color: '#27ae60', text: 'Speaking...' };
      case 'error':
        return { icon: '❌', color: '#e74c3c', text: 'Error' };
      default:
        return { icon: '🎤', color: '#3498db', text: 'Voice Input' };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (!isSupported) {
    return (
      <div className="voice-controls unsupported">
        <div className="voice-status">
          <span className="voice-icon">🎤</span>
          <span className="voice-text">Voice not supported</span>
        </div>
        <div className="voice-help">
          Use Chrome, Edge, or Safari for voice support
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="voice-controls">
        {/* Voice Input Button */}
        <button
          className={`voice-input-btn ${voiceStatus}`}
          onClick={handleVoiceInputClick}
          disabled={isSpeaking}
          title={statusDisplay.text}
        >
          <span className="voice-icon" style={{ color: statusDisplay.color }}>
            {statusDisplay.icon}
          </span>
          <span className="voice-text">{statusDisplay.text}</span>
        </button>

        {/* Voice Output Toggle */}
        <button
          className={`voice-output-btn ${isVoiceEnabled ? 'enabled' : 'disabled'}`}
          onClick={handleVoiceOutputToggle}
          title={isVoiceEnabled ? 'Disable voice output' : 'Enable voice output'}
        >
          <span className="voice-icon">
            {isVoiceEnabled ? '🔊' : '🔇'}
          </span>
          <span className="voice-text">
            {isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}
          </span>
        </button>

        {/* Voice Status Indicator */}
        <div className="voice-status-indicator">
          <div className={`status-dot ${voiceStatus}`}></div>
          <span className="status-text">{voiceStatus}</span>
        </div>

        {/* Settings Button */}
        <button
          className="voice-settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          title="Voice Settings"
        >
          <span className="voice-icon">⚙️</span>
        </button>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default VoiceControls;
