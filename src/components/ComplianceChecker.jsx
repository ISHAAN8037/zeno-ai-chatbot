import React, { useState, useEffect } from 'react';
import { domainService } from '../services/domainService';

const ComplianceChecker = ({ message, domain, onComplianceResult }) => {
  const [complianceChecks, setComplianceChecks] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (message && domain) {
      checkCompliance(message, domain);
    }
  }, [message, domain]);

  const checkCompliance = async (message, domainKey) => {
    setIsChecking(true);
    
    try {
      // Simulate compliance checking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const processedMessage = domainService.processMessage(message, domainKey);
      const checks = processedMessage.complianceChecks;
      
      setComplianceChecks(checks);
      onComplianceResult(checks);
    } catch (error) {
      console.error('Compliance check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (complianceChecks.length === 0 && !isChecking) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {isChecking && (
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Running compliance checks...</span>
        </div>
      )}
      
      {complianceChecks.map((check, index) => (
        <ComplianceAlert key={index} check={check} />
      ))}
    </div>
  );
};

const ComplianceAlert = ({ check }) => {
  const getAlertStyle = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getAlertStyle(check.type)}`}>
      <div className="flex items-start space-x-3">
        <div className="text-lg">{getIcon(check.type)}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium">
              {check.type === 'error' ? 'Compliance Error' : 
               check.type === 'warning' ? 'Compliance Warning' : 'Compliance Notice'}
            </span>
            {check.compliance && (
              <span className="px-2 py-1 bg-white/50 dark:bg-black/20 text-xs rounded-full">
                {check.compliance}
              </span>
            )}
          </div>
          <p className="text-sm">{check.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ComplianceChecker;
