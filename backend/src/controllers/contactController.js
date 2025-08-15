import { AppError } from '../middleware/errorHandler.js';
import { query } from '../db/simple-connection.js';

export class ContactController {
  static async submitContact(req, res) {
    try {
      const { email, title, message } = req.body;

      // Validate required fields
      if (!email || !title || !message) {
        throw new AppError('Email, title, and message are required', 400, 'MISSING_FIELDS');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Please enter a valid email address', 400, 'INVALID_EMAIL');
      }

      // Create contact submission
      const contactResult = await query(`
        INSERT INTO contacts (email, title, message, ip_address, user_agent, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id, email, title, message, status, created_at
      `, [email, title, message, req.ip, req.get('User-Agent'), 'unread', new Date().toISOString()]);

      const contact = contactResult.rows[0];

      // In a real application, you would send an email notification here
      // For now, we'll just log it
      console.log('Contact form submission:', {
        email,
        title,
        message,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon!',
        data: {
          contact
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'CONTACT_SUBMISSION_ERROR');
    }
  }

  // Get all contact messages (for admin panel)
  static async getAllContacts(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let params = [limit, offset];
      let paramIndex = 3;

      if (status) {
        whereClause = `WHERE status = $${paramIndex}`;
        params.push(status);
      }

      const contactsResult = await query(`
        SELECT id, email, title, message, status, ip_address, user_agent, created_at, updated_at
        FROM contacts
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, params);

      const countResult = await query(`
        SELECT COUNT(*) as total
        FROM contacts
        ${whereClause}
      `, status ? [status] : []);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          contacts: contactsResult.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'FETCH_CONTACTS_ERROR');
    }
  }

  // Get contact message by ID (for admin panel)
  static async getContactById(req, res) {
    try {
      const { id } = req.params;

      const contactResult = await query(`
        SELECT id, email, title, message, status, ip_address, user_agent, created_at, updated_at
        FROM contacts
        WHERE id = $1
      `, [id]);

      if (contactResult.rows.length === 0) {
        throw new AppError('Contact message not found', 404, 'CONTACT_NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          contact: contactResult.rows[0]
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'FETCH_CONTACT_ERROR');
    }
  }

  // Mark contact as read (for admin panel)
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const result = await query(`
        UPDATE contacts
        SET status = 'read', updated_at = $1
        WHERE id = $2
        RETURNING id, status, updated_at
      `, [new Date().toISOString(), id]);

      if (result.rows.length === 0) {
        throw new AppError('Contact message not found', 404, 'CONTACT_NOT_FOUND');
      }

      res.json({
        success: true,
        message: 'Contact marked as read',
        data: {
          contact: result.rows[0]
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'UPDATE_CONTACT_ERROR');
    }
  }

  // Delete contact message (for admin panel)
  static async deleteContact(req, res) {
    try {
      const { id } = req.params;

      const result = await query(`
        DELETE FROM contacts
        WHERE id = $1
        RETURNING id
      `, [id]);

      if (result.rows.length === 0) {
        throw new AppError('Contact message not found', 404, 'CONTACT_NOT_FOUND');
      }

      res.json({
        success: true,
        message: 'Contact message deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'DELETE_CONTACT_ERROR');
    }
  }

  // Get contact statistics (for admin panel)
  static async getContactStats(req, res) {
    try {
      const statsResult = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'unread' THEN 1 END) as unread,
          COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last24h,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last7days
        FROM contacts
      `);

      const stats = statsResult.rows[0];

      res.json({
        success: true,
        data: {
          stats: {
            total: parseInt(stats.total),
            unread: parseInt(stats.unread),
            read: parseInt(stats.read),
            last24h: parseInt(stats.last24h),
            last7days: parseInt(stats.last7days)
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500, 'FETCH_STATS_ERROR');
    }
  }
}
