import apiClient from './apiClient';

export const userProfileService = {
  // Get user profile information
  async getUserProfile() {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch profile.';
      throw new Error(message);
    }
  },

  // Update user profile information
  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to update profile.';
      throw new Error(message);
    }
  },

  // Get user's reviews
  async getUserReviews(page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC') {
    try {
      const response = await apiClient.get('/users/reviews', {
        params: { page, limit, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch reviews.';
      throw new Error(message);
    }
  },

  // Update user's review
  async updateUserReview(reviewId, reviewData) {
    try {
      const response = await apiClient.put(`/users/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to update review.';
      throw new Error(message);
    }
  },

  // Delete user's review
  async deleteUserReview(reviewId) {
    try {
      const response = await apiClient.delete(`/users/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to delete review.';
      throw new Error(message);
    }
  },

  // Get user's orders
  async getUserOrders(page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC') {
    try {
      const response = await apiClient.get('/users/orders', {
        params: { page, limit, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch orders.';
      throw new Error(message);
    }
  },

  // Get specific order details
  async getUserOrderDetails(orderId) {
    try {
      const response = await apiClient.get(`/users/orders/${orderId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch order details.';
      throw new Error(message);
    }
  },

  // Update user preferences
  async updateUserPreferences(preferencesData) {
    try {
      const response = await apiClient.put('/users/preferences', preferencesData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to update preferences.';
      throw new Error(message);
    }
  },

  // Get user addresses
  async getUserAddresses() {
    try {
      const response = await apiClient.get('/users/addresses');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch addresses.';
      throw new Error(message);
    }
  },

  // Add user address
  async addUserAddress(addressData) {
    try {
      const response = await apiClient.post('/users/addresses', addressData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to add address.';
      throw new Error(message);
    }
  },

  // Update user address
  async updateUserAddress(addressId, addressData) {
    try {
      const response = await apiClient.put(`/users/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to update address.';
      throw new Error(message);
    }
  },

  // Set address as default
  async setDefaultAddress(addressId) {
    try {
      const response = await apiClient.put(`/users/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to set default address.';
      throw new Error(message);
    }
  },

  // Delete user address
  async deleteUserAddress(addressId) {
    try {
      const response = await apiClient.delete(`/users/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to delete address.';
      throw new Error(message);
    }
  },

  // Change user password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/users/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to change password.';
      throw new Error(message);
    }
  },

  // Upload user avatar
  async uploadAvatar(formData) {
    try {
      const response = await apiClient.post('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to upload avatar.';
      throw new Error(message);
    }
  },

  // Remove user avatar
  async removeAvatar() {
    try {
      const response = await apiClient.delete('/users/profile/avatar');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to remove avatar.';
      throw new Error(message);
    }
  }
};

export default userProfileService;