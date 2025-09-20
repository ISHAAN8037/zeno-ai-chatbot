import React, { useState, useEffect } from 'react';
import voiceService from '../services/voiceService';
import './VoiceSettings.css';

const VoiceSettings = ({ isOpen, onClose }) => {
  const [voiceOptions, setVoiceOptions] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    lang: 'en-US'
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailableVoices();
    }
  }, [isOpen]);

  const loadAvailableVoices = async () => {
    try {
      const voices = await voiceService.getAvailableVoices();
      setAvailableVoices(voices);
      
      // Set default voice if none selected
      if (!selectedVoice && voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Natural') || 
          voice.name.includes('Premium')
        ) || voices[0];
        setSelectedVoice(preferredVoice.name);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleOptionChange = (option, value) => {
    const newOptions = { ...voiceOptions, [option]: parseFloat(value) };
    setVoiceOptions(newOptions);
    
    // Test the new settings with a sample text
    if (isOpen) {
      voiceService.speak('Voice settings updated', newOptions);
    }
  };

  const handleVoiceChange = (voiceName) => {
    setSelectedVoice(voiceName);
    
    // Test the new voice
    if (isOpen) {
      voiceService.speak('Voice changed', { ...voiceOptions, voice: voiceName });
    }
  };

  const testVoice = () => {
    const testText = "Hello! This is a test of your voice settings. How does it sound?";
    voiceService.speak(testText, voiceOptions);
  };

  const resetToDefaults = () => {
    const defaults = {
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
      lang: 'en-US'
    };
    setVoiceOptions(defaults);
    setSelectedVoice('');
    loadAvailableVoices();
  };

  if (!isOpen) return null;

  return (
    <div className="voice-settings-overlay" onClick={onClose}>
      <div className="voice-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="voice-settings-header">
          <h3>🎤 Voice Settings</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="voice-settings-content">
          {/* Voice Selection */}
          <div className="setting-group">
            <label>Voice:</label>
            <select 
              value={selectedVoice} 
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="voice-select"
            >
              {availableVoices.map((voice, index) => (
                <option key={index} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Control */}
          <div className="setting-group">
            <label>Speed: {voiceOptions.rate}x</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceOptions.rate}
              onChange={(e) => handleOptionChange('rate', e.target.value)}
              className="slider"
            />
          </div>

          {/* Pitch Control */}
          <div className="setting-group">
            <label>Pitch: {voiceOptions.pitch}</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceOptions.pitch}
              onChange={(e) => handleOptionChange('pitch', e.target.value)}
              className="slider"
            />
          </div>

          {/* Volume Control */}
          <div className="setting-group">
            <label>Volume: {Math.round(voiceOptions.volume * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={voiceOptions.volume}
              onChange={(e) => handleOptionChange('volume', e.target.value)}
              className="slider"
            />
          </div>

          {/* Language Selection */}
          <div className="setting-group">
            <label>Language:</label>
            <select 
              value={voiceOptions.lang} 
              onChange={(e) => handleOptionChange('lang', e.target.value)}
              className="lang-select"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-BR">Portuguese</option>
              <option value="ru-RU">Russian</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Simplified)</option>
            </select>
          </div>
        </div>

        <div className="voice-settings-actions">
          <button className="test-btn" onClick={testVoice}>
            🎵 Test Voice
          </button>
          <button className="reset-btn" onClick={resetToDefaults}>
            🔄 Reset
          </button>
          <button className="save-btn" onClick={onClose}>
            ✅ Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
