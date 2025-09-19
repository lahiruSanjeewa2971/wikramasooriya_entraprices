import { AppError } from '../middleware/errorHandler.js';
import { simpleProductService } from '../services/simpleProductService.js';

export class ProductController {
  static async listProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        featured,
        new_arrival,
        q: searchQuery,
        minPrice,
        maxPrice,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        featured,
        new_arrival,
        search: searchQuery,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      };

      const result = await simpleProductService.getAllProducts(options);

      res.json({
        success: true,
        data: {
          products: result.products,
          pagination: result.pagination
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'PRODUCT_FETCH_ERROR');
    }
  }

  static async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await simpleProductService.getProductById(id);

      if (!product) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          product
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'PRODUCT_FETCH_ERROR');
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await simpleProductService.getAllCategories();

      res.json({
        success: true,
        data: {
          categories
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'CATEGORY_FETCH_ERROR');
    }
  }

  static async getFeaturedProducts(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 8;
      const products = await simpleProductService.getFeaturedProducts(limit);

      res.json({
        success: true,
        data: {
          products
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'FEATURED_PRODUCTS_FETCH_ERROR');
    }
  }

  static async getNewArrivals(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 8;
      const products = await simpleProductService.getNewArrivals(limit);

      res.json({
        success: true,
        data: {
          products
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'NEW_ARRIVALS_FETCH_ERROR');
    }
  }

  static async getProductDetails(req, res) {
    try {
      const { id } = req.params;
      const product = await simpleProductService.getProductDetails(id);

      if (!product) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          product
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'PRODUCT_DETAILS_FETCH_ERROR');
    }
  }

  static async getProductReviews(req, res) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = 'newest'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
      };

      const result = await simpleProductService.getProductReviews(id, options);

      res.json({
        success: true,
        data: {
          reviews: result.reviews,
          pagination: result.pagination
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'PRODUCT_REVIEWS_FETCH_ERROR');
    }
  }

  static async getRelatedProducts(req, res) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 4;
      
      const products = await simpleProductService.getRelatedProducts(id, limit);

      res.json({
        success: true,
        data: {
          products
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'RELATED_PRODUCTS_FETCH_ERROR');
    }
  }
}
