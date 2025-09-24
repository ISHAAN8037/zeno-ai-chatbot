class StockAnalysisService {
  constructor() {
    this.apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';
    this.baseUrl = 'https://www.alphavantage.co/query';
  }

  // Get real-time stock quote
  async getStockQuote(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      const quote = data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data found for this symbol');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        marketCap: quote['07. market cap'] || 'N/A',
        lastUpdated: quote['07. latest trading day']
      };
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      return this.getMockStockData(symbol);
    }
  }

  // Get historical data for technical analysis
  async getHistoricalData(symbol, interval = 'daily', outputsize = 'compact') {
    try {
      const response = await fetch(`${this.baseUrl}?function=TIME_SERIES_${interval.toUpperCase()}&symbol=${symbol}&outputsize=${outputsize}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const timeSeriesKey = `Time Series (${interval.charAt(0).toUpperCase() + interval.slice(1)})`;
      const timeSeries = data[timeSeriesKey];
      
      if (!timeSeries) {
        throw new Error('No historical data found');
      }

      const historicalData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      return historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return this.getMockHistoricalData(symbol);
    }
  }

  // Calculate technical indicators
  calculateTechnicalIndicators(historicalData) {
    if (!historicalData || historicalData.length < 20) {
      return null;
    }

    const indicators = {
      sma: this.calculateSMA(historicalData, 20),
      ema: this.calculateEMA(historicalData, 20),
      rsi: this.calculateRSI(historicalData, 14),
      macd: this.calculateMACD(historicalData),
      bollingerBands: this.calculateBollingerBands(historicalData, 20),
      supportResistance: this.calculateSupportResistance(historicalData)
    };

    return indicators;
  }

  // Calculate Simple Moving Average
  calculateSMA(data, period) {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
      sma.push({
        date: data[i].date,
        value: sum / period
      });
    }
    return sma;
  }

  // Calculate Exponential Moving Average
  calculateEMA(data, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    let sum = data.slice(0, period).reduce((acc, val) => acc + val.close, 0);
    let emaValue = sum / period;
    
    ema.push({
      date: data[period - 1].date,
      value: emaValue
    });

    for (let i = period; i < data.length; i++) {
      emaValue = (data[i].close * multiplier) + (emaValue * (1 - multiplier));
      ema.push({
        date: data[i].date,
        value: emaValue
      });
    }
    
    return ema;
  }

  // Calculate Relative Strength Index
  calculateRSI(data, period) {
    const rsi = [];
    const gains = [];
    const losses = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = period; i < data.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((acc, val) => acc + val, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((acc, val) => acc + val, 0) / period;
      
      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      
      rsi.push({
        date: data[i].date,
        value: rsiValue
      });
    }

    return rsi;
  }

  // Calculate MACD
  calculateMACD(data) {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    const macd = [];
    const signal = [];
    
    for (let i = 0; i < ema26.length; i++) {
      const macdValue = ema12[i + 14] ? ema12[i + 14].value - ema26[i].value : 0;
      macd.push({
        date: ema26[i].date,
        value: macdValue
      });
    }

    // Calculate signal line (9-period EMA of MACD)
    const macdValues = macd.map(item => item.value);
    const signalLine = this.calculateEMAFromValues(macdValues, 9);
    
    for (let i = 0; i < signalLine.length; i++) {
      signal.push({
        date: macd[i + 8]?.date || '',
        value: signalLine[i]
      });
    }

    return { macd, signal };
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(data, period) {
    const sma = this.calculateSMA(data, period);
    const bands = [];
    
    for (let i = 0; i < sma.length; i++) {
      const startIndex = data.findIndex(item => item.date === sma[i].date) - period + 1;
      const endIndex = data.findIndex(item => item.date === sma[i].date) + 1;
      
      const prices = data.slice(startIndex, endIndex).map(item => item.close);
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - sma[i].value, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      bands.push({
        date: sma[i].date,
        upper: sma[i].value + (2 * standardDeviation),
        middle: sma[i].value,
        lower: sma[i].value - (2 * standardDeviation)
      });
    }
    
    return bands;
  }

  // Calculate Support and Resistance levels
  calculateSupportResistance(data) {
    const highs = data.map(item => item.high);
    const lows = data.map(item => item.low);
    
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    
    // Find recent support and resistance
    const recentData = data.slice(-20);
    const recentResistance = Math.max(...recentData.map(item => item.high));
    const recentSupport = Math.min(...recentData.map(item => item.low));
    
    return {
      major: { support, resistance },
      recent: { support: recentSupport, resistance: recentResistance }
    };
  }

  // Get fundamental data
  async getFundamentalData(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      return {
        companyName: data.Name || 'N/A',
        sector: data.Sector || 'N/A',
        industry: data.Industry || 'N/A',
        marketCap: data.MarketCapitalization || 'N/A',
        peRatio: data.PERatio || 'N/A',
        priceToBook: data.PriceToBookRatio || 'N/A',
        dividendYield: data.DividendYield || 'N/A',
        eps: data.EPS || 'N/A',
        revenue: data.RevenueTTM || 'N/A',
        profitMargin: data.ProfitMargin || 'N/A',
        returnOnEquity: data.ReturnOnEquityTTM || 'N/A',
        debtToEquity: data.DebtToEquityRatio || 'N/A'
      };
    } catch (error) {
      console.error('Error fetching fundamental data:', error);
      return this.getMockFundamentalData(symbol);
    }
  }

  // Get market sentiment (news)
  async getMarketSentiment(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      return data.feed?.slice(0, 10) || [];
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
      return this.getMockNewsData(symbol);
    }
  }

  // Comprehensive stock analysis
  async performStockAnalysis(symbol) {
    try {
      const [quote, historicalData, fundamentalData, sentiment] = await Promise.all([
        this.getStockQuote(symbol),
        this.getHistoricalData(symbol),
        this.getFundamentalData(symbol),
        this.getMarketSentiment(symbol)
      ]);

      const technicalIndicators = this.calculateTechnicalIndicators(historicalData);
      const analysis = this.generateAnalysis(quote, technicalIndicators, fundamentalData, sentiment);

      return {
        symbol,
        quote,
        historicalData,
        technicalIndicators,
        fundamentalData,
        sentiment,
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error performing stock analysis:', error);
      throw error;
    }
  }

  // Generate trading analysis and recommendations
  generateAnalysis(quote, technicalIndicators, fundamentalData, sentiment) {
    if (!technicalIndicators) {
      return { error: 'Insufficient data for analysis' };
    }

    const latestPrice = quote.price;
    const latestRSI = technicalIndicators.rsi[technicalIndicators.rsi.length - 1]?.value || 50;
    const latestMACD = technicalIndicators.macd.macd[technicalIndicators.macd.macd.length - 1]?.value || 0;
    const latestSignal = technicalIndicators.macd.signal[technicalIndicators.macd.signal.length - 1]?.value || 0;
    
    const sma20 = technicalIndicators.sma[technicalIndicators.sma.length - 1]?.value || latestPrice;
    const bollingerBands = technicalIndicators.bollingerBands[technicalIndicators.bollingerBands.length - 1];
    
    // Technical signals
    const technicalSignals = {
      rsi: latestRSI > 70 ? 'overbought' : latestRSI < 30 ? 'oversold' : 'neutral',
      macd: latestMACD > latestSignal ? 'bullish' : 'bearish',
      movingAverage: latestPrice > sma20 ? 'bullish' : 'bearish',
      bollingerBands: latestPrice > bollingerBands.upper ? 'overbought' : 
                      latestPrice < bollingerBands.lower ? 'oversold' : 'neutral'
    };

    // Overall technical score
    let technicalScore = 0;
    if (technicalSignals.rsi === 'oversold') technicalScore += 1;
    if (technicalSignals.macd === 'bullish') technicalScore += 1;
    if (technicalSignals.movingAverage === 'bullish') technicalScore += 1;
    if (technicalSignals.bollingerBands === 'oversold') technicalScore += 1;

    // Fundamental analysis
    const peRatio = parseFloat(fundamentalData.peRatio) || 0;
    const debtToEquity = parseFloat(fundamentalData.debtToEquity) || 0;
    
    let fundamentalScore = 0;
    if (peRatio > 0 && peRatio < 25) fundamentalScore += 1;
    if (debtToEquity < 1) fundamentalScore += 1;
    if (parseFloat(fundamentalData.profitMargin) > 0) fundamentalScore += 1;

    // Risk assessment
    let riskLevel = 'medium';
    if (technicalScore >= 3 && fundamentalScore >= 2) riskLevel = 'low';
    else if (technicalScore <= 1 && fundamentalScore <= 1) riskLevel = 'high';

    // Trading recommendation
    let recommendation = 'hold';
    if (technicalScore >= 3 && fundamentalScore >= 2) recommendation = 'buy';
    else if (technicalScore <= 1 && fundamentalScore <= 1) recommendation = 'sell';

    // Price targets
    const support = technicalIndicators.supportResistance.recent.support;
    const resistance = technicalIndicators.supportResistance.recent.resistance;
    
    const stopLoss = support * 0.95;
    const target = resistance * 1.05;

    return {
      technicalSignals,
      technicalScore: technicalScore / 4,
      fundamentalScore: fundamentalScore / 3,
      riskLevel,
      recommendation,
      priceTargets: {
        support,
        resistance,
        stopLoss,
        target
      },
      summary: this.generateSummary(recommendation, riskLevel, technicalSignals)
    };
  }

  // Generate analysis summary
  generateSummary(recommendation, riskLevel, technicalSignals) {
    const summaries = {
      buy: {
        low: "Strong technical and fundamental signals suggest a good entry point with low risk.",
        medium: "Positive technical indicators with moderate risk. Consider position sizing.",
        high: "Bullish signals present but high risk. Use strict stop-loss and small position."
      },
      sell: {
        low: "Technical indicators suggest taking profits or reducing exposure.",
        medium: "Bearish signals with moderate risk. Consider reducing positions.",
        high: "Strong bearish signals with high risk. Consider exiting positions."
      },
      hold: {
        low: "Mixed signals with low risk. Wait for clearer direction.",
        medium: "Neutral technical indicators. Monitor for breakout opportunities.",
        high: "Unclear signals with high risk. Stay on sidelines until clarity emerges."
      }
    };

    return summaries[recommendation][riskLevel] || "Analysis incomplete. Please check data availability.";
  }

  // Mock data for demo purposes
  getMockStockData(symbol) {
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: basePrice,
      change: change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      previousClose: basePrice - change,
      open: basePrice + (Math.random() - 0.5) * 5,
      high: basePrice + Math.random() * 5,
      low: basePrice - Math.random() * 5,
      marketCap: 'N/A',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }

  getMockHistoricalData(symbol) {
    const data = [];
    const basePrice = 100;
    let currentPrice = basePrice;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 4;
      currentPrice = Math.max(currentPrice + change, 50);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: currentPrice + (Math.random() - 0.5) * 2,
        high: currentPrice + Math.random() * 3,
        low: currentPrice - Math.random() * 3,
        close: currentPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    return data;
  }

  getMockFundamentalData(symbol) {
    return {
      companyName: `${symbol} Corporation`,
      sector: 'Technology',
      industry: 'Software',
      marketCap: '50B',
      peRatio: '25.5',
      priceToBook: '3.2',
      dividendYield: '1.2%',
      eps: '4.50',
      revenue: '15B',
      profitMargin: '18.5%',
      returnOnEquity: '22.3%',
      debtToEquity: '0.8'
    };
  }

  getMockNewsData(symbol) {
    return [
      {
        title: `${symbol} Reports Strong Q3 Earnings`,
        summary: 'Company exceeds analyst expectations with robust revenue growth.',
        sentiment: 'positive',
        time_published: new Date().toISOString()
      },
      {
        title: `${symbol} Announces New Product Launch`,
        summary: 'Innovative solution expected to drive market expansion.',
        sentiment: 'positive',
        time_published: new Date().toISOString()
      }
    ];
  }

  // Helper method for EMA calculation from values
  calculateEMAFromValues(values, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    let sum = values.slice(0, period).reduce((acc, val) => acc + val, 0);
    let emaValue = sum / period;
    
    ema.push(emaValue);

    for (let i = period; i < values.length; i++) {
      emaValue = (values[i] * multiplier) + (emaValue * (1 - multiplier));
      ema.push(emaValue);
    }
    
    return ema;
  }
}

export default new StockAnalysisService();



