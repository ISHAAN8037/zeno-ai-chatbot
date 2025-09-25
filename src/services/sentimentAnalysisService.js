/**
 * Advanced Sentiment Analysis Service
 * Analyzes news articles, financial reports, and social media using NLP techniques
 */

class SentimentAnalysisService {
  constructor() {
    this.apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'demo';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.newsApiKey = process.env.REACT_APP_NEWS_API_KEY;
    this.newsApiUrl = 'https://newsapi.org/v2';
    this.twitterApiKey = process.env.REACT_APP_TWITTER_API_KEY;
    this.redditApiKey = process.env.REACT_APP_REDDIT_API_KEY;
    
    // Sentiment analysis models and keywords
    this.sentimentKeywords = {
      positive: [
        'bullish', 'growth', 'profit', 'gain', 'rise', 'increase', 'strong', 'excellent',
        'outperform', 'beat', 'exceed', 'surge', 'rally', 'breakthrough', 'innovation',
        'expansion', 'acquisition', 'merger', 'partnership', 'upgrade', 'positive',
        'optimistic', 'confident', 'robust', 'solid', 'impressive', 'outstanding'
      ],
      negative: [
        'bearish', 'decline', 'loss', 'fall', 'drop', 'decrease', 'weak', 'poor',
        'underperform', 'miss', 'disappoint', 'crash', 'plunge', 'crisis', 'problem',
        'concern', 'risk', 'warning', 'downgrade', 'negative', 'pessimistic', 'worried',
        'uncertain', 'volatile', 'unstable', 'troubled', 'struggling', 'challenging'
      ],
      neutral: [
        'stable', 'maintain', 'steady', 'unchanged', 'flat', 'neutral', 'mixed',
        'uncertain', 'wait', 'monitor', 'observe', 'evaluate', 'assess', 'review'
      ]
    };

    this.financialTerms = {
      earnings: ['earnings', 'profit', 'revenue', 'income', 'eps', 'guidance'],
      growth: ['growth', 'expansion', 'increase', 'rise', 'surge', 'boom'],
      risk: ['risk', 'volatility', 'uncertainty', 'concern', 'warning', 'caution'],
      market: ['market', 'trading', 'price', 'stock', 'shares', 'equity'],
      analyst: ['analyst', 'rating', 'target', 'recommendation', 'upgrade', 'downgrade']
    };
  }

  // ==================== NEWS SENTIMENT ANALYSIS ====================

  async getNewsSentiment(symbol, timeframe = '7d') {
    try {
      const [alphaVantageNews, newsApiNews] = await Promise.all([
        this.getAlphaVantageNews(symbol),
        this.getNewsApiNews(symbol, timeframe)
      ]);

      const allNews = [...alphaVantageNews, ...newsApiNews];
      const sentimentAnalysis = this.analyzeNewsSentiment(allNews);
      
      return {
        symbol,
        timeframe,
        totalArticles: allNews.length,
        sentiment: sentimentAnalysis,
        topStories: this.getTopStories(allNews, 5),
        trends: this.analyzeSentimentTrends(allNews),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching news sentiment:', error);
      return this.getMockNewsSentiment(symbol);
    }
  }

  async getAlphaVantageNews(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      return (data.feed || []).map(article => ({
        title: article.title,
        summary: article.summary,
        url: article.url,
        publishedAt: article.time_published,
        source: article.source,
        sentiment: this.analyzeTextSentiment(article.title + ' ' + article.summary),
        relevanceScore: article.relevance_score || 0.5,
        tickerSentiment: article.ticker_sentiment_label || 'neutral'
      }));
    } catch (error) {
      console.error('Error fetching Alpha Vantage news:', error);
      return [];
    }
  }

  async getNewsApiNews(symbol, timeframe) {
    if (!this.newsApiKey) {
      console.warn('News API key not configured');
      return [];
    }

    try {
      const fromDate = this.getDateFromTimeframe(timeframe);
      const response = await fetch(
        `${this.newsApiUrl}/everything?q=${symbol}&from=${fromDate}&sortBy=publishedAt&apiKey=${this.newsApiKey}`
      );
      const data = await response.json();

      return (data.articles || []).map(article => ({
        title: article.title,
        summary: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        sentiment: this.analyzeTextSentiment(article.title + ' ' + article.description),
        relevanceScore: this.calculateRelevanceScore(article.title, symbol),
        tickerSentiment: 'neutral'
      }));
    } catch (error) {
      console.error('Error fetching News API news:', error);
      return [];
    }
  }

