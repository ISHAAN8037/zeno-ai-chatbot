/**
 * Comprehensive Stock Market Knowledge Service
 * Provides educational content, market concepts, and trading strategies
 */

class StockMarketKnowledgeService {
  constructor() {
    this.knowledgeBase = {
      // Basic Market Concepts
      basicConcepts: {
        bullMarket: {
          term: "Bull Market",
          definition: "A market condition where prices are rising or expected to rise, typically characterized by investor confidence and optimism.",
          characteristics: [
            "Rising stock prices over an extended period",
            "High investor confidence and optimism",
            "Strong economic indicators",
            "Increased trading volume",
            "Low unemployment and economic growth"
          ],
          example: "The S&P 500 gained 20% over the past year, indicating a bull market.",
          duration: "Typically lasts 2-7 years",
          indicators: ["RSI above 50", "Price above moving averages", "High trading volume"]
        },
        bearMarket: {
          term: "Bear Market",
          definition: "A market condition where prices are falling or expected to fall, typically characterized by investor pessimism and fear.",
          characteristics: [
            "Declining stock prices over an extended period",
            "Low investor confidence and pessimism",
            "Weak economic indicators",
            "Decreased trading volume",
            "High unemployment and economic contraction"
          ],
          example: "The market dropped 25% from its peak, signaling a bear market.",
          duration: "Typically lasts 1-3 years",
          indicators: ["RSI below 50", "Price below moving averages", "Low trading volume"]
        },
        marketCycle: {
          term: "Market Cycle",
          definition: "The natural fluctuation of the economy between periods of expansion and contraction.",
          phases: [
            "Expansion: Economic growth, rising employment, increasing prices",
            "Peak: Maximum economic activity, full employment, high prices",
            "Contraction: Economic decline, rising unemployment, falling prices",
            "Trough: Minimum economic activity, high unemployment, low prices"
          ],
          duration: "Typically 4-6 years for a complete cycle",
          example: "The 2008 financial crisis marked the end of an expansion phase and beginning of a contraction phase."
        }
      },

      // Technical Analysis Concepts
      technicalAnalysis: {
        supportLevel: {
          term: "Support Level",
          definition: "A price level where a stock or market tends to find buying interest and bounce back up.",
          characteristics: [
            "Price level where demand exceeds supply",
            "Historical price level where buying occurred",
            "Psychological price level important to investors",
            "Often coincides with round numbers or previous lows"
          ],
          example: "The stock found support at $100 and bounced back to $110.",
          tradingStrategy: "Buy near support levels, set stop-loss below support"
        },
        resistanceLevel: {
          term: "Resistance Level",
          definition: "A price level where a stock or market tends to find selling pressure and struggles to break through.",
          characteristics: [
            "Price level where supply exceeds demand",
            "Historical price level where selling occurred",
            "Psychological price level where sellers emerge",
            "Often coincides with round numbers or previous highs"
          ],
          example: "The stock hit resistance at $150 and pulled back to $140.",
          tradingStrategy: "Sell near resistance levels, wait for breakout confirmation"
        },
        trendLine: {
          term: "Trend Line",
          definition: "A straight line connecting two or more price points to show the direction of price movement.",
          types: [
            "Uptrend Line: Connects higher lows, shows upward price movement",
            "Downtrend Line: Connects lower highs, shows downward price movement",
            "Sideways Trend: Horizontal line showing range-bound movement"
          ],
          example: "Drawing a line connecting the recent lows shows an uptrend.",
          tradingStrategy: "Trade in the direction of the trend, buy on pullbacks to uptrend line"
        },
        breakout: {
          term: "Breakout",
          definition: "When a stock price moves above a resistance level or below a support level with increased volume.",
          characteristics: [
            "Price moves beyond key support or resistance levels",
            "Increased trading volume confirms the move",
            "Often leads to significant price movement",
            "Can be false breakouts if not confirmed by volume"
          ],
          example: "The stock broke above $150 resistance with high volume, signaling a bullish breakout.",
          tradingStrategy: "Enter positions on confirmed breakouts with volume"
        }
      },

      // Technical Indicators
      technicalIndicators: {
        rsi: {
          term: "RSI (Relative Strength Index)",
          definition: "A momentum oscillator that measures the speed and change of price movements, ranging from 0 to 100.",
          calculation: "RSI = 100 - (100 / (1 + RS)) where RS = Average Gain / Average Loss",
          interpretation: [
            "RSI > 70: Overbought conditions, potential sell signal",
            "RSI < 30: Oversold conditions, potential buy signal",
            "RSI 50: Neutral conditions, no clear signal",
            "Divergence: Price and RSI move in opposite directions"
          ],
          example: "RSI above 70 indicates overbought conditions, while RSI below 30 indicates oversold conditions.",
          timeframes: "Common periods: 14, 21, 30 days"
        },
        macd: {
          term: "MACD (Moving Average Convergence Divergence)",
          definition: "A trend-following momentum indicator that shows the relationship between two moving averages of a security's price.",
          components: [
            "MACD Line: 12-period EMA - 26-period EMA",
            "Signal Line: 9-period EMA of MACD line",
            "Histogram: MACD line - Signal line"
          ],
          signals: [
            "MACD line crosses above signal line: Bullish signal",
            "MACD line crosses below signal line: Bearish signal",
            "Histogram above zero: Bullish momentum",
            "Histogram below zero: Bearish momentum"
          ],
          example: "When MACD line crosses above signal line, it's considered a bullish signal.",
          timeframes: "Default: 12, 26, 9 periods"
        },
        bollingerBands: {
          term: "Bollinger Bands",
          definition: "A volatility indicator consisting of three lines: upper band, middle band (SMA), and lower band.",
          calculation: [
            "Middle Band: 20-period Simple Moving Average",
            "Upper Band: Middle Band + (2 × Standard Deviation)",
            "Lower Band: Middle Band - (2 × Standard Deviation)"
          ],
          signals: [
            "Price touches upper band: Overbought, potential sell",
            "Price touches lower band: Oversold, potential buy",
            "Bands squeeze: Low volatility, potential breakout",
            "Bands expand: High volatility, trend continuation"
          ],
          example: "When price touches the lower Bollinger Band, it may indicate an oversold condition.",
          timeframes: "Default: 20 periods with 2 standard deviations"
        },
        movingAverages: {
          term: "Moving Averages",
          definition: "Technical indicators that smooth out price data to identify trends by averaging prices over a specific period.",
          types: [
            "Simple Moving Average (SMA): Average of closing prices over period",
            "Exponential Moving Average (EMA): More weight to recent prices",
            "Weighted Moving Average (WMA): Linear weighting of prices"
          ],
          signals: [
            "Price above MA: Uptrend",
            "Price below MA: Downtrend",
            "MA crossover: Trend change signal",
            "Multiple MAs: Trend strength confirmation"
          ],
          example: "When 50-day MA crosses above 200-day MA, it's called a 'Golden Cross' - a bullish signal.",
          commonPeriods: "20, 50, 100, 200 days"
        }
      },

      // Fundamental Analysis Concepts
      fundamentalAnalysis: {
        peRatio: {
          term: "P/E Ratio (Price-to-Earnings)",
          definition: "A valuation ratio that compares a company's current share price to its per-share earnings.",
          calculation: "P/E Ratio = Market Price per Share / Earnings per Share (EPS)",
          interpretation: [
            "High P/E: Stock may be overvalued or high growth expected",
            "Low P/E: Stock may be undervalued or low growth expected",
            "Industry comparison: Compare with sector average",
            "Historical comparison: Compare with company's historical P/E"
          ],
          example: "A P/E ratio of 15 means investors pay $15 for every $1 of earnings.",
          ranges: "Typical range: 10-25, Growth stocks: 25+, Value stocks: 10-15"
        },
        eps: {
          term: "EPS (Earnings Per Share)",
          definition: "A company's profit divided by the number of outstanding shares, indicating profitability per share.",
          calculation: "EPS = Net Income / Number of Outstanding Shares",
          types: [
            "Trailing EPS: Based on past 12 months",
            "Forward EPS: Projected for next 12 months",
            "Diluted EPS: Accounts for potential share dilution"
          ],
          importance: [
            "Higher EPS generally indicates better profitability",
            "EPS growth shows company's growth trajectory",
            "Used in P/E ratio calculation",
            "Key metric for dividend sustainability"
          ],
          example: "If a company has $1 million net income and 1 million shares, EPS = $1.00."
        },
        roe: {
          term: "ROE (Return on Equity)",
          definition: "A measure of financial performance calculated by dividing net income by shareholders' equity.",
          calculation: "ROE = Net Income / Shareholders' Equity",
          interpretation: [
            "ROE > 15%: Generally considered good",
            "ROE > 20%: Excellent performance",
            "ROE < 10%: May indicate poor performance",
            "Industry comparison: Compare with sector average"
          ],
          importance: [
            "Measures how efficiently company uses equity",
            "Higher ROE indicates better management",
            "Key metric for value investors",
            "Sustainable growth indicator"
          ],
          example: "A company with $100 million net income and $500 million equity has ROE of 20%."
        },
        debtToEquity: {
          term: "Debt-to-Equity Ratio",
          definition: "A financial ratio indicating the relative proportion of shareholders' equity and debt used to finance assets.",
          calculation: "D/E Ratio = Total Debt / Total Shareholders' Equity",
          interpretation: [
            "D/E < 0.5: Conservative, low risk",
            "D/E 0.5-1.0: Moderate leverage",
            "D/E > 1.0: High leverage, higher risk",
            "Industry dependent: Utilities typically higher"
          ],
          importance: [
            "Measures financial leverage and risk",
            "Higher ratio = higher financial risk",
            "Affects credit rating and borrowing costs",
            "Key metric for risk assessment"
          ],
          example: "A company with $200 million debt and $100 million equity has D/E ratio of 2.0."
        }
      },

      // Trading Strategies
      tradingStrategies: {
        valueInvesting: {
          term: "Value Investing",
          definition: "An investment strategy that involves buying stocks that appear to be trading for less than their intrinsic value.",
          principles: [
            "Buy undervalued stocks",
            "Focus on fundamental analysis",
            "Long-term investment horizon",
            "Margin of safety in purchases"
          ],
          metrics: ["P/E ratio", "P/B ratio", "PEG ratio", "Dividend yield", "ROE"],
          example: "Warren Buffett's approach of buying quality companies at discounted prices.",
          timeframe: "Long-term (5+ years)"
        },
        growthInvesting: {
          term: "Growth Investing",
          definition: "An investment strategy focused on companies that are expected to grow at an above-average rate compared to the market.",
          characteristics: [
            "Focus on revenue and earnings growth",
            "Higher P/E ratios acceptable",
            "Technology and innovation sectors",
            "Less emphasis on dividends"
          ],
          metrics: ["Revenue growth", "EPS growth", "PEG ratio", "Market share growth"],
          example: "Investing in emerging tech companies with high growth potential.",
          timeframe: "Medium to long-term (2-5 years)"
        },
        momentumTrading: {
          term: "Momentum Trading",
          definition: "A trading strategy that involves buying and selling assets based on recent price trends and volume patterns.",
          principles: [
            "Follow the trend",
            "Use technical indicators",
            "Quick entry and exit",
            "Risk management crucial"
          ],
          indicators: ["RSI", "MACD", "Moving averages", "Volume analysis"],
          example: "Buying stocks that are breaking out to new highs with high volume.",
          timeframe: "Short to medium-term (days to months)"
        },
        swingTrading: {
          term: "Swing Trading",
          definition: "A trading strategy that aims to capture short- to medium-term price movements in stocks.",
          characteristics: [
            "Hold positions for days to weeks",
            "Use technical and fundamental analysis",
            "Focus on price patterns and trends",
            "Active monitoring required"
          ],
          techniques: ["Support/resistance trading", "Moving average crossovers", "Chart patterns"],
          example: "Buying a stock at support and selling at resistance over a 2-week period.",
          timeframe: "Short to medium-term (1-4 weeks)"
        }
      },

      // Risk Management
      riskManagement: {
        diversification: {
          term: "Diversification",
          definition: "A risk management strategy that involves spreading investments across different assets, sectors, or geographic regions.",
          benefits: [
            "Reduces overall portfolio risk",
            "Smooths out returns over time",
            "Protects against sector-specific risks",
            "Improves risk-adjusted returns"
          ],
          methods: [
            "Asset allocation across stocks, bonds, commodities",
            "Sector diversification",
            "Geographic diversification",
            "Market cap diversification"
          ],
          example: "Instead of investing 100% in tech stocks, spread across technology, healthcare, finance, and consumer goods.",
          rule: "Don't put all your eggs in one basket"
        },
        stopLoss: {
          term: "Stop Loss",
          definition: "A predetermined price level at which an investor will sell a security to limit losses.",
          types: [
            "Fixed stop loss: Set at specific price level",
            "Trailing stop loss: Adjusts with favorable price movement",
            "Percentage stop loss: Based on percentage decline",
            "Volatility-based stop loss: Based on ATR or volatility"
          ],
          benefits: [
            "Limits potential losses",
            "Removes emotion from trading",
            "Protects capital",
            "Allows for systematic risk management"
          ],
          example: "Buy stock at $100, set stop loss at $90 (10% loss limit).",
          commonLevels: "5-10% for stocks, 2-5% for day trading"
        },
        positionSizing: {
          term: "Position Sizing",
          definition: "The process of determining how much of a portfolio to allocate to a specific investment.",
          methods: [
            "Fixed dollar amount",
            "Percentage of portfolio",
            "Risk-based sizing",
            "Volatility-based sizing"
          ],
          principles: [
            "Never risk more than you can afford to lose",
            "Larger positions for higher conviction",
            "Smaller positions for higher risk",
            "Consider correlation between positions"
          ],
          example: "If you have $100,000 portfolio and want to risk 2% per trade, maximum position size is $2,000.",
          rule: "Risk 1-2% of portfolio per trade"
        }
      },

      // Market Psychology
      marketPsychology: {
        fearAndGreed: {
          term: "Fear and Greed Index",
          definition: "A sentiment indicator that measures market emotions on a scale from 0 (extreme fear) to 100 (extreme greed).",
          levels: [
            "0-25: Extreme Fear - Potential buying opportunity",
            "25-45: Fear - Cautious optimism",
            "45-55: Neutral - Balanced sentiment",
            "55-75: Greed - Cautious selling",
            "75-100: Extreme Greed - Potential selling opportunity"
          ],
          indicators: [
            "VIX (Volatility Index)",
            "Put/Call ratio",
            "Margin debt levels",
            "Insider trading activity",
            "Mutual fund flows"
          ],
          example: "During market crashes, fear index often reaches extreme levels, creating buying opportunities.",
          contrarian: "Be greedy when others are fearful, fearful when others are greedy"
        },
        herdMentality: {
          term: "Herd Mentality",
          definition: "The tendency for individuals to follow the actions of a larger group, often leading to market bubbles and crashes.",
          characteristics: [
            "Following popular investment trends",
            "Fear of missing out (FOMO)",
            "Group decision making",
            "Reduced individual analysis"
          ],
          effects: [
            "Market bubbles and crashes",
            "Overvaluation of popular stocks",
            "Undervaluation of unpopular stocks",
            "Increased market volatility"
          ],
          example: "The dot-com bubble of the late 1990s was driven by herd mentality investing in internet stocks.",
          advice: "Think independently and do your own research"
        }
      },

      // Economic Indicators
      economicIndicators: {
        gdp: {
          term: "GDP (Gross Domestic Product)",
          definition: "The total monetary value of all finished goods and services produced within a country's borders in a specific time period.",
          types: [
            "Nominal GDP: Current prices",
            "Real GDP: Adjusted for inflation",
            "GDP Growth Rate: Percentage change over time"
          ],
          impact: [
            "Higher GDP growth = positive for stocks",
            "Lower GDP growth = negative for stocks",
            "Recession = GDP decline for two consecutive quarters",
            "Affects corporate earnings and consumer spending"
          ],
          example: "A 3% GDP growth rate indicates a healthy, expanding economy.",
          frequency: "Quarterly reports"
        },
        inflation: {
          term: "Inflation",
          definition: "The rate at which the general level of prices for goods and services is rising, eroding purchasing power.",
          types: [
            "Consumer Price Index (CPI)",
            "Producer Price Index (PPI)",
            "Core Inflation: Excludes food and energy"
          ],
          effects: [
            "Rising inflation = higher interest rates",
            "Higher interest rates = lower stock valuations",
            "Moderate inflation (2-3%) = healthy economy",
            "High inflation = economic problems"
          ],
          example: "If inflation is 3% and your investment returns 5%, your real return is 2%.",
          target: "Central banks typically target 2% inflation"
        },
        interestRates: {
          term: "Interest Rates",
          definition: "The cost of borrowing money, set by central banks to control economic growth and inflation.",
          types: [
            "Federal Funds Rate: Overnight lending rate",
            "Prime Rate: Rate banks charge best customers",
            "10-Year Treasury: Long-term government bond rate"
          ],
          impact: [
            "Higher rates = lower stock valuations",
            "Lower rates = higher stock valuations",
            "Affects borrowing costs for companies",
            "Influences consumer spending and investment"
          ],
          example: "When Fed raises rates, stock prices often decline due to higher borrowing costs.",
          cycle: "Rates typically rise during economic expansion, fall during recession"
        }
      }
    };
  }

