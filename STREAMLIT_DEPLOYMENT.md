# Zeno AI Chatbot - Streamlit Deployment

This is a Streamlit version of the Zeno AI Chatbot that can be easily deployed on Streamlit Cloud.

## 🚀 Features

- **Dynamic Domain Expertise**: Switch between different professional domains (General, Finance, Healthcare, Technology, Education)
- **Real-time Chat Interface**: Interactive chat with domain-specific responses
- **Modern UI Design**: Beautiful gradient-based interface with responsive layout
- **User Profile Management**: Personalize your experience with name input
- **Session Management**: Clear chat history and maintain conversation context
- **Quick Actions**: Easy domain switching and conversation starters

## 📁 Files

- `streamlit_app.py` - Main Streamlit application
- `requirements.txt` - Python dependencies
- `STREAMLIT_DEPLOYMENT.md` - This deployment guide

## 🛠️ Local Development

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Locally**:
   ```bash
   streamlit run streamlit_app.py
   ```

3. **Access the App**:
   Open your browser to `http://localhost:8501`

## ☁️ Streamlit Cloud Deployment

### Method 1: Direct Upload

1. **Prepare Your Repository**:
   - Upload `streamlit_app.py` and `requirements.txt` to a GitHub repository
   - Ensure the main file is named `streamlit_app.py`

2. **Deploy on Streamlit Cloud**:
   - Go to [share.streamlit.io](https://share.streamlit.io)
   - Sign in with your GitHub account
   - Click "New app"
   - Select your repository and branch
   - Set the main file path to `streamlit_app.py`
   - Click "Deploy"

### Method 2: GitHub Integration

1. **Fork or Clone**:
   - Fork this repository or create a new one
   - Add the Streamlit files to your repository

2. **Connect to Streamlit Cloud**:
   - Go to [share.streamlit.io](https://share.streamlit.io)
   - Connect your GitHub account
   - Select your repository
   - Configure deployment settings

## 🎯 Domain Expertise Modes

### General Assistant 🤖
- General purpose AI assistant for all topics
- Broad knowledge base and versatile responses

### Finance & Investment 💰
- Financial analysis and investment advice
- Market insights and economic concepts
- Educational financial content

### Healthcare & Medical 🏥
- Health information and wellness guidance
- Medical education and symptom awareness
- Professional health recommendations

### Technology & Engineering 💻
- Software development and programming
- System design and architecture
- Technical troubleshooting and best practices

### Education & Learning 🎓
- Academic assistance and study strategies
- Learning methodologies and curriculum planning
- Educational resources and techniques

## 🎨 Customization

### Styling
The app uses custom CSS for modern design. You can modify the styles in the `st.markdown()` sections with custom CSS.

### Domain Configuration
Add new domains by modifying the `domains` dictionary in `streamlit_app.py`:

```python
domains = {
    'your_domain': {
        'name': 'Your Domain Name',
        'icon': '🔧',
        'description': 'Description of your domain',
        'color': 'linear-gradient(135deg, #color1 0%, #color2 100%)'
    }
}
```

### Response Logic
Modify the `get_domain_response()` function to customize how the bot responds to different domains and messages.

## 🔧 Configuration Options

### Environment Variables
You can set these in Streamlit Cloud's secrets management:

```toml
[secrets]
# Add any API keys or configuration here
OPENAI_API_KEY = "your-api-key"
```

### App Configuration
Modify `st.set_page_config()` for different layouts and settings:

```python
st.set_page_config(
    page_title="Your App Title",
    page_icon="🤖",
    layout="wide",  # or "centered"
    initial_sidebar_state="expanded"  # or "collapsed"
)
```

## 📊 Performance Optimization

- **Caching**: Use `@st.cache_data` for expensive operations
- **Session State**: Efficiently manage state with `st.session_state`
- **Lazy Loading**: Load data only when needed
- **Memory Management**: Clear unused data regularly

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**:
   - Ensure all dependencies are in `requirements.txt`
   - Check Python version compatibility

2. **Deployment Failures**:
   - Verify file names and paths
   - Check for syntax errors
   - Ensure all imports are available

3. **Performance Issues**:
   - Optimize data loading
   - Use caching appropriately
   - Monitor memory usage

### Debug Mode
Run with debug information:
```bash
streamlit run streamlit_app.py --logger.level debug
```

## 📈 Monitoring

Streamlit Cloud provides:
- **Usage Analytics**: Track app visits and interactions
- **Error Logs**: Monitor for issues and errors
- **Performance Metrics**: CPU and memory usage
- **User Feedback**: Collect user input and suggestions

## 🔒 Security Considerations

- **Input Validation**: Sanitize user inputs
- **API Keys**: Store sensitive data in Streamlit secrets
- **Rate Limiting**: Implement appropriate limits
- **Data Privacy**: Handle user data responsibly

## 🚀 Advanced Features

### Integration Possibilities
- **OpenAI API**: Connect to GPT models for real responses
- **Database**: Store chat history and user preferences
- **Authentication**: Add user login and profiles
- **File Upload**: Allow document analysis and processing

### Custom Components
- **Chat UI**: Enhanced message bubbles and animations
- **Domain Visualizer**: Interactive domain selection
- **Analytics Dashboard**: Usage statistics and insights

## 📞 Support

For issues and questions:
- **Streamlit Documentation**: [docs.streamlit.io](https://docs.streamlit.io)
- **Community Forum**: [discuss.streamlit.io](https://discuss.streamlit.io)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Chatting with Zeno AI! 🤖✨**
