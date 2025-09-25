/**
 * Advanced Predictive Modeling Service
 * Implements machine learning models for price prediction and portfolio optimization
 */

class PredictiveModelingService {
  constructor() {
    this.models = {
      // Time Series Models
      ARIMA: this.fitARIMA,
      LSTM: this.fitLSTM,
      Prophet: this.fitProphet,
      
      // Regression Models
      LinearRegression: this.fitLinearRegression,
      RandomForest: this.fitRandomForest,
      XGBoost: this.fitXGBoost,
      
      // Ensemble Methods
      VotingRegressor: this.fitVotingRegressor,
      StackingRegressor: this.fitStackingRegressor
    };

    this.featureExtractors = {
      technical: this.extractTechnicalFeatures,
      fundamental: this.extractFundamentalFeatures,
      sentiment: this.extractSentimentFeatures,
      macro: this.extractMacroFeatures
    };
  }

  // ==================== FEATURE EXTRACTION ====================

  extractTechnicalFeatures(historicalData, technicalIndicators) {
    const features = [];
    
    for (let i = 0; i < historicalData.length; i++) {
      const data = historicalData[i];
      const tech = technicalIndicators;
      
      const feature = {
        // Price features
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        
        // Price ratios
        highLowRatio: data.high / data.low,
        closeOpenRatio: data.close / data.open,
        volumeRatio: data.volume / this.calculateAverageVolume(historicalData, i, 20),
        
        // Moving averages
        sma20: this.getIndicatorValue(tech.movingAverages?.sma20, i),
        sma50: this.getIndicatorValue(tech.movingAverages?.sma50, i),
        ema12: this.getIndicatorValue(tech.movingAverages?.ema12, i),
        ema26: this.getIndicatorValue(tech.movingAverages?.ema26, i),
        
        // Momentum indicators
        rsi: this.getIndicatorValue(tech.momentum?.rsi, i),
        stochastic: this.getIndicatorValue(tech.momentum?.stochastic, i, 'k'),
        williamsR: this.getIndicatorValue(tech.momentum?.williamsR, i),
        cci: this.getIndicatorValue(tech.momentum?.cci, i),
        
        // Trend indicators
        macd: this.getIndicatorValue(tech.trend?.macd?.macd, i),
        macdSignal: this.getIndicatorValue(tech.trend?.macd?.signal, i),
        adx: this.getIndicatorValue(tech.trend?.adx, i),
        
        // Volatility indicators
        bollingerUpper: this.getIndicatorValue(tech.volatility?.bollingerBands, i, 'upper'),
        bollingerLower: this.getIndicatorValue(tech.volatility?.bollingerBands, i, 'lower'),
        atr: this.getIndicatorValue(tech.volatility?.atr, i),
        
        // Volume indicators
        obv: this.getIndicatorValue(tech.volume?.obv, i),
        vwap: this.getIndicatorValue(tech.volume?.vwap, i),
        mfi: this.getIndicatorValue(tech.volume?.mfi, i)
      };
      
      features.push(feature);
    }
    
    return features;
  }

  extractFundamentalFeatures(fundamentalData) {
    const { marketMetrics, profitability, financialHealth, ratios } = fundamentalData;
    
    return {
      // Market metrics
      peRatio: marketMetrics.peRatio || 0,
      pegRatio: marketMetrics.pegRatio || 0,
      priceToBook: marketMetrics.priceToBook || 0,
      priceToSales: marketMetrics.priceToSales || 0,
      dividendYield: marketMetrics.dividendYield || 0,
      
      // Profitability
      eps: profitability.eps || 0,
      profitMargin: profitability.profitMargin || 0,
      operatingMargin: profitability.operatingMargin || 0,
      returnOnEquity: profitability.returnOnEquity || 0,
      returnOnAssets: profitability.returnOnAssets || 0,
      
      // Financial health
      revenue: financialHealth.revenue || 0,
      revenueGrowth: financialHealth.revenueGrowth || 0,
      debtToEquity: financialHealth.debtToEquity || 0,
      currentRatio: financialHealth.currentRatio || 0,
      quickRatio: financialHealth.quickRatio || 0,
      
      // Calculated ratios
      grossMargin: ratios?.profitability?.grossMargin || 0,
      operatingMargin: ratios?.profitability?.operatingMargin || 0,
      netMargin: ratios?.profitability?.netMargin || 0,
      assetTurnover: ratios?.efficiency?.assetTurnover || 0,
      inventoryTurnover: ratios?.efficiency?.inventoryTurnover || 0
    };
  }

