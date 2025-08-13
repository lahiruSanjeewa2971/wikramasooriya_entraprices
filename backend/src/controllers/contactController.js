import { Contact } from '../models/index.js';

export class ContactController {
  static async submitContact(req, res) {
    const { name, email, message } = req.body;

    // Create contact submission
    const contact = await Contact.create({
      name,
      email,
      message,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

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
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          message: contact.message,
          created_at: contact.created_at
        }
      }
    });
  }
}
