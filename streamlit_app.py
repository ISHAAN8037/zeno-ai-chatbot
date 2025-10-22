import streamlit as st
import time
import random
from datetime import datetime
import json
import pandas as pd

# Page configuration
st.set_page_config(
    page_title="Zeno AI Chatbot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern design
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
    }
    
    .chat-message {
        padding: 1rem;
        border-radius: 1rem;
        margin: 0.5rem 0;
        max-width: 80%;
    }
    
    .user-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-left: auto;
        text-align: right;
    }
    
    .bot-message {
        background: #f8f9fa;
        color: #333;
        border: 1px solid #e9ecef;
    }
    
    .feature-card {
        background: white;
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 1rem 0;
        border-left: 4px solid #667eea;
    }
    
    .domain-selector {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        color: white;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'current_domain' not in st.session_state:
    st.session_state.current_domain = 'general'
if 'user_name' not in st.session_state:
    st.session_state.user_name = ''
if 'current_tab' not in st.session_state:
    st.session_state.current_tab = 'chat'

# Domain configurations
domains = {
    'general': {
        'name': 'General Assistant',
        'icon': '🤖',
        'description': 'General purpose AI assistant for all topics',
        'color': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    'knowledge': {
        'name': 'Universal Knowledge',
        'icon': '📚',
        'description': 'Comprehensive answers for all topics - technology, science, business, health, and more',
        'color': 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
    },
    'finance': {
        'name': 'Finance & Investment',
        'icon': '💰',
        'description': 'Financial analysis, investment advice, market insights',
        'color': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    'healthcare': {
        'name': 'Healthcare & Medical',
        'icon': '🏥',
        'description': 'Symptom analysis, medical information, health guidelines',
        'color': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    'technology': {
        'name': 'Technology & Engineering',
        'icon': '💻',
        'description': 'Software development, system design, technical troubleshooting',
        'color': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    'education': {
        'name': 'Education & Learning',
        'icon': '🎓',
        'description': 'Academic assistance, curriculum planning, learning resources',
        'color': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    }
}

# Sample responses for different domains
def get_domain_response(domain, user_message):
    # Use stock knowledge only when the query is finance-related
    if is_stock_query(user_message):
        stock_search_results = search_stock_knowledge(user_message)
        if stock_search_results:
            concept = stock_search_results[0]['concept']
            return f"""📈 **{concept['title']}**

**Definition:** {concept['definition']}

**Key Characteristics:**
{chr(10).join([f"• {char}" for char in concept['characteristics']])}

**Example:** {concept['example']}

**Strategy:** {concept['strategy']}

*This is educational information only, not financial advice. Please consult with a financial advisor for personalized guidance.*"""

    # Enhanced specific responses for common questions (intent-first, domain-agnostic)
    user_lower = user_message.lower()

    # Global topic detection (always answer specifically regardless of domain)
    if any(k in user_lower for k in [' what is python', 'python ', 'python?','python']) and 'cpython' not in user_lower:
        return """🐍 **Python Programming Language**

**Definition:** Python is a high-level, interpreted programming language known for simplicity and readability.

**Key Characteristics:**
• Easy syntax • Vast libraries • Cross-platform • Great for AI/data/web/automation

**Example:** Used by Google, Netflix, Instagram for data, web, ML.

**Getting started:** Install Python 3.10+, learn basics, then libraries like NumPy/Pandas/Django/Flask."""

    if any(k in user_lower for k in [' what is javascript', 'javascript', ' js ']):
        return """🟨 **JavaScript**

JavaScript is the language of the web used to make pages interactive. Runs in browsers and on servers via Node.js. Learn DOM, async/await, then a framework like React."""

    if 'react' in user_lower:
        return """⚛️ **React**

React is a JavaScript library for building user interfaces using reusable components and a virtual DOM. Learn components, props, state, hooks (useState/useEffect), then routing and state management. Used by Facebook, Instagram, Netflix."""

    if 'html' in user_lower:
        return """🌐 **HTML**

Markup language that structures web pages using elements like <div>, <p>, <a>, <img>. Combine with CSS and JavaScript for complete websites."""

    if 'css' in user_lower and 'scss' not in user_lower:
        return """🎨 **CSS**

Stylesheet language for presentation: layout (Flexbox/Grid), colors, spacing, responsive design, animations. Try Tailwind or Bootstrap for faster UI."""

    if 'sql' in user_lower or 'database' in user_lower:
        return """🗄️ **Databases & SQL**

Relational databases store structured data in tables; SQL queries data (SELECT/INSERT/UPDATE/DELETE, JOINs). Popular: PostgreSQL, MySQL. NoSQL (MongoDB) for documents."""
    
    # Technology domain specific responses
    if domain == 'technology':
        if 'python' in user_lower:
            return """🐍 **Python Programming Language**

**Definition:** Python is a high-level, interpreted programming language known for its simplicity and readability.

**Key Characteristics:**
• Easy-to-learn syntax
• Versatile applications (web, data science, AI, automation)
• Large standard library
• Cross-platform compatibility
• Strong community support

**Example:** Used by companies like Google, Netflix, Instagram, and Spotify for web development, data analysis, and machine learning.

**Strategy:** Start with basic syntax, practice with projects, explore libraries like NumPy, Pandas, Django, or Flask based on your interests."""
        
        elif 'javascript' in user_lower:
            return """🟨 **JavaScript Programming Language**

**Definition:** JavaScript is a dynamic programming language primarily used for web development and creating interactive web pages.

**Key Characteristics:**
• Runs in web browsers
• Dynamic typing
• Event-driven programming
• Asynchronous capabilities
• Extensive ecosystem (Node.js, React, Vue, Angular)

**Example:** Powers interactive features on websites like Google Maps, Facebook, and Netflix's user interface.

**Strategy:** Learn HTML/CSS first, then JavaScript fundamentals, followed by frameworks like React or Vue for modern web development."""
        
        elif 'react' in user_lower:
            return """⚛️ **React JavaScript Library**

**Definition:** React is a JavaScript library for building user interfaces, particularly single-page applications.

**Key Characteristics:**
• Component-based architecture
• Virtual DOM for performance
• JSX syntax
• Unidirectional data flow
• Rich ecosystem

**Example:** Used by Facebook, Instagram, Netflix, Airbnb, and WhatsApp for their web interfaces.

**Strategy:** Learn JavaScript first, then React fundamentals, practice with hooks, and explore the React ecosystem (Redux, Next.js)."""
        
        elif 'html' in user_lower:
            return """🌐 **HTML (HyperText Markup Language)**

**Definition:** HTML is the standard markup language used to create and structure web pages.

**Key Characteristics:**
• Markup language (not programming)
• Uses tags to structure content
• Works with CSS and JavaScript
• Platform independent
• Essential for web development

**Example:** Every website you visit uses HTML to structure text, images, links, and other content.

**Strategy:** Start with basic HTML tags, learn semantic HTML, practice with forms and tables, then combine with CSS for styling."""
        
        elif 'css' in user_lower:
            return """🎨 **CSS (Cascading Style Sheets)**

**Definition:** CSS is a stylesheet language used to describe the presentation of HTML documents.

**Key Characteristics:**
• Separates content from presentation
• Cascading rules
• Responsive design capabilities
• Animation and transitions
• Works with HTML and JavaScript

**Example:** Controls colors, fonts, layouts, spacing, and animations on websites.

**Strategy:** Learn CSS basics, understand selectors and properties, practice responsive design, explore CSS frameworks like Bootstrap or Tailwind."""
        
        elif 'database' in user_lower or 'sql' in user_lower:
            return """🗄️ **Database & SQL**

**Definition:** A database is an organized collection of data, and SQL (Structured Query Language) is used to manage and query databases.

**Key Characteristics:**
• Data storage and retrieval
• ACID properties (Atomicity, Consistency, Isolation, Durability)
• Relational and NoSQL options
• Query optimization
• Data integrity

**Example:** Banks use databases to store customer accounts, transactions, and personal information securely.

**Strategy:** Learn SQL fundamentals, practice with different database systems (MySQL, PostgreSQL), understand normalization, and explore NoSQL databases like MongoDB."""
    
    # General domain specific responses
    elif domain == 'general':
        if 'python' in user_lower:
            return """🐍 **Python - A Versatile Programming Language**

**What is Python?**
Python is a high-level, interpreted programming language that emphasizes code readability and simplicity. It's one of the most popular programming languages today.

**Why Python is Popular:**
• Easy to learn and read
• Versatile applications
• Strong community support
• Extensive libraries
• Cross-platform compatibility

**Common Uses:**
• Web development (Django, Flask)
• Data science and analytics
• Machine learning and AI
• Automation and scripting
• Game development

**Getting Started:**
1. Install Python from python.org
2. Learn basic syntax and data types
3. Practice with simple projects
4. Explore libraries based on your interests

Python is an excellent choice for beginners and professionals alike!"""
        
        elif 'artificial intelligence' in user_lower or 'ai' in user_lower:
            return """🤖 **Artificial Intelligence (AI)**

**Definition:** AI refers to computer systems that can perform tasks typically requiring human intelligence, such as learning, reasoning, and problem-solving.

**Types of AI:**
• **Narrow AI:** Specialized tasks (Siri, Google Translate)
• **General AI:** Human-level intelligence (still theoretical)
• **Machine Learning:** Learning from data
• **Deep Learning:** Neural networks

**Applications:**
• Virtual assistants (Siri, Alexa)
• Recommendation systems (Netflix, Amazon)
• Autonomous vehicles
• Medical diagnosis
• Financial trading

**Getting Started:**
1. Learn Python programming
2. Study mathematics (statistics, linear algebra)
3. Explore machine learning libraries (scikit-learn, TensorFlow)
4. Practice with real datasets

AI is transforming industries and creating new opportunities!"""
        
        elif 'programming' in user_lower:
            return """💻 **Programming - The Art of Problem Solving**

**What is Programming?**
Programming is the process of creating instructions for computers to follow, enabling us to build software, websites, apps, and automate tasks.

**Why Learn Programming?**
• Problem-solving skills
• Career opportunities
• Creative expression
• Automation capabilities
• Understanding technology

**Popular Programming Languages:**
• **Python:** Beginner-friendly, versatile
• **JavaScript:** Web development
• **Java:** Enterprise applications
• **C++:** System programming
• **Swift:** iOS development

**Learning Path:**
1. Choose a language (Python recommended for beginners)
2. Learn basic syntax and concepts
3. Practice with small projects
4. Build a portfolio
5. Contribute to open source

Programming opens doors to endless possibilities!"""

    # Finance domain specific responses
    elif domain == 'finance':
        if 'investing' in user_lower or 'investment' in user_lower:
            return """💰 **Investing Fundamentals**

**Definition:** Investing is the act of allocating money or resources with the expectation of generating income or profit over time.

**Key Principles:**
• Start early to benefit from compound interest
• Diversify your portfolio
• Understand risk vs. return
• Invest for the long term
• Do your research

**Investment Options:**
• **Stocks:** Ownership in companies
• **Bonds:** Lending money to governments/corporations
• **Mutual Funds:** Diversified portfolios
• **ETFs:** Exchange-traded funds
• **Real Estate:** Property investment

**Getting Started:**
1. Set financial goals
2. Build an emergency fund
3. Start with low-cost index funds
4. Learn about different asset classes
5. Consider your risk tolerance

*Remember: This is educational information, not financial advice. Consult a financial advisor for personalized guidance.*"""
        
        elif 'budget' in user_lower:
            return """📊 **Budgeting - Your Financial Foundation**

**Definition:** A budget is a plan for managing your income and expenses to achieve financial goals.

**Benefits of Budgeting:**
• Control over your money
• Identify spending patterns
• Save for goals
• Reduce financial stress
• Build wealth over time

**Budgeting Methods:**
• **50/30/20 Rule:** 50% needs, 30% wants, 20% savings
• **Zero-Based Budget:** Every dollar assigned a purpose
• **Envelope Method:** Cash-based spending
• **Percentage Budget:** Income-based allocations

**Steps to Create a Budget:**
1. Calculate total monthly income
2. List all expenses
3. Categorize expenses (needs vs. wants)
4. Set savings goals
5. Track and adjust regularly

**Tools:** Use apps like Mint, YNAB, or Excel spreadsheets to track your budget.

*This is educational information, not financial advice.*"""
        
        elif 'compound interest' in user_lower:
            return """📈 **Compound Interest - The Eighth Wonder**

**Definition:** Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods.

**How It Works:**
• You earn interest on your original investment
• You also earn interest on previously earned interest
• The effect accelerates over time
• Time is your greatest ally

**Example:**
• Invest $1,000 at 7% annual return
• Year 1: $1,070
• Year 10: $1,967
• Year 30: $7,612

**Key Factors:**
• **Principal:** Initial amount invested
• **Interest Rate:** Annual return percentage
• **Time:** Length of investment period
• **Frequency:** How often interest compounds

**Maximizing Compound Interest:**
1. Start investing early
2. Invest regularly
3. Reinvest dividends
4. Avoid withdrawing early
5. Choose appropriate investments

*This is educational information, not financial advice.*"""

    # Healthcare domain specific responses
    elif domain == 'healthcare':
        if 'healthy eating' in user_lower or 'nutrition' in user_lower:
            return """🥗 **Healthy Eating Habits**

**Definition:** Healthy eating involves consuming a variety of nutritious foods in appropriate portions to maintain good health and prevent disease.

**Key Principles:**
• Eat a variety of foods
• Focus on whole foods
• Control portion sizes
• Limit processed foods
• Stay hydrated

**Essential Nutrients:**
• **Proteins:** Build and repair tissues
• **Carbohydrates:** Provide energy
• **Fats:** Support cell function
• **Vitamins:** Essential for health
• **Minerals:** Support body functions

**Healthy Eating Tips:**
• Fill half your plate with fruits and vegetables
• Choose whole grains
• Include lean proteins
• Limit added sugars and sodium
• Eat regular meals

*This is general health information, not medical advice. Consult healthcare professionals for personalized guidance.*"""
        
        elif 'exercise' in user_lower or 'fitness' in user_lower:
            return """💪 **Exercise and Physical Activity**

**Definition:** Exercise is physical activity that improves or maintains physical fitness and overall health.

**Types of Exercise:**
• **Cardio:** Heart and lung health (running, swimming)
• **Strength:** Muscle building (weightlifting, resistance)
• **Flexibility:** Range of motion (yoga, stretching)
• **Balance:** Stability and coordination

**Benefits:**
• Improved cardiovascular health
• Stronger muscles and bones
• Better mental health
• Weight management
• Increased energy

**Getting Started:**
1. Choose activities you enjoy
2. Start slowly and gradually increase
3. Aim for 150 minutes of moderate activity weekly
4. Include strength training twice weekly
5. Stay consistent

*This is general health information, not medical advice. Consult healthcare professionals before starting new exercise programs.*"""

    # Education domain specific responses
    elif domain == 'education':
        if 'study habits' in user_lower or 'studying' in user_lower:
            return """📚 **Effective Study Habits**

**Definition:** Study habits are consistent practices and techniques that help you learn and retain information effectively.

**Key Study Strategies:**
• **Active Learning:** Engage with material actively
• **Spaced Repetition:** Review material over time
• **Practice Testing:** Test yourself regularly
• **Elaboration:** Explain concepts in your own words
• **Interleaving:** Mix different topics

**Effective Study Environment:**
• Quiet, well-lit space
• Minimal distractions
• Comfortable seating
• All materials ready
• Regular breaks

**Study Techniques:**
• **Pomodoro Technique:** 25-minute focused sessions
• **SQ3R Method:** Survey, Question, Read, Recite, Review
• **Mind Mapping:** Visual organization of information
• **Flashcards:** Active recall practice

**Tips for Success:**
1. Set specific goals
2. Create a study schedule
3. Take regular breaks
4. Get adequate sleep
5. Stay organized

Good study habits are the foundation of academic success!"""

    # Use universal knowledge base as fallback for any unanswered questions
    universal_response = get_universal_knowledge(user_message)
    if universal_response:
        return universal_response
    
    # Final fallback responses
    responses = {
        'general': [
            f"I understand you're asking about: {user_message}. As a general AI assistant, I can help with a wide range of topics. Could you be more specific about what you'd like to know?",
            f"That's an interesting question about {user_message}. Let me provide you with some general information and guidance on this topic.",
            f"Thanks for your question regarding {user_message}. I'm here to help with general information and support across various subjects."
        ],
        'knowledge': [
            f"I understand you're asking about: {user_message}. Let me provide you with comprehensive information about this topic.",
            f"That's a great question about {user_message}. I can share detailed knowledge and insights on this subject.",
            f"Regarding {user_message}, I can provide you with thorough explanations and practical guidance."
        ],
        'finance': [
            f"From a financial perspective regarding {user_message}, I should mention that this is not professional financial advice. However, I can provide general information about financial concepts and market trends.",
            f"Regarding {user_message} in the financial context, I can share general market insights and educational information about investment principles.",
            f"Your question about {user_message} touches on important financial topics. I can provide educational content about financial planning and market analysis."
        ],
        'healthcare': [
            f"Regarding {user_message} from a healthcare perspective, I must emphasize that this is not medical advice. I can provide general health information and suggest consulting healthcare professionals.",
            f"Your question about {user_message} relates to health topics. I can share general wellness information, but please consult medical professionals for specific health concerns.",
            f"From a healthcare standpoint regarding {user_message}, I can provide educational health information while strongly recommending professional medical consultation."
        ],
        'technology': [
            f"From a technical perspective on {user_message}, I can help with software development concepts, system architecture, and troubleshooting approaches.",
            f"Regarding {user_message} in technology, I can provide guidance on programming, system design, and technical best practices.",
            f"Your question about {user_message} involves technical concepts. I can share information about software development, algorithms, and system architecture."
        ],
        'education': [
            f"From an educational standpoint regarding {user_message}, I can help with learning strategies, academic concepts, and study techniques.",
            f"Regarding {user_message} in education, I can provide information about learning methodologies, curriculum development, and academic support.",
            f"Your question about {user_message} relates to educational topics. I can share information about teaching methods, learning theories, and academic resources."
        ]
    }
    
    domain_responses = responses.get(domain, responses['general'])
    return random.choice(domain_responses)

# Stock Market Knowledge Base
def get_stock_knowledge_base():
    return {
        'basic_concepts': {
            'title': 'Basic Concepts',
            'concepts': [
                {
                    'title': 'Bull Market',
                    'definition': 'A financial market condition where prices are rising or expected to rise.',
                    'characteristics': ['Optimistic investor sentiment', 'Economic growth', 'High trading volume', 'Rising stock prices'],
                    'example': 'The S&P 500 rising from 2,000 to 3,000 over 2 years',
                    'strategy': 'Consider growth stocks and momentum strategies during bull markets'
                },
                {
                    'title': 'Bear Market',
                    'definition': 'A market condition where prices are falling or expected to fall.',
                    'characteristics': ['Pessimistic sentiment', 'Economic decline', 'Low trading volume', 'Falling stock prices'],
                    'example': 'Market dropping 20% or more from recent highs',
                    'strategy': 'Focus on defensive stocks, bonds, and value investments'
                },
                {
                    'title': 'Market Cycle',
                    'definition': 'The recurring pattern of market phases from expansion to contraction.',
                    'characteristics': ['Bull market', 'Market peak', 'Bear market', 'Market bottom'],
                    'example': '2008-2020 cycle: Bear market (2008-2009), Bull market (2009-2020)',
                    'strategy': 'Diversify across different asset classes and rebalance regularly'
                }
            ]
        },
        'technical_analysis': {
            'title': 'Technical Analysis',
            'concepts': [
                {
                    'title': 'Support Level',
                    'definition': 'A price level where a stock tends to find buying interest and bounce back up.',
                    'characteristics': ['Historical price floor', 'High trading volume', 'Psychological barrier', 'Repeated bounces'],
                    'example': 'Apple stock bouncing off $150 multiple times',
                    'strategy': 'Consider buying near support levels with proper risk management'
                },
                {
                    'title': 'Resistance Level',
                    'definition': 'A price level where a stock tends to find selling pressure and reverse down.',
                    'characteristics': ['Historical price ceiling', 'High trading volume', 'Psychological barrier', 'Repeated rejections'],
                    'example': 'Tesla struggling to break above $300',
                    'strategy': 'Consider selling or taking profits near resistance levels'
                },
                {
                    'title': 'Trend Line',
                    'definition': 'A line drawn connecting price points to identify market direction.',
                    'characteristics': ['Uptrend: higher highs and higher lows', 'Downtrend: lower highs and lower lows', 'Sideways: horizontal movement'],
                    'example': 'Drawing a line connecting the lows of an uptrending stock',
                    'strategy': 'Trade in the direction of the trend with proper stop losses'
                }
            ]
        },
        'technical_indicators': {
            'title': 'Technical Indicators',
            'concepts': [
                {
                    'title': 'RSI (Relative Strength Index)',
                    'definition': 'A momentum oscillator that measures the speed and change of price movements.',
                    'characteristics': ['Range: 0-100', 'Overbought: >70', 'Oversold: <30', 'Momentum indicator'],
                    'example': 'RSI of 80 indicates overbought conditions',
                    'strategy': 'Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)'
                },
                {
                    'title': 'MACD (Moving Average Convergence Divergence)',
                    'definition': 'A trend-following momentum indicator showing relationship between two moving averages.',
                    'characteristics': ['MACD line', 'Signal line', 'Histogram', 'Zero line crossovers'],
                    'example': 'MACD line crossing above signal line indicates bullish momentum',
                    'strategy': 'Buy on bullish crossover, sell on bearish crossover'
                },
                {
                    'title': 'Bollinger Bands',
                    'definition': 'A volatility indicator consisting of a moving average and two standard deviation bands.',
                    'characteristics': ['Upper band', 'Middle band (SMA)', 'Lower band', 'Volatility expansion/contraction'],
                    'example': 'Price touching upper band suggests overbought conditions',
                    'strategy': 'Buy when price touches lower band, sell when touching upper band'
                }
            ]
        },
        'fundamental_analysis': {
            'title': 'Fundamental Analysis',
            'concepts': [
                {
                    'title': 'P/E Ratio (Price-to-Earnings)',
                    'definition': 'The ratio of a company\'s stock price to its earnings per share.',
                    'characteristics': ['Valuation metric', 'Lower = potentially undervalued', 'Higher = potentially overvalued', 'Industry comparison important'],
                    'example': 'Stock trading at $100 with EPS of $5 has P/E of 20',
                    'strategy': 'Compare P/E ratios within the same industry for relative valuation'
                },
                {
                    'title': 'EPS (Earnings Per Share)',
                    'definition': 'A company\'s profit divided by the number of outstanding shares.',
                    'characteristics': ['Profitability measure', 'Growth indicator', 'Dividend capacity', 'Share dilution impact'],
                    'example': 'Company with $1M profit and 100K shares has EPS of $10',
                    'strategy': 'Look for consistent EPS growth over time'
                },
                {
                    'title': 'ROE (Return on Equity)',
                    'definition': 'A measure of how efficiently a company uses shareholders\' equity to generate profits.',
                    'characteristics': ['Efficiency metric', 'Higher = better', 'Industry benchmark', 'Sustainable growth indicator'],
                    'example': 'ROE of 15% means company generates $15 profit per $100 equity',
                    'strategy': 'Prefer companies with ROE above industry average'
                }
            ]
        },
        'trading_strategies': {
            'title': 'Trading Strategies',
            'concepts': [
                {
                    'title': 'Value Investing',
                    'definition': 'Strategy of buying stocks that appear undervalued based on fundamental analysis.',
                    'characteristics': ['Long-term approach', 'Fundamental analysis', 'Margin of safety', 'Contrarian mindset'],
                    'example': 'Buying a stock trading below its intrinsic value',
                    'strategy': 'Focus on companies with strong fundamentals trading at discounts'
                },
                {
                    'title': 'Growth Investing',
                    'definition': 'Strategy focused on companies with above-average growth potential.',
                    'characteristics': ['High growth rates', 'Future potential', 'Higher valuations', 'Technology focus'],
                    'example': 'Investing in emerging tech companies with rapid revenue growth',
                    'strategy': 'Look for companies with consistent revenue and earnings growth'
                },
                {
                    'title': 'Momentum Trading',
                    'definition': 'Strategy based on following trends and price momentum.',
                    'characteristics': ['Trend following', 'Technical analysis', 'Short to medium term', 'Volume confirmation'],
                    'example': 'Buying stocks that are breaking out to new highs',
                    'strategy': 'Enter positions in the direction of strong momentum with tight stops'
                }
            ]
        },
        'risk_management': {
            'title': 'Risk Management',
            'concepts': [
                {
                    'title': 'Diversification',
                    'definition': 'Strategy of spreading investments across different assets to reduce risk.',
                    'characteristics': ['Asset allocation', 'Sector diversification', 'Geographic spread', 'Risk reduction'],
                    'example': 'Portfolio with stocks, bonds, real estate, and commodities',
                    'strategy': 'Allocate across different asset classes and sectors'
                },
                {
                    'title': 'Stop Loss',
                    'definition': 'An order to sell a security when it reaches a predetermined price.',
                    'characteristics': ['Risk control', 'Emotional discipline', 'Capital preservation', 'Automated execution'],
                    'example': 'Setting stop loss at 10% below purchase price',
                    'strategy': 'Always use stop losses to limit downside risk'
                },
                {
                    'title': 'Position Sizing',
                    'definition': 'Determining how much capital to allocate to each investment.',
                    'characteristics': ['Risk management', 'Portfolio balance', 'Volatility consideration', 'Correlation analysis'],
                    'example': 'Limiting single stock to 5% of total portfolio',
                    'strategy': 'Size positions based on risk tolerance and volatility'
                }
            ]
        },
        'market_psychology': {
            'title': 'Market Psychology',
            'concepts': [
                {
                    'title': 'Fear and Greed Index',
                    'definition': 'A sentiment indicator measuring market emotions from extreme fear to extreme greed.',
                    'characteristics': ['Sentiment gauge', 'Contrarian indicator', '0-100 scale', 'Market timing tool'],
                    'example': 'Index at 20 indicates extreme fear, potential buying opportunity',
                    'strategy': 'Buy when fear is extreme, be cautious when greed is high'
                },
                {
                    'title': 'Herd Mentality',
                    'definition': 'The tendency of investors to follow the crowd rather than independent analysis.',
                    'characteristics': ['Group behavior', 'Emotional decisions', 'Market bubbles', 'Contrarian opportunities'],
                    'example': 'Everyone buying tech stocks during dot-com bubble',
                    'strategy': 'Avoid following the herd; maintain independent analysis'
                }
            ]
        },
        'economic_indicators': {
            'title': 'Economic Indicators',
            'concepts': [
                {
                    'title': 'GDP (Gross Domestic Product)',
                    'definition': 'The total value of goods and services produced in a country.',
                    'characteristics': ['Economic health', 'Growth measure', 'Quarterly reports', 'Market impact'],
                    'example': 'GDP growth of 3% indicates healthy economic expansion',
                    'strategy': 'Strong GDP growth typically supports stock market performance'
                },
                {
                    'title': 'Inflation Rate',
                    'definition': 'The rate at which prices for goods and services increase over time.',
                    'characteristics': ['Purchasing power', 'Central bank policy', 'Interest rates', 'Consumer impact'],
                    'example': '2% inflation means prices increase 2% annually',
                    'strategy': 'Moderate inflation (2-3%) is generally positive for markets'
                },
                {
                    'title': 'Interest Rates',
                    'definition': 'The cost of borrowing money, set by central banks.',
                    'characteristics': ['Monetary policy tool', 'Economic stimulus', 'Bond yields', 'Stock valuations'],
                    'example': 'Fed raising rates from 0.25% to 2.5%',
                    'strategy': 'Rising rates typically pressure stock valuations'
                }
            ]
        }
    }

def search_stock_knowledge(query):
    """Search through stock market knowledge base"""
    knowledge_base = get_stock_knowledge_base()
    results = []
    
    # Basic stopwords to avoid noisy matches
    stopwords = {"what","is","are","the","a","an","in","of","to","for","and","on","with","about","explain","define"}
    tokens = [t for t in query.lower().split() if len(t) >= 3 and t not in stopwords]
    if not tokens:
        return []

    query_lower = " ".join(tokens)
    
    for category, data in knowledge_base.items():
        for concept in data['concepts']:
            # Search in title, definition, and characteristics
            searchable_text = f"{concept['title']} {concept['definition']} {' '.join(concept['characteristics'])}".lower()
            
            matches = [k for k in tokens if k in searchable_text]
            if matches:
                results.append({
                    'concept': concept,
                    'category': data['title'],
                    'relevance': len(matches)
                })
    
    # Sort by relevance
    results.sort(key=lambda x: x['relevance'], reverse=True)
    return results[:3]  # Return top 3 results

# Heuristic to decide if a user query is about stocks/markets
def is_stock_query(text: str) -> bool:
    t = text.lower()
    finance_keywords = [
        'stock','stocks','share','shares','market','markets','equity','equities','portfolio','index','indexes','indices',
        'invest','investing','investment','trading','trade','trader','broker','exchange','nasdaq','nyse','nifty','sensex',
        'support','resistance','trend','breakout','rsi','macd','bollinger','sma','ema','candle','candlestick','pe ratio','p/e',
        'dividend','valuation','roe','eps','beta','var','sharpe','gdp','inflation','interest rate','yield','bond'
    ]
    return any(k in t for k in finance_keywords)

def get_daily_tip():
    """Get a random daily market tip"""
    tips = [
        "📈 **Market Tip:** Always diversify your portfolio across different sectors to reduce risk.",
        "💰 **Investment Tip:** Start investing early to benefit from compound interest over time.",
        "📊 **Analysis Tip:** Use both technical and fundamental analysis for better investment decisions.",
        "⚠️ **Risk Tip:** Never invest more than you can afford to lose.",
        "🎯 **Strategy Tip:** Have a clear investment plan and stick to it, avoiding emotional decisions.",
        "📈 **Growth Tip:** Focus on companies with strong fundamentals and consistent earnings growth.",
        "🔄 **Market Tip:** Market cycles are normal - stay disciplined during both bull and bear markets.",
        "📚 **Learning Tip:** Continuously educate yourself about market trends and investment strategies."
    ]
    return random.choice(tips)

def get_universal_knowledge(query):
    """Comprehensive knowledge base for all topics"""
    query_lower = query.lower()
    
    # Technology & Programming
    if any(k in query_lower for k in ['python', 'programming', 'code', 'software', 'development']):
        if 'python' in query_lower:
            return """🐍 **Python Programming Language**

**What is Python?**
Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991.

**Key Features:**
• Easy-to-learn syntax
• Versatile applications (web, data science, AI, automation)
• Large standard library
• Cross-platform compatibility
• Strong community support

**Common Uses:**
• Web development (Django, Flask)
• Data science and analytics (NumPy, Pandas)
• Machine learning and AI (TensorFlow, PyTorch)
• Automation and scripting
• Game development (Pygame)

**Getting Started:**
1. Install Python from python.org
2. Learn basic syntax and data types
3. Practice with simple projects
4. Explore libraries based on your interests

Python is excellent for beginners and professionals alike!"""
        
        elif 'javascript' in query_lower or 'js' in query_lower:
            return """🟨 **JavaScript Programming Language**

**What is JavaScript?**
JavaScript is a dynamic programming language primarily used for web development and creating interactive web pages.

**Key Features:**
• Runs in web browsers and servers (Node.js)
• Dynamic typing
• Event-driven programming
• Asynchronous capabilities
• Extensive ecosystem

**Common Uses:**
• Frontend web development
• Backend development (Node.js)
• Mobile app development (React Native)
• Desktop applications (Electron)
• Game development

**Learning Path:**
1. Learn HTML/CSS first
2. Master JavaScript fundamentals
3. Explore frameworks (React, Vue, Angular)
4. Learn Node.js for backend development

JavaScript powers the modern web!"""
        
        elif 'react' in query_lower:
            return """⚛️ **React JavaScript Library**

**What is React?**
React is a JavaScript library for building user interfaces, particularly single-page applications. Created by Facebook.

**Key Features:**
• Component-based architecture
• Virtual DOM for performance
• JSX syntax
• Unidirectional data flow
• Rich ecosystem

**Common Uses:**
• Web applications
• Mobile apps (React Native)
• Desktop apps (Electron)
• Interactive user interfaces

**Learning Path:**
1. Master JavaScript first
2. Learn React fundamentals
3. Practice with hooks (useState, useEffect)
4. Explore React ecosystem (Redux, Next.js)

React is used by Facebook, Instagram, Netflix, and many others!"""
        
        elif 'html' in query_lower:
            return """🌐 **HTML (HyperText Markup Language)**

**What is HTML?**
HTML is the standard markup language used to create and structure web pages.

**Key Features:**
• Markup language (not programming)
• Uses tags to structure content
• Works with CSS and JavaScript
• Platform independent
• Essential for web development

**Common Uses:**
• Website structure
• Email templates
• Documentation
• Content management

**Learning Path:**
1. Learn basic HTML tags
2. Understand semantic HTML
3. Practice with forms and tables
4. Combine with CSS for styling

HTML is the foundation of the web!"""
        
        elif 'css' in query_lower:
            return """🎨 **CSS (Cascading Style Sheets)**

**What is CSS?**
CSS is a stylesheet language used to describe the presentation of HTML documents.

**Key Features:**
• Separates content from presentation
• Cascading rules
• Responsive design capabilities
• Animation and transitions
• Works with HTML and JavaScript

**Common Uses:**
• Website styling
• Responsive design
• Animations
• Print layouts
• Theme switching

**Learning Path:**
1. Learn CSS basics
2. Master layout (Flexbox, Grid)
3. Practice responsive design
4. Explore CSS frameworks (Bootstrap, Tailwind)

CSS brings websites to life!"""
        
        elif 'database' in query_lower or 'sql' in query_lower:
            return """🗄️ **Databases & SQL**

**What are Databases?**
A database is an organized collection of data, and SQL (Structured Query Language) is used to manage and query databases.

**Key Features:**
• Data storage and retrieval
• ACID properties
• Relational and NoSQL options
• Query optimization
• Data integrity

**Common Uses:**
• Banking systems
• E-commerce platforms
• Social media
• Healthcare records
• Government systems

**Learning Path:**
1. Learn SQL fundamentals
2. Master database design
3. Practice with different systems
4. Explore NoSQL databases

Databases are the backbone of modern applications!"""
    
    # Science & Nature
    elif any(k in query_lower for k in ['science', 'physics', 'chemistry', 'biology', 'nature', 'earth', 'space']):
        if 'physics' in query_lower:
            return """🔬 **Physics**

**What is Physics?**
Physics is the natural science that studies matter, energy, and their interactions.

**Key Areas:**
• Mechanics (motion, forces)
• Thermodynamics (heat, energy)
• Electromagnetism (electricity, magnetism)
• Quantum mechanics (atomic particles)
• Relativity (space, time)

**Applications:**
• Technology development
• Medical imaging
• Space exploration
• Energy production
• Engineering

Physics explains how the universe works!"""
        
        elif 'chemistry' in query_lower:
            return """🧪 **Chemistry**

**What is Chemistry?**
Chemistry is the study of matter, its properties, composition, and reactions.

**Key Areas:**
• Organic chemistry (carbon compounds)
• Inorganic chemistry (non-carbon compounds)
• Physical chemistry (energy, kinetics)
• Analytical chemistry (measurement)
• Biochemistry (life processes)

**Applications:**
• Medicine and pharmaceuticals
• Materials science
• Environmental science
• Food science
• Industrial processes

Chemistry is central to understanding matter!"""
        
        elif 'biology' in query_lower:
            return """🧬 **Biology**

**What is Biology?**
Biology is the study of living organisms and their interactions with the environment.

**Key Areas:**
• Cell biology (cellular processes)
• Genetics (heredity, DNA)
• Evolution (species development)
• Ecology (environmental interactions)
• Physiology (body functions)

**Applications:**
• Medicine and healthcare
• Agriculture and food production
• Environmental conservation
• Biotechnology
• Forensic science

Biology helps us understand life itself!"""
    
    # Business & Economics
    elif any(k in query_lower for k in ['business', 'economics', 'marketing', 'management', 'entrepreneur']):
        if 'marketing' in query_lower:
            return """📈 **Marketing**

**What is Marketing?**
Marketing is the process of promoting and selling products or services to customers.

**Key Areas:**
• Market research
• Product development
• Pricing strategies
• Advertising and promotion
• Customer relationship management

**Digital Marketing:**
• Social media marketing
• Search engine optimization (SEO)
• Content marketing
• Email marketing
• Pay-per-click advertising

**Strategies:**
• Target audience identification
• Brand positioning
• Customer journey mapping
• Performance measurement

Effective marketing drives business success!"""
        
        elif 'management' in query_lower:
            return """👥 **Management**

**What is Management?**
Management is the process of planning, organizing, leading, and controlling resources to achieve organizational goals.

**Key Functions:**
• Planning (setting goals, strategies)
• Organizing (structuring resources)
• Leading (motivating, guiding)
• Controlling (monitoring, evaluating)

**Management Levels:**
• Top-level (strategic decisions)
• Middle-level (tactical planning)
• First-line (operational supervision)

**Skills Needed:**
• Leadership
• Communication
• Decision-making
• Problem-solving
• Time management

Good management is essential for organizational success!"""
    
    # Health & Wellness
    elif any(k in query_lower for k in ['health', 'fitness', 'nutrition', 'exercise', 'wellness', 'medical']):
        if 'nutrition' in query_lower or 'healthy eating' in query_lower:
            return """🥗 **Nutrition & Healthy Eating**

**What is Nutrition?**
Nutrition is the study of how food affects health and the process of consuming nutrients for growth and maintenance.

**Essential Nutrients:**
• Proteins (building blocks)
• Carbohydrates (energy source)
• Fats (energy storage, cell function)
• Vitamins (metabolic processes)
• Minerals (body functions)
• Water (hydration)

**Healthy Eating Principles:**
• Eat a variety of foods
• Control portion sizes
• Limit processed foods
• Stay hydrated
• Balance macronutrients

**Benefits:**
• Improved energy levels
• Better immune function
• Disease prevention
• Weight management
• Enhanced mental clarity

Good nutrition is the foundation of health!"""
        
        elif 'exercise' in query_lower or 'fitness' in query_lower:
            return """💪 **Exercise & Fitness**

**What is Exercise?**
Exercise is physical activity that improves or maintains physical fitness and overall health.

**Types of Exercise:**
• Cardiovascular (heart health)
• Strength training (muscle building)
• Flexibility (range of motion)
• Balance (stability)
• High-intensity interval training (HIIT)

**Health Benefits:**
• Improved cardiovascular health
• Stronger muscles and bones
• Better mental health
• Weight management
• Increased energy
• Better sleep

**Getting Started:**
1. Choose activities you enjoy
2. Start slowly and gradually increase
3. Aim for 150 minutes moderate activity weekly
4. Include strength training twice weekly
5. Stay consistent

Regular exercise is key to a healthy lifestyle!"""
    
    # Education & Learning
    elif any(k in query_lower for k in ['education', 'learning', 'study', 'school', 'university', 'teaching']):
        if 'study' in query_lower or 'studying' in query_lower:
            return """📚 **Study Skills & Learning**

**What are Study Skills?**
Study skills are techniques and strategies that help you learn and retain information effectively.

**Effective Study Strategies:**
• Active learning (engagement)
• Spaced repetition (review over time)
• Practice testing (self-assessment)
• Elaboration (explaining concepts)
• Interleaving (mixing topics)

**Study Environment:**
• Quiet, well-lit space
• Minimal distractions
• Comfortable seating
• All materials ready
• Regular breaks

**Study Techniques:**
• Pomodoro Technique (25-minute sessions)
• SQ3R Method (Survey, Question, Read, Recite, Review)
• Mind mapping (visual organization)
• Flashcards (active recall)

**Tips for Success:**
1. Set specific goals
2. Create a study schedule
3. Take regular breaks
4. Get adequate sleep
5. Stay organized

Good study habits lead to academic success!"""
    
    # Arts & Culture
    elif any(k in query_lower for k in ['art', 'music', 'literature', 'culture', 'history', 'philosophy']):
        if 'art' in query_lower:
            return """🎨 **Art**

**What is Art?**
Art is the expression of human creativity and imagination through various forms and media.

**Types of Art:**
• Visual arts (painting, sculpture, drawing)
• Performing arts (music, dance, theater)
• Literary arts (poetry, novels, essays)
• Digital arts (graphic design, animation)
• Applied arts (architecture, fashion)

**Art Movements:**
• Renaissance (14th-17th century)
• Impressionism (19th century)
• Modernism (early 20th century)
• Contemporary art (present)

**Benefits of Art:**
• Creative expression
• Emotional healing
• Cultural understanding
• Critical thinking
• Aesthetic appreciation

Art enriches human experience and culture!"""
        
        elif 'music' in query_lower:
            return """🎵 **Music**

**What is Music?**
Music is the art of combining sounds in a harmonious and expressive way.

**Elements of Music:**
• Melody (tune)
• Harmony (chord progressions)
• Rhythm (beat, tempo)
• Dynamics (volume)
• Timbre (tone color)

**Genres:**
• Classical
• Jazz
• Rock
• Pop
• Hip-hop
• Electronic
• Folk
• Country

**Benefits of Music:**
• Emotional expression
• Stress relief
• Cognitive development
• Social connection
• Cultural identity

Music is a universal language that connects people!"""
    
    # Mathematics
    elif any(k in query_lower for k in ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'statistics']):
        return """🔢 **Mathematics**

**What is Mathematics?**
Mathematics is the study of numbers, shapes, patterns, and logical reasoning.

**Branches of Mathematics:**
• Arithmetic (basic operations)
• Algebra (equations, variables)
• Geometry (shapes, space)
• Calculus (rates of change)
• Statistics (data analysis)
• Trigonometry (angles, triangles)

**Applications:**
• Science and engineering
• Economics and finance
• Computer science
• Medicine and healthcare
• Architecture and design

**Problem-Solving Skills:**
• Logical reasoning
• Pattern recognition
• Critical thinking
• Abstract thinking
• Analytical skills

Mathematics is the language of science and technology!"""
    
    # Psychology
    elif any(k in query_lower for k in ['psychology', 'mental health', 'behavior', 'mind', 'brain']):
        return """🧠 **Psychology**

**What is Psychology?**
Psychology is the scientific study of mind and behavior, including mental processes and human interactions.

**Branches of Psychology:**
• Clinical psychology (mental health)
• Cognitive psychology (mental processes)
• Developmental psychology (human development)
• Social psychology (group behavior)
• Behavioral psychology (learning, conditioning)

**Key Concepts:**
• Consciousness and awareness
• Memory and learning
• Emotions and motivation
• Personality and individual differences
• Mental health and disorders

**Applications:**
• Therapy and counseling
• Education and learning
• Business and organizations
• Health and wellness
• Sports and performance

Psychology helps us understand human behavior!"""
    
    # Default comprehensive response
    return f"""📚 **Universal Knowledge Response**

I understand you're asking about: **{query}**

While I don't have a specific detailed answer for this topic in my current knowledge base, I can help you in several ways:

**What I Can Do:**
• Provide general information and guidance
• Help you break down complex topics
• Suggest learning resources and approaches
• Answer related questions you might have

**Suggestions:**
• Try rephrasing your question with more specific terms
• Ask about related topics I can help with
• Use the Stock Market Knowledge tab for financial topics
• Switch to different domain expertise modes

**Available Domains:**
• Technology & Engineering
• Finance & Investment  
• Healthcare & Medical
• Education & Learning
• Universal Knowledge

Feel free to ask me about any of these areas, and I'll provide detailed, helpful information!"""

# Main header
st.markdown("""
<div class="main-header">
    <h1>🤖 Zeno AI Chatbot</h1>
    <p>Next-Gen Intelligence • Dynamic Domain Expertise</p>
</div>
""", unsafe_allow_html=True)

# Sidebar for domain selection and user info
with st.sidebar:
    st.markdown("## 🎯 Domain Expertise")
    
    # Domain selector
    selected_domain = st.selectbox(
        "Choose your expertise domain:",
        options=list(domains.keys()),
        format_func=lambda x: f"{domains[x]['icon']} {domains[x]['name']}",
        index=list(domains.keys()).index(st.session_state.current_domain)
    )
    
    if selected_domain != st.session_state.current_domain:
        st.session_state.current_domain = selected_domain
        st.rerun()
    
    # Display current domain info
    current_domain_info = domains[st.session_state.current_domain]
    st.markdown(f"""
    <div class="domain-selector">
        <h3>{current_domain_info['icon']} {current_domain_info['name']}</h3>
        <p>{current_domain_info['description']}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # User name input
    st.markdown("## 👤 User Profile")
    user_name = st.text_input("Enter your name:", value=st.session_state.user_name)
    if user_name != st.session_state.user_name:
        st.session_state.user_name = user_name
    
    # Clear chat button
    if st.button("🗑️ Clear Chat History"):
        st.session_state.messages = []
        st.rerun()
    
    # Features info
    st.markdown("## ✨ Features")
    st.markdown("""
    - **Dynamic Domain Switching**
    - **Real-time Chat Interface**
    - **Professional Expertise Modes**
    - **Modern UI Design**
    - **Responsive Layout**
    """)

# Main interface with tabs
tab1, tab2 = st.tabs(["💬 Chat", "📚 Stock Market Knowledge"])

with tab1:
    # Main chat interface
    col1, col2 = st.columns([3, 1])

    with col1:
        st.markdown(f"### 💬 Chat with {current_domain_info['name']}")
        
        # Display chat messages
        for message in st.session_state.messages:
            if message['type'] == 'user':
                st.markdown(f"""
                <div class="chat-message user-message">
                    <strong>You:</strong> {message['content']}
                    <br><small>{message['timestamp']}</small>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="chat-message bot-message">
                    <strong>Zeno ({current_domain_info['name']}):</strong> {message['content']}
                    <br><small>{message['timestamp']}</small>
                </div>
                """, unsafe_allow_html=True)
        
        # Chat input
        user_input = st.text_input(
            f"Type your message here... (Currently in {current_domain_info['name']} mode)",
            key="chat_input",
            placeholder="Ask me anything!"
        )
        
        col_send, col_clear = st.columns([1, 1])
        
        with col_send:
            if st.button("🚀 Send Message", type="primary"):
                if user_input:
                    # Add user message
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    st.session_state.messages.append({
                        'type': 'user',
                        'content': user_input,
                        'timestamp': timestamp
                    })
                    
                    # Generate bot response
                    with st.spinner("Zeno is thinking..."):
                        time.sleep(1)  # Simulate thinking time
                        bot_response = get_domain_response(st.session_state.current_domain, user_input)
                    
                    # Add bot response
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    st.session_state.messages.append({
                        'type': 'bot',
                        'content': bot_response,
                        'timestamp': timestamp
                    })
                    
                    st.rerun()
        
        with col_clear:
            if st.button("🗑️ Clear"):
                st.session_state.messages = []
                st.rerun()

    with col2:
        # Quick actions
        st.markdown("### ⚡ Quick Actions")
        
        if st.button("🏠 Back to Home"):
            st.session_state.messages = []
            st.rerun()
        
        if st.button("🔄 Switch Domain"):
            st.session_state.current_domain = random.choice(list(domains.keys()))
            st.rerun()
        
        if st.button("📊 View Stats"):
            st.info(f"Messages in this session: {len(st.session_state.messages)}")
        
        # Domain features
        st.markdown("### 🎯 Current Domain Features")
        st.markdown(f"""
        **{current_domain_info['name']}**
        
        {current_domain_info['description']}
        
        **Capabilities:**
        - Specialized knowledge base
        - Domain-specific responses
        - Professional expertise
        - Industry best practices
        """)

with tab2:
    st.markdown("### 📚 Stock Market Knowledge Base")
    
    # Search functionality
    search_query = st.text_input("🔍 Search market concepts:", placeholder="e.g., RSI, P/E ratio, diversification")
    
    if search_query:
        results = search_stock_knowledge(search_query)
        if results:
            st.markdown(f"**Found {len(results)} result(s) for '{search_query}':**")
            for result in results:
                concept = result['concept']
                with st.expander(f"📈 {concept['title']} ({result['category']})"):
                    st.markdown(f"**Definition:** {concept['definition']}")
                    st.markdown(f"**Key Characteristics:**")
                    for char in concept['characteristics']:
                        st.markdown(f"• {char}")
                    st.markdown(f"**Example:** {concept['example']}")
                    st.markdown(f"**Strategy:** {concept['strategy']}")
        else:
            st.warning(f"No results found for '{search_query}'. Try different keywords.")
    
    # Categories
    st.markdown("### 📊 Browse by Category")
    knowledge_base = get_stock_knowledge_base()
    
    # Create columns for categories
    cols = st.columns(2)
    for i, (category_key, category_data) in enumerate(knowledge_base.items()):
        with cols[i % 2]:
            with st.expander(f"📁 {category_data['title']} ({len(category_data['concepts'])} concepts)"):
                for concept in category_data['concepts']:
                    st.markdown(f"**{concept['title']}**")
                    st.markdown(f"*{concept['definition']}*")
                    st.markdown("---")
    
    # Daily tip
    st.markdown("### 💡 Daily Market Tip")
    st.info(get_daily_tip())
    
    # Quick access buttons
    st.markdown("### ⚡ Quick Access")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("📈 Technical Analysis"):
            st.session_state.messages.append({
                'type': 'user',
                'content': 'technical analysis',
                'timestamp': datetime.now().strftime("%H:%M:%S")
            })
            st.rerun()
    
    with col2:
        if st.button("💰 Fundamental Analysis"):
            st.session_state.messages.append({
                'type': 'user',
                'content': 'fundamental analysis',
                'timestamp': datetime.now().strftime("%H:%M:%S")
            })
            st.rerun()
    
    with col3:
        if st.button("⚠️ Risk Management"):
            st.session_state.messages.append({
                'type': 'user',
                'content': 'risk management',
                'timestamp': datetime.now().strftime("%H:%M:%S")
            })
            st.rerun()

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 2rem;">
    <p>🤖 <strong>Zeno AI Chatbot</strong> • Powered by Streamlit • Dynamic Domain Expertise</p>
    <p>Built with ❤️ for intelligent conversations</p>
</div>
""", unsafe_allow_html=True)

# Add some sample conversation starters
if len(st.session_state.messages) == 0:
    st.markdown("### 💡 Try asking me about:")
    
    sample_questions = {
        'general': [
            "What can you help me with?",
            "Tell me about artificial intelligence",
            "How do I learn programming?"
        ],
        'knowledge': [
            "What is machine learning?",
            "Explain quantum physics",
            "How does photosynthesis work?",
            "What is blockchain technology?",
            "Tell me about climate change"
        ],
        'finance': [
            "What is RSI in stock trading?",
            "How do I analyze P/E ratios?",
            "What is diversification in investing?",
            "Explain bull vs bear markets",
            "What are Bollinger Bands?"
        ],
        'healthcare': [
            "What are healthy eating habits?",
            "How important is exercise?",
            "What should I know about mental health?"
        ],
        'technology': [
            "What programming language should I learn?",
            "How do I design a database?",
            "What is cloud computing?"
        ],
        'education': [
            "How can I improve my study habits?",
            "What are effective learning strategies?",
            "How do I prepare for exams?"
        ]
    }
    
    current_questions = sample_questions.get(st.session_state.current_domain, sample_questions['general'])
    
    for i, question in enumerate(current_questions):
        if st.button(f"💬 {question}", key=f"sample_{i}"):
            st.session_state.messages.append({
                'type': 'user',
                'content': question,
                'timestamp': datetime.now().strftime("%H:%M:%S")
            })
            
            with st.spinner("Zeno is thinking..."):
                time.sleep(1)
                bot_response = get_domain_response(st.session_state.current_domain, question)
            
            st.session_state.messages.append({
                'type': 'bot',
                'content': bot_response,
                'timestamp': datetime.now().strftime("%H:%M:%S")
            })
            
            st.rerun()
