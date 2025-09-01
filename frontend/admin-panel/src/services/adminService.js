import apiClient from './apiClient';

class AdminService {
  // Product Management
  async getProducts(params = {}) {
    const response = await apiClient.get('/admin/products', { params });
    return response.data;
  }

  async createProduct(productData) {
    const response = await apiClient.post('/admin/products', productData);
    return response.data;
  }

  async updateProduct(id, productData) {
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  }

  async getProduct(id) {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  }

  // Category Management
  async getCategories() {
    const response = await apiClient.get('/admin/categories');
    return response.data;
  }

  async createCategory(categoryData) {
    const response = await apiClient.post('/admin/categories', categoryData);
    return response.data;
  }

  async updateCategory(id, categoryData) {
    const response = await apiClient.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id) {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  }

  // User Management
  async getUsers(params = {}) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  }

  async getUser(id) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id, userData) {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id) {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  }

  // Contact Messages Management
  async getContacts(params = {}) {
    const response = await apiClient.get('/admin/contacts', { params });
    console.log('Contacts Response:', response.data);
    return response.data;
  }

  async getContact(id) {
    const response = await apiClient.get(`/admin/contacts/${id}`);
    return response.data;
  }

  async updateContact(id, contactData) {
    const response = await apiClient.put(`/admin/contacts/${id}`, contactData);
    return response.data;
  }

  async deleteContact(id) {
    const response = await apiClient.delete(`/admin/contacts/${id}`);
    return response.data;
  }

  async replyToContact(id, replyData) {
    const response = await apiClient.post(`/admin/contacts/${id}/reply`, replyData);
    return response.data;
  }

  // Analytics
  async getDashboardOverview() {
    const response = await apiClient.get('/admin/analytics/overview');
    return response.data;
  }

  async getProductAnalytics() {
    const response = await apiClient.get('/admin/analytics/products');
    return response.data;
  }

  async getUserAnalytics() {
    const response = await apiClient.get('/admin/analytics/users');
    return response.data;
  }

  // Excel Upload Methods
  async uploadExcel(formData) {
    try {
      const response = await apiClient.post('/excel/upload-products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload Excel file');
    }
  }

  async validateExcel(formData) {
    try {
      const response = await apiClient.post('/excel/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate Excel file');
    }
  }

  async downloadExcelTemplate() {
    try {
      const response = await apiClient.get('/excel/template', {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download template');
    }
  }
}

export default new AdminService();
