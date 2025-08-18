import { getClient, query } from '../db/simple-connection.js';
import { logger } from '../utils/logger.js';

export class simpleContactService {
  static async getContactById(id) {
    try {
      const result = await query('SELECT * FROM contacts WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error in getContactById:', error);
      throw new Error('Failed to fetch contact');
    }
  }

  static async getAllContacts(options = {}) {
    const { page = 1, limit = 50, status, search } = options;
    const offset = (page - 1) * limit;
    
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        whereClause += ` AND status = $${paramCount}`;
        params.push(status);
      }

      if (search) {
        paramCount++;
        whereClause += ` AND (email ILIKE $${paramCount} OR title ILIKE $${paramCount} OR message ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      const countQuery = `SELECT COUNT(*) as total FROM contacts ${whereClause}`;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      const contactsQuery = `
        SELECT * FROM contacts
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      params.push(limit, offset);
      
      const contactsResult = await query(contactsQuery, params);
      const contacts = contactsResult.rows;

      const totalPages = Math.ceil(total / limit);
      const pagination = {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      };

      return { contacts, pagination, total };
    } catch (error) {
      logger.error('Error in getAllContacts:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  static async createContact(contactData) {
    try {
      const { email, title, message, ip_address, user_agent } = contactData;
      
      const result = await query(`
        INSERT INTO contacts (email, title, message, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [email, title, message, ip_address, user_agent]);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error in createContact:', error);
      throw new Error('Failed to create contact');
    }
  }

  static async updateContact(id, updateData) {
    try {
      const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [id, ...fields.map(field => updateData[field])];

      const result = await query(`
        UPDATE contacts 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error in updateContact:', error);
      throw new Error('Failed to update contact');
    }
  }

  static async deleteContact(id) {
    try {
      const result = await query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found');
      }
      
      return true;
    } catch (error) {
      logger.error('Error in deleteContact:', error);
      throw new Error('Failed to delete contact');
    }
  }
}
