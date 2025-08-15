import express from 'express';
import { validateRequest, contactSchemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ContactController } from '../controllers/contactController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/contact - Submit contact form (public)
router.post('/',
  validateRequest(contactSchemas.submit),
  asyncHandler(ContactController.submitContact)
);

// Admin routes - require authentication
router.use(authenticateToken);

// GET /api/contact - Get all contact messages (admin)
router.get('/',
  asyncHandler(ContactController.getAllContacts)
);

// GET /api/contact/stats - Get contact statistics (admin)
router.get('/stats',
  asyncHandler(ContactController.getContactStats)
);

// GET /api/contact/:id - Get contact message by ID (admin)
router.get('/:id',
  asyncHandler(ContactController.getContactById)
);

// PUT /api/contact/:id/read - Mark contact as read (admin)
router.put('/:id/read',
  asyncHandler(ContactController.markAsRead)
);

// DELETE /api/contact/:id - Delete contact message (admin)
router.delete('/:id',
  asyncHandler(ContactController.deleteContact)
);

export default router;
