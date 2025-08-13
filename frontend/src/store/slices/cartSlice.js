import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartAPI } from '../../services/api.js'

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      if (!token) {
        throw new Error('No token available')
      }
      const response = await cartAPI.getCart()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch cart' })
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      if (!token) {
        throw new Error('No token available')
      }
      const response = await cartAPI.addItem(itemData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add item to cart' })
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ id, qty }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      if (!token) {
        throw new Error('No token available')
      }
      const response = await cartAPI.updateItem(id, { qty })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update cart item' })
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      if (!token) {
        throw new Error('No token available')
      }
      const response = await cartAPI.removeItem(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove item from cart' })
    }
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      if (!token) {
        throw new Error('No token available')
      }
      const response = await cartAPI.clearCart()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to clear cart' })
    }
  }
)

const initialState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  loading: false,
  error: null
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    // Local cart operations for unauthenticated users
    addItemLocally: (state, action) => {
      const { productId, qty, product } = action.payload
      const existingItem = state.items.find(item => item.product_id === productId)
      
      if (existingItem) {
        existingItem.qty += qty
        existingItem.subtotal = existingItem.price_at_add * existingItem.qty
      } else {
        state.items.push({
          id: Date.now(), // Temporary ID
          product_id: productId,
          qty,
          price_at_add: product.price,
          subtotal: product.price * qty,
          product
        })
      }
      
      state.itemCount = state.items.reduce((sum, item) => sum + item.qty, 0)
      state.totalAmount = state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    updateItemLocally: (state, action) => {
      const { id, qty } = action.payload
      const item = state.items.find(item => item.id === id)
      
      if (item) {
        item.qty = qty
        item.subtotal = item.price_at_add * qty
        
        state.itemCount = state.items.reduce((sum, item) => sum + item.qty, 0)
        state.totalAmount = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      }
    },
    removeItemLocally: (state, action) => {
      const id = action.payload
      state.items = state.items.filter(item => item.id !== id)
      
      state.itemCount = state.items.reduce((sum, item) => sum + item.qty, 0)
      state.totalAmount = state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    clearCartLocally: (state) => {
      state.items = []
      state.itemCount = 0
      state.totalAmount = 0
    },
    // Sync local cart with server cart
    syncWithServer: (state, action) => {
      const { cart } = action.payload
      state.items = cart.items || []
      state.totalAmount = cart.total_amount || 0
      state.itemCount = cart.item_count || 0
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        const { cart } = action.payload
        state.items = cart.items || []
        state.totalAmount = cart.total_amount || 0
        state.itemCount = cart.item_count || 0
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to fetch cart' }
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        const { cart } = action.payload
        state.items = cart.items || []
        state.totalAmount = cart.total_amount || 0
        state.itemCount = cart.item_count || 0
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to add item to cart' }
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false
        const { cart } = action.payload
        state.items = cart.items || []
        state.totalAmount = cart.total_amount || 0
        state.itemCount = cart.item_count || 0
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to update cart item' }
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false
        const { cart } = action.payload
        state.items = cart.items || []
        state.totalAmount = cart.total_amount || 0
        state.itemCount = cart.item_count || 0
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to remove item from cart' }
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false
        const { cart } = action.payload
        state.items = cart.items || []
        state.totalAmount = cart.total_amount || 0
        state.itemCount = cart.item_count || 0
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to clear cart' }
      })
  }
})

export const { 
  clearError, 
  addItemLocally, 
  updateItemLocally, 
  removeItemLocally, 
  clearCartLocally,
  syncWithServer
} = cartSlice.actions

export default cartSlice.reducer
