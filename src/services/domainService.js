// Domain Expertise Service
export class DomainService {
  constructor() {
    this.currentDomain = 'general';
    this.domains = {
      general: {
        name: 'General Assistant',
        icon: '🤖',
        color: 'from-gray-500 to-blue-600',
        description: 'General purpose AI assistant for all topics',
        compliance: ['GDPR'],
        dataSources: ['general-knowledge', 'web-search'],
        workflows: ['general-consultation', 'information-gathering'],
        knowledgeBase: 'general',
        ethicalRules: [
          'Provide helpful and accurate information',
          'Respect user privacy and data protection',
          'Maintain professional and respectful communication',
          'Acknowledge limitations and recommend professional help when needed'
        ]
      },
      finance: {
        name: 'Finance & Investment',
        icon: '💰',
        color: 'from-green-500 to-emerald-600',
        description: 'Financial analysis, investment advice, market insights',
        compliance: ['SEC', 'FINRA', 'GDPR'],
        dataSources: ['market-data', 'financial-news', 'economic-indicators'],
        workflows: ['risk-assessment', 'portfolio-analysis', 'compliance-check'],
        knowledgeBase: 'finance-specialized',
        ethicalRules: [
          'Provide general information only, not personalized financial advice',
          'Always recommend consulting with licensed financial advisors',
          'Disclose that past performance does not guarantee future results',
          'Maintain client confidentiality and data protection'
        ]
      },
      healthcare: {
        name: 'Healthcare & Medical',
        icon: '🏥',
        color: 'from-blue-500 to-cyan-600',
        description: 'Medical information, health guidance, clinical insights',
        compliance: ['HIPAA', 'FDA', 'GDPR'],
        dataSources: ['medical-databases', 'clinical-guidelines', 'research-papers'],
        workflows: ['symptom-analysis', 'treatment-guidance', 'compliance-audit'],
        knowledgeBase: 'healthcare-specialized',
        ethicalRules: [
          'Never provide specific medical diagnoses',
          'Always recommend consulting healthcare professionals',
          'Maintain strict patient confidentiality (HIPAA compliance)',
          'Provide evidence-based information only'
        ]
      },
      legal: {
        name: 'Legal & Compliance',
        icon: '⚖️',
        color: 'from-purple-500 to-indigo-600',
        description: 'Legal research, compliance guidance, regulatory insights',
        compliance: ['Attorney-Client Privilege', 'GDPR', 'State Bar Rules'],
        dataSources: ['legal-databases', 'case-law', 'regulatory-updates'],
        workflows: ['legal-research', 'compliance-check', 'document-review'],
        knowledgeBase: 'legal-specialized',
        ethicalRules: [
          'Provide general legal information, not specific legal advice',
          'Always recommend consulting licensed attorneys',
          'Maintain attorney-client privilege when applicable',
          'Stay updated on current laws and regulations'
        ]
      },
      education: {
        name: 'Education & Learning',
        icon: '🎓',
        color: 'from-orange-500 to-red-600',
        description: 'Educational content, learning strategies, academic support',
        compliance: ['FERPA', 'COPPA', 'GDPR'],
        dataSources: ['academic-databases', 'curriculum-standards', 'research-papers'],
        workflows: ['learning-assessment', 'curriculum-planning', 'progress-tracking'],
        knowledgeBase: 'education-specialized',
        ethicalRules: [
          'Respect student privacy and educational records (FERPA)',
          'Provide age-appropriate content (COPPA compliance)',
          'Support diverse learning styles and accessibility',
          'Maintain academic integrity standards'
        ]
      },
      technology: {
        name: 'Technology & Engineering',
        icon: '💻',
        color: 'from-gray-500 to-blue-600',
        description: 'Technical solutions, engineering guidance, innovation insights',
        compliance: ['GDPR', 'ISO 27001', 'SOC 2'],
        dataSources: ['tech-documentation', 'security-guidelines', 'industry-standards'],
        workflows: ['code-review', 'security-audit', 'architecture-planning'],
        knowledgeBase: 'technology-specialized',
        ethicalRules: [
          'Follow secure coding practices and security best practices',
          'Respect intellectual property and licensing requirements',
          'Maintain data security and privacy standards',
          'Stay updated on cybersecurity threats and solutions'
        ]
      },
      business: {
        name: 'Business & Strategy',
        icon: '📊',
        color: 'from-indigo-500 to-purple-600',
        description: 'Business strategy, management insights, market analysis',
        compliance: ['GDPR', 'SOX', 'Industry Standards'],
        dataSources: ['market-research', 'business-intelligence', 'industry-reports'],
        workflows: ['strategy-planning', 'market-analysis', 'risk-assessment'],
        knowledgeBase: 'business-specialized',
        ethicalRules: [
          'Maintain confidentiality of proprietary business information',
          'Provide objective analysis without conflicts of interest',
          'Respect competitive intelligence guidelines',
          'Ensure data accuracy and source verification'
        ]
      }
    };
  }

