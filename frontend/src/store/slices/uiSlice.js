import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loading: false,
  globalError: null,
  toast: {
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 5000
  },
  modal: {
    show: false,
    type: null, // 'login', 'register', 'cart'
    data: null
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setGlobalError: (state, action) => {
      state.globalError = action.payload
    },
    clearGlobalError: (state) => {
      state.globalError = null
    },
    showToast: (state, action) => {
      state.toast = {
        show: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000
      }
    },
    hideToast: (state) => {
      state.toast.show = false
    },
    showModal: (state, action) => {
      state.modal = {
        show: true,
        type: action.payload.type,
        data: action.payload.data || null
      }
    },
    hideModal: (state) => {
      state.modal.show = false
      state.modal.type = null
      state.modal.data = null
    }
  }
})

export const { 
  setLoading, 
  setGlobalError, 
  clearGlobalError, 
  showToast, 
  hideToast, 
  showModal, 
  hideModal 
} = uiSlice.actions

export default uiSlice.reducer
