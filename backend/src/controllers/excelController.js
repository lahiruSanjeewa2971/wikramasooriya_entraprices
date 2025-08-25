import { AppError } from '../middleware/errorHandler.js';
import { ExcelService } from '../services/excelService.js';
import { simpleAdminService } from '../services/simpleAdminService.js';
import { cleanupExcelFile } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';
import xlsx from 'xlsx';

export class ExcelController {
  /**
   * Upload and process Excel file for products
   */
  static async uploadProducts(req, res) {
    let filePath = null;
    
    try {
      if (!req.file) {
        throw new AppError('No Excel file provided', 400, 'NO_FILE');
      }

      filePath = req.file.path;
      
      // Parse Excel file
      const excelData = ExcelService.parseExcelFile(filePath);
      
      if (excelData.length === 0) {
        throw new AppError('Excel file contains no valid data rows', 400, 'NO_DATA');
      }

      // Validate each row
      const validationResults = [];
      const validData = [];
      
      for (const row of excelData) {
        const validation = ExcelService.validateProductData(row);
        if (validation.isValid) {
          validData.push(validation.cleanedData);
        } else {
          validationResults.push({
            row: row._rowNumber,
            sku: row.sku || 'N/A',
            errors: validation.errors
          });
        }
      }

      if (validData.length === 0) {
        throw new AppError('No valid data found in Excel file', 400, 'NO_VALID_DATA');
      }

      // Process valid data
      const results = await simpleAdminService.processExcelUpload(validData, req.user.userId);

      // Combine validation errors with processing errors
      const allErrors = [
        ...validationResults.map(v => ({
          row: v.row,
          sku: v.sku,
          error: v.errors.join('; ')
        })),
        ...results.errors
      ];

      const finalResults = {
        processed: results.processed,
        created: results.created,
        updated: results.updated,
        errors: allErrors,
        total: excelData.length,
        validRows: validData.length,
        invalidRows: validationResults.length
      };

      res.json({
        success: true,
        message: 'Excel upload processed successfully',
        data: finalResults
      });

    } catch (error) {
      logger.error('Excel upload error:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Failed to process Excel upload: ' + error.message, 
        500, 
        'EXCEL_PROCESSING_ERROR'
      );
    } finally {
      // Clean up uploaded file
      if (filePath) {
        cleanupExcelFile(filePath);
      }
    }
  }

  /**
   * Download Excel template
   */
  static async downloadTemplate(req, res) {
    try {
      // Create sample data for template with all current product table columns
      const sampleData = [
        {
          'SKU *': 'ABC123',
          'Product Name *': 'Sample Product',
          'Description': 'This is a sample product description',
          'Short Description': 'Sample product',
          'Image URL': 'https://example.com/image.jpg',
          'Image Public ID': 'products/sample_image_id',
          'Price *': '100.00',
          'Stock Quantity *': '50',
          'Category Name *': 'Bearings',
          'Featured': 'true',
          'New Arrival': 'false',
          'Weight (kg)': '2.5',
          'Dimensions (JSON)': '{"length": 10, "width": 5, "height": 3}',
          'Active Status': 'true'
        },
        {
          'SKU *': 'XYZ789',
          'Product Name *': 'Another Product',
          'Description': 'Another sample product description',
          'Short Description': 'Another product',
          'Image URL': 'https://example.com/another.jpg',
          'Image Public ID': 'products/another_image_id',
          'Price *': '150.00',
          'Stock Quantity *': '25',
          'Category Name *': 'Fasteners',
          'Featured': 'false',
          'New Arrival': 'true',
          'Weight (kg)': '1.8',
          'Dimensions (JSON)': '{"length": 8, "width": 4, "height": 2}',
          'Active Status': 'true'
        }
      ];

      // Create workbook using imported xlsx
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(sampleData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 15 }, // SKU *
        { wch: 25 }, // Product Name *
        { wch: 40 }, // Description
        { wch: 25 }, // Short Description
        { wch: 35 }, // Image URL
        { wch: 25 }, // Image Public ID
        { wch: 12 }, // Price *
        { wch: 15 }, // Stock Quantity *
        { wch: 20 }, // Category Name *
        { wch: 12 }, // Featured
        { wch: 15 }, // New Arrival
        { wch: 15 }, // Weight (kg)
        { wch: 30 }, // Dimensions (JSON)
        { wch: 15 }  // Active Status
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Products Template');

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="products_template.xlsx"');

      // Write to buffer and send
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);

    } catch (error) {
      logger.error('Template download error:', error);
      throw new AppError('Failed to generate template: ' + error.message, 500, 'TEMPLATE_ERROR');
    }
  }

  /**
   * Validate Excel data without processing
   */
  static async validateExcel(req, res) {
    let filePath = null;
    
    try {
      if (!req.file) {
        throw new AppError('No Excel file provided', 400, 'NO_FILE');
      }

      filePath = req.file.path;
      
      // Parse Excel file
      const excelData = ExcelService.parseExcelFile(filePath);
      
      if (excelData.length === 0) {
        throw new AppError('Excel file contains no valid data rows', 400, 'NO_DATA');
      }

      // Validate each row
      const validationResults = [];
      let validCount = 0;
      let invalidCount = 0;
      
      for (const row of excelData) {
        const validation = ExcelService.validateProductData(row);
        if (validation.isValid) {
          validCount++;
        } else {
          invalidCount++;
          validationResults.push({
            row: row._rowNumber,
            sku: row.sku || 'N/A',
            errors: validation.errors
          });
        }
      }

      res.json({
        success: true,
        message: 'Excel validation completed',
        data: {
          total: excelData.length,
          valid: validCount,
          invalid: invalidCount,
          errors: validationResults
        }
      });

    } catch (error) {
      logger.error('Excel validation error:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Failed to validate Excel file: ' + error.message, 
        500, 
        'EXCEL_VALIDATION_ERROR'
      );
    } finally {
      // Clean up uploaded file
      if (filePath) {
        cleanupExcelFile(filePath);
      }
    }
  }
}
