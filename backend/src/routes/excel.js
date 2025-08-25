import express from 'express';
import { uploadExcel } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ExcelController } from '../controllers/excelController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Upload Excel file for products
router.post('/upload-products', 
  uploadExcel.single('excel'),
  asyncHandler(ExcelController.uploadProducts)
);

// Download Excel template
router.get('/template', 
  asyncHandler(ExcelController.downloadTemplate)
);

// Validate Excel file without processing
router.post('/validate', 
  uploadExcel.single('excel'),
  asyncHandler(ExcelController.validateExcel)
);

export default router;
