# Zeno AI Chatbot - Deployment Guide

## 🚀 Deploy Your React Application

Your React application is ready for deployment! Here are the best options:

### Option 1: Vercel (Recommended - Free & Easy)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from your project directory:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project: No
   - Project name: zeno-ai-chatbot
   - Directory: ./
   - Override settings: No

4. **Your app will be live at:** `https://zeno-ai-chatbot.vercel.app`

### Option 2: Netlify (Free & Easy)

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option 3: GitHub Pages (Free)

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "homepage": "https://ISHAAN8037.github.io/zeno-ai-chatbot",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## 🔧 Backend Deployment

For the backend server, you can deploy to:

### Heroku (Free tier available)
1. Create a Heroku account
2. Install Heroku CLI
3. Create a `Procfile`:
   ```
   web: node server.js
   ```
4. Deploy:
   ```bash
   heroku create zeno-ai-chatbot-api
   git push heroku main
   ```

### Railway (Free tier available)
1. Connect your GitHub repository
2. Select the backend files
3. Deploy automatically

## 🌐 Environment Variables

Set these in your deployment platform:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
```

## 📱 Features Included

✅ Modern React UI with Tailwind CSS  
✅ Authentication system  
✅ Domain expertise switching  
✅ Responsive design  
✅ Professional animations  
✅ Voice controls  
✅ Stock analysis  
✅ Chat interface  

## 🎯 Quick Start

1. **Local Development:**
   ```bash
   npm run dev:full
   ```

2. **Production Build:**
   ```bash
   npm run build
   ```

3. **Preview:**
   ```bash
   npm run preview
   ```

Your React application is production-ready! 🚀
