import { apiClient } from '../api/client';
import { AuthToken } from '../api/config';

export class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;
  private tokenKey = 'library-app-token';

  private constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.loadTokenFromStorage();
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Load token from localStorage
  private loadTokenFromStorage() {
    try {
      const storedToken = localStorage.getItem(this.tokenKey);
      if (storedToken) {
        const tokenData: AuthToken = JSON.parse(storedToken);

        // Check if token is expired
        if (tokenData.expiresAt && new Date() > new Date(tokenData.expiresAt)) {
          this.clearToken();
          return;
        }

        this.setToken(tokenData.token);
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
      this.clearToken();
    }
  }

  // Save token to localStorage
  private saveTokenToStorage(token: string, expiresAt?: Date) {
    try {
      const tokenData: AuthToken = { token, expiresAt };
      localStorage.setItem(this.tokenKey, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  // Set authentication token
  setToken(token: string, expiresAt?: Date) {
    this.token = token;
    apiClient.setAuthToken(token);

    if (typeof window !== 'undefined') {
      this.saveTokenToStorage(token, expiresAt);
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Clear token
  clearToken() {
    this.token = null;
    apiClient.clearAuthToken();

    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();
