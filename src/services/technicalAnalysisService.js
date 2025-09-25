/**
 * Advanced Technical Analysis Service
 * Implements comprehensive technical indicators for stock market analysis
 */

class TechnicalAnalysisService {
  constructor() {
    this.indicators = {
      // Moving Averages
      SMA: this.calculateSMA,
      EMA: this.calculateEMA,
      WMA: this.calculateWMA,
      VWMA: this.calculateVWMA,
      
      // Momentum Indicators
      RSI: this.calculateRSI,
      Stochastic: this.calculateStochastic,
      WilliamsR: this.calculateWilliamsR,
      CCI: this.calculateCCI,
      
      // Trend Indicators
      MACD: this.calculateMACD,
      ADX: this.calculateADX,
      Aroon: this.calculateAroon,
      ParabolicSAR: this.calculateParabolicSAR,
      
      // Volatility Indicators
      BollingerBands: this.calculateBollingerBands,
      ATR: this.calculateATR,
      KeltnerChannels: this.calculateKeltnerChannels,
      
      // Volume Indicators
      OBV: this.calculateOBV,
      VWAP: this.calculateVWAP,
      MoneyFlowIndex: this.calculateMoneyFlowIndex,
      
      // Pattern Recognition
      CandlestickPatterns: this.detectCandlestickPatterns,
      SupportResistance: this.calculateSupportResistance,
      TrendLines: this.calculateTrendLines
    };
  }

  // ==================== MOVING AVERAGES ====================

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

  calculateWMA(data, period) {
    const wma = [];
    const weights = Array.from({length: period}, (_, i) => i + 1);
    const weightSum = weights.reduce((acc, w) => acc + w, 0);
    
    for (let i = period - 1; i < data.length; i++) {
      let weightedSum = 0;
      for (let j = 0; j < period; j++) {
        weightedSum += data[i - period + 1 + j].close * weights[j];
      }
      wma.push({
        date: data[i].date,
        value: weightedSum / weightSum
      });
    }
    return wma;
  }

  calculateVWMA(data, period) {
    const vwma = [];
    for (let i = period - 1; i < data.length; i++) {
      let volumeSum = 0;
      let volumePriceSum = 0;
      
      for (let j = 0; j < period; j++) {
        const item = data[i - period + 1 + j];
        volumeSum += item.volume;
        volumePriceSum += item.close * item.volume;
      }
      
      vwma.push({
        date: data[i].date,
        value: volumePriceSum / volumeSum
      });
    }
    return vwma;
  }

  // ==================== MOMENTUM INDICATORS ====================

  calculateRSI(data, period = 14) {
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
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      
      rsi.push({
        date: data[i].date,
        value: rsiValue,
        signal: rsiValue > 70 ? 'overbought' : rsiValue < 30 ? 'oversold' : 'neutral'
      });
    }

