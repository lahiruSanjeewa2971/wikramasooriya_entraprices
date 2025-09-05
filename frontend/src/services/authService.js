import apiClient from './apiClient';

class AuthService {
  // Login user
  async login(credentials) {
    try {
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
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
