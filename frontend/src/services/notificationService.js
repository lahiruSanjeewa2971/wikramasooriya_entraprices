import apiClient from './apiClient';

class NotificationService {
  // Get all notifications
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notifications.';
      throw new Error(message);
    }
  }

  // Get unread notifications count
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch unread count.';
      throw new Error(message);
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark notification as read.';
      throw new Error(message);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark all notifications as read.';
      throw new Error(message);
    }
  }

  // Delete notification
  async deleteNotification(id) {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete notification.';
      throw new Error(message);
    }
  }

  // Get contact message notifications
  async getContactNotifications() {
    try {
      const response = await apiClient.get('/contact');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch contact notifications.';
      throw new Error(message);
    }
  }

  // Get contact statistics
  async getContactStats() {
    try {
      const response = await apiClient.get('/contact/stats');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch contact statistics.';
      throw new Error(message);
    }
  }

  // Mark contact as read
  async markContactAsRead(id) {
    try {
      const response = await apiClient.put(`/contact/${id}/read`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark contact as read.';
      throw new Error(message);
    }
  }

  // Delete contact message
  async deleteContact(id) {
    try {
      const response = await apiClient.delete(`/contact/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete contact message.';
      throw new Error(message);
    }
  }

  // Subscribe to real-time notifications (WebSocket or Server-Sent Events)
  subscribeToNotifications(callback) {
    // This would be implemented with WebSocket or Server-Sent Events
    // For now, we'll use polling
    const interval = setInterval(async () => {
      try {
        const response = await this.getUnreadCount();
        if (response.success && response.data.count > 0) {
          callback(response.data);
        }
      } catch (error) {
        console.error('Notification polling error:', error);
      }
    }, 30000); // Poll every 30 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}

export default new NotificationService();