    return rsi;
  }

  calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
    const stoch = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const periodData = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...periodData.map(d => d.high));
      const lowest = Math.min(...periodData.map(d => d.low));
      const current = data[i].close;
      
      const k = ((current - lowest) / (highest - lowest)) * 100;
      
      stoch.push({
        date: data[i].date,
        k: k,
        signal: k > 80 ? 'overbought' : k < 20 ? 'oversold' : 'neutral'
      });
    }
    
    // Calculate %D (SMA of %K)
    const d = this.calculateSMA(stoch.map(s => ({close: s.k})), dPeriod);
    
    return stoch.map((item, index) => ({
      ...item,
      d: d[index]?.value || 0
    }));
  }

  calculateWilliamsR(data, period = 14) {
    const williamsR = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...periodData.map(d => d.high));
      const lowest = Math.min(...periodData.map(d => d.low));
      const current = data[i].close;
      
      const wr = ((highest - current) / (highest - lowest)) * -100;
      
      williamsR.push({
        date: data[i].date,
        value: wr,
        signal: wr > -20 ? 'overbought' : wr < -80 ? 'oversold' : 'neutral'
      });
    }
    
    return williamsR;
  }

  calculateCCI(data, period = 20) {
    const cci = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const typicalPrice = periodData.map(d => (d.high + d.low + d.close) / 3);
      const sma = typicalPrice.reduce((acc, val) => acc + val, 0) / period;
      const meanDeviation = typicalPrice.reduce((acc, val) => acc + Math.abs(val - sma), 0) / period;
      const currentTP = (data[i].high + data[i].low + data[i].close) / 3;
      
      const cciValue = (currentTP - sma) / (0.015 * meanDeviation);
      
      cci.push({
        date: data[i].date,
        value: cciValue,
        signal: cciValue > 100 ? 'overbought' : cciValue < -100 ? 'oversold' : 'neutral'
      });
    }
    
    return cci;
  }

  // ==================== TREND INDICATORS ====================

  calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = this.calculateEMA(data, fastPeriod);
    const emaSlow = this.calculateEMA(data, slowPeriod);
    
    const macd = [];
    const signal = [];
    
    for (let i = 0; i < emaSlow.length; i++) {
      const fastValue = emaFast[i + (slowPeriod - fastPeriod)]?.value || 0;
      const slowValue = emaSlow[i].value;
      const macdValue = fastValue - slowValue;
      
      macd.push({
        date: emaSlow[i].date,
        value: macdValue
      });
    }

    // Calculate signal line (EMA of MACD)
    const macdValues = macd.map(item => ({close: item.value}));
    const signalLine = this.calculateEMA(macdValues, signalPeriod);
    
    for (let i = 0; i < signalLine.length; i++) {
      signal.push({
        date: macd[i + (signalPeriod - 1)]?.date || '',
        value: signalLine[i].value
      });
    }

    return { macd, signal, histogram: this.calculateMACDHistogram(macd, signal) };
  }

  calculateMACDHistogram(macd, signal) {
    return macd.map((item, index) => ({
      date: item.date,
      value: item.value - (signal[index]?.value || 0)
    }));
  }

  calculateADX(data, period = 14) {
    const adx = [];
    const tr = this.calculateTrueRange(data);
    const dm = this.calculateDirectionalMovement(data);
    
    for (let i = period; i < data.length; i++) {
      const atr = tr.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0) / period;
      const plusDM = dm.plus.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0) / period;
      const minusDM = dm.minus.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0) / period;
      
      const plusDI = (plusDM / atr) * 100;
      const minusDI = (minusDM / atr) * 100;
      const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
      
      adx.push({
        date: data[i].date,
        value: dx,
        plusDI,
        minusDI,
        signal: dx > 25 ? 'strong_trend' : dx < 20 ? 'weak_trend' : 'moderate_trend'
      });
    }
    
    return adx;
  }

  calculateTrueRange(data) {
    const tr = [];
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      tr.push(Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      ));
    }
    return tr;
  }

  calculateDirectionalMovement(data) {
    const plusDM = [];
    const minusDM = [];
    
    for (let i = 1; i < data.length; i++) {
      const highDiff = data[i].high - data[i - 1].high;
      const lowDiff = data[i - 1].low - data[i].low;
      
      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
    }
    
    return { plus: plusDM, minus: minusDM };
  }

  // ==================== VOLATILITY INDICATORS ====================

  calculateBollingerBands(data, period = 20, multiplier = 2) {
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
        upper: sma[i].value + (multiplier * standardDeviation),
        middle: sma[i].value,
        lower: sma[i].value - (multiplier * standardDeviation),
        width: (2 * multiplier * standardDeviation) / sma[i].value * 100,
        squeeze: (2 * multiplier * standardDeviation) / sma[i].value < 0.1
      });
    }
    
    return bands;
  }

  calculateATR(data, period = 14) {
    const tr = this.calculateTrueRange(data);
    const atr = [];
    
    for (let i = period - 1; i < tr.length; i++) {
      const atrValue = tr.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0) / period;
      atr.push({
        date: data[i + 1].date,
        value: atrValue
      });
    }
    
    return atr;
  }

  calculateKeltnerChannels(data, period = 20, multiplier = 2) {
    const ema = this.calculateEMA(data, period);
    const atr = this.calculateATR(data, period);
    const channels = [];
    
    for (let i = 0; i < ema.length; i++) {
      const atrValue = atr[i]?.value || 0;
      channels.push({
        date: ema[i].date,
        upper: ema[i].value + (multiplier * atrValue),
        middle: ema[i].value,
        lower: ema[i].value - (multiplier * atrValue)
      });
    }
    
    return channels;
  }

  // ==================== VOLUME INDICATORS ====================

  calculateOBV(data) {
    const obv = [];
    let obvValue = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        obvValue = data[i].volume;
      } else {
        if (data[i].close > data[i - 1].close) {
          obvValue += data[i].volume;
        } else if (data[i].close < data[i - 1].close) {
          obvValue -= data[i].volume;
        }
      }
      
      obv.push({
        date: data[i].date,
        value: obvValue
      });
    }
    
    return obv;
  }

  calculateVWAP(data) {
    const vwap = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (let i = 0; i < data.length; i++) {
      const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
      cumulativeVolume += data[i].volume;
      cumulativeVolumePrice += typicalPrice * data[i].volume;
      
      vwap.push({
        date: data[i].date,
        value: cumulativeVolumePrice / cumulativeVolume
      });
    }
    
    return vwap;
  }

  calculateMoneyFlowIndex(data, period = 14) {
    const mfi = [];
    const typicalPrices = data.map(d => (d.high + d.low + d.close) / 3);
    const moneyFlow = typicalPrices.map((tp, i) => tp * data[i].volume);
    
    for (let i = period; i < data.length; i++) {
      let positiveFlow = 0;
      let negativeFlow = 0;
      
      for (let j = i - period + 1; j <= i; j++) {
        if (typicalPrices[j] > typicalPrices[j - 1]) {
          positiveFlow += moneyFlow[j];
        } else if (typicalPrices[j] < typicalPrices[j - 1]) {
          negativeFlow += moneyFlow[j];
        }
      }
      
      const mfiValue = 100 - (100 / (1 + (positiveFlow / negativeFlow)));
      
      mfi.push({
        date: data[i].date,
        value: mfiValue,
        signal: mfiValue > 80 ? 'overbought' : mfiValue < 20 ? 'oversold' : 'neutral'
      });
    }
    
    return mfi;
  }

  // ==================== PATTERN RECOGNITION ====================

  detectCandlestickPatterns(data) {
    const patterns = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const pattern = this.analyzeCandlestickPattern(current, previous);
      if (pattern) {
        patterns.push({
          date: current.date,
          pattern: pattern.name,
          signal: pattern.signal,
          confidence: pattern.confidence
        });
      }
    }
    
    return patterns;
  }

  analyzeCandlestickPattern(current, previous) {
    const currentBody = Math.abs(current.close - current.open);
    const currentRange = current.high - current.low;
    const currentUpperShadow = current.high - Math.max(current.open, current.close);
    const currentLowerShadow = Math.min(current.open, current.close) - current.low;
    
    const previousBody = Math.abs(previous.close - previous.open);
    const previousRange = previous.high - previous.low;
    
    // Doji
    if (currentBody < currentRange * 0.1) {
      return {
        name: 'Doji',
        signal: 'neutral',
        confidence: 0.8
      };
    }
    
    // Hammer
    if (currentLowerShadow > currentBody * 2 && currentUpperShadow < currentBody * 0.5) {
      return {
        name: 'Hammer',
        signal: 'bullish',
        confidence: 0.7
      };
    }
    
    // Shooting Star
    if (currentUpperShadow > currentBody * 2 && currentLowerShadow < currentBody * 0.5) {
      return {
        name: 'Shooting Star',
        signal: 'bearish',
        confidence: 0.7
      };
    }
    
    // Engulfing
    if (currentBody > previousBody && 
        ((current.close > current.open && previous.close < previous.open) ||
         (current.close < current.open && previous.close > previous.open))) {
      return {
        name: current.close > current.open ? 'Bullish Engulfing' : 'Bearish Engulfing',
        signal: current.close > current.open ? 'bullish' : 'bearish',
        confidence: 0.8
      };
    }
    
    return null;
  }

  calculateSupportResistance(data, lookback = 20) {
    const levels = [];
    
    for (let i = lookback; i < data.length; i++) {
      const periodData = data.slice(i - lookback, i);
      const highs = periodData.map(d => d.high);
      const lows = periodData.map(d => d.low);
      
      const resistance = Math.max(...highs);
      const support = Math.min(...lows);
      
      levels.push({
        date: data[i].date,
        support,
        resistance,
        range: resistance - support,
        breakout: data[i].close > resistance,
        breakdown: data[i].close < support
      });
    }
    
    return levels;
  }

  calculateTrendLines(data, minPoints = 3) {
    const trendLines = [];
    const highs = [];
    const lows = [];
    
    // Find pivot highs and lows
    for (let i = 2; i < data.length - 2; i++) {
      if (data[i].high > data[i-1].high && data[i].high > data[i+1].high) {
        highs.push({ date: data[i].date, value: data[i].high, index: i });
      }
      if (data[i].low < data[i-1].low && data[i].low < data[i+1].low) {
        lows.push({ date: data[i].date, value: data[i].low, index: i });
      }
    }
    
    // Calculate trend line slopes
    if (highs.length >= minPoints) {
      const slope = (highs[highs.length - 1].value - highs[0].value) / 
                   (highs[highs.length - 1].index - highs[0].index);
      trendLines.push({
        type: 'resistance',
        slope,
        points: highs,
        strength: highs.length
      });
    }
    
    if (lows.length >= minPoints) {
      const slope = (lows[lows.length - 1].value - lows[0].value) / 
                   (lows[lows.length - 1].index - lows[0].index);
      trendLines.push({
        type: 'support',
        slope,
        points: lows,
        strength: lows.length
      });
    }
    
    return trendLines;
  }

  // ==================== COMPREHENSIVE ANALYSIS ====================

  performTechnicalAnalysis(data) {
    const analysis = {
      movingAverages: {
        sma20: this.calculateSMA(data, 20),
        sma50: this.calculateSMA(data, 50),
        sma200: this.calculateSMA(data, 200),
        ema12: this.calculateEMA(data, 12),
        ema26: this.calculateEMA(data, 26)
      },
      momentum: {
        rsi: this.calculateRSI(data, 14),
        stochastic: this.calculateStochastic(data, 14, 3),
        williamsR: this.calculateWilliamsR(data, 14),
        cci: this.calculateCCI(data, 20)
      },
      trend: {
        macd: this.calculateMACD(data, 12, 26, 9),
        adx: this.calculateADX(data, 14)
      },
      volatility: {
        bollingerBands: this.calculateBollingerBands(data, 20, 2),
        atr: this.calculateATR(data, 14),
        keltnerChannels: this.calculateKeltnerChannels(data, 20, 2)
      },
      volume: {
        obv: this.calculateOBV(data),
        vwap: this.calculateVWAP(data),
        mfi: this.calculateMoneyFlowIndex(data, 14)
      },
      patterns: {
        candlestick: this.detectCandlestickPatterns(data),
        supportResistance: this.calculateSupportResistance(data, 20),
        trendLines: this.calculateTrendLines(data, 3)
      }
    };

    return analysis;
  }

  generateTradingSignals(analysis) {
    const signals = [];
    const latest = analysis.movingAverages.sma20[analysis.movingAverages.sma20.length - 1];
    
    if (!latest) return signals;

    // RSI Signal
    const rsi = analysis.momentum.rsi[analysis.momentum.rsi.length - 1];
    if (rsi) {
      if (rsi.value < 30) signals.push({ indicator: 'RSI', signal: 'BUY', strength: 'strong' });
      else if (rsi.value > 70) signals.push({ indicator: 'RSI', signal: 'SELL', strength: 'strong' });
    }

    // MACD Signal
    const macd = analysis.trend.macd.macd[analysis.trend.macd.macd.length - 1];
    const macdSignal = analysis.trend.macd.signal[analysis.trend.macd.signal.length - 1];
    if (macd && macdSignal) {
      if (macd.value > macdSignal.value) signals.push({ indicator: 'MACD', signal: 'BUY', strength: 'medium' });
      else signals.push({ indicator: 'MACD', signal: 'SELL', strength: 'medium' });
    }

    // Moving Average Crossover
    const sma20 = analysis.movingAverages.sma20[analysis.movingAverages.sma20.length - 1];
    const sma50 = analysis.movingAverages.sma50[analysis.movingAverages.sma50.length - 1];
    if (sma20 && sma50) {
      if (sma20.value > sma50.value) signals.push({ indicator: 'MA Crossover', signal: 'BUY', strength: 'medium' });
      else signals.push({ indicator: 'MA Crossover', signal: 'SELL', strength: 'medium' });
    }

    return signals;
  }
}

export default new TechnicalAnalysisService();
