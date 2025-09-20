// Voice Assistant Service
class VoiceService {
  constructor() {
    this.speechRecognition = null;
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.utterance = null;
    
    // Only initialize if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.initializeSpeechRecognition();
    }
  }

  // Initialize speech recognition
  initializeSpeechRecognition() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('Not in browser environment, skipping speech recognition initialization');
        return;
      }

      // Check for browser support
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new SpeechRecognition();
      } else {
        console.warn('Speech recognition not supported in this browser');
        return;
      }

      // Configure speech recognition
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      // Set up event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('🎤 Voice recognition started');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice input:', transcript);
        
        // Emit custom event with transcript
        const voiceEvent = new CustomEvent('voiceInput', { 
          detail: { transcript, confidence: event.results[0][0].confidence } 
        });
        document.dispatchEvent(voiceEvent);
      };

      this.recognition.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        this.isListening = false;
        
        // Emit error event
        const errorEvent = new CustomEvent('voiceError', { 
          detail: { error: event.error } 
        });
        document.dispatchEvent(errorEvent);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('🎤 Voice recognition ended');
      };

    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }
  }

  // Start listening for voice input
  startListening() {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start listening:', error);
      return false;
    }
  }

  // Stop listening for voice input
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Check if currently listening
  getListeningStatus() {
    return this.isListening;
  }

  // Speak text using text-to-speech
  speak(text, options = {}) {
    if (typeof window === 'undefined') {
      console.warn('Not in browser environment, cannot speak');
      return false;
    }
    
    if (!this.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return false;
    }

    // Stop any current speech
    this.stopSpeaking();

    // Create new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech options
    this.utterance.rate = options.rate || 1.0;        // Speed (0.1 to 10)
    this.utterance.pitch = options.pitch || 1.0;      // Pitch (0 to 2)
    this.utterance.volume = options.volume || 0.8;    // Volume (0 to 1)
    this.utterance.lang = options.lang || 'en-US';    // Language
    
    // Get available voices and set a good one
    const voices = this.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer natural-sounding voices
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Premium')
      ) || voices[0];
      
      this.utterance.voice = preferredVoice;
    }

    // Set up event handlers
    this.utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('🔊 Started speaking:', text);
      
      // Emit speaking started event
      const speakEvent = new CustomEvent('speakingStarted', { 
        detail: { text } 
      });
      document.dispatchEvent(speakEvent);
    };

    this.utterance.onend = () => {
      this.isSpeaking = false;
      console.log('🔊 Finished speaking');
      
      // Emit speaking ended event
      const speakEvent = new CustomEvent('speakingEnded');
      document.dispatchEvent(speakEvent);
    };

    this.utterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error('🔊 Speech synthesis error:', event.error);
      
      // Emit speaking error event
      const errorEvent = new CustomEvent('speakingError', { 
        detail: { error: event.error } 
      });
      document.dispatchEvent(errorEvent);
    };

    // Start speaking
    this.speechSynthesis.speak(this.utterance);
    return true;
  }

  // Stop speaking
  stopSpeaking() {
    if (this.speechSynthesis && this.isSpeaking) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Check if currently speaking
  getSpeakingStatus() {
    return this.isSpeaking;
  }

  // Pause speech
  pauseSpeaking() {
    if (this.speechSynthesis && this.isSpeaking) {
      this.speechSynthesis.pause();
    }
  }

  // Resume speech
  resumeSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.resume();
    }
  }

  // Get available voices
  getAvailableVoices() {
    if (!this.speechSynthesis) return [];
    
    let voices = this.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (voices.length === 0) {
      return new Promise((resolve) => {
        this.speechSynthesis.onvoiceschanged = () => {
          voices = this.speechSynthesis.getVoices();
          resolve(voices);
        };
      });
    }
    
    return voices;
  }

  // Check browser support
  isSupported() {
    return !!(this.recognition && this.speechSynthesis);
  }

  // Get support status
  getSupportStatus() {
    return {
      speechRecognition: !!this.recognition,
      speechSynthesis: !!this.speechSynthesis,
      supported: this.isSupported()
    };
  }
}

export default new VoiceService();
