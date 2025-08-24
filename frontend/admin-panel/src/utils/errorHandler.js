/**
 * Utility function to extract error messages from various error response formats
 * @param {Error} error - The error object from API calls
 * @param {string} defaultMessage - Default message if no error details found
 * @returns {string} The extracted error message
 */
export const extractErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    // Backend error message
    return error.response.data.message;
  } else if (error.response?.data?.error) {
    // Alternative error field
    return error.response.data.error.message;
  } else if (error.message) {
    // Axios error message
    return error.message;
  }
  return defaultMessage;
};

/**
 * Utility function to check if an error is a specific HTTP status
 * @param {Error} error - The error object
 * @param {number} status - HTTP status code to check
 * @returns {boolean} True if error has the specified status
 */
export const isErrorStatus = (error, status) => {
  return error.response?.status === status;
};

/**
 * Utility function to check if an error is a network error
 * @param {Error} error - The error object
 * @returns {boolean} True if it's a network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

/**
 * Utility function to get error status code
 * @param {Error} error - The error object
 * @returns {number|null} HTTP status code or null
 */
export const getErrorStatus = (error) => {
  return error.response?.status || null;
};
