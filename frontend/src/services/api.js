import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper functions for token management
const getToken = () => localStorage.getItem('authToken')
const getRefreshToken = () => localStorage.getItem('refreshToken')
const setToken = (token) => localStorage.setItem('authToken', token)
const removeTokens = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh token
      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          })
          
          const { accessToken } = response.data.data.tokens
          setToken(accessToken)
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        removeTokens()
        // You can add a callback or event to notify the app about logout
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: { message: 'Session expired. Please login again.' }
        }))
      }
    }

    // Handle other errors
    if (error.response?.data?.error) {
      const errorMessage = error.response.data.error.message
      // You can add a callback or event to notify the app about errors
      window.dispatchEvent(new CustomEvent('api:error', {
        detail: { message: errorMessage }
      }))
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken })
}

// Product API
export const productAPI = {
  getProducts: (filters = {}) => api.get('/products', { params: filters }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getFeaturedProducts: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new')
}

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (itemData) => api.post('/cart/add', itemData),
  updateItem: (id, updateData) => api.put(`/cart/item/${id}`, updateData),
  removeItem: (id) => api.delete(`/cart/item/${id}`),
  clearCart: () => api.delete('/cart/clear')
}

// Contact API
export const contactAPI = {
  submitContact: (contactData) => api.post('/contact', contactData)
}

// Token management utilities
export const tokenUtils = {
  getToken,
  getRefreshToken,
  setToken,
  removeTokens,
  isAuthenticated: () => !!getToken()
}

export default api