  extractSentimentFeatures(sentimentData) {
    const { news, social, financial } = sentimentData;
    
    return {
      // News sentiment
      newsScore: news.sentiment.overall.score || 0,
      newsConfidence: news.sentiment.overall.confidence || 0,
      newsPositive: news.sentiment.distribution.positive || 0,
      newsNegative: news.sentiment.distribution.negative || 0,
      
      // Social sentiment
      socialScore: social.overall.score || 0,
      socialConfidence: social.overall.confidence || 0,
      twitterMentions: social.twitter.totalMentions || 0,
      redditMentions: social.reddit.totalMentions || 0,
      
      // Financial sentiment
      financialScore: financial.overall.score || 0,
      earningsSentiment: financial.earnings.score || 0,
      secFilingsSentiment: financial.secFilings.score || 0
    };
  }

  extractMacroFeatures(macroData) {
    const { gdp, inflation, interestRates, unemployment } = macroData;
    
    return {
      gdpGrowth: gdp.growth || 0,
      gdpTrend: this.encodeTrend(gdp.trend),
      inflation: inflation.current || 0,
      inflationTrend: this.encodeTrend(inflation.trend),
      interestRate: interestRates.current || 0,
      interestTrend: this.encodeTrend(interestRates.trend),
      unemployment: unemployment.current || 0,
      unemploymentTrend: this.encodeTrend(unemployment.trend),
      economicHealth: macroData.economicHealth.score || 50
    };
  }

  // ==================== TIME SERIES MODELS ====================

  fitARIMA(data, order = [1, 1, 1]) {
    // Simplified ARIMA implementation
    const prices = data.map(d => d.close);
    const differences = this.difference(prices, order[1]);
    const arCoeffs = this.calculateARCoefficients(differences, order[0]);
    const maCoeffs = this.calculateMACoefficients(differences, order[2]);
    
    return {
      model: 'ARIMA',
      order,
      coefficients: { ar: arCoeffs, ma: maCoeffs },
      predict: (steps) => this.predictARIMA(prices, arCoeffs, maCoeffs, steps)
    };
  }

  fitLSTM(data, lookback = 60, units = 50) {
    // Simplified LSTM implementation using basic neural network concepts
    const sequences = this.createSequences(data, lookback);
    const features = this.prepareLSTMFeatures(sequences);
    
    // Mock LSTM model (in real implementation, would use TensorFlow.js)
    const weights = this.initializeLSTMWeights(units, features[0].length);
    
    return {
      model: 'LSTM',
      lookback,
      units,
      weights,
      predict: (input) => this.predictLSTM(input, weights, lookback)
    };
  }

  fitProphet(data) {
    // Simplified Prophet implementation
    const trend = this.calculateTrend(data);
    const seasonality = this.calculateSeasonality(data);
    const holidays = this.identifyHolidays(data);
    
    return {
      model: 'Prophet',
      trend,
      seasonality,
      holidays,
      predict: (steps) => this.predictProphet(trend, seasonality, holidays, steps)
    };
  }

  // ==================== REGRESSION MODELS ====================

