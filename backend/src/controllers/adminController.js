import { simpleAdminService } from '../services/simpleAdminService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logApiError } from '../utils/logger.js';
import { simpleProductService } from '../services/simpleProductService.js';
import { simpleAuthService } from '../services/simpleAuthService.js';
import { simpleContactService } from '../services/simpleContactService.js';
import xlsx from 'xlsx';

export class AdminController {
  // ==================== PRODUCT MANAGEMENT ====================
  
  static async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 50, category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        search,
        sortBy,
        sortOrder
      };

      const result = await simpleAdminService.getAllProductsForAdmin(options);
      
      res.json({
        success: true,
        data: {
          products: result.products,
          pagination: result.pagination,
          total: result.total
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'PRODUCTS_FETCH_ERROR');
    }
  }

  static async createProduct(req, res) {
    try {
      const productData = req.body;
      
      // Check if SKU already exists
      const existingProduct = await simpleProductService.getProductBySku(productData.sku);
      if (existingProduct) {
        throw new AppError('Product with this SKU already exists', 409, 'SKU_EXISTS');
      }

      const product = await simpleAdminService.createProduct(productData);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'PRODUCT_CREATE_ERROR');
    }
  }

  static async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await simpleAdminService.getProductForAdmin(id);
      
      if (!product) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'PRODUCT_FETCH_ERROR');
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const product = await simpleAdminService.updateProduct(id, updateData);
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'PRODUCT_UPDATE_ERROR');
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await simpleAdminService.deleteProduct(id);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'PRODUCT_DELETE_ERROR');
    }
  }

  static async bulkUpdateProducts(req, res) {
    try {
      const { products } = req.body;
      
      if (!Array.isArray(products) || products.length === 0) {
        throw new AppError('Products array is required', 400, 'INVALID_PRODUCTS_DATA');
      }

      const result = await simpleAdminService.processExcelData(products);
      
      res.json({
        success: true,
        message: 'Products updated successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'BULK_UPDATE_ERROR');
    }
  }

  // ==================== CATEGORY MANAGEMENT ====================
  
  static async getAllCategories(req, res) {
    try {
      const categories = await simpleAdminService.getAllCategoriesForAdmin();
      
      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'CATEGORIES_FETCH_ERROR');
    }
  }

  static async createCategory(req, res) {
    try {
      const categoryData = req.body;
      
      // Check if category name already exists
      const existingCategory = await simpleAdminService.getCategoryByName(categoryData.name);
      if (existingCategory) {
        throw new AppError('Category name already exists', 409, 'CATEGORY_NAME_EXISTS');
      }
      
      const category = await simpleAdminService.createCategory(categoryData);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      // Log the error with enhanced context
      logApiError(req, error, {
        operation: 'createCategory',
        categoryData: req.body
      });
      
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CATEGORY_CREATE_ERROR');
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const category = await simpleAdminService.updateCategory(id, updateData);
      
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CATEGORY_UPDATE_ERROR');
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      await simpleAdminService.deleteCategory(id);
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      // Log the error with enhanced context
      logApiError(req, error, {
        operation: 'deleteCategory',
        categoryId: req.params.id
      });
      
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CATEGORY_DELETE_ERROR');
    }
  }

  static async getCategoryProducts(req, res) {
    try {
      const { id } = req.params;
      
      const products = await simpleAdminService.getProductsByCategory(id);
      
      res.json({
        success: true,
        data: { products }
      });
    } catch (error) {
      // Log the error with enhanced context
      logApiError(req, error, {
        operation: 'getCategoryProducts',
        categoryId: req.params.id
      });
      
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CATEGORY_PRODUCTS_FETCH_ERROR');
    }
  }

  // ==================== USER MANAGEMENT ====================
  
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 50, search, role, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        sortBy,
        sortOrder
      };

      const result = await simpleAdminService.getAllUsersForAdmin(options);
      
      res.json({
        success: true,
        data: {
          users: result.users,
          pagination: result.pagination,
          total: result.total
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'USERS_FETCH_ERROR');
    }
  }

  static async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await simpleAdminService.getUserForAdmin(id);
      
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'USER_FETCH_ERROR');
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await simpleAdminService.updateUser(id, updateData);
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'USER_UPDATE_ERROR');
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user has active cart or orders
      const hasActiveData = await simpleAdminService.checkUserActiveData(id);
      if (hasActiveData) {
        throw new AppError('Cannot delete user with active cart or orders', 400, 'USER_HAS_ACTIVE_DATA');
      }
      
      await simpleAdminService.deleteUser(id);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'USER_DELETE_ERROR');
    }
  }

  static async deleteContact(req, res) {
    try {
      const { id } = req.params;
      await simpleAdminService.deleteContact(id);
      
      res.json({
        success: true,
        message: 'Contact message deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CONTACT_DELETE_ERROR');
    }
  }

  // ==================== CONTACT MESSAGES MANAGEMENT ====================
  
  static async getAllContacts(req, res) {
    try {
      const { page = 1, limit = 50, status, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        search,
        sortBy,
        sortOrder
      };

      const result = await simpleAdminService.getAllContactsForAdmin(options);
      
      res.json({
        success: true,
        data: {
          contacts: result.contacts,
          pagination: result.pagination,
          total: result.total
        }
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'CONTACTS_FETCH_ERROR');
    }
  }

  static async getContact(req, res) {
    try {
      const { id } = req.params;
      const contact = await simpleAdminService.getContactForAdmin(id);
      
      if (!contact) {
        throw new AppError('Contact message not found', 404, 'CONTACT_NOT_FOUND');
      }

      res.json({
        success: true,
        data: { contact }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CONTACT_FETCH_ERROR');
    }
  }

  static async updateContact(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const contact = await simpleAdminService.updateContact(id, updateData);
      
      res.json({
        success: true,
        message: 'Contact message updated successfully',
        data: { contact }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CONTACT_UPDATE_ERROR');
    }
  }

  static async deleteContact(req, res) {
    try {
      const { id } = req.params;
      await simpleAdminService.deleteContact(id);
      
      res.json({
        success: true,
        message: 'Contact message deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CONTACT_DELETE_ERROR');
    }
  }

  static async replyToContact(req, res) {
    try {
      const { id } = req.params;
      const { reply_message, admin_notes } = req.body;
      
      const contact = await simpleAdminService.replyToContact(id, reply_message, admin_notes);
      
      res.json({
        success: true,
        message: 'Reply sent successfully',
        data: { contact }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CONTACT_REPLY_ERROR');
    }
  }

  // ==================== ANALYTICS & DASHBOARD ====================
  
  static async getDashboardOverview(req, res) {
    try {
      const overview = await simpleAdminService.getDashboardOverview();
      
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'DASHBOARD_FETCH_ERROR');
    }
  }

  static async getProductAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      const analytics = await simpleAdminService.getProductAnalytics(period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'PRODUCT_ANALYTICS_ERROR');
    }
  }

  static async getSalesAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      const analytics = await simpleAdminService.getSalesAnalytics(period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'SALES_ANALYTICS_ERROR');
    }
  }

  static async getProductAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      const analytics = await simpleAdminService.getProductAnalytics(period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'PRODUCT_ANALYTICS_ERROR');
    }
  }

  static async getUserAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      const analytics = await simpleAdminService.getUserAnalytics(period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw new AppError(error.message, 500, 'USER_ANALYTICS_ERROR');
    }
  }

  // ==================== EXCEL UPLOAD ====================
  
  static async uploadExcel(req, res) {
    try {
      if (!req.file) {
        throw new AppError('Excel file is required', 400, 'FILE_MISSING');
      }

      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new AppError('Excel file is empty or invalid', 400, 'INVALID_EXCEL_DATA');
      }

      // Validate and process Excel data
      const result = await simpleAdminService.processExcelData(data);
      
      res.json({
        success: true,
        message: 'Excel file processed successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'EXCEL_PROCESSING_ERROR');
    }
  }
}
