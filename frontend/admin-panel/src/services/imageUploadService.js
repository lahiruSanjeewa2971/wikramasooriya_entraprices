import apiClient from './apiClient';

class ImageUploadService {
  /**
   * Upload a single image file
   * @param {File} file - The image file to upload
   * @param {string} folder - The folder to upload to (e.g., 'products', 'categories')
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} Upload response with image data
   */
  static async uploadImage(file, folder = 'products', onProgress = null) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);
      formData.append('timestamp', Date.now().toString());

      // Upload with progress tracking - don't set Content-Type header, let browser set it
      const response = await apiClient.post('/upload/image', formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      // Check if the response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      console.error('Image upload error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (errorData && errorData.error) {
          throw new Error(errorData.error.message || 'Upload failed');
        }
        throw new Error(`Upload failed: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        throw new Error(error.message || 'Failed to upload image');
      }
    }
  }

  /**
   * Delete an uploaded image
   * @param {string} publicId - The public ID of the image to delete
   * @returns {Promise<Object>} Delete response
   */
  static async deleteImage(publicId) {
    try {
      // URL encode the public ID to handle forward slashes properly
      const encodedPublicId = encodeURIComponent(publicId);
      const response = await apiClient.delete(`/upload/image/${encodedPublicId}`);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData && errorData.error) {
          throw new Error(errorData.error.message || 'Delete failed');
        }
        throw new Error(`Delete failed: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to delete image');
      }
    }
  }

  /**
   * Get image information
   * @param {string} publicId - The public ID of the image
   * @returns {Promise<Object>} Image information
   */
  static async getImageInfo(publicId) {
    try {
      const response = await apiClient.get(`/upload/image/${publicId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Image info error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData && errorData.error) {
          throw new Error(errorData.error.message || 'Failed to get image info');
        }
        throw new Error(`Failed to get image info: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to get image info');
      }
    }
  }

  /**
   * Transform image URL with Cloudinary parameters
   * @param {string} url - Original Cloudinary URL
   * @param {Object} options - Transformation options
   * @returns {string} Transformed URL
   */
  static transformImageUrl(url, options = {}) {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find the upload index
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return url;

      // Insert transformations after 'upload'
      const transformations = [];
      
      if (options.width) transformations.push(`w_${options.width}`);
      if (options.height) transformations.push(`h_${options.height}`);
      if (options.crop) transformations.push(`c_${options.crop}`);
      if (options.quality) transformations.push(`q_${options.quality}`);
      if (options.format) transformations.push(`f_${options.format}`);

      if (transformations.length > 0) {
        pathParts.splice(uploadIndex + 1, 0, transformations.join(','));
      }

      urlObj.pathname = pathParts.join('/');
      return urlObj.toString();
    } catch (error) {
      console.error('URL transformation error:', error);
      return url;
    }
  }

  /**
   * Generate thumbnail URL
   * @param {string} url - Original image URL
   * @param {number} size - Thumbnail size (default: 150)
   * @returns {string} Thumbnail URL
   */
  static getThumbnailUrl(url, size = 150) {
    return this.transformImageUrl(url, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 80
    });
  }

  /**
   * Generate optimized product image URL
   * @param {string} url - Original image URL
   * @param {number} width - Desired width (default: 800)
   * @param {number} height - Desired height (default: 800)
   * @returns {string} Optimized URL
   */
  static getOptimizedProductUrl(url, width = 800, height = 800) {
    return this.transformImageUrl(url, {
      width,
      height,
      crop: 'fill',
      quality: 85,
      format: 'auto'
    });
  }

  /**
   * Validate image file
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  static validateImageFile(file) {
    const errors = [];
    const warnings = [];

    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push('File must be an image');
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must be less than 10MB');
    }

    // Check file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File type not supported. Allowed: ${allowedExtensions.join(', ')}`);
    }

    // Warnings for large files
    if (file.size > 5 * 1024 * 1024) {
      warnings.push('Large file detected. Consider compressing for better performance.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name
    };
  }
}

export default ImageUploadService;
