import apiClient from './apiClient';
import { clearAvatarCache, shouldClearCache } from '../utils/cacheUtils';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      // Check if switching from Google OAuth to credentials
      const previousUser = this.getCurrentUser();
      if (shouldClearCache(previousUser)) {
        console.log('🧹 Switching from Google OAuth to credentials - clearing cache');
        clearAvatarCache();
      }
      
      const response = await apiClient.post('/auth/login', credentials);
      const { tokens, user } = response.data.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Dispatch login event
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { user } }));
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(message);
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { tokens, user } = response.data.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Dispatch login event
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { user } }));
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  }

  // Logout user
  logout() {
    // Get current user before clearing to check if cache clearing is needed
    const currentUser = this.getCurrentUser();
    
    // Clear authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear cache if user was a Google OAuth user (to prevent CORS issues)
    if (shouldClearCache(currentUser)) {
      console.log('🧹 Google OAuth user detected - clearing cache to prevent avatar issues');
      clearAvatarCache();
    }
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  // Get access token
  getToken() {
    return localStorage.getItem('accessToken');
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Refresh token (if needed in future)
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Google OAuth login
  async googleLogin(googleData) {
    try {
      console.log('AuthService: Starting Google login with data:', googleData);
      
      // Check if switching from credentials to Google OAuth
      const previousUser = this.getCurrentUser();
      if (previousUser && !shouldClearCache(previousUser)) {
        console.log('🧹 Switching from credentials to Google OAuth - clearing cache');
        clearAvatarCache();
      }
      
      const response = await apiClient.post('/auth/google/callback', googleData);
      const { tokens, user } = response.data;
      
      console.log('AuthService: Received response:', { tokens, user });
      
      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('AuthService: Stored data in localStorage');
      
      // Dispatch login event
      const loginEvent = new CustomEvent('auth:login', { detail: { user } });
      console.log('AuthService: Dispatching auth:login event', user);
      window.dispatchEvent(loginEvent);
      
      return { success: true, user };
    } catch (error) {
      console.error('AuthService: Google login error:', error);
      const message = error.response?.data?.error?.message || 'Google login failed. Please try again.';
      throw new Error(message);
    }
  }
}

export default new AuthService();