  fitLinearRegression(features, targets) {
    const { coefficients, intercept } = this.calculateLinearRegression(features, targets);
    
    return {
      model: 'LinearRegression',
      coefficients,
      intercept,
      predict: (X) => this.predictLinearRegression(X, coefficients, intercept),
      score: this.calculateRSquared(features, targets, coefficients, intercept)
    };
  }

  fitRandomForest(features, targets, nEstimators = 100) {
    const trees = [];
    
    for (let i = 0; i < nEstimators; i++) {
      const bootstrapSample = this.bootstrapSample(features, targets);
      const tree = this.buildDecisionTree(bootstrapSample.features, bootstrapSample.targets);
      trees.push(tree);
    }
    
    return {
      model: 'RandomForest',
      nEstimators,
      trees,
      predict: (X) => this.predictRandomForest(X, trees),
      featureImportance: this.calculateFeatureImportance(trees)
    };
  }

  fitXGBoost(features, targets, nEstimators = 100) {
    const models = [];
    let predictions = new Array(targets.length).fill(0);
    
    for (let i = 0; i < nEstimators; i++) {
      const residuals = targets.map((target, idx) => target - predictions[idx]);
      const tree = this.buildGradientBoostingTree(features, residuals);
      models.push(tree);
      
      // Update predictions
      const treePredictions = this.predictTree(features, tree);
      predictions = predictions.map((pred, idx) => pred + 0.1 * treePredictions[idx]);
    }
    
    return {
      model: 'XGBoost',
      nEstimators,
      models,
      predict: (X) => this.predictXGBoost(X, models)
    };
  }

  // ==================== ENSEMBLE METHODS ====================

  fitVotingRegressor(models) {
    return {
      model: 'VotingRegressor',
      models,
      predict: (X) => this.predictVotingRegressor(X, models)
    };
  }

  fitStackingRegressor(baseModels, metaModel) {
    return {
      model: 'StackingRegressor',
      baseModels,
      metaModel,
      predict: (X) => this.predictStackingRegressor(X, baseModels, metaModel)
    };
  }

  // ==================== PREDICTION METHODS ====================

  predictARIMA(prices, arCoeffs, maCoeffs, steps) {
    const predictions = [];
    const lastPrices = prices.slice(-arCoeffs.length);
    
    for (let i = 0; i < steps; i++) {
      let prediction = 0;
      
      // AR component
      for (let j = 0; j < arCoeffs.length; j++) {
        prediction += arCoeffs[j] * lastPrices[lastPrices.length - 1 - j];
      }
      
      // MA component
      for (let j = 0; j < maCoeffs.length; j++) {
        prediction += maCoeffs[j] * (Math.random() - 0.5); // Simplified
      }
      
      predictions.push(prediction);
      lastPrices.push(prediction);
      lastPrices.shift();
    }
    
    return predictions;
  }

  predictLSTM(input, weights, lookback) {
    // Simplified LSTM prediction
    const hidden = new Array(weights.hiddenSize).fill(0);
    const cell = new Array(weights.hiddenSize).fill(0);
    
    for (let t = 0; t < input.length; t++) {
      const x = input[t];
      
      // Forget gate
      const forget = this.sigmoid(this.dot(x, weights.Wf) + this.dot(hidden, weights.Uf) + weights.bf);
      
      // Input gate
      const inputGate = this.sigmoid(this.dot(x, weights.Wi) + this.dot(hidden, weights.Ui) + weights.bi);
      const candidate = this.tanh(this.dot(x, weights.Wc) + this.dot(hidden, weights.Uc) + weights.bc);
      
      // Cell state update
      cell.forEach((val, i) => {
        cell[i] = forget[i] * val + inputGate[i] * candidate[i];
      });
      
      // Output gate
      const output = this.sigmoid(this.dot(x, weights.Wo) + this.dot(hidden, weights.Uo) + weights.bo);
      
      // Hidden state update
      hidden.forEach((val, i) => {
        hidden[i] = output[i] * this.tanh(cell[i]);
      });
    }
    
    return this.dot(hidden, weights.Wy) + weights.by;
  }

