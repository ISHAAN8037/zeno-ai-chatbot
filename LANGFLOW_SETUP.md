# 🔧 Langflow Integration Setup Guide

This guide will help you set up your React chatbot to work with your Langflow instance.

## 🚀 Prerequisites

1. **Langflow Running**: Your Langflow instance must be accessible at `http://localhost:7860`
2. **Active Flow**: Your flow with ID `2078174c-067b-4095-919d-582126a918e6` must be active
3. **API Key**: You need your Langflow API key

## 📋 Step-by-Step Setup

### 1. Update API Key

Edit `src/config.js` and replace the placeholder with your actual API key:

```javascript
export const LANGFLOW_CONFIG = {
  // Replace this with your actual API key
  apiKey: 'sk-mZT588tijSkKdREvRTMDhnYEjGzJaILFxE685kUKI1A', // ← Your key here
  
  baseUrl: 'http://localhost:7860',
  flowId: '2078174c-067b-4095-919d-582126a918e6'
};
```

### 2. Verify Langflow is Running

Make sure your Langflow instance is accessible:

```bash
# Test if Langflow is responding
curl http://localhost:7860/health
```

You should see a response indicating Langflow is running.

### 3. Test Your Flow

Test your specific flow with a simple request:

```bash
curl -X POST "http://localhost:7860/api/v1/run/2078174c-067b-4095-919d-582126a918e6" \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk-mZT588tijSkKdREvRTMDhnYEjGzJaILFxE685kUKI1A" \
  -d '{
    "output_type": "chat",
    "input_type": "chat",
    "input_value": "Hello, how are you?"
  }'
```

## 🔍 Troubleshooting

### Connection Issues

**Problem**: "Langflow not accessible" message
**Solution**: 
- Check if Langflow is running on port 7860
- Verify no firewall is blocking the connection
- Check Langflow logs for errors

### API Key Issues

**Problem**: "Failed to get response" errors
**Solution**:
- Verify your API key is correct
- Check if the API key has proper permissions
- Ensure the key is not expired

### Flow Issues

**Problem**: Flow not responding
**Solution**:
- Verify your flow ID is correct
- Check if the flow is active and running
- Review Langflow flow logs

## 🧪 Testing the Integration

### 1. Start Development Server

```bash
npm run dev
```

### 2. Check Browser Console

Open browser developer tools and look for:
- ✅ "Langflow script loaded successfully"
- ✅ "Langflow chat element is ready"
- ✅ "Langflow is running and accessible"

### 3. Send Test Message

Type a simple message like "Hello" and check:
- Message appears in chat
- Typing indicator shows
- Response is received from Langflow

## 🔧 Advanced Configuration

### Custom Flow ID

If you want to use a different flow, update both files:

1. **`src/config.js`**:
```javascript
flowId: 'your-new-flow-id-here'
```

2. **`src/services/langflowApi.js`**:
```javascript
// The service will automatically use the new flow ID
```

### Custom Langflow URL

If your Langflow runs on a different URL:

1. **`src/config.js`**:
```javascript
baseUrl: 'http://your-custom-url:port'
```

2. **Update CORS settings** in your Langflow instance if needed

### Environment Variables

For production, you can use environment variables:

1. Create `.env.local` file:
```bash
REACT_APP_LANGFLOW_API_KEY=your-actual-key
REACT_APP_LANGFLOW_BASE_URL=http://your-url
REACT_APP_LANGFLOW_FLOW_ID=your-flow-id
```

2. Update `src/config.js`:
```javascript
export const LANGFLOW_CONFIG = {
  apiKey: process.env.REACT_APP_LANGFLOW_API_KEY || 'fallback-key',
  baseUrl: process.env.REACT_APP_LANGFLOW_BASE_URL || 'http://localhost:7860',
  flowId: process.env.REACT_APP_LANGFLOW_FLOW_ID || 'default-flow-id'
};
```

## 📱 Production Deployment

### Environment Variables

Set these in your hosting platform:
- `REACT_APP_LANGFLOW_API_KEY`
- `REACT_APP_LANGFLOW_BASE_URL`
- `REACT_APP_LANGFLOW_FLOW_ID`

### CORS Configuration

Ensure your Langflow instance allows requests from your production domain.

### API Key Security

Never commit your API key to version control. Use environment variables in production.

## 🎯 Expected Behavior

### Successful Integration

- ✅ Connection status shows "Connected to Langflow"
- ✅ Messages are sent to your flow
- ✅ Responses are displayed in chat
- ✅ No error messages in console

### Error Indicators

- ❌ Connection status shows "Langflow not accessible"
- ❌ Error messages in chat
- ❌ Console errors about API calls

## 🆘 Getting Help

If you're still having issues:

1. **Check Langflow logs** for server-side errors
2. **Verify network connectivity** to localhost:7860
3. **Test API directly** with curl commands
4. **Check browser console** for client-side errors
5. **Verify flow configuration** in Langflow UI

---

**Your chatbot should now be fully integrated with Langflow!** 🚀✨