  // Get knowledge by category
  getKnowledgeByCategory(category) {
    return this.knowledgeBase[category] || {};
  }

  // Get specific concept
  getConcept(category, concept) {
    const categoryData = this.knowledgeBase[category];
    return categoryData ? categoryData[concept] : null;
  }

  // Search knowledge base
  searchKnowledge(query) {
    const results = [];
    const searchTerm = query.toLowerCase();

    Object.keys(this.knowledgeBase).forEach(category => {
      Object.keys(this.knowledgeBase[category]).forEach(concept => {
        const conceptData = this.knowledgeBase[category][concept];
        if (this.matchesSearch(conceptData, searchTerm)) {
          results.push({
            category,
            concept,
            data: conceptData
          });
        }
      });
    });

    return results;
  }

  // Check if concept matches search query
  matchesSearch(conceptData, searchTerm) {
    const searchableText = [
      conceptData.term,
      conceptData.definition,
      ...(conceptData.characteristics || []),
      ...(conceptData.example || []),
      ...(conceptData.interpretation || []),
      ...(conceptData.benefits || []),
      ...(conceptData.principles || [])
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm);
  }

  // Get random educational tip
  getRandomTip() {
    const allConcepts = [];
    Object.keys(this.knowledgeBase).forEach(category => {
      Object.keys(this.knowledgeBase[category]).forEach(concept => {
        allConcepts.push({
          category,
          concept,
          data: this.knowledgeBase[category][concept]
        });
      });
    });

    const randomConcept = allConcepts[Math.floor(Math.random() * allConcepts.length)];
    return {
      tip: `${randomConcept.data.term}: ${randomConcept.data.definition}`,
      example: randomConcept.data.example,
      category: randomConcept.category
    };
  }

