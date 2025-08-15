import apiClient from './apiClient';

class ContactService {
  // Submit contact form
  async submitContact(contactData) {
    try {
      const response = await apiClient.post('/contact', contactData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit contact form.';
      throw new Error(message);
    }
  }

  // Get all contact messages (for admin panel)
  async getAllContacts() {
    try {
      const response = await apiClient.get('/contact');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch contact messages.';
      throw new Error(message);
    }
  }

  // Get contact message by ID (for admin panel)
  async getContactById(id) {
    try {
      const response = await apiClient.get(`/contact/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch contact message.';
      throw new Error(message);
    }
  }

  // Mark contact as read (for admin panel)
  async markAsRead(id) {
    try {
      const response = await apiClient.put(`/contact/${id}/read`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark contact as read.';
      throw new Error(message);
    }
  }

  // Delete contact message (for admin panel)
  async deleteContact(id) {
    try {
      const response = await apiClient.delete(`/contact/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete contact message.';
      throw new Error(message);
    }
  }
}

export default new ContactService();
