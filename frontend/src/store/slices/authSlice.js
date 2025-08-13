import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api.js'

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' })
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' })
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      if (!token) {
        throw new Error('No token available')
      }
      const response = await authAPI.getCurrentUser()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to get user' })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      return null
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Logout failed' })
    }
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setToken: (state, action) => {
      state.token = action.payload
      state.isAuthenticated = !!action.payload
      if (action.payload) {
        localStorage.setItem('token', action.payload)
      } else {
        localStorage.removeItem('token')
      }
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload
      if (action.payload) {
        localStorage.setItem('refreshToken', action.payload)
      } else {
        localStorage.removeItem('refreshToken')
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.tokens.accessToken
        state.refreshToken = action.payload.tokens.refreshToken
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.tokens.accessToken)
        localStorage.setItem('refreshToken', action.payload.tokens.refreshToken)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Registration failed' }
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.tokens.accessToken
        state.refreshToken = action.payload.tokens.refreshToken
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.tokens.accessToken)
        localStorage.setItem('refreshToken', action.payload.tokens.refreshToken)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Login failed' }
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to get user' }
        // Clear invalid tokens
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      })
  }
})

export const { clearError, setToken, setRefreshToken } = authSlice.actions
export default authSlice.reducer