  // Get trading strategies by risk level
  getStrategiesByRiskLevel(riskLevel) {
    const strategies = {
      conservative: ['valueInvesting', 'diversification'],
      moderate: ['growthInvesting', 'swingTrading'],
      aggressive: ['momentumTrading', 'positionSizing']
    };

    return strategies[riskLevel] || [];
  }

  // Get market concepts by experience level
  getConceptsByExperienceLevel(level) {
    const concepts = {
      beginner: [
        'bullMarket', 'bearMarket', 'peRatio', 'eps', 'diversification',
        'supportLevel', 'resistanceLevel', 'rsi', 'movingAverages'
      ],
      intermediate: [
        'macd', 'bollingerBands', 'roe', 'debtToEquity', 'stopLoss',
        'trendLine', 'breakout', 'valueInvesting', 'growthInvesting'
      ],
      advanced: [
        'momentumTrading', 'swingTrading', 'positionSizing', 'fearAndGreed',
        'herdMentality', 'gdp', 'inflation', 'interestRates'
      ]
    };

    return concepts[level] || [];
  }

  // Get comprehensive knowledge summary
  getKnowledgeSummary() {
    const summary = {
      totalConcepts: 0,
      categories: {},
      experienceLevels: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      }
    };

    Object.keys(this.knowledgeBase).forEach(category => {
      const concepts = Object.keys(this.knowledgeBase[category]);
      summary.categories[category] = concepts.length;
      summary.totalConcepts += concepts.length;
    });

