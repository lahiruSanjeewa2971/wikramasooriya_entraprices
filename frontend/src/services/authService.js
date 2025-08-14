import apiClient from './apiClient';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
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
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
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
    localStorage.removeItem('authToken');
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
    return !!localStorage.getItem('authToken');
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Refresh token (if needed in future)
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      return token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}

export default new AuthService();
