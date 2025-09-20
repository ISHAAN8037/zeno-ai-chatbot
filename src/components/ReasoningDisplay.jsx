import React, { useState } from 'react';

const ReasoningDisplay = ({ reasoning, isVisible, onClose }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  if (!reasoning || !isVisible) return null;

  const toggleStep = (stepId) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return '🎯';
    if (confidence >= 0.6) return '🤔';
    return '❓';
  };

  const getStepIcon = (stepType) => {
    const icons = {
      'analysis': '🔍',
      'context': '📚',
      'knowledge': '🧠',
      'logic': '🔗',
      'solution': '💡',
      'validation': '✅'
    };
    return icons[stepType] || '📝';
  };

  const getStepColor = (stepType) => {
    const colors = {
      'analysis': 'from-blue-500 to-blue-600',
      'context': 'from-purple-500 to-purple-600',
      'knowledge': 'from-green-500 to-green-600',
      'logic': 'from-indigo-500 to-indigo-600',
      'solution': 'from-orange-500 to-orange-600',
      'validation': 'from-teal-500 to-teal-600'
    };
    return colors[stepType] || 'from-gray-500 to-gray-600';
  };

  // Helper function to render step content
  const renderStepContent = (content) => {
    if (typeof content === 'string') {
      return <p>{content}</p>;
    }
    
    if (Array.isArray(content)) {
      return (
        <ul className="space-y-1">
          {content.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{typeof item === 'object' ? JSON.stringify(item, null, 2) : item}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    if (typeof content === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(content).map(([key, value]) => (
            <div key={key}>
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                {key.replace(/([A-Z])/g, ' $1').trim()}:{' '}
              </span>
              <span className="text-sm text-slate-600 dark:text-gray-400">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{String(content)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden premium-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🧠</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Zeno's Reasoning Process</h2>
              <p className="text-slate-600 dark:text-gray-300">
                Understanding how I think through your question
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-effect hover:scale-110 transition-all duration-300"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 dark:border-gray-800/60">
          {['overview', 'steps', 'insights', 'confidence'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="premium-card p-6 bg-gradient-to-br from-blue-400/30 via-indigo-500/30 to-purple-600/30">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                  🎯 Reasoning Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Query</p>
                    <p className="text-slate-800 dark:text-white font-medium">
                      "{reasoning.summary?.query || 'N/A'}"
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Intent</p>
                    <p className="text-slate-800 dark:text-white font-medium">
                      {reasoning.summary?.intent || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Approach</p>
                    <p className="text-slate-800 dark:text-white font-medium">
                      {reasoning.summary?.approach || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Overall Confidence</p>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getConfidenceColor(reasoning.confidence?.score || 0)}`}>
                        {Math.round((reasoning.confidence?.score || 0) * 100)}%
                      </span>
                      <span className="text-2xl">{getConfidenceIcon(reasoning.confidence?.score || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              {reasoning.summary?.keyInsights?.length > 0 && (
                <div className="premium-card p-6 bg-gradient-to-br from-green-400/30 via-emerald-500/30 to-teal-600/30">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    💡 Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {reasoning.summary.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                        <span className="text-slate-700 dark:text-gray-200">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {reasoning.recommendations?.length > 0 && (
                <div className="premium-card p-6 bg-gradient-to-br from-yellow-400/30 via-amber-500/30 to-orange-600/30">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    💭 Recommendations
                  </h3>
                  <div className="space-y-3">
                    {reasoning.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          rec.priority === 'high' 
                            ? 'bg-red-500/20 text-red-700 dark:text-red-300' 
                            : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                        }`}>
                          {rec.priority}
                        </span>
                        <div>
                          <p className="text-slate-700 dark:text-gray-200 font-medium">{rec.suggestion}</p>
                          <p className="text-sm text-slate-600 dark:text-gray-400">{rec.reasoning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              {reasoning.steps?.map((step, index) => (
                <div key={step.id} className="premium-card p-4">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getStepColor(step.type)} rounded-xl flex items-center justify-center`}>
                        <span className="text-white text-lg">{getStepIcon(step.type)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white capitalize">
                          {step.type.replace('-', ' ')}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                          Step {index + 1} • {Math.round(step.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(step.confidence)}`}>
                        {Math.round(step.confidence * 100)}%
                      </span>
                      <span className="text-lg transform transition-transform duration-300">
                        {expandedSteps.has(step.id) ? '▼' : '▶'}
                      </span>
                    </div>
                  </button>
                  
                  {expandedSteps.has(step.id) && (
                    <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-800/60">
                      <div className="space-y-3">
                        {Object.entries(step.content).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-sm font-medium text-slate-700 dark:text-gray-300 capitalize mb-1">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </p>
                            <div className="text-sm text-slate-600 dark:text-gray-400">
                              {this.renderStepContent(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Intent Analysis */}
              {reasoning.steps?.find(s => s.type === 'analysis')?.content?.intent && (
                <div className="premium-card p-6 bg-gradient-to-br from-blue-400/30 via-indigo-500/30 to-blue-600/30">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    🎯 Intent Analysis
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Primary Intent</p>
                      <p className="text-slate-800 dark:text-white font-medium">
                        {reasoning.steps.find(s => s.type === 'analysis').content.intent.primary}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Confidence</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${reasoning.steps.find(s => s.type === 'analysis').content.intent.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                          {Math.round(reasoning.steps.find(s => s.type === 'analysis').content.intent.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Complexity Assessment */}
              {reasoning.steps?.find(s => s.type === 'analysis')?.content?.complexity && (
                <div className="premium-card p-6 bg-gradient-to-br from-purple-400/30 via-pink-500/30 to-purple-600/30">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    📊 Complexity Assessment
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Level</p>
                      <p className="text-slate-800 dark:text-white font-medium capitalize">
                        {reasoning.steps.find(s => s.type === 'analysis').content.complexity.level}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Score</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${reasoning.steps.find(s => s.type === 'analysis').content.complexity.score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                          {Math.round(reasoning.steps.find(s => s.type === 'analysis').content.complexity.score * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Domain Identification */}
              {reasoning.steps?.find(s => s.type === 'analysis')?.content?.domain && (
                <div className="premium-card p-6 bg-gradient-to-br from-green-400/30 via-emerald-500/30 to-green-600/30">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    🌐 Domain Identification
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Primary Domain</p>
                      <p className="text-slate-800 dark:text-white font-medium capitalize">
                        {reasoning.steps.find(s => s.type === 'analysis').content.domain.primary}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-1">Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {reasoning.steps.find(s => s.type === 'analysis').content.domain.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'confidence' && (
            <div className="space-y-6">
              {/* Overall Confidence */}
              <div className="premium-card p-6 bg-gradient-to-br from-teal-400/30 via-cyan-500/30 to-teal-600/30">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                  🎯 Overall Confidence
                </h3>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-2">{getConfidenceIcon(reasoning.confidence?.score || 0)}</div>
                  <div className={`text-4xl font-bold ${getConfidenceColor(reasoning.confidence?.score || 0)}`}>
                    {Math.round((reasoning.confidence?.score || 0) * 100)}%
                  </div>
                </div>
                
                {reasoning.confidence?.breakdown && (
                  <div className="space-y-3">
                    {reasoning.confidence.breakdown.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 dark:text-gray-300 capitalize">
                            {item.factor.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-slate-600 dark:text-gray-400">
                            {Math.round(item.contribution * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${item.value * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-gray-300 w-12 text-right">
                            {Math.round(item.value * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step-by-Step Confidence */}
              {reasoning.steps && (
                <div className="premium-card p-6 bg-gradient-to-br from-indigo-400/30 via-purple-500/30 to-indigo-600/30">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    📊 Step Confidence Breakdown
                  </h3>
                  <div className="space-y-3">
                    {reasoning.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${getStepColor(step.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-sm">{getStepIcon(step.type)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-gray-300 capitalize">
                              {step.type.replace('-', ' ')}
                            </span>
                            <span className="text-slate-600 dark:text-gray-400">
                              {Math.round(step.confidence * 100)}%
                            </span>
                          </div>
                          <div className="bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${getStepColor(step.type)}`}
                              style={{ width: `${step.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReasoningDisplay;
