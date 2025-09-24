// Langflow Configuration
export const LANGFLOW_CONFIG = {
  // Your Langflow API key - replace with your actual key
  apiKey: 'sk-mZT588tijSkKdREvRTMDhnYEjGzJaILFxE685kUKI1A',
  
  // Langflow server URL - direct connection to Langflow server
  baseUrl: 'http://localhost:3001',
  
  // Your flow ID
  flowId: '2078174c-067b-4095-919d-582126a918e6',
  
  // Alternative flow ID (if you want to create a simpler flow)
  // flowId: 'your-alternative-flow-id',
  
  // API endpoints
  endpoints: {
    run: '/api/v1/run',
    health: '/health',
    flows: '/api/v1/flows'
  }
};

// Weather API Configuration
export const WEATHER_CONFIG = {
  // Get your free API key from: https://openweathermap.org/api
  apiKey: 'your-openweathermap-api-key-here',
  
  // Weather service settings
  baseUrl: 'https://api.openweathermap.org/data/2.5',
  units: 'metric', // metric, imperial, kelvin
  language: 'en'
};

// Update this with your actual API key
export const getApiKey = () => {
  // You can set your API key here or use environment variables
  return LANGFLOW_CONFIG.apiKey;
};

// Get weather API key
export const getWeatherApiKey = () => {
  return WEATHER_CONFIG.apiKey;
};
