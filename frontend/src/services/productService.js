import apiClient from './apiClient';

class ProductService {
  // Get all products
  async getProducts(filters = {}) {
    try {
      const response = await apiClient.get('/products', { params: filters });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products.';
      throw new Error(message);
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch product.';
      throw new Error(message);
    }
  }

  // Get comprehensive product details with reviews and related products
  async getProductDetails(id) {
    try {
      const response = await apiClient.get(`/products/${id}/details`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch product details.';
      throw new Error(message);
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const response = await apiClient.get('/products', { params: { category } });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products by category.';
      throw new Error(message);
    }
  }

  // Search products - using the main products endpoint with search query
  async searchProducts(query) {
    try {
      const response = await apiClient.get('/products', { params: { q: query } });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search products.';
      throw new Error(message);
    }
  }

  // Semantic search products - AI-powered search using embeddings
  async semanticSearch(query, limit = 20) {
    try {
      const response = await apiClient.get('/search/semantic', { 
        params: { q: query, limit } 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to perform semantic search.';
      throw new Error(message);
    }
  }

  // Get featured products
  async getFeaturedProducts() {
    try {
      const response = await apiClient.get('/products/featured');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch featured products.';
      throw new Error(message);
    }
  }

  // Get new arrival products
  async getNewArrivals() {
    try {
      const response = await apiClient.get('/products/new');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch new arrivals.';
      throw new Error(message);
    }
  }

  // Get all categories
  async getCategories() {
    try {
      const response = await apiClient.get('/products/categories');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch categories.';
      throw new Error(message);
    }
  }
}

export default new ProductService();
