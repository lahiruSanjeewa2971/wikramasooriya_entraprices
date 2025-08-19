import apiClient from './apiClient';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      console.log('AuthService: Making login request to:', '/auth/login');
      const response = await apiClient.post('/auth/login', credentials);
      console.log('AuthService: Login response:', response.data);
      
      const { tokens, user } = response.data.data;
      
      // Check if user is admin
      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Store token and user data
      localStorage.setItem('authToken', tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      console.error('AuthService: Login error:', error);
      console.error('AuthService: Error response:', error.response?.data);
      
      let message = 'Login failed. Please try again.';
      
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      throw new Error(message);
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
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

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();