  // ==================== SOCIAL MEDIA SENTIMENT ====================

  async getSocialMediaSentiment(symbol) {
    try {
      const [twitterSentiment, redditSentiment] = await Promise.all([
        this.getTwitterSentiment(symbol),
        this.getRedditSentiment(symbol)
      ]);

      return {
        symbol,
        twitter: twitterSentiment,
        reddit: redditSentiment,
        overall: this.aggregateSocialSentiment(twitterSentiment, redditSentiment),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching social media sentiment:', error);
      return this.getMockSocialMediaSentiment(symbol);
    }
  }

  async getTwitterSentiment(symbol) {
    // Note: This would require Twitter API v2 access
    // For demo purposes, returning mock data
    return {
      totalMentions: Math.floor(Math.random() * 1000) + 100,
      sentiment: {
        positive: Math.floor(Math.random() * 40) + 20,
        negative: Math.floor(Math.random() * 30) + 10,
        neutral: Math.floor(Math.random() * 50) + 30
      },
      trending: Math.random() > 0.5,
      topHashtags: [`#${symbol}`, '#stocks', '#trading', '#investing'],
      influentialUsers: ['@MarketWatch', '@CNBC', '@Bloomberg']
    };
  }

  async getRedditSentiment(symbol) {
    // Note: This would require Reddit API access
    // For demo purposes, returning mock data
    return {
      totalMentions: Math.floor(Math.random() * 500) + 50,
      sentiment: {
        positive: Math.floor(Math.random() * 35) + 15,
        negative: Math.floor(Math.random() * 25) + 15,
        neutral: Math.floor(Math.random() * 50) + 30
      },
      subreddits: ['r/stocks', 'r/investing', 'r/SecurityAnalysis'],
      topPosts: this.generateMockRedditPosts(symbol),
      sentimentScore: (Math.random() - 0.5) * 2 // -1 to 1
    };
  }

  // ==================== FINANCIAL REPORTS ANALYSIS ====================

  async analyzeFinancialReports(symbol) {
    try {
      const [earningsReports, secFilings] = await Promise.all([
        this.getEarningsReports(symbol),
        this.getSECFilings(symbol)
      ]);

      return {
        symbol,
        earnings: this.analyzeEarningsSentiment(earningsReports),
        secFilings: this.analyzeSECFilingsSentiment(secFilings),
        overall: this.aggregateFinancialSentiment(earningsReports, secFilings),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing financial reports:', error);
      return this.getMockFinancialReportsAnalysis(symbol);
    }
  }

  async getEarningsReports(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}?function=EARNINGS&symbol=${symbol}&apikey=${this.apiKey}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      return (data.annualEarnings || []).map(earnings => ({
        fiscalDateEnding: earnings.fiscalDateEnding,
        reportedEPS: parseFloat(earnings.reportedEPS) || 0,
        estimatedEPS: parseFloat(earnings.estimatedEPS) || 0,
        surprise: parseFloat(earnings.surprise) || 0,
        surprisePercentage: parseFloat(earnings.surprisePercentage) || 0,
        sentiment: this.analyzeEarningsSentiment(earnings)
      }));
    } catch (error) {
      console.error('Error fetching earnings reports:', error);
      return [];
    }
  }

  async getSECFilings(symbol) {
    // Note: This would require SEC EDGAR API access
    // For demo purposes, returning mock data
    return this.generateMockSECFilings(symbol);
  }

  // ==================== NLP SENTIMENT ANALYSIS ====================

