// Weather API Service
class WeatherApiService {
  constructor() {
    // You can get a free API key from OpenWeatherMap
    this.apiKey = 'your-openweathermap-api-key-here';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Set your OpenWeatherMap API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // Get current weather for a location
  async getCurrentWeather(location) {
    try {
      if (!this.apiKey || this.apiKey === 'your-openweathermap-api-key-here') {
        throw new Error('Please set your OpenWeatherMap API key first');
      }

      const url = `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Location "${location}" not found. Please check the spelling or try a different location.`);
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else {
          throw new Error(`Weather service error: ${response.status}`);
        }
      }

      const data = await response.json();
      return this.formatWeatherData(data);
      
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  }

  // Get weather forecast for a location
  async getWeatherForecast(location, days = 5) {
    try {
      if (!this.apiKey || this.apiKey === 'your-openweathermap-api-key-here') {
        throw new Error('Please set your OpenWeatherMap API key first');
      }

      const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Location "${location}" not found. Please check the spelling or try a different location.`);
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else {
          throw new Error(`Weather service error: ${response.status}`);
        }
      }

      const data = await response.json();
      return this.formatForecastData(data);
      
    } catch (error) {
      console.error('Weather Forecast API Error:', error);
      throw error;
    }
  }

  // Format current weather data
  formatWeatherData(data) {
    const weather = {
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: this.getWindDirection(data.wind.deg),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      timestamp: new Date().toLocaleString()
    };

    return weather;
  }

  // Format forecast data
  formatForecastData(data) {
    const forecast = {
      location: data.city.name,
      country: data.city.country,
      forecasts: []
    };

    // Group forecasts by day
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString();
      
      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          date: day,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          temps: [],
          descriptions: [],
          humidity: [],
          windSpeed: []
        };
      }
      
      dailyForecasts[day].temps.push(Math.round(item.main.temp));
      dailyForecasts[day].descriptions.push(item.weather[0].description);
      dailyForecasts[day].humidity.push(item.main.humidity);
      dailyForecasts[day].windSpeed.push(Math.round(item.wind.speed * 3.6));
    });

    // Calculate daily averages
    Object.values(dailyForecasts).forEach(day => {
      const avgTemp = Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length);
      const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length);
      const avgWindSpeed = Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length);
      const mainDescription = this.getMostFrequent(day.descriptions);
      
      forecast.forecasts.push({
        date: day.date,
        dayName: day.dayName,
        temperature: avgTemp,
        description: mainDescription,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed
      });
    });

    return forecast;
  }

  // Get wind direction from degrees
  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Get most frequent item in array
  getMostFrequent(arr) {
    const counts = {};
    let maxCount = 0;
    let mostFrequent = arr[0];
    
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
      if (counts[item] > maxCount) {
        maxCount = counts[item];
        mostFrequent = item;
      }
    });
    
    return mostFrequent;
  }

  // Extract location from user message
  extractLocation(message) {
    const locationPatterns = [
      /weather\s+(?:in|at|for)\s+([^,]+)/i,
      /temperature\s+(?:in|at|for)\s+([^,]+)/i,
      /forecast\s+(?:in|at|for)\s+([^,]+)/i,
      /how\s+is\s+the\s+weather\s+(?:in|at|for)\s+([^,]+)/i,
      /what's\s+the\s+weather\s+(?:in|at|for)\s+([^,]+)/i
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // If no pattern matches, try to extract any capitalized words that might be a location
    const words = message.split(/\s+/);
    const potentialLocations = words.filter(word => 
      word.length > 2 && 
      word[0] === word[0].toUpperCase() && 
      !['The', 'How', 'What', 'Weather', 'Temperature', 'Forecast', 'Today', 'Tomorrow'].includes(word)
    );

    return potentialLocations.length > 0 ? potentialLocations.join(' ') : null;
  }

  // Check if message is weather-related
  isWeatherRequest(message) {
    const weatherKeywords = [
      'weather', 'temperature', 'forecast', 'climate', 'rain', 'snow', 
      'sunny', 'cloudy', 'hot', 'cold', 'humid', 'wind', 'storm'
    ];
    
    return weatherKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

export default new WeatherApiService();
