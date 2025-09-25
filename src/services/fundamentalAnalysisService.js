/**
 * Comprehensive Fundamental Analysis Service
 * Integrates company financial data and macroeconomic indicators
 */

class FundamentalAnalysisService {
  constructor() {
    this.apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.financialModelingApiKey = process.env.REACT_APP_FINANCIAL_MODELING_API_KEY;
    this.financialModelingUrl = 'https://financialmodelingprep.com/api/v3';
  }

  // ==================== COMPANY FINANCIAL DATA ====================

  async getCompanyOverview(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      return {
        basicInfo: {
          symbol: data.Symbol,
          name: data.Name,
          description: data.Description,
          sector: data.Sector,
          industry: data.Industry,
          exchange: data.Exchange,
          currency: data.Currency,
          country: data.Country
        },
        marketMetrics: {
          marketCap: this.parseNumericValue(data.MarketCapitalization),
          peRatio: this.parseNumericValue(data.PERatio),
          pegRatio: this.parseNumericValue(data.PEGRatio),
          priceToBook: this.parseNumericValue(data.PriceToBookRatio),
          priceToSales: this.parseNumericValue(data.PriceToSalesRatioTTM),
          dividendYield: this.parseNumericValue(data.DividendYield),
          dividendPerShare: this.parseNumericValue(data.DividendPerShare),
          payoutRatio: this.parseNumericValue(data.PayoutRatio)
        },
        profitability: {
          eps: this.parseNumericValue(data.EPS),
          epsGrowth: this.parseNumericValue(data.EPSEstimateCurrentYear),
          profitMargin: this.parseNumericValue(data.ProfitMargin),
          operatingMargin: this.parseNumericValue(data.OperatingMarginTTM),
          returnOnEquity: this.parseNumericValue(data.ReturnOnEquityTTM),
          returnOnAssets: this.parseNumericValue(data.ReturnOnAssetsTTM),
          grossProfitMargin: this.parseNumericValue(data.GrossProfitTTM)
        },
        financialHealth: {
          revenue: this.parseNumericValue(data.RevenueTTM),
          revenueGrowth: this.parseNumericValue(data.RevenueGrowthTTM),
          debtToEquity: this.parseNumericValue(data.DebtToEquityRatio),
          currentRatio: this.parseNumericValue(data.CurrentRatio),
          quickRatio: this.parseNumericValue(data.QuickRatio),
          cashPerShare: this.parseNumericValue(data.CashPerShare),
          priceToCashFlow: this.parseNumericValue(data.PriceToCashFlowRatio)
        },
        valuation: {
          evToEbitda: this.parseNumericValue(data.EVToEBITDA),
          evToRevenue: this.parseNumericValue(data.EVToRevenue),
          priceToEarnings: this.parseNumericValue(data.PERatio),
          priceToBook: this.parseNumericValue(data.PriceToBookRatio),
          priceToSales: this.parseNumericValue(data.PriceToSalesRatioTTM),
          pegRatio: this.parseNumericValue(data.PEGRatio)
        },
        analystData: {
          targetPrice: this.parseNumericValue(data.AnalystTargetPrice),
          recommendation: data.AnalystRecommendation,
          numberOfAnalysts: this.parseNumericValue(data.NumberOfAnalystOpinions),
          rating: this.parseAnalystRating(data.AnalystRecommendation)
        }
      };
    } catch (error) {
      console.error('Error fetching company overview:', error);
      return this.getMockCompanyOverview(symbol);
    }
  }

  async getFinancialStatements(symbol, statement = 'income') {
    try {
      const endpoint = statement === 'income' ? 'INCOME_STATEMENT' : 
                     statement === 'balance' ? 'BALANCE_SHEET' : 'CASH_FLOW';
      
      const response = await fetch(`${this.baseUrl}?function=${endpoint}&symbol=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const statements = data.annualReports || data.quarterlyReports || [];
      
      return statements.slice(0, 5).map(stmt => ({
        fiscalDateEnding: stmt.fiscalDateEnding,
        reportedCurrency: stmt.reportedCurrency,
        data: this.parseFinancialStatement(stmt, statement)
      }));
    } catch (error) {
      console.error(`Error fetching ${statement} statement:`, error);
      return this.getMockFinancialStatements(symbol, statement);
    }
  }

  parseFinancialStatement(stmt, type) {
    const commonFields = {
      fiscalDateEnding: stmt.fiscalDateEnding,
      reportedCurrency: stmt.reportedCurrency
    };

    switch (type) {
      case 'income':
        return {
          ...commonFields,
          totalRevenue: this.parseNumericValue(stmt.totalRevenue),
          grossProfit: this.parseNumericValue(stmt.grossProfit),
          operatingIncome: this.parseNumericValue(stmt.operatingIncome),
          netIncome: this.parseNumericValue(stmt.netIncome),
          ebitda: this.parseNumericValue(stmt.ebitda),
          eps: this.parseNumericValue(stmt.reportedEPS)
        };
      case 'balance':
        return {
          ...commonFields,
          totalAssets: this.parseNumericValue(stmt.totalAssets),
          totalLiabilities: this.parseNumericValue(stmt.totalLiabilities),
          totalEquity: this.parseNumericValue(stmt.totalShareholderEquity),
          currentAssets: this.parseNumericValue(stmt.totalCurrentAssets),
          currentLiabilities: this.parseNumericValue(stmt.totalCurrentLiabilities),
          cash: this.parseNumericValue(stmt.cashAndCashEquivalentsAtCarryingValue),
          debt: this.parseNumericValue(stmt.totalDebt)
        };
      case 'cashflow':
        return {
          ...commonFields,
          operatingCashFlow: this.parseNumericValue(stmt.operatingCashflow),
          investingCashFlow: this.parseNumericValue(stmt.cashflowFromInvestment),
          financingCashFlow: this.parseNumericValue(stmt.cashflowFromFinancing),
          freeCashFlow: this.parseNumericValue(stmt.operatingCashflow) - 
                       this.parseNumericValue(stmt.capitalExpenditures)
        };
      default:
        return commonFields;
    }
  }

  // ==================== MACROECONOMIC INDICATORS ====================

  async getMacroeconomicData() {
    try {
      const [gdp, inflation, interestRates, unemployment] = await Promise.all([
        this.getGDPData(),
        this.getInflationData(),
        this.getInterestRateData(),
        this.getUnemploymentData()
      ]);

      return {
        gdp,
        inflation,
        interestRates,
        unemployment,
        economicHealth: this.assessEconomicHealth(gdp, inflation, interestRates, unemployment)
      };
    } catch (error) {
      console.error('Error fetching macroeconomic data:', error);
      return this.getMockMacroeconomicData();
    }
  }

  async getGDPData() {
    try {
      const response = await fetch(`${this.baseUrl}?function=REAL_GDP&interval=quarterly&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const gdpData = data.data || [];
      return {
        current: gdpData[0]?.value || 0,
        previous: gdpData[1]?.value || 0,
        growth: gdpData[0]?.value - gdpData[1]?.value || 0,
        trend: this.calculateTrend(gdpData.slice(0, 4).map(d => parseFloat(d.value))),
        lastUpdated: gdpData[0]?.date || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching GDP data:', error);
      return this.getMockGDPData();
    }
  }

  async getInflationData() {
    try {
      const response = await fetch(`${this.baseUrl}?function=INFLATION&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const inflationData = data.data || [];
      return {
        current: inflationData[0]?.value || 0,
        previous: inflationData[1]?.value || 0,
        trend: this.calculateTrend(inflationData.slice(0, 12).map(d => parseFloat(d.value))),
        lastUpdated: inflationData[0]?.date || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching inflation data:', error);
      return this.getMockInflationData();
    }
  }

  async getInterestRateData() {
    try {
      const response = await fetch(`${this.baseUrl}?function=FEDERAL_FUNDS_RATE&interval=monthly&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const rateData = data.data || [];
      return {
        current: rateData[0]?.value || 0,
        previous: rateData[1]?.value || 0,
        trend: this.calculateTrend(rateData.slice(0, 12).map(d => parseFloat(d.value))),
        lastUpdated: rateData[0]?.date || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching interest rate data:', error);
      return this.getMockInterestRateData();
    }
  }

  async getUnemploymentData() {
    try {
      const response = await fetch(`${this.baseUrl}?function=UNEMPLOYMENT&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const unemploymentData = data.data || [];
      return {
        current: unemploymentData[0]?.value || 0,
        previous: unemploymentData[1]?.value || 0,
        trend: this.calculateTrend(unemploymentData.slice(0, 12).map(d => parseFloat(d.value))),
        lastUpdated: unemploymentData[0]?.date || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching unemployment data:', error);
      return this.getMockUnemploymentData();
    }
  }

  // ==================== FINANCIAL RATIOS & METRICS ====================

  calculateFinancialRatios(incomeStatement, balanceSheet, cashFlow) {
    const latestIncome = incomeStatement[0]?.data;
    const latestBalance = balanceSheet[0]?.data;
    const latestCashFlow = cashFlow[0]?.data;

    if (!latestIncome || !latestBalance) {
      return null;
    }

    return {
      profitability: {
        grossMargin: (latestIncome.grossProfit / latestIncome.totalRevenue) * 100,
        operatingMargin: (latestIncome.operatingIncome / latestIncome.totalRevenue) * 100,
        netMargin: (latestIncome.netIncome / latestIncome.totalRevenue) * 100,
        roe: (latestIncome.netIncome / latestBalance.totalEquity) * 100,
        roa: (latestIncome.netIncome / latestBalance.totalAssets) * 100
      },
      liquidity: {
        currentRatio: latestBalance.currentAssets / latestBalance.currentLiabilities,
        quickRatio: (latestBalance.currentAssets - latestBalance.inventory) / latestBalance.currentLiabilities,
        cashRatio: latestBalance.cash / latestBalance.currentLiabilities
      },
      leverage: {
        debtToEquity: latestBalance.totalLiabilities / latestBalance.totalEquity,
        debtToAssets: latestBalance.totalDebt / latestBalance.totalAssets,
        interestCoverage: latestIncome.operatingIncome / latestIncome.interestExpense
      },
      efficiency: {
        assetTurnover: latestIncome.totalRevenue / latestBalance.totalAssets,
        inventoryTurnover: latestIncome.costOfGoodsSold / latestBalance.inventory,
        receivablesTurnover: latestIncome.totalRevenue / latestBalance.accountsReceivable
      },
      valuation: {
        peRatio: this.calculatePERatio(latestIncome.eps),
        pbRatio: this.calculatePBRatio(latestBalance.totalEquity),
        psRatio: this.calculatePSRatio(latestIncome.totalRevenue),
        pegRatio: this.calculatePEGRatio(latestIncome.eps, latestIncome.epsGrowth)
      }
    };
  }

  // ==================== SECTOR & INDUSTRY ANALYSIS ====================

  async getSectorAnalysis(sector) {
    try {
      const response = await fetch(`${this.baseUrl}?function=SECTOR&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      return {
        sector,
        performance: data,
        analysis: this.analyzeSectorPerformance(data),
        recommendations: this.generateSectorRecommendations(data)
      };
    } catch (error) {
      console.error('Error fetching sector analysis:', error);
      return this.getMockSectorAnalysis(sector);
    }
  }

  analyzeSectorPerformance(sectorData) {
    const sectors = Object.keys(sectorData);
    const performance = sectors.map(sector => ({
      sector,
      change: parseFloat(sectorData[sector].replace('%', '')),
      rank: 0
    })).sort((a, b) => b.change - a.change);

    performance.forEach((sector, index) => {
      sector.rank = index + 1;
    });

    return {
      topPerformer: performance[0],
      worstPerformer: performance[performance.length - 1],
      averageChange: performance.reduce((sum, s) => sum + s.change, 0) / performance.length,
      volatility: this.calculateVolatility(performance.map(s => s.change))
    };
  }

  // ==================== VALUATION MODELS ====================

  calculateIntrinsicValue(financialData, growthRate = 0.05, discountRate = 0.1) {
    const { eps, peRatio, dividendYield, revenue } = financialData;
    
    // DCF Model
    const dcfValue = this.calculateDCFValue(financialData, growthRate, discountRate);
    
    // P/E Model
    const peValue = this.calculatePEValue(eps, peRatio);
    
    // Dividend Discount Model
    const ddmValue = this.calculateDDMValue(financialData, growthRate, discountRate);
    
    // Graham Formula
    const grahamValue = this.calculateGrahamValue(eps, growthRate);
    
    return {
      dcf: dcfValue,
      pe: peValue,
      ddm: ddmValue,
      graham: grahamValue,
      average: (dcfValue + peValue + ddmValue + grahamValue) / 4,
      methods: {
        dcf: { value: dcfValue, weight: 0.4 },
        pe: { value: peValue, weight: 0.3 },
        ddm: { value: ddmValue, weight: 0.2 },
        graham: { value: grahamValue, weight: 0.1 }
      }
    };
  }

  calculateDCFValue(financialData, growthRate, discountRate) {
    const { revenue, netIncome, totalAssets } = financialData;
    const projectedCashFlow = netIncome * (1 + growthRate);
    const terminalValue = projectedCashFlow / (discountRate - growthRate);
    return terminalValue / 1000000; // Convert to millions
  }

  calculatePEValue(eps, peRatio) {
    return eps * peRatio;
  }

  calculateDDMValue(financialData, growthRate, discountRate) {
    const { dividendPerShare } = financialData;
    if (!dividendPerShare || dividendPerShare <= 0) return 0;
    return (dividendPerShare * (1 + growthRate)) / (discountRate - growthRate);
  }

  calculateGrahamValue(eps, growthRate) {
    return eps * (8.5 + 2 * growthRate * 100);
  }

  // ==================== COMPREHENSIVE FUNDAMENTAL ANALYSIS ====================

  async performFundamentalAnalysis(symbol) {
    try {
      const [overview, incomeStatement, balanceSheet, cashFlow, macroData] = await Promise.all([
        this.getCompanyOverview(symbol),
        this.getFinancialStatements(symbol, 'income'),
        this.getFinancialStatements(symbol, 'balance'),
        this.getFinancialStatements(symbol, 'cashflow'),
        this.getMacroeconomicData()
      ]);

      const ratios = this.calculateFinancialRatios(incomeStatement, balanceSheet, cashFlow);
      const intrinsicValue = this.calculateIntrinsicValue(overview.marketMetrics);
      const sectorAnalysis = await this.getSectorAnalysis(overview.basicInfo.sector);

      return {
        symbol,
        overview,
        financialStatements: {
          income: incomeStatement,
          balance: balanceSheet,
          cashFlow: cashFlow
        },
        ratios,
        intrinsicValue,
        macroData,
        sectorAnalysis,
        analysis: this.generateFundamentalAnalysis(overview, ratios, intrinsicValue, macroData),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error performing fundamental analysis:', error);
      throw error;
    }
  }

  generateFundamentalAnalysis(overview, ratios, intrinsicValue, macroData) {
    const analysis = {
      overallScore: 0,
      strengths: [],
      weaknesses: [],
      risks: [],
      opportunities: [],
      recommendation: 'hold',
      confidence: 0.5
    };

    // Analyze profitability
    if (ratios?.profitability) {
      const { grossMargin, operatingMargin, netMargin, roe, roa } = ratios.profitability;
      
      if (grossMargin > 30) analysis.strengths.push('Strong gross margins');
      if (operatingMargin > 15) analysis.strengths.push('Healthy operating margins');
      if (roe > 15) analysis.strengths.push('Strong return on equity');
      if (netMargin < 5) analysis.weaknesses.push('Low net profit margins');
    }

    // Analyze financial health
    if (ratios?.liquidity) {
      const { currentRatio, quickRatio } = ratios.liquidity;
      
      if (currentRatio > 2) analysis.strengths.push('Strong liquidity position');
      if (currentRatio < 1) analysis.weaknesses.push('Poor liquidity');
    }

    // Analyze leverage
    if (ratios?.leverage) {
      const { debtToEquity, interestCoverage } = ratios.leverage;
      
      if (debtToEquity < 0.5) analysis.strengths.push('Low debt levels');
      if (debtToEquity > 2) analysis.weaknesses.push('High debt levels');
      if (interestCoverage < 2.5) analysis.risks.push('Low interest coverage');
    }

    // Analyze valuation
    const peRatio = overview.marketMetrics.peRatio;
    const intrinsicVal = intrinsicValue.average;
    const currentPrice = overview.marketMetrics.marketCap / 1000000; // Simplified

    if (peRatio < 15) analysis.opportunities.push('Undervalued based on P/E ratio');
    if (peRatio > 30) analysis.weaknesses.push('High valuation based on P/E ratio');
    if (intrinsicVal > currentPrice * 1.2) analysis.opportunities.push('Significant upside potential');
    if (intrinsicVal < currentPrice * 0.8) analysis.risks.push('Overvalued based on intrinsic value');

    // Calculate overall score
    analysis.overallScore = this.calculateOverallScore(analysis);
    
    // Generate recommendation
    analysis.recommendation = this.generateRecommendation(analysis.overallScore);
    analysis.confidence = Math.min(analysis.overallScore / 100, 1);

    return analysis;
  }

  calculateOverallScore(analysis) {
    let score = 50; // Base score
    
    score += analysis.strengths.length * 10;
    score -= analysis.weaknesses.length * 8;
    score -= analysis.risks.length * 5;
    score += analysis.opportunities.length * 7;
    
    return Math.max(0, Math.min(100, score));
  }

  generateRecommendation(score) {
    if (score >= 70) return 'strong_buy';
    if (score >= 60) return 'buy';
    if (score >= 40) return 'hold';
    if (score >= 30) return 'sell';
    return 'strong_sell';
  }

  // ==================== HELPER METHODS ====================

  parseNumericValue(value) {
    if (!value || value === 'None' || value === '-') return 0;
    return parseFloat(value.toString().replace(/,/g, ''));
  }

  parseAnalystRating(recommendation) {
    const ratings = {
      'Strong Buy': 5,
      'Buy': 4,
      'Hold': 3,
      'Sell': 2,
      'Strong Sell': 1
    };
    return ratings[recommendation] || 3;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  calculateVolatility(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  assessEconomicHealth(gdp, inflation, interestRates, unemployment) {
    let score = 50;
    
    if (gdp.growth > 2) score += 15;
    if (inflation.current < 3) score += 10;
    if (interestRates.current < 5) score += 10;
    if (unemployment.current < 5) score += 15;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      status: score > 70 ? 'healthy' : score > 50 ? 'moderate' : 'concerning'
    };
  }

  // ==================== MOCK DATA ====================

  getMockCompanyOverview(symbol) {
    return {
      basicInfo: {
        symbol,
        name: `${symbol} Corporation`,
        description: 'Leading technology company',
        sector: 'Technology',
        industry: 'Software',
        exchange: 'NASDAQ',
        currency: 'USD',
        country: 'United States'
      },
      marketMetrics: {
        marketCap: 1000000000,
        peRatio: 25.5,
        pegRatio: 1.2,
        priceToBook: 3.2,
        dividendYield: 1.2,
        dividendPerShare: 2.5
      },
      profitability: {
        eps: 4.50,
        profitMargin: 18.5,
        returnOnEquity: 22.3
      },
      financialHealth: {
        revenue: 15000000000,
        debtToEquity: 0.8,
        currentRatio: 2.1
      },
      analystData: {
        targetPrice: 150,
        recommendation: 'Buy',
        rating: 4
      }
    };
  }

  getMockFinancialStatements(symbol, type) {
    return Array.from({length: 5}, (_, i) => ({
      fiscalDateEnding: new Date(Date.now() - i * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reportedCurrency: 'USD',
      data: type === 'income' ? {
        totalRevenue: 1000000000 * (1 + i * 0.1),
        grossProfit: 600000000 * (1 + i * 0.1),
        operatingIncome: 200000000 * (1 + i * 0.1),
        netIncome: 150000000 * (1 + i * 0.1),
        eps: 3.0 + i * 0.5
      } : type === 'balance' ? {
        totalAssets: 5000000000 * (1 + i * 0.05),
        totalLiabilities: 2000000000 * (1 + i * 0.05),
        totalEquity: 3000000000 * (1 + i * 0.05),
        currentAssets: 1000000000,
        currentLiabilities: 500000000,
        cash: 200000000
      } : {
        operatingCashFlow: 300000000 * (1 + i * 0.1),
        investingCashFlow: -100000000,
        financingCashFlow: -50000000
      }
    }));
  }

  getMockMacroeconomicData() {
    return {
      gdp: { current: 21.5, growth: 2.1, trend: 'increasing' },
      inflation: { current: 2.5, trend: 'stable' },
      interestRates: { current: 4.25, trend: 'increasing' },
      unemployment: { current: 3.8, trend: 'stable' },
      economicHealth: { score: 75, status: 'healthy' }
    };
  }

  getMockSectorAnalysis(sector) {
    return {
      sector,
      performance: {
        'Technology': '5.2%',
        'Healthcare': '3.1%',
        'Financial': '2.8%',
        'Consumer': '1.9%',
        'Industrial': '1.5%'
      },
      analysis: {
        topPerformer: { sector: 'Technology', change: 5.2, rank: 1 },
        averageChange: 2.9,
        volatility: 1.8
      }
    };
  }
}

export default new FundamentalAnalysisService();
