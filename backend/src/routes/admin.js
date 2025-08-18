import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRequest, adminSchemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AdminController } from '../controllers/adminController.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Product Management
router.get('/products', asyncHandler(AdminController.getAllProducts));
router.post('/products', validateRequest(adminSchemas.createProduct), asyncHandler(AdminController.createProduct));
router.get('/products/:id', asyncHandler(AdminController.getProduct));
router.put('/products/:id', validateRequest(adminSchemas.updateProduct), asyncHandler(AdminController.updateProduct));
router.delete('/products/:id', asyncHandler(AdminController.deleteProduct));
router.post('/products/bulk-update', asyncHandler(AdminController.bulkUpdateProducts));

// Category Management
router.get('/categories', asyncHandler(AdminController.getAllCategories));
router.post('/categories', validateRequest(adminSchemas.createCategory), asyncHandler(AdminController.createCategory));
router.put('/categories/:id', validateRequest(adminSchemas.updateCategory), asyncHandler(AdminController.updateCategory));
router.delete('/categories/:id', asyncHandler(AdminController.deleteCategory));

// User Management
router.get('/users', asyncHandler(AdminController.getAllUsers));
router.get('/users/:id', asyncHandler(AdminController.getUser));
router.put('/users/:id', validateRequest(adminSchemas.updateUser), asyncHandler(AdminController.updateUser));
router.delete('/users/:id', asyncHandler(AdminController.deleteUser));

// Contact Messages Management
router.get('/contacts', asyncHandler(AdminController.getAllContacts));
router.get('/contacts/:id', asyncHandler(AdminController.getContact));
router.put('/contacts/:id', validateRequest(adminSchemas.updateContact), asyncHandler(AdminController.updateContact));
router.delete('/contacts/:id', asyncHandler(AdminController.deleteContact));
router.post('/contacts/:id/reply', validateRequest(adminSchemas.replyContact), asyncHandler(AdminController.replyToContact));

// Analytics & Dashboard
router.get('/analytics/overview', asyncHandler(AdminController.getDashboardOverview));
router.get('/analytics/products', asyncHandler(AdminController.getProductAnalytics));
router.get('/analytics/sales', asyncHandler(AdminController.getSalesAnalytics));
router.get('/analytics/users', asyncHandler(AdminController.getUserAnalytics));

// Excel Upload
router.post('/upload/excel', asyncHandler(AdminController.uploadExcel));

export default router;
