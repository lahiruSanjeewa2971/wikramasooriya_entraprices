import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import productReducer from './slices/productSlice.js'
import cartReducer from './slices/cartSlice.js'
import uiReducer from './slices/uiSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
