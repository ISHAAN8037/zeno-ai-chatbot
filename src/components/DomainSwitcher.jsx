import React, { useState } from 'react';
import { domainService } from '../services/domainService';

const DomainSwitcher = ({ currentDomain, onDomainChange, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const domains = domainService.getAllDomains();
  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Domain Expertise Mode
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Choose your professional domain for specialized assistance
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <span className="text-gray-600 dark:text-gray-300 text-xl">×</span>
              </button>
            </div>
            
            {/* Search */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Domain Grid */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDomains.map((domain) => (
                <DomainCard
                  key={domain.key}
                  domain={domain}
                  isSelected={currentDomain === domain.key}
                  onSelect={() => {
                    onDomainChange(domain.key);
                    onClose();
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Current Mode:</span> {domainService.getDomain(currentDomain).name}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-300"
              >
                Close
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Each domain includes specialized knowledge, compliance rules, and workflows
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DomainCard = ({ domain, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${domain.color} rounded-xl flex items-center justify-center text-2xl`}>
          {domain.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {domain.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {domain.description}
          </p>
          
          {/* Compliance Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {domain.compliance.slice(0, 2).map((rule, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full"
              >
                {rule}
              </span>
            ))}
            {domain.compliance.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full">
                +{domain.compliance.length - 2}
              </span>
            )}
          </div>

          {/* Workflows */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Workflows:</span> {domain.workflows.length} specialized
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainSwitcher;