  getDomain(domainKey) {
    return this.domains[domainKey] || this.domains.general;
  }

  getAllDomains() {
    return Object.keys(this.domains).map(key => ({
      key,
      ...this.domains[key]
    }));
  }

  setCurrentDomain(domainKey) {
    if (this.domains[domainKey]) {
      this.currentDomain = domainKey;
      return true;
    }
    return false;
  }

  getCurrentDomain() {
    return this.getDomain(this.currentDomain);
  }

  getComplianceRules(domainKey) {
    const domain = this.getDomain(domainKey);
    return domain.compliance || [];
  }

  getEthicalRules(domainKey) {
    const domain = this.getDomain(domainKey);
    return domain.ethicalRules || [];
  }

  getWorkflows(domainKey) {
    const domain = this.getDomain(domainKey);
    return domain.workflows || [];
  }

  // Domain-specific message processing
  processMessage(message, domainKey) {
    const domain = this.getDomain(domainKey);
    const ethicalRules = this.getEthicalRules(domainKey);
    
    return {
      originalMessage: message,
      domain: domain.name,
      complianceChecks: this.runComplianceChecks(message, domainKey),
      ethicalGuidelines: ethicalRules,
      suggestedWorkflow: this.suggestWorkflow(message, domainKey),
      domainContext: this.getDomainContext(domainKey)
    };
  }

  runComplianceChecks(message, domainKey) {
    const domain = this.getDomain(domainKey);
    const checks = [];
    
    // Basic compliance checks based on domain
    if (domainKey === 'healthcare') {
      if (message.toLowerCase().includes('diagnosis') || message.toLowerCase().includes('prescription')) {
        checks.push({
          type: 'warning',
          message: 'Medical diagnosis requires professional consultation',
          compliance: 'HIPAA'
        });
      }
    }
    
    if (domainKey === 'finance') {
      if (message.toLowerCase().includes('investment advice') || message.toLowerCase().includes('buy') || message.toLowerCase().includes('sell')) {
        checks.push({
          type: 'warning',
          message: 'Investment advice requires licensed professional',
          compliance: 'SEC/FINRA'
        });
      }
    }
    
    if (domainKey === 'legal') {
      if (message.toLowerCase().includes('legal advice') || message.toLowerCase().includes('sue') || message.toLowerCase().includes('lawsuit')) {
        checks.push({
          type: 'warning',
          message: 'Legal advice requires licensed attorney',
          compliance: 'State Bar Rules'
        });
      }
    }
    
    return checks;
  }

  suggestWorkflow(message, domainKey) {
    const workflows = this.getWorkflows(domainKey);
    const messageLower = message.toLowerCase();
    
    // Simple keyword-based workflow suggestion
    for (const workflow of workflows) {
      if (messageLower.includes(workflow.split('-')[0])) {
        return workflow;
      }
    }
    
    return workflows[0] || 'general-consultation';
  }

  getDomainContext(domainKey) {
    const domain = this.getDomain(domainKey);
    return {
      name: domain.name,
      icon: domain.icon,
      color: domain.color,
      description: domain.description,
      dataSources: domain.dataSources,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get specialized knowledge base for domain
  getKnowledgeBase(domainKey) {
    const domain = this.getDomain(domainKey);
    return {
      base: domain.knowledgeBase,
      sources: domain.dataSources,
      lastTraining: new Date().toISOString()
    };
  }
}

const domainService = new DomainService();
export { domainService };
export default domainService;
