import apiClient from './apiClient';

class CartService {
  // Get user's cart
  async getCart() {
    try {
      const response = await apiClient.get('/cart');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch cart.';
      throw new Error(message);
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const response = await apiClient.post('/cart/items', {
        productId,
        quantity
      });
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cart:updated'));
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart.';
      throw new Error(message);
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await apiClient.put(`/cart/items/${itemId}`, {
        quantity
      });
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cart:updated'));
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart item.';
      throw new Error(message);
    }
  }

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const response = await apiClient.delete(`/cart/items/${itemId}`);
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cart:updated'));
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart.';
      throw new Error(message);
    }
  }

  // Clear cart
  async clearCart() {
    try {
      const response = await apiClient.delete('/cart');
      
      // Dispatch cart updated event
      window.dispatchEvent(new CustomEvent('cart:updated'));
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart.';
      throw new Error(message);
    }
  }

  // Checkout with delivery option
  async checkoutDelivery(checkoutData) {
    try {
      const response = await apiClient.post('/cart/checkout/delivery', checkoutData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Checkout failed. Please try again.';
      throw new Error(message);
    }
  }

  // Checkout with pickup option
  async checkoutPickup(checkoutData) {
    try {
      const response = await apiClient.post('/cart/checkout/pickup', checkoutData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Checkout failed. Please try again.';
      throw new Error(message);
    }
  }

  // Get cart item count
  async getCartItemCount() {
    try {
      const response = await apiClient.get('/cart/count');
      return response.data.count;
    } catch (error) {
      return 0;
    }
  }
}

export default new CartService();