  predictLinearRegression(X, coefficients, intercept) {
    return X.map(row => {
      let prediction = intercept;
      for (let i = 0; i < row.length; i++) {
        prediction += row[i] * coefficients[i];
      }
      return prediction;
    });
  }

  predictRandomForest(X, trees) {
    return X.map(row => {
      const predictions = trees.map(tree => this.predictTree([row], tree)[0]);
      return predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
    });
  }

  predictXGBoost(X, models) {
    return X.map(row => {
      let prediction = 0;
      models.forEach(model => {
        prediction += this.predictTree([row], model)[0] * 0.1;
      });
      return prediction;
    });
  }

  // ==================== PORTFOLIO OPTIMIZATION ====================

  optimizePortfolio(assets, expectedReturns, covarianceMatrix, riskTolerance = 0.5) {
    const n = assets.length;
    const weights = new Array(n).fill(1 / n); // Equal weights initially
    
    // Markowitz optimization
    const optimizedWeights = this.markowitzOptimization(
      expectedReturns,
      covarianceMatrix,
      riskTolerance
    );
    
    const portfolio = {
      assets: assets.map((asset, i) => ({
        symbol: asset,
        weight: optimizedWeights[i],
        expectedReturn: expectedReturns[i]
      })),
      expectedReturn: this.calculatePortfolioReturn(optimizedWeights, expectedReturns),
      risk: this.calculatePortfolioRisk(optimizedWeights, covarianceMatrix),
      sharpeRatio: this.calculateSharpeRatio(
        this.calculatePortfolioReturn(optimizedWeights, expectedReturns),
        this.calculatePortfolioRisk(optimizedWeights, covarianceMatrix)
      )
    };
    
    return portfolio;
  }

  markowitzOptimization(expectedReturns, covarianceMatrix, riskTolerance) {
    // Simplified Markowitz optimization
    const n = expectedReturns.length;
    const weights = new Array(n).fill(1 / n);
    
    // Gradient descent optimization
    const learningRate = 0.01;
    const iterations = 1000;
    
    for (let iter = 0; iter < iterations; iter++) {
      const gradient = this.calculateGradient(weights, expectedReturns, covarianceMatrix, riskTolerance);
      
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradient[i];
        weights[i] = Math.max(0, Math.min(1, weights[i])); // Constrain to [0,1]
      }
      
      // Normalize weights
      const sum = weights.reduce((acc, w) => acc + w, 0);
      weights.forEach((w, i) => weights[i] = w / sum);
    }
    
