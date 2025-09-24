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

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simple AI response simulation (replace with actual AI service)
    const responses = [
      "Hello! I'm Zeno, your AI assistant. How can I help you today?",
      "That's an interesting question! Let me think about that...",
      "I understand what you're asking. Here's what I think...",
      "Great question! Based on my knowledge, I would suggest...",
      "I'm here to help! Could you provide more details about what you need?",
      "That's a complex topic. Let me break it down for you...",
      "I appreciate your question. Here's my perspective...",
      "Interesting point! Let me share some insights on that...",
      "I'm designed to be helpful and informative. What specific information do you need?",
      "That's a great question! I'd be happy to help you understand this better."
    ];

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate an intelligent response based on the message
    let response;
    const lowerMessage = message.toLowerCase();
    
    // Programming and Technology Questions
    if (lowerMessage.includes('python') || lowerMessage.includes('define python')) {
      response = `🐍 **Python Programming Language**

**What is Python?**
Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, Python emphasizes code readability and allows programmers to express concepts in fewer lines of code.

**Key Features:**
• **Easy to Learn**: Simple syntax that's close to natural language
• **Versatile**: Used for web development, data science, AI, automation, and more
• **Large Community**: Extensive libraries and frameworks
• **Cross-Platform**: Runs on Windows, Mac, Linux

**Popular Uses:**
• Web Development (Django, Flask)
• Data Science & Analytics (Pandas, NumPy)
• Machine Learning (TensorFlow, PyTorch)
• Automation & Scripting
• Game Development

**Example Code:**
\`\`\`python
# Simple Python program
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

Would you like me to explain any specific aspect of Python in more detail?`;
    } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
      response = `🟨 **JavaScript Programming Language**

**What is JavaScript?**
JavaScript is a versatile programming language primarily used for web development. It's the language that makes websites interactive and dynamic.

**Key Features:**
• **Client-Side & Server-Side**: Runs in browsers and on servers (Node.js)
• **Dynamic**: No need to declare variable types
• **Event-Driven**: Responds to user interactions
• **Asynchronous**: Handles multiple operations efficiently

**Common Uses:**
• Frontend Web Development (React, Vue, Angular)
• Backend Development (Node.js, Express)
• Mobile Apps (React Native)
• Desktop Applications (Electron)

Would you like to learn about specific JavaScript concepts or frameworks?`;
    } else if (lowerMessage.includes('react')) {
      response = `⚛️ **React JavaScript Library**

**What is React?**
React is a popular JavaScript library for building user interfaces, especially single-page applications. Created by Facebook, it uses a component-based architecture.

**Key Concepts:**
• **Components**: Reusable UI pieces
• **JSX**: JavaScript syntax extension
• **Virtual DOM**: Efficient updates
• **State Management**: Managing data changes

**Why Use React?**
• Fast and efficient rendering
• Large ecosystem and community
• Great for complex UIs
• Works well with other libraries

Would you like me to explain React hooks, components, or state management?`;
    } else if (lowerMessage.includes('html')) {
      response = `🌐 **HTML (HyperText Markup Language)**

**What is HTML?**
HTML is the standard markup language for creating web pages. It structures content using elements and tags.

**Key Concepts:**
• **Elements**: Building blocks of HTML
• **Tags**: Markup that defines content
• **Attributes**: Additional information about elements
• **Semantic HTML**: Meaningful element names

**Basic Structure:**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is a paragraph.</p>
</body>
</html>
\`\`\`

Would you like to learn about specific HTML elements or CSS styling?`;
    } else if (lowerMessage.includes('css')) {
      response = `🎨 **CSS (Cascading Style Sheets)**

**What is CSS?**
CSS is a stylesheet language used to describe the presentation of HTML documents. It controls how web pages look and feel.

**Key Concepts:**
• **Selectors**: Target HTML elements
• **Properties**: What to style (color, size, etc.)
• **Values**: How to style (red, 20px, etc.)
• **Box Model**: How elements are sized and spaced

**Example:**
\`\`\`css
h1 {
    color: blue;
    font-size: 24px;
    text-align: center;
}
\`\`\`

Would you like to learn about CSS Grid, Flexbox, or responsive design?`;
    } else if (lowerMessage.includes('machine learning') || lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      response = `🤖 **Machine Learning & Artificial Intelligence**

**What is Machine Learning?**
Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed.

**Types of ML:**
• **Supervised Learning**: Learning with labeled data
• **Unsupervised Learning**: Finding patterns in unlabeled data
• **Reinforcement Learning**: Learning through trial and error

**Common Applications:**
• Image Recognition
• Natural Language Processing
• Recommendation Systems
• Predictive Analytics
• Autonomous Vehicles

**Popular Tools:**
• Python: TensorFlow, PyTorch, Scikit-learn
• R: Caret, Random Forest
• Cloud: AWS SageMaker, Google AI Platform

Would you like to explore specific ML algorithms or applications?`;
    } else if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
      response = `🗄️ **Databases & SQL**

**What is a Database?**
A database is an organized collection of data stored and accessed electronically. SQL (Structured Query Language) is used to manage relational databases.

**Types of Databases:**
• **Relational**: MySQL, PostgreSQL, SQLite
• **NoSQL**: MongoDB, Cassandra, Redis
• **Graph**: Neo4j, Amazon Neptune

**SQL Basics:**
\`\`\`sql
-- Create a table
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

-- Insert data
INSERT INTO users VALUES (1, 'John', 'john@email.com');

-- Query data
SELECT * FROM users WHERE name = 'John';
\`\`\`

Would you like to learn about specific database concepts or query optimization?`;
    } else if (lowerMessage.includes('math') || lowerMessage.includes('calculate') || lowerMessage.includes('solve')) {
      response = `🧮 **Mathematics & Problem Solving**

I can help you with various mathematical concepts and problem-solving techniques!

**Areas I can assist with:**
• **Algebra**: Equations, functions, graphing
• **Calculus**: Derivatives, integrals, limits
• **Statistics**: Probability, distributions, analysis
• **Geometry**: Shapes, angles, areas, volumes
• **Trigonometry**: Sine, cosine, tangent functions
• **Linear Algebra**: Vectors, matrices, transformations

**Problem-Solving Approach:**
1. Understand the problem
2. Identify what's given and what's needed
3. Choose appropriate methods
4. Work through step-by-step
5. Verify the solution

What specific math problem or concept would you like help with?`;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = "Hello! I'm Zeno, your AI assistant. How can I help you today?";
    } else if (lowerMessage.includes('help')) {
      response = "I'm here to help! I can assist you with various topics including general knowledge, problem-solving, creative writing, and more. What would you like to know?";
    } else if (lowerMessage.includes('weather')) {
      response = "I can help you with weather information! However, I need to be connected to a weather service. For now, I can tell you that weather varies by location and time. What specific weather information do you need?";
    } else if (lowerMessage.includes('stock') || lowerMessage.includes('finance')) {
      response = "I can help with financial and stock market information! I can provide analysis, explain concepts, or help you understand market trends. What financial topic interests you?";
    } else if (lowerMessage.includes('thank')) {
      response = "You're very welcome! I'm glad I could help. Is there anything else you'd like to know?";
    } else {
      // Provide a more helpful response for unknown questions
      response = `I understand you're asking about "${message}". While I have knowledge in many areas including programming, mathematics, science, and general topics, I'd be happy to help you with more specific information.

**I can help with:**
• Programming languages (Python, JavaScript, React, etc.)
• Web development (HTML, CSS, frameworks)
• Data science and machine learning
• Mathematics and problem-solving
• General knowledge and explanations

Could you provide more details about what specifically you'd like to know? I'm here to give you detailed, helpful answers!`;
    }

    // Store chat history if userId is provided
    if (userId) {
      if (!userChatHistory[userId]) {
        userChatHistory[userId] = [];
      }
      userChatHistory[userId].push({
        user: message,
        assistant: response,
        timestamp: new Date().toISOString()
      });
      saveChatHistory();
    }

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      response: "I'm sorry, I encountered an error. Please try again."
    });
  }
});

// Get chat history
app.get('/api/chat/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = userChatHistory[userId] || [];
    res.json({ success: true, history });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Zeno AI Chatbot API is running',
    timestamp: new Date().toISOString()
  });
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
