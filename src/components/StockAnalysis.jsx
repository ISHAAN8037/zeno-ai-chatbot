import React, { useState } from 'react';
import stockAnalysisService from '../services/stockAnalysisService';

const StockAnalysis = ({ isVisible, onClose }) => {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const result = await stockAnalysisService.performStockAnalysis(symbol.toUpperCase());
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze stock. Please check the symbol and try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
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
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {['overview', 'technical', 'fundamental', 'sentiment', 'charts'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-all duration-300 ${
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
              )}

              {activeTab === 'technical' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      🔧 Technical Indicators
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Technical analysis data will be displayed here.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'fundamental' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      🏢 Company Overview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Fundamental analysis data will be displayed here.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'sentiment' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      📰 Market Sentiment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Market sentiment data will be displayed here.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'charts' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      📈 Price Charts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Chart data will be displayed here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockAnalysis;
