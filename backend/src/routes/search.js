import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { SearchController } from '../controllers/searchController.js';

const router = express.Router();

// GET /api/search/semantic - AI-powered semantic search
router.get('/semantic',
  optionalAuth,
  asyncHandler(SearchController.semanticSearch)
);

export default router;

