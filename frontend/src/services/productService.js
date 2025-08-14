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

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const response = await apiClient.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products by category.';
      throw new Error(message);
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      const response = await apiClient.get('/products/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search products.';
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
}

export default new ProductService();
