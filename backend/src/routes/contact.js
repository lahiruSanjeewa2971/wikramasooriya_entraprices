import express from 'express';
import { validateRequest, contactSchemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ContactController } from '../controllers/contactController.js';

const router = express.Router();

// POST /api/contact - Submit contact form
router.post('/',
  validateRequest(contactSchemas.submit),
  asyncHandler(ContactController.submitContact)
);

export default router;
