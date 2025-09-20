import React, { useState } from 'react';
import { domainService } from '../services/domainService';

const DomainWorkflow = ({ domain, onWorkflowSelect }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const workflows = domainService.getWorkflows(domain);

  const workflowTemplates = {
    'risk-assessment': {
      name: 'Risk Assessment',
      icon: '📊',
      description: 'Comprehensive risk analysis and mitigation strategies',
      steps: [
        'Identify potential risks',
        'Assess probability and impact',
        'Develop mitigation strategies',
        'Create monitoring plan'
      ]
    },
    'portfolio-analysis': {
      name: 'Portfolio Analysis',
      icon: '📈',
      description: 'Investment portfolio evaluation and optimization',
      steps: [
        'Analyze current holdings',
        'Calculate performance metrics',
        'Identify diversification opportunities',
        'Recommend adjustments'
      ]
    },
    'compliance-check': {
      name: 'Compliance Check',
      icon: '✅',
      description: 'Verify adherence to regulatory requirements',
      steps: [
        'Review applicable regulations',
        'Check current compliance status',
        'Identify gaps and violations',
        'Create remediation plan'
      ]
    },
    'symptom-analysis': {
      name: 'Symptom Analysis',
      icon: '🔍',
      description: 'Systematic evaluation of symptoms and conditions',
      steps: [
        'Document symptoms and history',
        'Analyze symptom patterns',
        'Consider differential diagnoses',
        'Recommend next steps'
      ]
    },
    'treatment-guidance': {
      name: 'Treatment Guidance',
      icon: '💊',
      description: 'Evidence-based treatment recommendations',
      steps: [
        'Review clinical guidelines',
        'Assess treatment options',
        'Consider contraindications',
        'Develop treatment plan'
      ]
    },
    'compliance-audit': {
      name: 'Compliance Audit',
      icon: '🔍',
      description: 'Comprehensive compliance review and assessment',
      steps: [
        'Review regulatory requirements',
        'Audit current practices',
        'Document findings',
        'Create action plan'
      ]
    },
    'legal-research': {
      name: 'Legal Research',
      icon: '📚',
      description: 'Comprehensive legal research and analysis',
      steps: [
        'Identify relevant laws and regulations',
        'Research case law and precedents',
        'Analyze legal implications',
        'Prepare research summary'
      ]
    },
    'document-review': {
      name: 'Document Review',
      icon: '📄',
      description: 'Thorough review of legal documents',
      steps: [
        'Examine document structure',
        'Identify key provisions',
        'Check for compliance issues',
        'Provide recommendations'
      ]
    },
    'learning-assessment': {
      name: 'Learning Assessment',
      icon: '🎯',
      description: 'Evaluate learning progress and needs',
      steps: [
        'Assess current knowledge level',
        'Identify learning gaps',
        'Set learning objectives',
        'Create study plan'
      ]
    },
    'curriculum-planning': {
      name: 'Curriculum Planning',
      icon: '📋',
      description: 'Design comprehensive learning curriculum',
      steps: [
        'Define learning outcomes',
        'Select appropriate content',
        'Structure learning sequence',
        'Plan assessments'
      ]
    },
    'progress-tracking': {
      name: 'Progress Tracking',
      icon: '📊',
      description: 'Monitor and track learning progress',
      steps: [
        'Set measurable goals',
        'Track progress metrics',
        'Identify areas for improvement',
        'Adjust learning plan'
      ]
    },
    'code-review': {
      name: 'Code Review',
      icon: '💻',
      description: 'Comprehensive code quality and security review',
      steps: [
        'Review code structure and logic',
        'Check for security vulnerabilities',
        'Assess performance implications',
        'Provide improvement recommendations'
      ]
    },
    'security-audit': {
      name: 'Security Audit',
      icon: '🔒',
      description: 'Comprehensive security assessment',
      steps: [
        'Identify security vulnerabilities',
        'Assess current security measures',
        'Test security controls',
        'Create security improvement plan'
      ]
    },
    'architecture-planning': {
      name: 'Architecture Planning',
      icon: '🏗️',
      description: 'Design scalable and maintainable system architecture',
      steps: [
        'Analyze requirements',
        'Design system components',
        'Plan integration points',
        'Create implementation roadmap'
      ]
    },
    'strategy-planning': {
      name: 'Strategy Planning',
      icon: '🎯',
      description: 'Develop comprehensive business strategy',
      steps: [
        'Analyze market conditions',
        'Define strategic objectives',
        'Identify key initiatives',
        'Create implementation plan'
      ]
    },
    'market-analysis': {
      name: 'Market Analysis',
      icon: '📊',
      description: 'Comprehensive market research and analysis',
      steps: [
        'Gather market data',
        'Analyze trends and patterns',
        'Assess competitive landscape',
        'Identify opportunities'
      ]
    }
  };

  if (workflows.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Available Workflows
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {workflows.map((workflowKey, index) => {
          const workflow = workflowTemplates[workflowKey] || {
            name: workflowKey.replace('-', ' '),
            icon: '⚙️',
            description: 'Specialized workflow for this domain',
            steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4']
          };

          return (
            <WorkflowCard
              key={index}
              workflow={workflow}
              isSelected={selectedWorkflow === workflowKey}
              onSelect={() => {
                setSelectedWorkflow(workflowKey);
                onWorkflowSelect(workflowKey);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const WorkflowCard = ({ workflow, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{workflow.icon}</div>
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {workflow.name}
          </h5>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {workflow.description}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {workflow.steps.length} steps
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainWorkflow;
