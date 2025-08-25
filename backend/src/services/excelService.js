import xlsx from 'xlsx';
import { query, getClient } from '../db/simple-connection.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export class ExcelService {
  /**
   * Parse Excel file and extract product data
   */
  static parseExcelFile(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }
      
      // Extract headers and data
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      
      // Map headers to standardized column names
      const columnMapping = this.mapHeaders(headers);
      
      // Process data rows
      const products = dataRows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row, index) => this.parseRow(row, columnMapping, index + 2));
      
      return products;
    } catch (error) {
      logger.error('Error parsing Excel file:', error);
      throw new AppError('Failed to parse Excel file: ' + error.message, 400, 'EXCEL_PARSE_ERROR');
    }
  }

  /**
   * Map Excel headers to standardized column names
   */
  static mapHeaders(headers) {
    const mapping = {};
    const headerMap = {
      'sku': ['sku', 'SKU', 'Sku', 'Product SKU', 'Product Code', 'SKU *', 'Sku *'],
      'name': ['name', 'Name', 'Product Name', 'Product', 'Title', 'Product Name *', 'Name *'],
      'description': ['description', 'Description', 'Product Description', 'Desc'],
      'short_description': ['short_description', 'Short Description', 'Short Desc', 'Summary'],
      'image_url': ['image_url', 'Image URL', 'Image', 'Product Image', 'Image Link'],
      'image_public_id': ['image_public_id', 'Image Public ID', 'Image Public ID', 'Public ID', 'Cloudinary ID'],
      'price': ['price', 'Price', 'Cost', 'Unit Price', 'Unit Cost', 'Price *'],
      'stock_qty': ['stock_qty', 'Stock Qty', 'Stock Quantity', 'Quantity', 'Qty', 'Stock', 'Stock Quantity *'],
      'category_name': ['category_name', 'Category Name', 'Category', 'Product Category', 'Category Name *'],
      'featured': ['featured', 'Featured', 'Is Featured', 'Feature'],
      'new_arrival': ['new_arrival', 'New Arrival', 'Is New', 'New'],
      'weight': ['weight', 'Weight', 'Product Weight', 'Weight (kg)'],
      'dimensions': ['dimensions', 'Dimensions', 'Size', 'Product Dimensions', 'Dimensions (JSON)'],
      'is_active': ['is_active', 'Active Status', 'Is Active', 'Status', 'Active']
    };

    headers.forEach((header, index) => {
      if (header) {
        const headerStr = String(header).trim();
        for (const [standardName, variations] of Object.entries(headerMap)) {
          if (variations.includes(headerStr)) {
            mapping[standardName] = index;
            break;
          }
        }
      }
    });

    return mapping;
  }

  /**
   * Parse a single row of Excel data
   */
  static parseRow(row, columnMapping, rowNumber) {
    const product = {};
    
    // Extract values based on column mapping
    Object.entries(columnMapping).forEach(([fieldName, columnIndex]) => {
      if (columnIndex < row.length) {
        product[fieldName] = row[columnIndex];
      }
    });

    // Add row number for error reporting
    product._rowNumber = rowNumber;
    
    return product;
  }

  /**
   * Validate product data from Excel
   */
  static validateProductData(product) {
    const errors = [];

    // Required field validation
    const requiredFields = ['sku', 'name', 'price', 'stock_qty', 'category_name'];
    requiredFields.forEach(field => {
      if (!product[field] || String(product[field]).trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Data type validation
    if (product.sku) {
      const sku = String(product.sku).trim();
      if (sku.length < 2 || sku.length > 50) {
        errors.push(`SKU must be between 2 and 50 characters: ${sku}`);
      }
      if (!/^[A-Za-z0-9-_]+$/.test(sku)) {
        errors.push(`SKU contains invalid characters: ${sku}`);
      }
    }

    if (product.name) {
      const name = String(product.name).trim();
      if (name.length < 2 || name.length > 200) {
        errors.push(`Product name must be between 2 and 200 characters: ${name}`);
      }
    }

    if (product.price) {
      const price = parseFloat(product.price);
      if (isNaN(price) || price <= 0) {
        errors.push(`Invalid price: ${product.price}`);
      }
    }

    if (product.stock_qty) {
      const qty = parseInt(product.stock_qty);
      if (isNaN(qty) || qty < 0) {
        errors.push(`Invalid stock quantity: ${product.stock_qty}`);
      }
    }

    if (product.weight) {
      const weight = parseFloat(product.weight);
      if (isNaN(weight) || weight < 0) {
        errors.push(`Invalid weight: ${product.weight}`);
      }
    }

    // Boolean field validation
    ['featured', 'new_arrival', 'is_active'].forEach(field => {
      if (product[field] !== undefined && product[field] !== null && product[field] !== '') {
        const value = String(product[field]).toLowerCase();
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value)) {
          errors.push(`Invalid boolean value for ${field}: ${product[field]}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      cleanedData: this.cleanProductData(product)
    };
  }

  /**
   * Clean and normalize product data
   */
  static cleanProductData(product) {
    const cleaned = {};

    // Clean string fields
    ['sku', 'name', 'description', 'short_description', 'category_name'].forEach(field => {
      if (product[field]) {
        cleaned[field] = String(product[field]).trim();
      }
    });

    // Clean numeric fields
    if (product.price) {
      cleaned.price = parseFloat(product.price);
    }
    if (product.stock_qty) {
      cleaned.stock_qty = parseInt(product.stock_qty);
    }
    if (product.weight) {
      cleaned.weight = parseFloat(product.weight);
    }

    // Clean boolean fields
    ['featured', 'new_arrival', 'is_active'].forEach(field => {
      if (product[field] !== undefined && product[field] !== null && product[field] !== '') {
        const value = String(product[field]).toLowerCase();
        cleaned[field] = ['true', '1', 'yes'].includes(value);
      }
    });

    // Clean dimensions (if provided as JSON string)
    if (product.dimensions) {
      try {
        if (typeof product.dimensions === 'string') {
          cleaned.dimensions = JSON.parse(product.dimensions);
        } else {
          cleaned.dimensions = product.dimensions;
        }
      } catch (error) {
        // If dimensions can't be parsed as JSON, store as string
        cleaned.dimensions = String(product.dimensions);
      }
    }

    return cleaned;
  }

  /**
   * Get or create category by name
   */
  static async getOrCreateCategory(categoryName) {
    try {
      // Check if category exists
      let result = await query(
        'SELECT id FROM categories WHERE name = $1',
        [categoryName]
      );

      if (result.rows.length === 0) {
        // Create new category
        result = await query(
          'INSERT INTO categories (name, description, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
          [categoryName, `Category for ${categoryName}`]
        );
      }

      return result.rows[0].id;
    } catch (error) {
      logger.error('Error getting/creating category:', error);
      throw new AppError(`Failed to process category '${categoryName}': ${error.message}`, 500, 'CATEGORY_ERROR');
    }
  }

  /**
   * Check if product exists by SKU
   */
  static async getProductBySku(sku) {
    try {
      const result = await query(
        'SELECT id, price, stock_qty FROM products WHERE sku = $1',
        [sku]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error checking product existence:', error);
      throw error;
    }
  }

  /**
   * Calculate weighted average price for existing products
   */
  static calculateWeightedAveragePrice(existingQty, existingPrice, newQty, newPrice) {
    const totalQty = existingQty + newQty;
    const totalValue = (existingQty * existingPrice) + (newQty * newPrice);
    return Math.round((totalValue / totalQty) * 100) / 100; // Round to 2 decimal places
  }
}
