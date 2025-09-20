import streamlit as st
import time
import random
from datetime import datetime
import json

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

# Domain configurations
domains = {
    'general': {
        'name': 'General Assistant',
        'icon': '🤖',
        'description': 'General purpose AI assistant for all topics',
        'color': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
    responses = {
        'general': [
            f"I understand you're asking about: {user_message}. As a general AI assistant, I can help with a wide range of topics. Could you be more specific about what you'd like to know?",
            f"That's an interesting question about {user_message}. Let me provide you with some general information and guidance on this topic.",
            f"Thanks for your question regarding {user_message}. I'm here to help with general information and support across various subjects."
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
        'finance': [
            "What are the basics of investing?",
            "How do I create a budget?",
            "What is compound interest?"
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
