import axios from 'axios'
import { store } from '../store/store.js'
import { logoutUser } from '../store/slices/authSlice.js'
import { showToast } from '../store/slices/uiSlice.js'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
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
        const refreshToken = store.getState().auth.refreshToken
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          })
          
          const { accessToken } = response.data.data.tokens
          store.dispatch({ type: 'auth/setToken', payload: accessToken })
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logoutUser())
        store.dispatch(showToast({
          message: 'Session expired. Please login again.',
          type: 'error'
        }))
      }
    }

    // Handle other errors
    if (error.response?.data?.error) {
      const errorMessage = error.response.data.error.message
      store.dispatch(showToast({
        message: errorMessage,
        type: 'error'
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

export default api
