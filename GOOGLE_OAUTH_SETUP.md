# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
   - `http://localhost:5173` (for development)
7. Copy the Client ID and Client Secret

## 2. Environment Variables

Create a `.env` file in the root directory with:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
JWT_SECRET=your-super-secret-jwt-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/ai-chatbot
PORT=3001
NODE_ENV=development
```

## 3. Features

### Google OAuth Authentication
- Sign in with Google accounts
- Automatic account creation
- Profile picture and name from Google
- Email verification

### Password Protection
- Add password to Google-linked accounts
- Extra security layer
- Optional password requirement

### User Management
- Profile management
- Preferences (theme, notifications)
- Chat history per user
- Session management

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Session-based authentication
- Secure cookie handling

## 4. Usage

1. Start the server: `npm run dev:full`
2. Open `http://localhost:5173`
3. Click "Sign In" button
4. Choose "Google" tab
5. Click "Continue with Google"
6. Complete Google OAuth flow
7. Optionally add password protection

## 5. API Endpoints

- `GET /api/auth/google` - Get Google OAuth URL
- `POST /api/auth/google` - Verify Google token
- `POST /api/auth/google-password` - Add password to Google account
- `PUT /api/user/preferences` - Update user preferences
- `GET /api/user/profile` - Get user profile
- `POST /api/logout` - Logout user

## 6. Database

The system uses in-memory storage by default. For production, configure MongoDB:

```bash
npm install mongoose
```

Update the MONGODB_URI in your `.env` file.
