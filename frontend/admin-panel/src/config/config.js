// Configuration file for admin panel
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Wikramasooriya Admin Panel',
  APP_VERSION: '1.0.0'
};
