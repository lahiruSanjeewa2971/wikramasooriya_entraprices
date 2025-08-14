import { AppError } from '../middleware/errorHandler.js';
import { query } from '../db/simple-connection.js';

export class ContactController {
  static async submitContact(req, res) {
    try {
      const { name, email, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        throw new AppError('Name, email, and message are required', 400, 'MISSING_FIELDS');
      }

      // Create contact submission
      const contactResult = await query(`
        INSERT INTO contacts (name, email, message, ip_address, user_agent, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING id, name, email, message, created_at
      `, [name, email, message, req.ip, req.get('User-Agent'), new Date().toISOString()]);

      const contact = contactResult.rows[0];

      // In a real application, you would send an email here
      // For now, we'll just log it
      console.log('Contact form submission:', {
        name,
        email,
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
}
