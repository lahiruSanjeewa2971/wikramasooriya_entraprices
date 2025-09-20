import apiClient from './apiClient';

class ReviewService {
  // Create a new product review
  async createReview(productId, reviewData) {
    try {
      const response = await apiClient.post(`/reviews/product/${productId}`, reviewData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to submit review.';
      throw new Error(message);
    }
  }

  // Get product reviews with pagination and sorting
  async getProductReviews(productId, options = {}) {
    try {
      const response = await apiClient.get(`/reviews/product/${productId}`, { 
        params: options 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch reviews.';
      throw new Error(message);
    }
  }

  // Update an existing review
  async updateReview(productId, reviewId, reviewData) {
    try {
      const response = await apiClient.put(`/reviews/product/${productId}/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to update review.';
      throw new Error(message);
    }
  }

  // Delete a review
  async deleteReview(productId, reviewId) {
    try {
      const response = await apiClient.delete(`/reviews/product/${productId}/${reviewId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to delete review.';
      throw new Error(message);
    }
  }

  // Mark review as helpful/unhelpful
  async markHelpful(productId, reviewId, isHelpful) {
    try {
      const response = await apiClient.post(`/reviews/product/${productId}/${reviewId}/helpful`, {
        is_helpful: isHelpful
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to update review helpfulness.';
      throw new Error(message);
    }
  }

  // Get user's review for a specific product
  async getUserReview(productId) {
    try {
      const response = await apiClient.get(`/reviews/user/${productId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch user review.';
      throw new Error(message);
    }
  }
}

export default new ReviewService();
