export class User {
  constructor({
    id,
    email,
    name,
    picture,
    googleId,
    password,
    isGoogleLinked,
    createdAt,
    lastLogin,
    preferences = {},
    chatHistory = []
  }) {
    this.id = id || this.generateId();
    this.email = email;
    this.name = name;
    this.picture = picture;
    this.googleId = googleId;
    this.password = password; // Will be hashed
    this.isGoogleLinked = isGoogleLinked || false;
    this.createdAt = createdAt || new Date().toISOString();
    this.lastLogin = lastLogin;
    this.preferences = {
      theme: 'light',
      language: 'en',
      notifications: true,
      ...preferences
    };
    this.chatHistory = chatHistory;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      picture: this.picture,
      googleId: this.googleId,
      isGoogleLinked: this.isGoogleLinked,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      preferences: this.preferences,
      chatHistory: this.chatHistory
    };
  }

  // Exclude sensitive data for client
  toPublicJSON() {
    const { password, ...publicData } = this.toJSON();
    return publicData;
  }
}
