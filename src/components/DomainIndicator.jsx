import React, { useState } from 'react';
import { domainService } from '../services/domainService';

const DomainIndicator = ({ currentDomain, onDomainChange }) => {
  const [showDetails, setShowDetails] = useState(false);
  const domain = domainService.getDomain(currentDomain);

  return (
    <div className="relative group">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-3 px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-600/50 rounded-2xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div className={`w-8 h-8 bg-gradient-to-r ${domain.color} rounded-lg flex items-center justify-center text-lg`}>
          {domain.icon}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {domain.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Expert Mode
          </div>
        </div>
        <div className="text-gray-400 dark:text-gray-500">
          <svg className="w-4 h-4 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Details */}
      {showDetails && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-6">
            {/* Domain Info */}
            <div className="flex items-start space-x-4 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${domain.color} rounded-xl flex items-center justify-center text-2xl`}>
                {domain.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {domain.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {domain.description}
                </p>
              </div>
            </div>

            {/* Compliance Rules */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Compliance & Ethics
              </h4>
              <div className="space-y-2">
                {domain.compliance.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflows */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Available Workflows
              </h4>
              <div className="flex flex-wrap gap-2">
                {domain.workflows.map((workflow, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full"
                  >
                    {workflow.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Data Sources
              </h4>
              <div className="flex flex-wrap gap-2">
                {domain.dataSources.map((source, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-xs text-blue-600 dark:text-blue-400 rounded-full"
                  >
                    {source.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // This would open the domain switcher
                  onDomainChange('switch');
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all duration-300"
              >
                Switch Domain
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainIndicator;
