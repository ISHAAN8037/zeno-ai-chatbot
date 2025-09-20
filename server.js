import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { OAuth2Client } from 'google-auth-library';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Middleware
app.use(express.json());
app.use(express.static('dist')); // Serve the built React app

// Session middleware (using memory store for simplicity)
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// In-memory storage (replace with database in production)
let users = [];
let userChatHistory = {};

// Load existing users from file if exists
const usersFile = path.join(__dirname, 'users.json');
const historyFile = path.join(__dirname, 'chatHistory.json');

try {
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }
  if (fs.existsSync(historyFile)) {
    userChatHistory = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  }
} catch (error) {
  console.log('No existing user data found, starting fresh');
}

// Save users to file
function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Save chat history to file
function saveChatHistory() {
  fs.writeFileSync(historyFile, JSON.stringify(userChatHistory, null, 2));
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    userChatHistory[newUser.id] = [];
    
    saveUsers();
    saveChatHistory();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

// Save chat history for user
app.post('/api/chat-history', authenticateToken, (req, res) => {
  try {
    const { messages, title } = req.body;
    const userId = req.user.userId;

    if (!userChatHistory[userId]) {
      userChatHistory[userId] = [];
    }

    const chatSession = {
      id: Date.now().toString(),
      title: title || `Chat ${new Date().toLocaleString()}`,
      messages,
      timestamp: new Date().toISOString(),
      messageCount: messages.length
    };

    userChatHistory[userId].unshift(chatSession);
    
    // Keep only last 50 sessions per user
    if (userChatHistory[userId].length > 50) {
      userChatHistory[userId] = userChatHistory[userId].slice(0, 50);
    }

    saveChatHistory();

    res.json({ message: 'Chat history saved successfully', session: chatSession });

  } catch (error) {
    console.error('Save chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history for user
app.get('/api/chat-history', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userHistory = userChatHistory[userId] || [];
  res.json({ history: userHistory });
});

// Delete chat session
app.delete('/api/chat-history/:sessionId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.sessionId;

    if (!userChatHistory[userId]) {
      return res.status(404).json({ error: 'No chat history found' });
    }

    const initialLength = userChatHistory[userId].length;
    userChatHistory[userId] = userChatHistory[userId].filter(
      session => session.id !== sessionId
    );

    if (userChatHistory[userId].length === initialLength) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    saveChatHistory();
    res.json({ message: 'Chat session deleted successfully' });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear all chat history for user
app.delete('/api/chat-history', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    userChatHistory[userId] = [];
    saveChatHistory();
    res.json({ message: 'All chat history cleared successfully' });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      const validCurrentPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validCurrentPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    saveUsers();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth endpoints
app.get('/api/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'consent'
  });
  res.json({ authUrl });
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;
    
    if (!email_verified) {
      return res.status(400).json({ error: 'Email not verified' });
    }
    
    // Check if user exists
    let user = users.find(u => u.googleId === googleId || u.email === email);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        email,
        name,
        picture,
        googleId,
        isGoogleLinked: true,
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        },
        chatHistory: []
      };
      users.push(user);
      saveUsers();
    } else if (!user.isGoogleLinked) {
      // Link existing user to Google
      user.googleId = googleId;
      user.picture = picture;
      user.isGoogleLinked = true;
      saveUsers();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        googleId: user.googleId,
        isGoogleLinked: user.isGoogleLinked,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: 'Google authentication failed' });
  }
});

app.post('/api/auth/google-password', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Hash and save password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    saveUsers();
    
    res.json({
      success: true,
      message: 'Password added successfully'
    });
  } catch (error) {
    console.error('Password setup error:', error);
    res.status(400).json({ error: 'Failed to set password' });
  }
});

// User preferences endpoint
app.put('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.preferences = { ...user.preferences, ...preferences };
    saveUsers();
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        googleId: user.googleId,
        isGoogleLinked: user.isGoogleLinked,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(400).json({ error: 'Failed to update preferences' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Authentication server running on http://localhost:${PORT}`);
  console.log(`📱 React app will be served from the same port`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET}`);
});