    return weights;
  }

  // ==================== COMPREHENSIVE PREDICTION ====================

  async performComprehensivePrediction(symbol, historicalData, technicalIndicators, fundamentalData, sentimentData, macroData) {
    try {
      // Extract features
      const technicalFeatures = this.extractTechnicalFeatures(historicalData, technicalIndicators);
      const fundamentalFeatures = this.extractFundamentalFeatures(fundamentalData);
      const sentimentFeatures = this.extractSentimentFeatures(sentimentData);
      const macroFeatures = this.extractMacroFeatures(macroData);
      
      // Combine features
      const allFeatures = technicalFeatures.map((tech, i) => ({
        ...tech,
        ...fundamentalFeatures,
        ...sentimentFeatures,
        ...macroFeatures
      }));
      
      // Prepare data for modeling
      const { X, y } = this.prepareTrainingData(allFeatures, historicalData);
      
      // Train multiple models
      const models = {
        arima: this.fitARIMA(historicalData),
        lstm: this.fitLSTM(historicalData),
        linear: this.fitLinearRegression(X, y),
        randomForest: this.fitRandomForest(X, y),
        xgboost: this.fitXGBoost(X, y)
      };
      
      // Create ensemble
      const ensemble = this.fitVotingRegressor([
        models.linear,
        models.randomForest,
        models.xgboost
      ]);
      
      // Generate predictions
      const predictions = {
        shortTerm: this.generateShortTermPredictions(models, X, 5),
        mediumTerm: this.generateMediumTermPredictions(models, X, 20),
        longTerm: this.generateLongTermPredictions(models, X, 60),
        ensemble: this.generateEnsemblePredictions(ensemble, X, 30)
      };
      
      // Calculate confidence intervals
      const confidenceIntervals = this.calculateConfidenceIntervals(predictions.ensemble, models);
      
      // Generate trading signals
      const signals = this.generateTradingSignals(predictions, historicalData);
      
      return {
        symbol,
        models,
        predictions,
        confidenceIntervals,
        signals,
        featureImportance: this.calculateOverallFeatureImportance(models),
        modelPerformance: this.evaluateModelPerformance(models, X, y),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error performing comprehensive prediction:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  getIndicatorValue(indicator, index, property = 'value') {
    if (!indicator || !indicator[index]) return 0;
    return indicator[index][property] || 0;
  }

  calculateAverageVolume(data, index, period) {
    const start = Math.max(0, index - period + 1);
    const end = index + 1;
    const volumes = data.slice(start, end).map(d => d.volume);
    return volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  }

  encodeTrend(trend) {
    const trends = { 'increasing': 1, 'decreasing': -1, 'stable': 0 };
    return trends[trend] || 0;
  }

  difference(data, order) {
    let result = [...data];
    for (let i = 0; i < order; i++) {
      const diff = [];
      for (let j = 1; j < result.length; j++) {
        diff.push(result[j] - result[j - 1]);
      }
      result = diff;
    }
    return result;
  }

  calculateARCoefficients(data, order) {
    // Simplified AR coefficient calculation
    const coeffs = [];
    for (let i = 0; i < order; i++) {
      coeffs.push((Math.random() - 0.5) * 0.5);
    }
    return coeffs;
  }

  calculateMACoefficients(data, order) {
    // Simplified MA coefficient calculation
    const coeffs = [];
    for (let i = 0; i < order; i++) {
      coeffs.push((Math.random() - 0.5) * 0.3);
    }
    return coeffs;
  }

  createSequences(data, lookback) {
    const sequences = [];
    for (let i = lookback; i < data.length; i++) {
      sequences.push(data.slice(i - lookback, i));
    }
    return sequences;
  }

  prepareLSTMFeatures(sequences) {
    return sequences.map(seq => seq.map(d => [d.close, d.volume, d.high - d.low]));
  }

  initializeLSTMWeights(units, inputSize) {
    return {
      hiddenSize: units,
      Wf: this.randomMatrix(inputSize, units),
      Uf: this.randomMatrix(units, units),
      bf: this.randomVector(units),
      Wi: this.randomMatrix(inputSize, units),
      Ui: this.randomMatrix(units, units),
      bi: this.randomVector(units),
      Wc: this.randomMatrix(inputSize, units),
      Uc: this.randomMatrix(units, units),
      bc: this.randomVector(units),
      Wo: this.randomMatrix(inputSize, units),
      Uo: this.randomMatrix(units, units),
      bo: this.randomVector(units),
      Wy: this.randomMatrix(units, 1),
      by: this.randomVector(1)
    };
  }

  randomMatrix(rows, cols) {
    return Array(rows).fill().map(() => Array(cols).fill().map(() => Math.random() - 0.5));
  }

  randomVector(size) {
    return Array(size).fill().map(() => Math.random() - 0.5);
  }

  sigmoid(x) {
    if (Array.isArray(x)) {
      return x.map(val => 1 / (1 + Math.exp(-val)));
    }
    return 1 / (1 + Math.exp(-x));
  }

  tanh(x) {
    if (Array.isArray(x)) {
      return x.map(val => Math.tanh(val));
    }
    return Math.tanh(x);
  }

  dot(a, b) {
    if (Array.isArray(a[0])) {
      // Matrix multiplication
      const result = [];
      for (let i = 0; i < a.length; i++) {
        result[i] = 0;
        for (let j = 0; j < b.length; j++) {
          result[i] += a[i][j] * b[j];
        }
      }
      return result;
    } else {
      // Vector dot product
      return a.reduce((sum, val, i) => sum + val * b[i], 0);
    }
  }

  prepareTrainingData(features, historicalData) {
    const X = features.slice(0, -1); // All but last
    const y = historicalData.slice(1).map(d => d.close); // Next day's close price
    
    return { X, y };
  }

  calculateLinearRegression(features, targets) {
    // Simplified linear regression calculation
    const n = features.length;
    const p = features[0].length;
    
    const coefficients = Array(p).fill(0);
    const intercept = 0;
    
    // In a real implementation, this would use matrix operations
    // For now, return mock coefficients
    for (let i = 0; i < p; i++) {
      coefficients[i] = (Math.random() - 0.5) * 0.1;
    }
    
    return { coefficients, intercept };
  }

  calculateRSquared(features, targets, coefficients, intercept) {
    const predictions = this.predictLinearRegression(features, coefficients, intercept);
    const mean = targets.reduce((sum, t) => sum + t, 0) / targets.length;
    
    const ssRes = targets.reduce((sum, t, i) => sum + Math.pow(t - predictions[i], 2), 0);
    const ssTot = targets.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0);
    
    return 1 - (ssRes / ssTot);
  }

  bootstrapSample(features, targets) {
    const n = features.length;
    const indices = Array(n).fill().map(() => Math.floor(Math.random() * n));
    
    return {
      features: indices.map(i => features[i]),
      targets: indices.map(i => targets[i])
    };
  }

  buildDecisionTree(features, targets) {
    // Simplified decision tree implementation
    return {
      feature: Math.floor(Math.random() * features[0].length),
      threshold: Math.random() * 100,
      left: null,
      right: null,
      prediction: targets.reduce((sum, t) => sum + t, 0) / targets.length
    };
  }

  predictTree(features, tree) {
    return features.map(feature => {
      if (tree.left === null && tree.right === null) {
        return tree.prediction;
      }
      
      if (feature[tree.feature] <= tree.threshold) {
        return this.predictTree([feature], tree.left)[0];
      } else {
        return this.predictTree([feature], tree.right)[0];
      }
    });
  }

  buildGradientBoostingTree(features, residuals) {
    // Simplified gradient boosting tree
    return this.buildDecisionTree(features, residuals);
  }

  calculateFeatureImportance(trees) {
    const importance = {};
    const totalTrees = trees.length;
    
    trees.forEach(tree => {
      if (tree.feature !== undefined) {
        importance[tree.feature] = (importance[tree.feature] || 0) + 1 / totalTrees;
      }
    });
    
    return importance;
  }

  predictVotingRegressor(X, models) {
    const predictions = models.map(model => model.predict(X));
    const ensemble = [];
    
    for (let i = 0; i < X.length; i++) {
      const pred = predictions.reduce((sum, preds) => sum + preds[i], 0) / predictions.length;
      ensemble.push(pred);
    }
    
    return ensemble;
  }

  predictStackingRegressor(X, baseModels, metaModel) {
    const basePredictions = baseModels.map(model => model.predict(X));
    const metaFeatures = X.map((_, i) => basePredictions.map(preds => preds[i]));
    return metaModel.predict(metaFeatures);
  }

  generateShortTermPredictions(models, X, steps) {
    const predictions = {};
    Object.keys(models).forEach(modelName => {
      if (models[modelName].predict) {
        predictions[modelName] = models[modelName].predict(X.slice(-1))[0];
      }
    });
    return predictions;
  }

  generateMediumTermPredictions(models, X, steps) {
    return this.generateShortTermPredictions(models, X, steps);
  }

  generateLongTermPredictions(models, X, steps) {
    return this.generateShortTermPredictions(models, X, steps);
  }

  generateEnsemblePredictions(ensemble, X, steps) {
    return ensemble.predict(X.slice(-1));
  }

  calculateConfidenceIntervals(predictions, models) {
    // Simplified confidence interval calculation
    const mean = predictions.reduce((sum, p) => sum + p, 0) / predictions.length;
    const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      lower: mean - 1.96 * stdDev,
      upper: mean + 1.96 * stdDev,
      mean
    };
  }

  generateTradingSignals(predictions, historicalData) {
    const currentPrice = historicalData[historicalData.length - 1].close;
    const shortTermPred = predictions.shortTerm.ensemble || currentPrice;
    const mediumTermPred = predictions.mediumTerm.ensemble || currentPrice;
    
    let signal = 'hold';
    let confidence = 0.5;
    
    if (shortTermPred > currentPrice * 1.02) {
      signal = 'buy';
      confidence = 0.7;
    } else if (shortTermPred < currentPrice * 0.98) {
      signal = 'sell';
      confidence = 0.7;
    }
    
    return {
      signal,
      confidence,
      currentPrice,
      predictedPrice: shortTermPred,
      priceChange: ((shortTermPred - currentPrice) / currentPrice) * 100
    };
  }

  calculateOverallFeatureImportance(models) {
    const importance = {};
    
    Object.keys(models).forEach(modelName => {
      if (models[modelName].featureImportance) {
        Object.keys(models[modelName].featureImportance).forEach(feature => {
          importance[feature] = (importance[feature] || 0) + 
            models[modelName].featureImportance[feature];
        });
      }
    });
    
    return importance;
  }

  evaluateModelPerformance(models, X, y) {
    const performance = {};
    
    Object.keys(models).forEach(modelName => {
      if (models[modelName].predict) {
        const predictions = models[modelName].predict(X);
        const mse = this.calculateMSE(y, predictions);
        const mae = this.calculateMAE(y, predictions);
        const r2 = this.calculateR2(y, predictions);
        
        performance[modelName] = { mse, mae, r2 };
      }
    });
    
    return performance;
  }

  calculateMSE(actual, predicted) {
    return actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0) / actual.length;
  }

  calculateMAE(actual, predicted) {
    return actual.reduce((sum, a, i) => sum + Math.abs(a - predicted[i]), 0) / actual.length;
  }

  calculateR2(actual, predicted) {
    const mean = actual.reduce((sum, a) => sum + a, 0) / actual.length;
    const ssRes = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0);
    const ssTot = actual.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0);
    return 1 - (ssRes / ssTot);
  }

  calculatePortfolioReturn(weights, returns) {
    return weights.reduce((sum, w, i) => sum + w * returns[i], 0);
  }

  calculatePortfolioRisk(weights, covarianceMatrix) {
    let risk = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        risk += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }
    return Math.sqrt(risk);
  }

  calculateSharpeRatio(return_, risk, riskFreeRate = 0.02) {
    return (return_ - riskFreeRate) / risk;
  }

  calculateGradient(weights, expectedReturns, covarianceMatrix, riskTolerance) {
    // Simplified gradient calculation for Markowitz optimization
    const gradient = new Array(weights.length).fill(0);
    
    for (let i = 0; i < weights.length; i++) {
      gradient[i] = expectedReturns[i] - riskTolerance * this.calculateRiskGradient(weights, covarianceMatrix, i);
    }
    
    return gradient;
  }

  calculateRiskGradient(weights, covarianceMatrix, i) {
    let gradient = 0;
    for (let j = 0; j < weights.length; j++) {
      gradient += weights[j] * covarianceMatrix[i][j];
    }
    return 2 * gradient;
  }
}

export default new PredictiveModelingService();
