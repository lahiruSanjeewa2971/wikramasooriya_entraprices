import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import ImageUploadService from '../services/imageUploadService';

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  onImageRemove, 
  onImageRestore, // New prop for restoring image
  disabled = false, 
  className = '',
  isMarkedForDeletion = false // New prop to show deletion state
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Handle drag and drop events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    console.log('File selected:', file.name, file.size, file.type); // Debug log

    // Reset any previous errors
    setUploadError(null);

    // Validate file using the service
    const validation = ImageUploadService.validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.errors[0]);
      return;
    }

    // Show warnings in console
    if (validation.warnings.length > 0) {
      console.warn('Image upload warnings:', validation.warnings);
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setPreviewImage(imageUrl);
      
      // Start real upload
      uploadImage(file);
    };
    reader.readAsDataURL(file);
  };

  // Real image upload function
  const uploadImage = async (file) => {
    console.log('Starting upload for file:', file.name); // Debug log
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Use the real upload service
      const uploadedImageData = await ImageUploadService.uploadImage(
        file, 
        'products', 
        (progress) => setUploadProgress(progress)
      );

      console.log('Upload successful:', uploadedImageData); // Debug log
      console.log('🔍 Image data structure:', {
        url: uploadedImageData?.url,
        public_id: uploadedImageData?.public_id,
        secure_url: uploadedImageData?.secure_url,
        original_name: uploadedImageData?.original_name,
        format: uploadedImageData?.format,
        size: uploadedImageData?.size,
        width: uploadedImageData?.width,
        height: uploadedImageData?.height
      });

      // Clear preview and update parent
      setPreviewImage(null);
      if (onImageChange) {
        console.log('🔍 Calling onImageChange with:', uploadedImageData);
        onImageChange(uploadedImageData);
      }

      // Reset states
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
      setPreviewImage(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Remove current image
  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    document.getElementById('image-upload-input').click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {currentImage && (
        <Card className={`border-2 border-dashed transition-colors duration-200 ${
          isMarkedForDeletion 
            ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isMarkedForDeletion ? 'Image Marked for Removal' : 'Current Product Image'}
              </h4>
              <div className="flex space-x-2">
                {isMarkedForDeletion && onImageRestore && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onImageRestore}
                    disabled={disabled || isUploading}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onImageRemove}
                  disabled={disabled || isUploading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {isMarkedForDeletion && (
              <div className="mb-3 p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
                <p className="text-xs text-red-700 dark:text-red-300">
                  ⚠️ This image will be permanently deleted when you save the product.
                </p>
              </div>
            )}
            <div className="relative">
              <img
                src={currentImage.url || currentImage}
                alt="Product"
                className={`w-full h-32 object-cover rounded-lg ${
                  isMarkedForDeletion ? 'opacity-50' : ''
                }`}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
            </div>
            {/* Image details */}
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <p>Format: {currentImage.format || 'Unknown'}</p>
              <p>Size: {currentImage.size ? `${(currentImage.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
              {currentImage.width && currentImage.height && (
                <p>Dimensions: {currentImage.width} × {currentImage.height}px</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      {!currentImage && (
        <Card className={`border-2 border-dashed transition-colors duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          <CardContent className="p-6">
            <div
              className={`text-center ${
                isDragOver ? 'scale-105' : 'scale-100'
              } transition-transform duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Upload Icon */}
              <div className="mx-auto h-12 w-12 mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Upload Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {isUploading ? 'Uploading...' : 'Upload Product Image'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isUploading 
                    ? 'Please wait while we upload your image' 
                    : 'Drag and drop an image here, or click to select'
                  }
                </p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}

              {/* Upload Button */}
              {!isUploading && (
                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={disabled}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              )}

              {/* File Input (Hidden) */}
              <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled || isUploading}
              />

              {/* File Requirements */}
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <p>Supported formats: JPG, PNG, WebP</p>
                <p>Maximum size: 10MB</p>
                <p>Recommended: 800x800px or larger</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview (for new uploads) */}
      {previewImage && !currentImage && (
        <Card className="border-2 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-300">
                Image Preview
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPreviewImage(null)}
                disabled={isUploading}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {uploadError && (
        <Card className="border-2 border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
