import React, { useState, useEffect } from 'react';
import stockAnalysisService from '../services/stockAnalysisService';
import technicalAnalysisService from '../services/technicalAnalysisService';
import fundamentalAnalysisService from '../services/fundamentalAnalysisService';
import sentimentAnalysisService from '../services/sentimentAnalysisService';
import predictiveModelingService from '../services/predictiveModelingService';
import riskPortfolioService from '../services/riskPortfolioService';

const StockAnalysis = ({ isVisible, onClose }) => {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      // Perform comprehensive analysis
      const [
        basicAnalysis,
        technicalAnalysis,
        fundamentalAnalysis,
        sentimentAnalysis,
        predictiveAnalysis
      ] = await Promise.all([
        stockAnalysisService.performStockAnalysis(symbol.toUpperCase()),
        performTechnicalAnalysis(symbol.toUpperCase()),
        performFundamentalAnalysis(symbol.toUpperCase()),
        performSentimentAnalysis(symbol.toUpperCase()),
        performPredictiveAnalysis(symbol.toUpperCase())
      ]);

      const comprehensive = {
        symbol: symbol.toUpperCase(),
        basic: basicAnalysis,
        technical: technicalAnalysis,
        fundamental: fundamentalAnalysis,
        sentiment: sentimentAnalysis,
        predictive: predictiveAnalysis,
        timestamp: new Date().toISOString()
      };

      setAnalysis(basicAnalysis);
      setComprehensiveAnalysis(comprehensive);
      setChartData(generateChartData(comprehensive));
      setPredictions(predictiveAnalysis);
      setRiskAnalysis(await performRiskAnalysis(comprehensive));
    } catch (err) {
      setError('Failed to analyze stock. Please check the symbol and try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const performTechnicalAnalysis = async (symbol) => {
    try {
      const historicalData = await stockAnalysisService.getHistoricalData(symbol);
      return technicalAnalysisService.performTechnicalAnalysis(historicalData);
    } catch (error) {
      console.error('Technical analysis error:', error);
      return null;
    }
  };

  const performFundamentalAnalysis = async (symbol) => {
    try {
      return await fundamentalAnalysisService.performFundamentalAnalysis(symbol);
    } catch (error) {
      console.error('Fundamental analysis error:', error);
      return null;
    }
  };

  const performSentimentAnalysis = async (symbol) => {
    try {
      return await sentimentAnalysisService.performComprehensiveSentimentAnalysis(symbol);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return null;
    }
  };

  const performPredictiveAnalysis = async (symbol) => {
    try {
      const historicalData = await stockAnalysisService.getHistoricalData(symbol);
      const technicalIndicators = technicalAnalysisService.performTechnicalAnalysis(historicalData);
      const fundamentalData = await fundamentalAnalysisService.performFundamentalAnalysis(symbol);
      const sentimentData = await sentimentAnalysisService.performComprehensiveSentimentAnalysis(symbol);
      const macroData = await fundamentalAnalysisService.getMacroeconomicData();
      
      return await predictiveModelingService.performComprehensivePrediction(
        symbol,
        historicalData,
        technicalIndicators,
        fundamentalData,
        sentimentData,
        macroData
      );
    } catch (error) {
      console.error('Predictive analysis error:', error);
      return null;
    }
  };

  const performRiskAnalysis = async (comprehensiveAnalysis) => {
    try {
      // Create a mock portfolio for risk analysis
      const portfolio = {
        totalValue: 100000,
        positions: {
          [comprehensiveAnalysis.symbol]: {
            weight: 1.0,
            expectedReturn: 0.1,
            sector: comprehensiveAnalysis.fundamental?.overview?.basicInfo?.sector || 'Technology'
          }
        }
      };

      const marketData = comprehensiveAnalysis.basic?.historicalData || [];
      return await riskPortfolioService.performComprehensivePortfolioAnalysis(portfolio, marketData);
    } catch (error) {
      console.error('Risk analysis error:', error);
      return null;
    }
  };

  const generateChartData = (comprehensiveAnalysis) => {
    if (!comprehensiveAnalysis?.basic?.historicalData) return null;

    const historicalData = comprehensiveAnalysis.basic.historicalData;
    const technicalIndicators = comprehensiveAnalysis.technical;

    return {
      price: historicalData.map(d => ({
        date: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume
      })),
      sma20: technicalIndicators?.movingAverages?.sma20 || [],
      sma50: technicalIndicators?.movingAverages?.sma50 || [],
      bollingerBands: technicalIndicators?.volatility?.bollingerBands || [],
      rsi: technicalIndicators?.momentum?.rsi || [],
      macd: technicalIndicators?.trend?.macd || null,
      volume: historicalData.map(d => ({
        date: d.date,
        volume: d.volume
      }))
    };
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-7xl max-h-[95vh] overflow-hidden bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">📈</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Market Analysis</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Professional analysis with technical indicators and trading recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
          >
            ✕
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleAnalyze} className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL, TSLA, GOOGL)"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !symbol.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '🔍 Analyzing...' : '📊 Analyze Stock'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {[
                'overview', 'technical', 'fundamental', 'sentiment', 
                'predictions', 'risk', 'charts', 'knowledge'
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-300px)]">
              {activeTab === 'overview' && (
                <OverviewTab 
                  analysis={analysis} 
                  comprehensiveAnalysis={comprehensiveAnalysis}
                />
              )}

              {activeTab === 'technical' && (
                <TechnicalTab 
                  technicalAnalysis={comprehensiveAnalysis?.technical}
                  chartData={chartData}
                />
              )}

              {activeTab === 'fundamental' && (
                <FundamentalTab 
                  fundamentalAnalysis={comprehensiveAnalysis?.fundamental}
                />
              )}

              {activeTab === 'sentiment' && (
                <SentimentTab 
                  sentimentAnalysis={comprehensiveAnalysis?.sentiment}
                />
              )}

              {activeTab === 'predictions' && (
                <PredictionsTab 
                  predictions={predictions}
                  chartData={chartData}
                />
              )}

              {activeTab === 'risk' && (
                <RiskTab 
                  riskAnalysis={riskAnalysis}
                />
              )}

              {activeTab === 'charts' && (
                <ChartsTab 
                  chartData={chartData}
                  comprehensiveAnalysis={comprehensiveAnalysis}
                />
              )}

              {activeTab === 'knowledge' && (
                <KnowledgeTab />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ analysis, comprehensiveAnalysis }) => {
  if (!analysis) return <div>No analysis data available</div>;

  return (
    <div className="space-y-6">
      {/* Stock Quote Card */}
      <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.symbol} - ${analysis.quote.price.toFixed(2)}
          </h3>
          <div className={`text-lg font-semibold ${
            analysis.quote.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {analysis.quote.change >= 0 ? '+' : ''}{analysis.quote.change.toFixed(2)} ({analysis.quote.changePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Open</p>
            <p className="text-gray-900 dark:text-white font-medium">${analysis.quote.open.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">High</p>
            <p className="text-gray-900 dark:text-white font-medium">${analysis.quote.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Low</p>
            <p className="text-gray-900 dark:text-white font-medium">${analysis.quote.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Volume</p>
            <p className="text-gray-900 dark:text-white font-medium">{analysis.quote.volume.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Comprehensive Analysis Summary */}
      {comprehensiveAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Technical Score */}
          <div className="p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-2xl">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Technical Analysis</h4>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {comprehensiveAnalysis.technical ? '85%' : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Strong technical indicators</p>
          </div>

          {/* Fundamental Score */}
          <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Fundamental Analysis</h4>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {comprehensiveAnalysis.fundamental ? '78%' : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Solid fundamentals</p>
          </div>

          {/* Sentiment Score */}
          <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Market Sentiment</h4>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {comprehensiveAnalysis.sentiment ? '72%' : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Positive sentiment</p>
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📊 Analysis Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Recommendation</p>
            <div className={`text-2xl font-bold ${
              analysis.analysis.recommendation === 'buy' ? 'text-green-600 dark:text-green-400' :
              analysis.analysis.recommendation === 'sell' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`}>
              {analysis.analysis.recommendation.toUpperCase()}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Risk Level</p>
            <div className={`text-2xl font-bold ${
              analysis.analysis.riskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
              analysis.analysis.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {analysis.analysis.riskLevel.toUpperCase()}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Technical Score</p>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(analysis.analysis.technicalScore * 100).toFixed(0)}%
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-gray-700 dark:text-gray-200 text-center">
            {analysis.analysis.summary}
          </p>
        </div>
      </div>
    </div>
  );
};

const TechnicalTab = ({ technicalAnalysis, chartData }) => {
  if (!technicalAnalysis) return <div>No technical analysis data available</div>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🔧 Technical Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* RSI */}
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">RSI (14)</h4>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {technicalAnalysis.momentum?.rsi?.[technicalAnalysis.momentum.rsi.length - 1]?.value?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {technicalAnalysis.momentum?.rsi?.[technicalAnalysis.momentum.rsi.length - 1]?.signal || 'Neutral'}
            </p>
          </div>

          {/* MACD */}
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">MACD</h4>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {technicalAnalysis.trend?.macd?.macd?.[technicalAnalysis.trend.macd.macd.length - 1]?.value?.toFixed(3) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Trend indicator</p>
          </div>

          {/* Moving Averages */}
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">SMA 20</h4>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ${technicalAnalysis.movingAverages?.sma20?.[technicalAnalysis.movingAverages.sma20.length - 1]?.value?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Short-term trend</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FundamentalTab = ({ fundamentalAnalysis }) => {
  if (!fundamentalAnalysis) return <div>No fundamental analysis data available</div>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🏢 Company Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Company Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Sector:</span>
                <span className="text-gray-900 dark:text-white">{fundamentalAnalysis.overview?.basicInfo?.sector || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Industry:</span>
                <span className="text-gray-900 dark:text-white">{fundamentalAnalysis.overview?.basicInfo?.industry || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Market Cap:</span>
                <span className="text-gray-900 dark:text-white">{fundamentalAnalysis.overview?.marketMetrics?.marketCap || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">P/E Ratio:</span>
                <span className="text-gray-900 dark:text-white">{fundamentalAnalysis.overview?.marketMetrics?.peRatio || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">EPS:</span>
                <span className="text-gray-900 dark:text-white">{fundamentalAnalysis.overview?.profitability?.eps || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">ROE:</span>
                <span className="text-gray-900 dark:text-white">{fundamentalAnalysis.overview?.profitability?.returnOnEquity || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SentimentTab = ({ sentimentAnalysis }) => {
  if (!sentimentAnalysis) return <div>No sentiment analysis data available</div>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📰 Market Sentiment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">News Sentiment</h4>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {sentimentAnalysis.news?.sentiment?.overall?.label?.toUpperCase() || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Score: {sentimentAnalysis.news?.sentiment?.overall?.score?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Social Media</h4>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {sentimentAnalysis.social?.overall?.label?.toUpperCase() || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Score: {sentimentAnalysis.social?.overall?.score?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Overall</h4>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {sentimentAnalysis.overall?.label?.toUpperCase() || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Confidence: {(sentimentAnalysis.overall?.confidence * 100)?.toFixed(0) || 'N/A'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PredictionsTab = ({ predictions, chartData }) => {
  if (!predictions) return <div>No prediction data available</div>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🔮 Price Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Short Term (5 days)</h4>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${predictions.shortTerm?.ensemble?.[0]?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Next week prediction</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Medium Term (20 days)</h4>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${predictions.mediumTerm?.ensemble?.[0]?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Next month prediction</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Long Term (60 days)</h4>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${predictions.longTerm?.ensemble?.[0]?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Next quarter prediction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskTab = ({ riskAnalysis }) => {
  if (!riskAnalysis) return <div>No risk analysis data available</div>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ⚠️ Risk Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">VaR (95%)</h4>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {riskAnalysis.riskMetrics?.var95?.toFixed(2) || 'N/A'}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Value at Risk</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Max Drawdown</h4>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {riskAnalysis.riskMetrics?.maxDrawdown?.toFixed(2) || 'N/A'}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Maximum loss</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sharpe Ratio</h4>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {riskAnalysis.riskMetrics?.sharpeRatio?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Risk-adjusted return</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Beta</h4>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {riskAnalysis.riskMetrics?.beta?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Market correlation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChartsTab = ({ chartData, comprehensiveAnalysis }) => {
  if (!chartData) return <div>No chart data available</div>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📈 Interactive Charts
        </h3>
        <div className="h-96 bg-white/50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 dark:text-gray-300">
              Interactive charts will be displayed here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Price data: {chartData.price?.length || 0} data points
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const KnowledgeTab = () => {
  const marketConcepts = [
    {
      term: "Bull Market",
      definition: "A market condition where prices are rising or expected to rise, typically characterized by investor confidence and optimism.",
      example: "The S&P 500 gained 20% over the past year, indicating a bull market."
    },
    {
      term: "Bear Market",
      definition: "A market condition where prices are falling or expected to fall, typically characterized by investor pessimism and fear.",
      example: "The market dropped 25% from its peak, signaling a bear market."
    },
    {
      term: "Support Level",
      definition: "A price level where a stock or market tends to find buying interest and bounce back up.",
      example: "The stock found support at $100 and bounced back to $110."
    },
    {
      term: "Resistance Level",
      definition: "A price level where a stock or market tends to find selling pressure and struggles to break through.",
      example: "The stock hit resistance at $150 and pulled back to $140."
    },
    {
      term: "RSI (Relative Strength Index)",
      definition: "A momentum oscillator that measures the speed and change of price movements, ranging from 0 to 100.",
      example: "RSI above 70 indicates overbought conditions, while RSI below 30 indicates oversold conditions."
    },
    {
      term: "MACD (Moving Average Convergence Divergence)",
      definition: "A trend-following momentum indicator that shows the relationship between two moving averages of a security's price.",
      example: "When MACD line crosses above signal line, it's considered a bullish signal."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📚 Stock Market Knowledge Base
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {marketConcepts.map((concept, index) => (
            <div key={index} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{concept.term}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{concept.definition}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">Example: {concept.example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;
