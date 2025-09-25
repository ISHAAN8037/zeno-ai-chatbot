/**
 * Advanced Risk & Portfolio Management Service
 * Implements comprehensive risk analysis and portfolio optimization tools
 */

class RiskPortfolioService {
  constructor() {
    this.riskMetrics = {
      VaR: this.calculateVaR,
      CVaR: this.calculateCVaR,
      Sharpe: this.calculateSharpeRatio,
      Sortino: this.calculateSortinoRatio,
      Calmar: this.calculateCalmarRatio,
      MaxDrawdown: this.calculateMaxDrawdown,
      Beta: this.calculateBeta,
      Alpha: this.calculateAlpha,
      Treynor: this.calculateTreynorRatio,
      Information: this.calculateInformationRatio
    };

    this.portfolioOptimizers = {
      Markowitz: this.markowitzOptimization,
      BlackLitterman: this.blackLittermanOptimization,
      RiskParity: this.riskParityOptimization,
      EqualWeight: this.equalWeightOptimization,
      MinVariance: this.minVarianceOptimization
    };
  }

  // ==================== RISK METRICS ====================

  calculateVaR(returns, confidenceLevel = 0.05) {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(confidenceLevel * sortedReturns.length);
    return sortedReturns[index];
  }

  calculateCVaR(returns, confidenceLevel = 0.05) {
    const var = this.calculateVaR(returns, confidenceLevel);
    const tailReturns = returns.filter(r => r <= var);
    return tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
  }

  calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    return (meanReturn - riskFreeRate) / volatility;
  }

  calculateSortinoRatio(returns, riskFreeRate = 0.02) {
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const downsideReturns = returns.filter(r => r < riskFreeRate);
    const downsideDeviation = this.calculateVolatility(downsideReturns);
    return (meanReturn - riskFreeRate) / downsideDeviation;
  }

  calculateCalmarRatio(returns) {
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    return (meanReturn * 252) / Math.abs(maxDrawdown);
  }

  calculateMaxDrawdown(returns) {
    let peak = returns[0];
    let maxDD = 0;
    
    for (let i = 1; i < returns.length; i++) {
      if (returns[i] > peak) {
        peak = returns[i];
      }
      const drawdown = (peak - returns[i]) / peak;
      if (drawdown > maxDD) {
        maxDD = drawdown;
      }
    }
    
    return maxDD;
  }

  calculateBeta(portfolioReturns, marketReturns) {
    const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < portfolioReturns.length; i++) {
      covariance += (portfolioReturns[i] - portfolioMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }
    
    return covariance / marketVariance;
  }

  calculateAlpha(portfolioReturns, marketReturns, riskFreeRate = 0.02) {
    const beta = this.calculateBeta(portfolioReturns, marketReturns);
    const portfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const marketReturn = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    
    return portfolioReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
  }

  calculateTreynorRatio(portfolioReturns, marketReturns, riskFreeRate = 0.02) {
    const beta = this.calculateBeta(portfolioReturns, marketReturns);
    const portfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    return (portfolioReturn - riskFreeRate) / beta;
  }

  calculateInformationRatio(portfolioReturns, benchmarkReturns) {
    const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
    const trackingError = this.calculateVolatility(excessReturns);
    
    return meanExcessReturn / trackingError;
  }

  calculateVolatility(returns) {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  // ==================== PORTFOLIO OPTIMIZATION ====================

  markowitzOptimization(expectedReturns, covarianceMatrix, riskTolerance = 0.5) {
    const n = expectedReturns.length;
    const weights = new Array(n).fill(1 / n);
    
    // Simplified Markowitz optimization using gradient descent
    const learningRate = 0.01;
    const iterations = 1000;
    
    for (let iter = 0; iter < iterations; iter++) {
      const gradient = this.calculateMarkowitzGradient(weights, expectedReturns, covarianceMatrix, riskTolerance);
      
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradient[i];
        weights[i] = Math.max(0, Math.min(1, weights[i])); // Constrain to [0,1]
      }
      
      // Normalize weights
      const sum = weights.reduce((acc, w) => acc + w, 0);
      weights.forEach((w, i) => weights[i] = w / sum);
    }
    
    return {
      weights,
      expectedReturn: this.calculatePortfolioReturn(weights, expectedReturns),
      risk: this.calculatePortfolioRisk(weights, covarianceMatrix),
      sharpeRatio: this.calculateSharpeRatioFromWeights(weights, expectedReturns, covarianceMatrix)
    };
  }

  blackLittermanOptimization(expectedReturns, covarianceMatrix, views = [], viewConfidence = 0.5) {
    // Simplified Black-Litterman implementation
    const n = expectedReturns.length;
    const tau = 0.05; // Scaling factor
    
    // Market implied returns (simplified)
    const marketCapWeights = this.calculateMarketCapWeights(expectedReturns);
    const marketImpliedReturns = this.calculateMarketImpliedReturns(marketCapWeights, covarianceMatrix);
    
    // Combine market and views
    const combinedReturns = this.combineReturnsAndViews(
      marketImpliedReturns,
      views,
      covarianceMatrix,
      tau,
      viewConfidence
    );
    
    // Optimize with combined returns
    return this.markowitzOptimization(combinedReturns, covarianceMatrix);
  }

  riskParityOptimization(covarianceMatrix) {
    const n = covarianceMatrix.length;
    const weights = new Array(n).fill(1 / n);
    
    // Risk parity optimization
    const iterations = 100;
    const learningRate = 0.01;
    
    for (let iter = 0; iter < iterations; iter++) {
      const riskContributions = this.calculateRiskContributions(weights, covarianceMatrix);
      const targetRisk = 1 / n; // Equal risk contribution
      
      const gradient = riskContributions.map(rc => rc - targetRisk);
      
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradient[i];
        weights[i] = Math.max(0.01, weights[i]); // Minimum weight constraint
      }
      
      // Normalize weights
      const sum = weights.reduce((acc, w) => acc + w, 0);
      weights.forEach((w, i) => weights[i] = w / sum);
    }
    
    return {
      weights,
      riskContributions: this.calculateRiskContributions(weights, covarianceMatrix),
      expectedReturn: 0, // Risk parity doesn't optimize for return
      risk: this.calculatePortfolioRisk(weights, covarianceMatrix)
    };
  }

  equalWeightOptimization(n) {
    const weights = new Array(n).fill(1 / n);
    return {
      weights,
      expectedReturn: 0,
      risk: 0,
      sharpeRatio: 0
    };
  }

  minVarianceOptimization(covarianceMatrix) {
    const n = covarianceMatrix.length;
    
    // Solve for minimum variance portfolio
    // This is a simplified implementation
    const weights = this.solveMinVariance(covarianceMatrix);
    
    return {
      weights,
      expectedReturn: 0, // Min variance doesn't consider returns
      risk: this.calculatePortfolioRisk(weights, covarianceMatrix)
    };
  }

  // ==================== PORTFOLIO ANALYSIS ====================

  analyzePortfolio(portfolio, marketData, riskFreeRate = 0.02) {
    const returns = this.calculatePortfolioReturns(portfolio, marketData);
    const marketReturns = this.calculateMarketReturns(marketData);
    
    const analysis = {
      performance: {
        totalReturn: this.calculateTotalReturn(returns),
        annualizedReturn: this.calculateAnnualizedReturn(returns),
        volatility: this.calculateVolatility(returns),
        sharpeRatio: this.calculateSharpeRatio(returns, riskFreeRate),
        sortinoRatio: this.calculateSortinoRatio(returns, riskFreeRate),
        calmarRatio: this.calculateCalmarRatio(returns)
      },
      risk: {
        var95: this.calculateVaR(returns, 0.05),
        var99: this.calculateVaR(returns, 0.01),
        cvar95: this.calculateCVaR(returns, 0.05),
        cvar99: this.calculateCVaR(returns, 0.01),
        maxDrawdown: this.calculateMaxDrawdown(returns),
        beta: this.calculateBeta(returns, marketReturns),
        alpha: this.calculateAlpha(returns, marketReturns, riskFreeRate)
      },
      attribution: {
        sectorAllocation: this.calculateSectorAllocation(portfolio),
        stockSelection: this.calculateStockSelection(portfolio, marketData),
        currency: this.calculateCurrencyAttribution(portfolio),
        timing: this.calculateTimingAttribution(portfolio, marketData)
      },
      diversification: {
        effectiveAssets: this.calculateEffectiveAssets(portfolio),
        concentrationRisk: this.calculateConcentrationRisk(portfolio),
        correlationRisk: this.calculateCorrelationRisk(portfolio, marketData)
      }
    };
    
    return analysis;
  }

  // ==================== RISK MANAGEMENT ====================

  calculatePositionSizing(portfolio, riskBudget, volatility) {
    const positionSizes = {};
    
    Object.keys(portfolio.positions).forEach(symbol => {
      const position = portfolio.positions[symbol];
      const positionVolatility = volatility[symbol] || 0.2; // Default 20% volatility
      
      // Kelly Criterion for position sizing
      const kellyFraction = this.calculateKellyFraction(position.expectedReturn, positionVolatility);
      
      // Risk-based position sizing
      const riskBasedSize = riskBudget / (positionVolatility * portfolio.totalValue);
      
      positionSizes[symbol] = {
        kelly: kellyFraction,
        riskBased: riskBasedSize,
        recommended: Math.min(kellyFraction, riskBasedSize, 0.1) // Cap at 10%
      };
    });
    
    return positionSizes;
  }

  calculateKellyFraction(expectedReturn, volatility) {
    // Kelly Criterion: f = (bp - q) / b
    // where b = odds, p = probability of win, q = probability of loss
    const b = 1; // Assuming 1:1 odds
    const p = 0.5 + (expectedReturn / 2); // Convert return to probability
    const q = 1 - p;
    
    return Math.max(0, (b * p - q) / b);
  }

  calculateStopLoss(entryPrice, volatility, riskTolerance = 0.02) {
    // ATR-based stop loss
    const atr = volatility * entryPrice;
    const stopLoss = entryPrice - (2 * atr); // 2x ATR stop loss
    
    return {
      price: stopLoss,
      percentage: ((entryPrice - stopLoss) / entryPrice) * 100,
      atrMultiple: 2
    };
  }

  calculateTakeProfit(entryPrice, expectedReturn, riskRewardRatio = 2) {
    const stopLoss = this.calculateStopLoss(entryPrice, 0.2); // Default 20% volatility
    const risk = entryPrice - stopLoss.price;
    const takeProfit = entryPrice + (risk * riskRewardRatio);
    
    return {
      price: takeProfit,
      percentage: ((takeProfit - entryPrice) / entryPrice) * 100,
      riskRewardRatio
    };
  }

  // ==================== STRESS TESTING ====================

  performStressTest(portfolio, scenarios) {
    const results = {};
    
    Object.keys(scenarios).forEach(scenarioName => {
      const scenario = scenarios[scenarioName];
      const portfolioValue = this.calculateScenarioValue(portfolio, scenario);
      
      results[scenarioName] = {
        portfolioValue,
        return: (portfolioValue - portfolio.totalValue) / portfolio.totalValue,
        worstPerformer: this.findWorstPerformer(portfolio, scenario),
        bestPerformer: this.findBestPerformer(portfolio, scenario)
      };
    });
    
    return {
      baseValue: portfolio.totalValue,
      scenarios: results,
      worstCase: this.findWorstCase(results),
      bestCase: this.findBestCase(results)
    };
  }

  generateStressScenarios() {
    return {
      marketCrash: {
        description: '2008-style market crash',
        marketReturn: -0.37,
        volatilityMultiplier: 3.0,
        correlationIncrease: 0.3
      },
      recession: {
        description: 'Economic recession',
        marketReturn: -0.20,
        volatilityMultiplier: 2.0,
        correlationIncrease: 0.2
      },
      inflation: {
        description: 'High inflation environment',
        marketReturn: -0.10,
        volatilityMultiplier: 1.5,
        correlationIncrease: 0.1
      },
      interestRate: {
        description: 'Rising interest rates',
        marketReturn: -0.15,
        volatilityMultiplier: 1.8,
        correlationIncrease: 0.15
      },
      pandemic: {
        description: 'Pandemic-like disruption',
        marketReturn: -0.30,
        volatilityMultiplier: 2.5,
        correlationIncrease: 0.25
      }
    };
  }

  // ==================== COMPREHENSIVE PORTFOLIO MANAGEMENT ====================

  async performComprehensivePortfolioAnalysis(portfolio, marketData, riskPreferences = {}) {
    try {
      const {
        riskTolerance = 0.5,
        maxPositionSize = 0.1,
        rebalanceThreshold = 0.05,
        riskBudget = 0.02
      } = riskPreferences;

      // Calculate market metrics
      const marketReturns = this.calculateMarketReturns(marketData);
      const volatility = this.calculateAssetVolatility(portfolio, marketData);
      const correlationMatrix = this.calculateCorrelationMatrix(portfolio, marketData);

      // Portfolio analysis
      const analysis = this.analyzePortfolio(portfolio, marketData);
      
      // Risk metrics
      const riskMetrics = this.calculateAllRiskMetrics(portfolio, marketData);
      
      // Position sizing
      const positionSizing = this.calculatePositionSizing(portfolio, riskBudget, volatility);
      
      // Stress testing
      const stressScenarios = this.generateStressScenarios();
      const stressTest = this.performStressTest(portfolio, stressScenarios);
      
      // Optimization recommendations
      const optimization = this.generateOptimizationRecommendations(
        portfolio,
        analysis,
        riskMetrics,
        riskTolerance
      );
      
      // Rebalancing recommendations
      const rebalancing = this.generateRebalancingRecommendations(
        portfolio,
        analysis,
        rebalanceThreshold
      );

      return {
        portfolio,
        analysis,
        riskMetrics,
        positionSizing,
        stressTest,
        optimization,
        rebalancing,
        recommendations: this.generatePortfolioRecommendations(
          analysis,
          riskMetrics,
          optimization,
          rebalancing
        ),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error performing comprehensive portfolio analysis:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

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

  calculateSharpeRatioFromWeights(weights, expectedReturns, covarianceMatrix) {
    const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
    const portfolioRisk = this.calculatePortfolioRisk(weights, covarianceMatrix);
    return portfolioReturn / portfolioRisk;
  }

  calculateMarkowitzGradient(weights, expectedReturns, covarianceMatrix, riskTolerance) {
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

  calculateMarketCapWeights(expectedReturns) {
    // Simplified market cap weights calculation
    const total = expectedReturns.reduce((sum, r) => sum + Math.abs(r), 0);
    return expectedReturns.map(r => Math.abs(r) / total);
  }

  calculateMarketImpliedReturns(weights, covarianceMatrix) {
    // Simplified market implied returns calculation
    const riskAversion = 3.0; // Market risk aversion parameter
    return covarianceMatrix.map((row, i) => 
      riskAversion * row.reduce((sum, cov, j) => sum + cov * weights[j], 0)
    );
  }

  combineReturnsAndViews(marketReturns, views, covarianceMatrix, tau, viewConfidence) {
    // Simplified Black-Litterman combination
    return marketReturns; // In practice, this would be more complex
  }

  calculateRiskContributions(weights, covarianceMatrix) {
    const portfolioRisk = this.calculatePortfolioRisk(weights, covarianceMatrix);
    const contributions = [];
    
    for (let i = 0; i < weights.length; i++) {
      let contribution = 0;
      for (let j = 0; j < weights.length; j++) {
        contribution += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
      contributions.push(contribution / portfolioRisk);
    }
    
    return contributions;
  }

  solveMinVariance(covarianceMatrix) {
    // Simplified minimum variance solution
    const n = covarianceMatrix.length;
    const weights = new Array(n).fill(1 / n);
    
    // In practice, this would solve the quadratic programming problem
    // For now, return equal weights as approximation
    return weights;
  }

  calculatePortfolioReturns(portfolio, marketData) {
    // Calculate portfolio returns based on positions and market data
    const returns = [];
    const positions = portfolio.positions;
    
    for (let i = 1; i < marketData.length; i++) {
      let portfolioReturn = 0;
      
      Object.keys(positions).forEach(symbol => {
        const position = positions[symbol];
        const assetReturn = (marketData[i][symbol] - marketData[i-1][symbol]) / marketData[i-1][symbol];
        portfolioReturn += position.weight * assetReturn;
      });
      
      returns.push(portfolioReturn);
    }
    
    return returns;
  }

  calculateMarketReturns(marketData) {
    // Calculate market returns (e.g., S&P 500)
    const returns = [];
    
    for (let i = 1; i < marketData.length; i++) {
      const marketReturn = (marketData[i].SPY - marketData[i-1].SPY) / marketData[i-1].SPY;
      returns.push(marketReturn);
    }
    
    return returns;
  }

  calculateTotalReturn(returns) {
    return returns.reduce((product, r) => product * (1 + r), 1) - 1;
  }

  calculateAnnualizedReturn(returns) {
    const totalReturn = this.calculateTotalReturn(returns);
    const years = returns.length / 252; // Assuming daily returns
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  calculateSectorAllocation(portfolio) {
    // Simplified sector allocation calculation
    const sectors = {};
    
    Object.keys(portfolio.positions).forEach(symbol => {
      const position = portfolio.positions[symbol];
      const sector = position.sector || 'Unknown';
      sectors[sector] = (sectors[sector] || 0) + position.weight;
    });
    
    return sectors;
  }

  calculateStockSelection(portfolio, marketData) {
    // Simplified stock selection attribution
    return {
      alpha: 0.02, // Mock alpha
      stockSpecific: 0.01,
      systematic: 0.01
    };
  }

  calculateCurrencyAttribution(portfolio) {
    // Simplified currency attribution
    return {
      currencyReturn: 0.005,
      hedgingEffect: -0.002
    };
  }

  calculateTimingAttribution(portfolio, marketData) {
    // Simplified timing attribution
    return {
      timingReturn: 0.01,
      marketTiming: 0.005,
      securityTiming: 0.005
    };
  }

  calculateEffectiveAssets(portfolio) {
    // Calculate effective number of assets (inverse of Herfindahl index)
    const weights = Object.values(portfolio.positions).map(p => p.weight);
    const herfindahl = weights.reduce((sum, w) => sum + w * w, 0);
    return 1 / herfindahl;
  }

  calculateConcentrationRisk(portfolio) {
    const weights = Object.values(portfolio.positions).map(p => p.weight);
    const maxWeight = Math.max(...weights);
    const top5Weight = weights
      .sort((a, b) => b - a)
      .slice(0, 5)
      .reduce((sum, w) => sum + w, 0);
    
    return {
      maxPosition: maxWeight,
      top5Concentration: top5Weight,
      riskLevel: maxWeight > 0.2 ? 'high' : top5Weight > 0.6 ? 'medium' : 'low'
    };
  }

  calculateCorrelationRisk(portfolio, marketData) {
    // Simplified correlation risk calculation
    return {
      averageCorrelation: 0.3,
      riskLevel: 'medium'
    };
  }

  calculateAssetVolatility(portfolio, marketData) {
    const volatility = {};
    
    Object.keys(portfolio.positions).forEach(symbol => {
      const returns = [];
      for (let i = 1; i < marketData.length; i++) {
        const return_ = (marketData[i][symbol] - marketData[i-1][symbol]) / marketData[i-1][symbol];
        returns.push(return_);
      }
      volatility[symbol] = this.calculateVolatility(returns);
    });
    
    return volatility;
  }

  calculateCorrelationMatrix(portfolio, marketData) {
    const symbols = Object.keys(portfolio.positions);
    const matrix = [];
    
    for (let i = 0; i < symbols.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < symbols.length; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          matrix[i][j] = this.calculateCorrelation(
            this.getAssetReturns(symbols[i], marketData),
            this.getAssetReturns(symbols[j], marketData)
          );
        }
      }
    }
    
    return matrix;
  }

  calculateCorrelation(returns1, returns2) {
    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;
    
    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;
    
    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }
    
    return covariance / Math.sqrt(variance1 * variance2);
  }

  getAssetReturns(symbol, marketData) {
    const returns = [];
    for (let i = 1; i < marketData.length; i++) {
      const return_ = (marketData[i][symbol] - marketData[i-1][symbol]) / marketData[i-1][symbol];
      returns.push(return_);
    }
    return returns;
  }

  calculateAllRiskMetrics(portfolio, marketData) {
    const returns = this.calculatePortfolioReturns(portfolio, marketData);
    const marketReturns = this.calculateMarketReturns(marketData);
    
    return {
      var95: this.calculateVaR(returns, 0.05),
      var99: this.calculateVaR(returns, 0.01),
      cvar95: this.calculateCVaR(returns, 0.05),
      cvar99: this.calculateCVaR(returns, 0.01),
      maxDrawdown: this.calculateMaxDrawdown(returns),
      sharpeRatio: this.calculateSharpeRatio(returns),
      sortinoRatio: this.calculateSortinoRatio(returns),
      calmarRatio: this.calculateCalmarRatio(returns),
      beta: this.calculateBeta(returns, marketReturns),
      alpha: this.calculateAlpha(returns, marketReturns),
      treynorRatio: this.calculateTreynorRatio(returns, marketReturns),
      informationRatio: this.calculateInformationRatio(returns, marketReturns)
    };
  }

  calculateScenarioValue(portfolio, scenario) {
    let value = portfolio.totalValue;
    
    Object.keys(portfolio.positions).forEach(symbol => {
      const position = portfolio.positions[symbol];
      const positionValue = portfolio.totalValue * position.weight;
      const scenarioReturn = scenario.marketReturn * (1 + Math.random() * 0.2 - 0.1); // Add some randomness
      value += positionValue * scenarioReturn;
    });
    
    return value;
  }

  findWorstPerformer(portfolio, scenario) {
    // Simplified worst performer calculation
    const positions = Object.keys(portfolio.positions);
    return positions[Math.floor(Math.random() * positions.length)];
  }

  findBestPerformer(portfolio, scenario) {
    // Simplified best performer calculation
    const positions = Object.keys(portfolio.positions);
    return positions[Math.floor(Math.random() * positions.length)];
  }

  findWorstCase(results) {
    return Object.keys(results).reduce((worst, scenario) => 
      results[scenario].return < results[worst].return ? scenario : worst
    );
  }

  findBestCase(results) {
    return Object.keys(results).reduce((best, scenario) => 
      results[scenario].return > results[best].return ? scenario : best
    );
  }

  generateOptimizationRecommendations(portfolio, analysis, riskMetrics, riskTolerance) {
    const recommendations = [];
    
    if (riskMetrics.sharpeRatio < 1.0) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: 'Portfolio Sharpe ratio is below 1.0. Consider rebalancing to improve risk-adjusted returns.',
        action: 'Rebalance portfolio weights'
      });
    }
    
    if (analysis.diversification.effectiveAssets < 5) {
      recommendations.push({
        type: 'diversification',
        priority: 'medium',
        message: 'Portfolio has low diversification. Consider adding more assets.',
        action: 'Add diversified assets'
      });
    }
    
    if (analysis.diversification.concentrationRisk.riskLevel === 'high') {
      recommendations.push({
        type: 'concentration',
        priority: 'high',
        message: 'High concentration risk detected. Reduce position sizes.',
        action: 'Reduce largest positions'
      });
    }
    
    return recommendations;
  }

  generateRebalancingRecommendations(portfolio, analysis, threshold) {
    const recommendations = [];
    const targetWeights = this.calculateTargetWeights(portfolio);
    
    Object.keys(portfolio.positions).forEach(symbol => {
      const currentWeight = portfolio.positions[symbol].weight;
      const targetWeight = targetWeights[symbol];
      const deviation = Math.abs(currentWeight - targetWeight);
      
      if (deviation > threshold) {
        recommendations.push({
          symbol,
          currentWeight,
          targetWeight,
          deviation,
          action: currentWeight > targetWeight ? 'reduce' : 'increase',
          priority: deviation > threshold * 2 ? 'high' : 'medium'
        });
      }
    });
    
    return recommendations;
  }

  calculateTargetWeights(portfolio) {
    // Simplified target weight calculation (equal weight for demo)
    const symbols = Object.keys(portfolio.positions);
    const targetWeight = 1 / symbols.length;
    
    const targetWeights = {};
    symbols.forEach(symbol => {
      targetWeights[symbol] = targetWeight;
    });
    
    return targetWeights;
  }

  generatePortfolioRecommendations(analysis, riskMetrics, optimization, rebalancing) {
    const recommendations = [];
    
    // Add optimization recommendations
    recommendations.push(...optimization);
    
    // Add rebalancing recommendations
    recommendations.push(...rebalancing.map(rec => ({
      type: 'rebalancing',
      priority: rec.priority,
      message: `${rec.action} position in ${rec.symbol} (${rec.deviation.toFixed(2)}% deviation)`,
      action: `${rec.action} ${rec.symbol}`
    })));
    
    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    return recommendations;
  }
}

export default new RiskPortfolioService();
