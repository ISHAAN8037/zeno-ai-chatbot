const API_BASE_URL = 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('zeno_token');
    this.user = JSON.parse(localStorage.getItem('zeno_user') || 'null');
  }

  // Set auth data
  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('zeno_token', token);
    localStorage.setItem('zeno_user', JSON.stringify(user));
  }

  // Clear auth data
  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('zeno_token');
    localStorage.removeItem('zeno_user');
  }

  // Get auth headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // User Registration
  async register(email, password, name) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Set auth data on successful registration
      this.setAuth(data.token, data.user);
      return data;

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // User Login
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Set auth data on successful login
      this.setAuth(data.token, data.user);
      return data;

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // User Logout
  logout() {
    this.clearAuth();
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get profile');
      }

      return data;

    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(name, currentPassword, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name, currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local user data
      if (data.user) {
        this.user = data.user;
        localStorage.setItem('zeno_user', JSON.stringify(data.user));
      }

      return data;

    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Save chat history
  async saveChatHistory(messages, title) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ messages, title })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save chat history');
      }

      return data;

    } catch (error) {
      console.error('Save chat history error:', error);
      throw error;
    }
  }

  // Get chat history
  async getChatHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get chat history');
      }

      return data;

    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  }

  // Delete chat session
  async deleteChatSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${sessionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete chat session');
      }

      return data;

    } catch (error) {
      console.error('Delete chat session error:', error);
      throw error;
    }
  }

  // Clear all chat history
  async clearAllChatHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear chat history');
      }

      return data;

    } catch (error) {
      console.error('Clear chat history error:', error);
      throw error;
    }
  }

  // Validate token and refresh if needed
  async validateToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        return true;
      } else {
        // Token is invalid, clear auth
        this.clearAuth();
        return false;
      }

    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
      return false;
    }
  }
}

export default new AuthService();