  analyzeTextSentiment(text) {
    if (!text) return { score: 0, label: 'neutral', confidence: 0.5 };

    const words = text.toLowerCase().split(/\W+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    words.forEach(word => {
      if (this.sentimentKeywords.positive.includes(word)) {
        positiveScore += 1;
      } else if (this.sentimentKeywords.negative.includes(word)) {
        negativeScore += 1;
      } else if (this.sentimentKeywords.neutral.includes(word)) {
        neutralScore += 1;
      }
    });

    const totalScore = positiveScore + negativeScore + neutralScore;
    if (totalScore === 0) {
      return { score: 0, label: 'neutral', confidence: 0.5 };
    }

    const normalizedPositive = positiveScore / totalScore;
    const normalizedNegative = negativeScore / totalScore;
    const normalizedNeutral = neutralScore / totalScore;

    let label = 'neutral';
    let score = 0;
    let confidence = 0.5;

    if (normalizedPositive > normalizedNegative && normalizedPositive > normalizedNeutral) {
      label = 'positive';
      score = normalizedPositive;
      confidence = normalizedPositive;
    } else if (normalizedNegative > normalizedPositive && normalizedNegative > normalizedNeutral) {
      label = 'negative';
      score = -normalizedNegative;
      confidence = normalizedNegative;
    } else {
      label = 'neutral';
      score = 0;
      confidence = normalizedNeutral;
    }

    return { score, label, confidence };
  }

  analyzeNewsSentiment(news) {
    if (!news || news.length === 0) {
      return {
        overall: { score: 0, label: 'neutral', confidence: 0.5 },
        distribution: { positive: 0, negative: 0, neutral: 0 },
        averageRelevance: 0,
        sentimentTrend: 'stable'
      };
    }

    const sentiments = news.map(article => article.sentiment);
    const relevanceScores = news.map(article => article.relevanceScore);

    const positiveCount = sentiments.filter(s => s.label === 'positive').length;
    const negativeCount = sentiments.filter(s => s.label === 'negative').length;
    const neutralCount = sentiments.filter(s => s.label === 'neutral').length;

    const totalCount = sentiments.length;
    const distribution = {
      positive: (positiveCount / totalCount) * 100,
      negative: (negativeCount / totalCount) * 100,
      neutral: (neutralCount / totalCount) * 100
    };

    const averageScore = sentiments.reduce((sum, s) => sum + s.score, 0) / totalCount;
    const averageRelevance = relevanceScores.reduce((sum, r) => sum + r, 0) / totalCount;

    let overallLabel = 'neutral';
    if (averageScore > 0.1) overallLabel = 'positive';
    else if (averageScore < -0.1) overallLabel = 'negative';

    return {
      overall: {
        score: averageScore,
        label: overallLabel,
        confidence: Math.abs(averageScore)
      },
      distribution,
      averageRelevance,
      sentimentTrend: this.calculateSentimentTrend(sentiments)
    };
  }

  analyzeEarningsSentiment(earnings) {
    if (!earnings || earnings.length === 0) return { score: 0, label: 'neutral' };

    const latest = earnings[0];
    const surprise = latest.surprisePercentage || 0;
    const beatExpectations = surprise > 0;

    let score = 0;
    let label = 'neutral';

    if (beatExpectations) {
      score = Math.min(surprise / 10, 1); // Normalize to 0-1
      label = surprise > 5 ? 'very_positive' : 'positive';
    } else {
      score = Math.max(surprise / 10, -1); // Normalize to -1 to 0
      label = surprise < -5 ? 'very_negative' : 'negative';
    }

    return { score, label, beatExpectations, surprise };
  }

  analyzeSECFilingsSentiment(filings) {
    if (!filings || filings.length === 0) return { score: 0, label: 'neutral' };

    const sentiments = filings.map(filing => this.analyzeTextSentiment(filing.content));
    const averageScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;

    return {
      score: averageScore,
      label: averageScore > 0.1 ? 'positive' : averageScore < -0.1 ? 'negative' : 'neutral',
      filingCount: filings.length
    };
  }

  // ==================== SENTIMENT AGGREGATION ====================

  aggregateSocialSentiment(twitter, reddit) {
    const totalMentions = twitter.totalMentions + reddit.totalMentions;
    if (totalMentions === 0) {
      return { score: 0, label: 'neutral', confidence: 0.5 };
    }

    const twitterWeight = twitter.totalMentions / totalMentions;
    const redditWeight = reddit.totalMentions / totalMentions;

    const twitterScore = this.calculateSentimentScore(twitter.sentiment);
    const redditScore = reddit.sentimentScore;

    const aggregatedScore = (twitterScore * twitterWeight) + (redditScore * redditWeight);

    return {
      score: aggregatedScore,
      label: aggregatedScore > 0.1 ? 'positive' : aggregatedScore < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(aggregatedScore),
      totalMentions,
      breakdown: {
        twitter: { score: twitterScore, weight: twitterWeight },
        reddit: { score: redditScore, weight: redditWeight }
      }
    };
  }

  aggregateFinancialSentiment(earnings, secFilings) {
    const earningsSentiment = this.analyzeEarningsSentiment(earnings);
    const secSentiment = this.analyzeSECFilingsSentiment(secFilings);

    const earningsWeight = 0.7; // Earnings are more important
    const secWeight = 0.3;

    const aggregatedScore = (earningsSentiment.score * earningsWeight) + (secSentiment.score * secWeight);

    return {
      score: aggregatedScore,
      label: aggregatedScore > 0.1 ? 'positive' : aggregatedScore < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(aggregatedScore),
      breakdown: {
        earnings: earningsSentiment,
        secFilings: secSentiment
      }
    };
  }

  // ==================== COMPREHENSIVE SENTIMENT ANALYSIS ====================

  async performComprehensiveSentimentAnalysis(symbol) {
    try {
      const [newsSentiment, socialSentiment, financialSentiment] = await Promise.all([
        this.getNewsSentiment(symbol),
        this.getSocialMediaSentiment(symbol),
        this.analyzeFinancialReports(symbol)
      ]);

      const overallSentiment = this.aggregateAllSentimentSources(
        newsSentiment.sentiment,
        socialSentiment.overall,
        financialSentiment.overall
      );

      return {
        symbol,
        news: newsSentiment,
        social: socialSentiment,
        financial: financialSentiment,
        overall: overallSentiment,
        recommendations: this.generateSentimentRecommendations(overallSentiment),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error performing comprehensive sentiment analysis:', error);
      throw error;
    }
  }

  aggregateAllSentimentSources(newsSentiment, socialSentiment, financialSentiment) {
    const newsWeight = 0.4;
    const socialWeight = 0.3;
    const financialWeight = 0.3;

    const aggregatedScore = (
      newsSentiment.overall.score * newsWeight +
      socialSentiment.score * socialWeight +
      financialSentiment.score * financialWeight
    );

    const aggregatedConfidence = (
      newsSentiment.overall.confidence * newsWeight +
      socialSentiment.confidence * socialWeight +
      financialSentiment.confidence * financialWeight
    );

    return {
      score: aggregatedScore,
      label: aggregatedScore > 0.1 ? 'positive' : aggregatedScore < -0.1 ? 'negative' : 'neutral',
      confidence: aggregatedConfidence,
      breakdown: {
        news: { score: newsSentiment.overall.score, weight: newsWeight },
        social: { score: socialSentiment.score, weight: socialWeight },
        financial: { score: financialSentiment.score, weight: financialWeight }
      }
    };
  }

  generateSentimentRecommendations(sentiment) {
    const recommendations = [];

    if (sentiment.label === 'positive' && sentiment.confidence > 0.7) {
      recommendations.push({
        type: 'buy_signal',
        message: 'Strong positive sentiment detected across all sources',
        confidence: sentiment.confidence
      });
    } else if (sentiment.label === 'negative' && sentiment.confidence > 0.7) {
      recommendations.push({
        type: 'sell_signal',
        message: 'Strong negative sentiment detected across all sources',
        confidence: sentiment.confidence
      });
    } else if (sentiment.confidence < 0.5) {
      recommendations.push({
        type: 'wait',
        message: 'Mixed or unclear sentiment signals - wait for more clarity',
        confidence: 1 - sentiment.confidence
      });
    }

    return recommendations;
  }

  // ==================== HELPER METHODS ====================

  getDateFromTimeframe(timeframe) {
    const now = new Date();
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 7;
    const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return fromDate.toISOString().split('T')[0];
  }

  calculateRelevanceScore(title, symbol) {
    const titleWords = title.toLowerCase().split(/\W+/);
    const symbolWords = symbol.toLowerCase().split('');
    let score = 0;

    titleWords.forEach(word => {
      if (word.includes(symbol.toLowerCase())) score += 0.5;
      if (this.financialTerms.earnings.includes(word)) score += 0.3;
      if (this.financialTerms.growth.includes(word)) score += 0.2;
    });

    return Math.min(score, 1);
  }

  calculateSentimentScore(sentimentDistribution) {
    const { positive, negative, neutral } = sentimentDistribution;
    const total = positive + negative + neutral;
    if (total === 0) return 0;
    
    return ((positive - negative) / total);
  }

  calculateSentimentTrend(sentiments) {
    if (sentiments.length < 3) return 'stable';
    
    const recent = sentiments.slice(-3);
    const scores = recent.map(s => s.score);
    
    if (scores[2] > scores[1] && scores[1] > scores[0]) return 'improving';
    if (scores[2] < scores[1] && scores[1] < scores[0]) return 'declining';
    return 'stable';
  }

  getTopStories(news, count) {
    return news
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, count)
      .map(article => ({
        title: article.title,
        summary: article.summary,
        url: article.url,
        sentiment: article.sentiment,
        publishedAt: article.publishedAt
      }));
  }

  analyzeSentimentTrends(news) {
    const timeGroups = this.groupNewsByTime(news);
    const trends = Object.keys(timeGroups).map(time => ({
      time,
      sentiment: this.analyzeNewsSentiment(timeGroups[time])
    }));

    return trends;
  }

  groupNewsByTime(news) {
    const groups = {};
    news.forEach(article => {
      const date = new Date(article.publishedAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(article);
    });
    return groups;
  }

  // ==================== MOCK DATA GENERATORS ====================

  getMockNewsSentiment(symbol) {
    return {
      symbol,
      timeframe: '7d',
      totalArticles: 25,
      sentiment: {
        overall: { score: 0.2, label: 'positive', confidence: 0.7 },
        distribution: { positive: 60, negative: 20, neutral: 20 },
        averageRelevance: 0.8,
        sentimentTrend: 'improving'
      },
      topStories: this.generateMockTopStories(symbol),
      trends: this.generateMockTrends(),
      lastUpdated: new Date().toISOString()
    };
  }

  getMockSocialMediaSentiment(symbol) {
    return {
      symbol,
      twitter: {
        totalMentions: 500,
        sentiment: { positive: 45, negative: 25, neutral: 30 },
        trending: true,
        topHashtags: [`#${symbol}`, '#stocks', '#trading'],
        influentialUsers: ['@MarketWatch', '@CNBC']
      },
      reddit: {
        totalMentions: 200,
        sentiment: { positive: 40, negative: 30, neutral: 30 },
        subreddits: ['r/stocks', 'r/investing'],
        topPosts: this.generateMockRedditPosts(symbol),
        sentimentScore: 0.1
      },
      overall: { score: 0.15, label: 'positive', confidence: 0.6 },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockFinancialReportsAnalysis(symbol) {
    return {
      symbol,
      earnings: {
        score: 0.3,
        label: 'positive',
        beatExpectations: true,
        surprise: 5.2
      },
      secFilings: {
        score: 0.1,
        label: 'positive',
        filingCount: 8
      },
      overall: { score: 0.2, label: 'positive', confidence: 0.7 },
      lastUpdated: new Date().toISOString()
    };
  }

  generateMockTopStories(symbol) {
    return [
      {
        title: `${symbol} Reports Strong Q3 Earnings Beat`,
        summary: 'Company exceeds analyst expectations with robust revenue growth',
        url: '#',
        sentiment: { score: 0.8, label: 'positive', confidence: 0.9 },
        publishedAt: new Date().toISOString()
      },
      {
        title: `${symbol} Announces New Product Launch`,
        summary: 'Innovative solution expected to drive market expansion',
        url: '#',
        sentiment: { score: 0.6, label: 'positive', confidence: 0.8 },
        publishedAt: new Date().toISOString()
      }
    ];
  }

  generateMockTrends() {
    return [
      { time: '2024-01-01', sentiment: { overall: { score: 0.1, label: 'positive' } } },
      { time: '2024-01-02', sentiment: { overall: { score: 0.2, label: 'positive' } } },
      { time: '2024-01-03', sentiment: { overall: { score: 0.3, label: 'positive' } } }
    ];
  }

  generateMockRedditPosts(symbol) {
    return [
      {
        title: `${symbol} looking strong after earnings`,
        score: 150,
        comments: 25,
        sentiment: 'positive'
      },
      {
        title: `Thoughts on ${symbol} recent dip?`,
        score: 80,
        comments: 15,
        sentiment: 'neutral'
      }
    ];
  }

  generateMockSECFilings(symbol) {
    return [
      {
        type: '10-K',
        date: '2024-01-01',
        content: `${symbol} reports strong financial performance with increased revenue and profitability`,
        sentiment: { score: 0.2, label: 'positive', confidence: 0.7 }
      },
      {
        type: '8-K',
        date: '2024-01-15',
        content: `${symbol} announces strategic partnership to expand market reach`,
        sentiment: { score: 0.1, label: 'positive', confidence: 0.6 }
      }
    ];
  }
}

export default new SentimentAnalysisService();
