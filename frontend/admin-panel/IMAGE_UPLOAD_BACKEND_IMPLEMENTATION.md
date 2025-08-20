# Image Upload Backend Implementation Guide

This guide explains how to implement the backend for the image upload functionality in the admin panel.

## 🎯 Overview

The frontend is now fully implemented with:
- ✅ Image upload component with drag & drop
- ✅ File validation (10MB limit, JPG/PNG/WebP)
- ✅ Progress tracking
- ✅ Error handling
- ✅ Image preview and management
- ✅ Service layer ready for backend integration

## 🚀 Backend Implementation Steps

### 1. Install Required Dependencies

```bash
npm install multer cloudinary multer-storage-cloudinary
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

### 3. Create Upload Middleware

Create `backend/src/middleware/upload.js`:

```javascript
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: (req, file, cb) => {
      // Dynamic folder based on request
      const folder = req.body.folder || 'general';
      cb(null, folder);
    },
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file, cb) => {
      // Generate unique public ID
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, '');
      cb(null, `${req.body.folder || 'general'}_${timestamp}_${originalName}`);
    },
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES.split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
});

export default upload;
```

### 4. Create Upload Controller

Create `backend/src/controllers/uploadController.js`:

```javascript
import { AppError } from '../middleware/errorHandler.js';
import { logApiError } from '../utils/logger.js';

export default class UploadController {
  /**
   * Upload a single image
   */
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        throw new AppError('No image file provided', 400, 'MISSING_FILE');
      }

      // Get file information
      const fileInfo = {
        url: req.file.secure_url,
        public_id: req.file.public_id,
        secure_url: req.file.secure_url,
        original_name: req.file.originalname,
        size: req.file.size,
        format: req.file.format,
        width: req.file.width,
        height: req.file.height,
        folder: req.body.folder || 'general',
        created_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: fileInfo
      });

    } catch (error) {
      logApiError(req, error, { operation: 'uploadImage' });
      throw error;
    }
  }

  /**
   * Delete an uploaded image
   */
  static async deleteImage(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw new AppError('Public ID is required', 400, 'MISSING_PUBLIC_ID');
      }

      // Delete from Cloudinary
      const result = await cloudinary.v2.uploader.destroy(publicId);

      if (result.result === 'ok') {
        res.json({
          success: true,
          message: 'Image deleted successfully'
        });
      } else {
        throw new AppError('Failed to delete image', 500, 'DELETE_FAILED');
      }

    } catch (error) {
      logApiError(req, error, { operation: 'deleteImage' });
      throw error;
    }
  }

  /**
   * Get image information
   */
  static async getImageInfo(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw new AppError('Public ID is required', 400, 'MISSING_PUBLIC_ID');
      }

      // Get image info from Cloudinary
      const result = await cloudinary.v2.api.resource(publicId);

      const imageInfo = {
        url: result.secure_url,
        public_id: result.public_id,
        secure_url: result.secure_url,
        original_name: result.original_filename,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
        created_at: result.created_at
      };

      res.json({
        success: true,
        data: imageInfo
      });

    } catch (error) {
      logApiError(req, error, { operation: 'getImageInfo' });
      throw error;
    }
  }
}
```

### 5. Create Upload Routes

Create `backend/src/routes/upload.js`:

```javascript
import express from 'express';
import upload from '../middleware/upload.js';
import UploadController from '../controllers/uploadController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all upload routes
router.use(auth);

// Upload single image
router.post('/image', 
  upload.single('image'), 
  asyncHandler(UploadController.uploadImage)
);

// Delete image
router.delete('/image/:publicId', 
  asyncHandler(UploadController.deleteImage)
);

// Get image info
router.get('/image/:publicId', 
  asyncHandler(UploadController.getImageInfo)
);

export default router;
```

### 6. Add Routes to Server

In `backend/src/server.js`, add:

```javascript
import uploadRoutes from './routes/upload.js';

// ... existing code ...

// Upload routes
app.use('/api/upload', uploadRoutes);
```

### 7. Update Product Schema

Ensure your products table has the image fields:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_format VARCHAR(10);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_size INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_width INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_height INTEGER;
```

### 8. Update Product Service

In `backend/src/services/simpleProductService.js`, update the create/update methods:

```javascript
static async createProduct(productData) {
  try {
    const {
      name, sku, description, short_description, image_url, price,
      stock_qty, category_id, featured, new_arrival, weight,
      dimensions, is_active
    } = productData;

    // Extract image data if present
    const imageFields = image_url ? {
      image_url,
      image_public_id: productData.image_public_id,
      image_format: productData.image_format,
      image_size: productData.image_size,
      image_width: productData.image_width,
      image_height: productData.image_height
    } : {};

    const insertQuery = `
      INSERT INTO products (
        name, sku, description, short_description, image_url,
        image_public_id, image_format, image_size, image_width, image_height,
        price, stock_qty, category_id, featured, new_arrival,
        weight, dimensions, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const values = [
      name, sku, description, short_description, image_url,
      imageFields.image_public_id || null,
      imageFields.image_format || null,
      imageFields.image_size || null,
      imageFields.image_width || null,
      imageFields.image_height || null,
      price, stock_qty, category_id, featured, new_arrival,
      weight, dimensions, is_active
    ];

    const result = await query(insertQuery, values);
    return result.rows[0];
  } catch (error) {
    logDatabaseError('createProduct', error, insertQuery, values);
    throw new Error('Failed to create product');
  }
}
```

## 🔧 Frontend Integration

The frontend is already configured to work with this backend. The `ImageUploadService` will:

1. Send POST requests to `/api/upload/image`
2. Include the image file and folder in FormData
3. Track upload progress
4. Handle the response and update the UI
5. Store image metadata in the product form

## 🧪 Testing

### Test the Upload Endpoint

```bash
# Test with curl
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@test-image.jpg" \
  -F "folder=products"
```

### Test File Validation

- Try uploading non-image files
- Try uploading files > 10MB
- Try uploading without authentication
- Verify Cloudinary storage and transformations

## 🚨 Error Handling

The system handles:
- File size limits
- File type validation
- Authentication errors
- Upload failures
- Network errors
- Cloudinary API errors

## 📱 Frontend Features

Once connected to the backend:
- Real upload progress
- Actual Cloudinary URLs
- Image metadata display
- Error messages from server
- Image deletion capability
- Thumbnail generation

## 🔄 Next Steps

1. **Implement the backend** following this guide
2. **Test the upload functionality** with real files
3. **Add image optimization** if needed
4. **Implement cleanup** for deleted products
5. **Add image transformations** for different use cases
6. **Monitor upload usage** and costs

## 💡 Tips

- Use environment variables for all Cloudinary credentials
- Implement proper error logging
- Add rate limiting for uploads
- Consider image compression for large files
- Monitor Cloudinary usage and costs
- Implement cleanup for orphaned images

The frontend is production-ready and will work seamlessly once the backend is implemented! 🎉
