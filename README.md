# Zeno AI Chatbot - Streamlit Version

A modern, interactive AI chatbot with dynamic domain expertise, built with Streamlit and designed for easy cloud deployment.

## 🚀 Live Demo

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://your-app-name.streamlit.app)

## ✨ Features

- **Dynamic Domain Expertise**: Switch between General, Finance, Healthcare, Technology, and Education modes
- **Real-time Chat Interface**: Interactive conversation with domain-specific responses
- **Modern UI Design**: Beautiful gradient-based interface with responsive layout
- **User Profile Management**: Personalize your experience
- **Session Management**: Clear chat history and maintain conversation context
- **Quick Actions**: Easy domain switching and conversation starters

## 🛠️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/zeno-ai-chatbot.git
   cd zeno-ai-chatbot
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run locally**:
   ```bash
   streamlit run streamlit_app.py
   ```

4. **Access the app**:
   Open your browser to `http://localhost:8501`

## ☁️ Streamlit Cloud Deployment

### Quick Deploy

1. **Fork this repository**
2. **Go to [share.streamlit.io](https://share.streamlit.io)**
3. **Sign in with GitHub**
4. **Click "New app"**
5. **Select your repository and branch**
6. **Set main file path to `streamlit_app.py`**
7. **Click "Deploy"**

### Manual Setup

1. **Prepare your repository**:
   - Upload `streamlit_app.py` and `requirements.txt`
   - Ensure the main file is named `streamlit_app.py`

2. **Deploy on Streamlit Cloud**:
   - Connect your GitHub account
   - Select your repository
   - Configure deployment settings
   - Deploy!

## 🎯 Domain Expertise

The chatbot supports multiple professional domains:

- **🤖 General Assistant**: Broad knowledge base for all topics
- **💰 Finance & Investment**: Financial analysis and market insights
- **🏥 Healthcare & Medical**: Health information and wellness guidance
- **💻 Technology & Engineering**: Software development and technical support
- **🎓 Education & Learning**: Academic assistance and study strategies

## 🎨 Customization

### Adding New Domains

Modify the `domains` dictionary in `streamlit_app.py`:

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

### Styling

Customize the appearance by modifying the CSS in the `st.markdown()` sections.

## 📊 Performance

- **Fast Loading**: Optimized for quick startup
- **Responsive Design**: Works on all device sizes
- **Memory Efficient**: Minimal resource usage
- **Scalable**: Handles multiple concurrent users

## 🔧 Configuration

### Environment Variables

Set these in Streamlit Cloud's secrets management:

```toml
[secrets]
# Add any API keys or configuration here
OPENAI_API_KEY = "your-api-key"
```

### App Settings

Modify `st.set_page_config()` for different configurations:

```python
st.set_page_config(
    page_title="Your App Title",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are in `requirements.txt`
2. **Deployment Failures**: Check file names and syntax
3. **Performance Issues**: Optimize data loading and use caching

### Debug Mode

```bash
streamlit run streamlit_app.py --logger.level debug
```

## 📈 Analytics

Streamlit Cloud provides:
- Usage analytics and metrics
- Error logs and monitoring
- Performance insights
- User feedback collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

- **Documentation**: [docs.streamlit.io](https://docs.streamlit.io)
- **Community**: [discuss.streamlit.io](https://discuss.streamlit.io)
- **Issues**: [GitHub Issues](https://github.com/yourusername/zeno-ai-chatbot/issues)

---

**Built with ❤️ using Streamlit**

*Zeno AI Chatbot - Intelligent Conversations Made Simple*
