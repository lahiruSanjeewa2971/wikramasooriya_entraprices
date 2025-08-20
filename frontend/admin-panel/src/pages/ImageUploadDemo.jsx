import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import ImageUpload from '../components/ImageUpload';

export default function ImageUploadDemo() {
  const [demoImage1, setDemoImage1] = useState(null);
  const [demoImage2, setDemoImage2] = useState({
    url: 'https://res.cloudinary.com/demo/image/upload/v1/products/sample_product.jpg',
    public_id: 'products_sample_product',
    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/products/sample_product.jpg',
    original_name: 'sample_product.jpg',
    format: 'JPG',
    size: 2048576, // 2MB
    width: 800,
    height: 600
  });
  const [demoImage3, setDemoImage3] = useState(null);

  const handleImageChange1 = (imageData) => {
    setDemoImage1(imageData);
    console.log('Demo 1 - New image:', imageData);
  };

  const handleImageChange2 = (imageData) => {
    setDemoImage2(imageData);
    console.log('Demo 2 - Image updated:', imageData);
  };

  const handleImageChange3 = (imageData) => {
    setDemoImage3(imageData);
    console.log('Demo 3 - New image:', imageData);
  };

  const handleImageRemove1 = () => {
    setDemoImage1(null);
    console.log('Demo 1 - Image removed');
  };

  const handleImageRemove2 = () => {
    setDemoImage2(null);
    console.log('Demo 2 - Image removed');
  };

  const handleImageRemove3 = () => {
    setDemoImage3(null);
    console.log('Demo 3 - Image removed');
  };

  const resetAll = () => {
    setDemoImage1(null);
    setDemoImage2({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/products/sample_product.jpg',
      public_id: 'products_sample_product',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/products/sample_product.jpg',
      original_name: 'sample_product.jpg',
      format: 'JPG',
      size: 2048576, // 2MB
      width: 800,
      height: 600
    });
    setDemoImage3(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Image Upload Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the real image upload functionality with different scenarios
        </p>
        <Button onClick={resetAll} className="mt-4">
          Reset All Demos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demo 1: Empty State */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo 1: Empty State</CardTitle>
            <p className="text-sm text-gray-500">No image uploaded yet</p>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImage={demoImage1}
              onImageChange={handleImageChange1}
              onImageRemove={handleImageRemove1}
            />
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Current State:</strong> {demoImage1 ? 'Image uploaded' : 'No image'}
              </p>
              {demoImage1 && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <strong>URL:</strong> {demoImage1.url}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <strong>Format:</strong> {demoImage1.format}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <strong>Size:</strong> {(demoImage1.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo 2: Existing Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo 2: Existing Image</CardTitle>
            <p className="text-sm text-gray-500">Product with current image</p>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImage={demoImage2}
              onImageChange={handleImageChange2}
              onImageRemove={handleImageRemove2}
            />
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Current State:</strong> {demoImage2 ? 'Image uploaded' : 'No image'}
              </p>
              {demoImage2 && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <strong>URL:</strong> {demoImage2.url}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <strong>Format:</strong> {demoImage2.format}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <strong>Size:</strong> {(demoImage2.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo 3: Disabled State */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo 3: Disabled State</CardTitle>
            <p className="text-sm text-gray-500">Upload disabled (e.g., during save)</p>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImage={demoImage3}
              onImageChange={handleImageChange3}
              onImageRemove={handleImageRemove3}
              disabled={true}
            />
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Current State:</strong> {demoImage3 ? 'Image uploaded' : 'No image'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                <strong>Status:</strong> Disabled
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">How to Test</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300">
          <div className="space-y-2 text-sm">
            <p><strong>1. Drag & Drop:</strong> Drag an image file over any upload area</p>
            <p><strong>2. Click to Select:</strong> Click "Choose Image" to browse files</p>
            <p><strong>3. File Validation:</strong> Try uploading non-image files or files &gt; 10MB</p>
            <p><strong>4. Image Management:</strong> Replace or remove existing images</p>
            <p><strong>5. Real Upload:</strong> Watch the actual upload progress</p>
            <p><strong>6. Console Logs:</strong> Check browser console for image data</p>
            <p><strong>7. Error Handling:</strong> Test with invalid files to see error messages</p>
          </div>
        </CardContent>
      </Card>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700 dark:text-green-300">✅ Core Functionality</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Real image upload with progress tracking</li>
                <li>• File type validation (JPG, PNG, WebP)</li>
                <li>• File size validation (10MB limit)</li>
                <li>• Image preview before upload</li>
                <li>• Single image per product</li>
                <li>• Professional error handling</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-700 dark:text-green-300">✅ User Experience</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Drag & drop with visual feedback</li>
                <li>• Real-time upload progress</li>
                <li>• Comprehensive validation</li>
                <li>• Responsive design</li>
                <li>• Dark mode support</li>
                <li>• Image metadata display</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Service</h5>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• RESTful API integration with progress tracking</li>
                <li>• FormData handling for multipart uploads</li>
                <li>• Comprehensive file validation</li>
                <li>• Error handling and user feedback</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Image Processing</h5>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• Cloudinary URL transformation support</li>
                <li>• Thumbnail generation</li>
                <li>• Image optimization</li>
                <li>• Format conversion</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">State Management</h5>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• React hooks for local state</li>
                <li>• Callback-based parent communication</li>
                <li>• Optimistic UI updates</li>
                <li>• Error state persistence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
