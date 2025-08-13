import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productAPI } from '../../services/api.js'

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProducts(filters)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' })
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProduct(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch product' })
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getCategories()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch categories' })
    }
  }
)

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getFeaturedProducts()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch featured products' })
    }
  }
)

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getNewArrivals()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch new arrivals' })
    }
  }
)

const initialState = {
  products: [],
  featuredProducts: [],
  newArrivals: [],
  categories: [],
  currentProduct: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    category: '',
    featured: false,
    new_arrival: false,
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  },
  loading: false,
  error: null
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to fetch products' }
      })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload.product
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to fetch product' }
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload.categories
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to fetch categories' }
      })
      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false
        state.featuredProducts = action.payload.products
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to fetch featured products' }
      })
      // Fetch New Arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.loading = false
        state.newArrivals = action.payload.products
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || { message: 'Failed to fetch new arrivals' }
      })
  }
})

export const { 
  clearError, 
  clearCurrentProduct, 
  setFilters, 
  clearFilters, 
  setPagination 
} = productSlice.actions

export default productSlice.reducer
