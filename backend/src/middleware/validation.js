import Joi from 'joi';
import { AppError } from './errorHandler.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

// Validation schemas
export const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    mobile: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required()
      .messages({
        'string.pattern.base': 'Please provide a valid mobile number',
        'any.required': 'Mobile number is required'
      }),
    location: Joi.string().min(3).max(255).required()
      .messages({
        'string.min': 'Location must be at least 3 characters long',
        'string.max': 'Location cannot exceed 255 characters',
        'any.required': 'Location is required'
      }),
    password: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required'
      })
  }),

  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Password is required'
      })
  })
};

export const productSchemas = {
  create: Joi.object({
    sku: Joi.string().min(3).max(50).required(),
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    image_url: Joi.string().uri().optional(),
    price: Joi.number().positive().required(),
    stock_qty: Joi.number().integer().min(0).default(0),
    featured: Joi.boolean().default(false),
    new_arrival: Joi.boolean().default(false),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.object().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(200).optional(),
    description: Joi.string().optional(),
    short_description: Joi.string().max(500).optional(),
    image_url: Joi.string().uri().optional(),
    price: Joi.number().positive().optional(),
    stock_qty: Joi.number().integer().min(0).optional(),
    featured: Joi.boolean().optional(),
    new_arrival: Joi.boolean().optional(),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.object().optional()
  })
};

export const cartSchemas = {
  addItem: Joi.object({
    productId: Joi.number().integer().positive().required()
      .messages({
        'any.required': 'Product ID is required',
        'number.base': 'Product ID must be a number',
        'number.positive': 'Product ID must be positive'
      }),
    qty: Joi.number().integer().min(1).max(99).default(1)
      .messages({
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 99'
      })
  }),

  updateItem: Joi.object({
    qty: Joi.number().integer().min(1).max(99).required()
      .messages({
        'any.required': 'Quantity is required',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 99'
      })
  })
};

export const contactSchemas = {
  submit: Joi.object({
    name: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    message: Joi.string().min(10).max(2000).required()
      .messages({
        'string.min': 'Message must be at least 10 characters long',
        'string.max': 'Message cannot exceed 2000 characters',
        'any.required': 'Message is required'
      })
  })
};