    // Count by experience level
    ['beginner', 'intermediate', 'advanced'].forEach(level => {
      summary.experienceLevels[level] = this.getConceptsByExperienceLevel(level).length;
    });

    return summary;
  }

  // Get related concepts
  getRelatedConcepts(conceptName) {
    const relations = {
      // Technical Analysis Relations
      'rsi': ['macd', 'bollingerBands', 'supportLevel', 'resistanceLevel'],
      'macd': ['rsi', 'movingAverages', 'trendLine', 'momentumTrading'],
      'bollingerBands': ['rsi', 'macd', 'volatility', 'breakout'],
      'supportLevel': ['resistanceLevel', 'trendLine', 'breakout', 'swingTrading'],
      'resistanceLevel': ['supportLevel', 'trendLine', 'breakout', 'swingTrading'],
      
      // Fundamental Analysis Relations
      'peRatio': ['eps', 'roe', 'valueInvesting', 'growthInvesting'],
      'eps': ['peRatio', 'roe', 'fundamentalAnalysis', 'valueInvesting'],
      'roe': ['peRatio', 'eps', 'debtToEquity', 'valueInvesting'],
      'debtToEquity': ['roe', 'riskManagement', 'fundamentalAnalysis'],
      
      // Market Concepts Relations
      'bullMarket': ['bearMarket', 'marketCycle', 'fearAndGreed', 'herdMentality'],
      'bearMarket': ['bullMarket', 'marketCycle', 'fearAndGreed', 'herdMentality'],
      'diversification': ['riskManagement', 'positionSizing', 'stopLoss'],
      'stopLoss': ['diversification', 'positionSizing', 'riskManagement']
    };

    return relations[conceptName] || [];
  }

  // Get market education curriculum
  getEducationCurriculum() {
    return {
      beginner: {
        title: "Stock Market Basics",
        duration: "2-3 weeks",
        topics: [
          "Understanding stocks and markets",
          "Basic terminology and concepts",
          "Introduction to fundamental analysis",
          "Risk management basics",
          "Diversification principles"
        ],
        concepts: this.getConceptsByExperienceLevel('beginner')
      },
      intermediate: {
        title: "Technical Analysis & Strategies",
        duration: "4-6 weeks",
        topics: [
          "Technical indicators and chart patterns",
          "Trading strategies and approaches",
          "Advanced fundamental analysis",
          "Portfolio management",
          "Market psychology"
        ],
        concepts: this.getConceptsByExperienceLevel('intermediate')
      },
      advanced: {
        title: "Advanced Trading & Economics",
        duration: "6-8 weeks",
        topics: [
          "Advanced technical analysis",
          "Economic indicators and macro analysis",
          "Risk management and position sizing",
          "Market psychology and behavioral finance",
          "Professional trading strategies"
        ],
        concepts: this.getConceptsByExperienceLevel('advanced')
      }
    };
  }
}

export default new StockMarketKnowledgeService();
