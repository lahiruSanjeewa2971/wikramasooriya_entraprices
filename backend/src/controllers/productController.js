import { Op } from 'sequelize';
import { AppError } from '../middleware/errorHandler.js';
import { Product, Category } from '../models/index.js';

export class ProductController {
  static async listProducts(req, res) {
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

    // Build where clause
    const whereClause = { is_active: true };

    if (category) {
      whereClause['$categories.slug$'] = category;
    }

    if (featured === 'true') {
      whereClause.featured = true;
    }

    if (new_arrival === 'true') {
      whereClause.new_arrival = true;
    }

    if (searchQuery) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } },
        { short_description: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    // Build include clause
    const includeClause = [
      {
        model: Category,
        as: 'categories',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ];

    // Build order clause
    const orderClause = [[sortBy, sortOrder.toUpperCase()]];

    // Execute query
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  }

  static async getProduct(req, res) {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        product
      }
    });
  }

  static async getCategories(req, res) {
    const categories = await Category.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'slug', 'description'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        categories
      }
    });
  }

  static async getFeaturedProducts(req, res) {
    const products = await Product.findAll({
      where: { 
        featured: true, 
        is_active: true 
      },
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 8
    });

    res.json({
      success: true,
      data: {
        products
      }
    });
  }

  static async getNewArrivals(req, res) {
    const products = await Product.findAll({
      where: { 
        new_arrival: true, 
        is_active: true 
      },
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 8
    });

    res.json({
      success: true,
      data: {
        products
      }
    });
  }
}
