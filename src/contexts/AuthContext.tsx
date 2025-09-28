'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (storedToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(storedToken);
        // Set token in API client
        apiClient.setAuthToken(storedToken);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{
        user: User;
        token: string;
      }>('/auth/login', {
        email,
        password,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user: apiUser, token: apiToken } = response.data;

      localStorage.setItem('token', apiToken);
      localStorage.setItem('user', JSON.stringify(apiUser));
      setUser(apiUser);
      setToken(apiToken);
      apiClient.setAuthToken(apiToken);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    const password = _password;
    try {
      // Call server register
      const registerResponse = await apiClient.post<{ user: User }>(
        '/auth/register',
        { name, email, password }
      );

      if (!registerResponse.success) {
        throw new Error(registerResponse.message || 'Registration failed');
      }

      // Auto-login to get token and full user from server
      await login(email, password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    // Clear token from API client
    apiClient.clearAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
