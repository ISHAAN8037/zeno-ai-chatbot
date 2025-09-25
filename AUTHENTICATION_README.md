# 🔐 Zeno AI Chatbot - Authentication System

## 🚀 **Overview**

The Zeno AI Chatbot now includes a complete user authentication system that allows users to create accounts, log in, and manage their personal chat history. Each user gets their own secure, isolated chat sessions and profile management.

## ✨ **Features**

### **User Management**
- **User Registration**: Create new accounts with email, password, and name
- **User Login**: Secure authentication with JWT tokens
- **Profile Management**: Update name and change passwords
- **Secure Logout**: Clear all session data

### **Chat History**
- **Personal Chat Storage**: Each user has their own chat history
- **Server-side Storage**: Chat history is saved to the server (with localStorage fallback)
- **Session Management**: Organize conversations with titles and timestamps
- **Search & Filter**: Find specific conversations quickly

### **Security Features**
- **Password Hashing**: Bcrypt encryption for secure password storage
- **JWT Tokens**: Secure authentication tokens with 7-day expiration
- **Input Validation**: Comprehensive form validation and error handling
- **Session Management**: Automatic token validation and refresh

## 🏗️ **Architecture**

### **Backend (Node.js + Express)**
- **Server**: `server.js` - Express server with authentication endpoints
- **Port**: Runs on `http://localhost:3001`
- **Storage**: File-based storage (users.json, chatHistory.json)
- **Authentication**: JWT-based with bcrypt password hashing

### **Frontend (React + TailwindCSS)**
- **Components**: Login, Register, UserProfile components
- **Service**: `authService.js` - Handles all authentication API calls
- **State Management**: React hooks for user state and authentication
- **UI**: Premium design with smooth animations and responsive layout

## 🚀 **Getting Started**

### **1. Start the Backend Server**
```bash
# Start only the backend server
npm run server

# Or start both frontend and backend simultaneously
npm run dev:full
```

### **2. Access the Application**
- **Frontend**: `http://localhost:5174` (or the port Vite assigns)
- **Backend API**: `http://localhost:3001/api`

### **3. Create Your First Account**
1. Click "✨ Sign Up" in the header
2. Fill in your name, email, and password
3. Click "🚀 Create Account"
4. You'll be automatically logged in and redirected to the home page

## 📱 **User Interface**

### **Authentication Views**
- **Login Form**: Email and password fields with validation
- **Registration Form**: Name, email, password, and confirmation
- **User Profile**: View and edit profile information

### **Navigation**
- **Header**: Authentication buttons and user welcome message
- **Profile Button**: Access user settings and logout
- **Responsive Design**: Works on all device sizes

### **Chat Integration**
- **Personal History**: Each user sees only their own chat sessions
- **Automatic Saving**: Chat sessions are saved when closing
- **Cross-device Sync**: Chat history accessible from any device

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### **Chat History**
- `POST /api/chat-history` - Save chat session
- `GET /api/chat-history` - Get user's chat history
- `DELETE /api/chat-history/:sessionId` - Delete specific session
- `DELETE /api/chat-history` - Clear all history

## 🛡️ **Security Features**

### **Password Security**
- Minimum 6 characters required
- Bcrypt hashing with salt rounds
- Secure password change with current password verification

### **Token Security**
- JWT tokens with 7-day expiration
- Automatic token validation
- Secure logout with token clearing

### **Data Protection**
- User data isolation
- Secure API endpoints with authentication middleware
- Input validation and sanitization

## 📊 **Data Storage**

### **User Data**
```json
{
  "id": "timestamp",
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "User Name",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### **Chat History**
```json
{
  "id": "session_timestamp",
  "title": "Chat Session Title",
  "messages": [...],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "messageCount": 10
}
```

## 🔄 **State Management**

### **Authentication State**
- `currentUser`: Currently logged-in user object
- `showAuth`: Controls authentication form visibility
- `authMode`: Toggles between login and register forms
- `showProfile`: Controls profile management visibility

### **Chat State**
- `chatHistory`: User's personal chat sessions
- `messages`: Current chat conversation
- `showChat`: Controls chat interface visibility

## 🎨 **UI Components**

### **Login Component**
- Email and password fields
- Form validation and error handling
- Link to registration form
- Premium styling with animations

### **Register Component**
- Name, email, password, and confirmation fields
- Password strength validation
- Link to login form
- Success feedback

### **User Profile Component**
- Display current user information
- Edit mode for profile updates
- Password change functionality
- Logout button

## 🚨 **Error Handling**

### **Validation Errors**
- Required field validation
- Password confirmation matching
- Email format validation
- Password length requirements

### **API Errors**
- Network connection issues
- Server errors
- Authentication failures
- User-friendly error messages

## 🔮 **Future Enhancements**

### **Planned Features**
- **Email Verification**: Confirm email addresses
- **Password Reset**: Forgot password functionality
- **Social Login**: Google, GitHub, etc.
- **Two-Factor Authentication**: Enhanced security
- **User Roles**: Admin and premium user features
- **Database Integration**: Replace file storage with PostgreSQL/MongoDB

### **Performance Improvements**
- **Token Refresh**: Automatic token renewal
- **Caching**: Client-side data caching
- **Offline Support**: PWA capabilities
- **Real-time Updates**: WebSocket integration

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Server Not Running**: Ensure `npm run server` is running
2. **Port Conflicts**: Check if ports 3001 or 5174 are available
3. **Authentication Errors**: Verify email/password combination
4. **Chat History Not Loading**: Check network connection and server status

### **Debug Mode**
- Check browser console for error messages
- Verify server logs for backend issues
- Test API endpoints with tools like Postman

## 📝 **Development Notes**

### **File Structure**
```
src/
├── components/
│   └── Auth/
│       ├── Login.jsx
│       ├── Register.jsx
│       └── UserProfile.jsx
├── services/
│   └── authService.js
└── App.jsx

server.js
package.json
```

### **Dependencies**
- **Backend**: Express, bcryptjs, jsonwebtoken
- **Frontend**: React, TailwindCSS, custom components
- **Development**: Concurrently for running multiple servers

## 🎯 **Usage Examples**

### **Creating a New User**
```javascript
// Frontend registration
const user = await authService.register(
  'john@example.com',
  'securepassword123',
  'John Doe'
);
```

### **User Login**
```javascript
// Frontend login
const result = await authService.login(
  'john@example.com',
  'securepassword123'
);
```

### **Saving Chat History**
```javascript
// Save chat session
await authService.saveChatHistory(
  messages,
  'AI Discussion about Machine Learning'
);
```

## 🌟 **Conclusion**

The authentication system transforms Zeno from a simple chatbot into a full-featured, multi-user platform. Users can now:

- **Create personal accounts** with secure authentication
- **Maintain private chat histories** across sessions
- **Manage their profiles** with easy-to-use interfaces
- **Enjoy a premium experience** with modern UI/UX design

The system is designed to be scalable, secure, and user-friendly, providing a solid foundation for future enhancements and enterprise features.

---

**🎉 Ready to start building your AI conversation history? Sign up today and experience the future of AI chat!**




