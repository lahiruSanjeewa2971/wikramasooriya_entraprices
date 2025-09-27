import { pipeline } from '@xenova/transformers';
import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * Semantic Search Service
 * Handles embedding generation and vector similarity search using SentenceTransformers
 */
export class SemanticSearchService {
  constructor() {
    this.model = null;
    this.dockerConfig = {
      host: process.env.DB_HOST_SEMANTIC || 'localhost',
      port: process.env.DB_PORT_SEMANTIC || 5433,
      database: process.env.DB_NAME_SEMANTIC || 'wik_db',
      user: process.env.DB_USER_SEMANTIC || 'postgres',
      password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    };
    this.mainDbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'wik_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Abcd@1234',
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    };
  }

  /**
   * Initialize the SentenceTransformers model
   */
  async initializeModel() {
    try {
      if (this.model) {
        return this.model;
      }

      logger.info('Loading SentenceTransformers model: all-MiniLM-L6-v2...');
      
      // Load the feature extraction pipeline with the all-MiniLM-L6-v2 model
      this.model = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        {
          quantized: true, // Use quantized model for better performance
          progress_callback: (progress) => {
            if (progress.status === 'downloading') {
              logger.info(`Downloading model: ${Math.round(progress.loaded / progress.total * 100)}%`);
            }
          }
        }
      );

      logger.info('✅ SentenceTransformers model loaded successfully');
      return this.model;
    } catch (error) {
      logger.error('❌ Failed to load SentenceTransformers model:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text) {
    try {
      if (!this.model) {
        await this.initializeModel();
      }

      if (!text || text.trim() === '') {
        throw new Error('Text cannot be empty');
      }

      // Clean and prepare text
      const cleanText = text.trim().substring(0, 512); // Limit to 512 characters
      
      // Generate embedding
      const result = await this.model(cleanText, {
        pooling: 'mean',
        normalize: true
      });

      // Convert to array format
      const embedding = Array.from(result.data);
      
      if (embedding.length !== 384) {
        throw new Error(`Expected 384 dimensions, got ${embedding.length}`);
      }

      return embedding;
    } catch (error) {
      logger.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for product data
   */
  async generateProductEmbeddings(product) {
    try {
      const { id, name, description } = product;
      
      logger.info(`Generating embeddings for product ${id}: ${name}`);

      // Generate embeddings for name, description, and combined text
      const nameEmbedding = await this.generateEmbedding(name || '');
      const descriptionEmbedding = await this.generateEmbedding(description || '');
      
      // Create combined text for better semantic understanding
      const combinedText = `${name || ''} ${description || ''}`.trim();
      const combinedEmbedding = await this.generateEmbedding(combinedText);

      return {
        product_id: id,
        title_embedding: nameEmbedding, // Store name embedding in title_embedding column
        description_embedding: descriptionEmbedding,
        combined_embedding: combinedEmbedding
      };
    } catch (error) {
      logger.error(`❌ Failed to generate embeddings for product ${product.id}:`, error);
      throw error;
    }
  }

  /**
   * Store embeddings in the semantic database
   */
  async storeEmbeddings(embeddings) {
    const client = new Pool(this.dockerConfig);
    
    try {
      await client.connect();
      
      const { product_id, title_embedding, description_embedding, combined_embedding } = embeddings;
      
      // Convert arrays to PostgreSQL vector format
      const titleVector = `[${title_embedding.join(',')}]`;
      const descriptionVector = `[${description_embedding.join(',')}]`;
      const combinedVector = `[${combined_embedding.join(',')}]`;

      const query = `
        INSERT INTO product_embeddings (product_id, title_embedding, description_embedding, combined_embedding)
        VALUES ($1, $2::vector, $3::vector, $4::vector)
        ON CONFLICT (product_id) 
        DO UPDATE SET 
          title_embedding = EXCLUDED.title_embedding,
          description_embedding = EXCLUDED.description_embedding,
          combined_embedding = EXCLUDED.combined_embedding,
          updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(query, [product_id, titleVector, descriptionVector, combinedVector]);
      
      logger.info(`✅ Stored embeddings for product ${product_id}`);
    } catch (error) {
      logger.error('❌ Failed to store embeddings:', error);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Get products from main database
   */
  async getProducts(limit = 100, offset = 0) {
    const client = new Pool(this.mainDbConfig);
    
    try {
      await client.connect();
      
      const query = `
        SELECT id, title, description, price, category_id, created_at, updated_at
        FROM products 
        ORDER BY id 
        LIMIT $1 OFFSET $2
      `;

      const result = await client.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('❌ Failed to fetch products:', error);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Get total count of products
   */
  async getProductCount() {
    const client = new Pool(this.mainDbConfig);
    
    try {
      await client.connect();
      
      const query = 'SELECT COUNT(*) as total FROM products';
      const result = await client.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      logger.error('❌ Failed to get product count:', error);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Check if product already has embeddings
   */
  async hasEmbeddings(productId) {
    const client = new Pool(this.dockerConfig);
    
    try {
      await client.connect();
      
      const query = 'SELECT id FROM product_embeddings WHERE product_id = $1';
      const result = await client.query(query, [productId]);
      
      return result.rows.length > 0;
    } catch (error) {
      logger.error(`❌ Failed to check embeddings for product ${productId}:`, error);
      return false;
    } finally {
      await client.end();
    }
  }

  /**
   * Get products that don't have embeddings yet
   */
  async getProductsWithoutEmbeddings(limit = 100, offset = 0) {
    const client = new Pool(this.mainDbConfig);
    
    try {
      await client.connect();
      
      const query = `
        SELECT p.id, p.name, p.description, p.price, p.category_id, p.created_at, p.updated_at
        FROM products p
        LEFT JOIN (
          SELECT DISTINCT product_id 
          FROM product_embeddings 
          WHERE product_id IS NOT NULL
        ) pe ON p.id = pe.product_id
        WHERE pe.product_id IS NULL AND p.is_active = true
        ORDER BY p.id 
        LIMIT $1 OFFSET $2
      `;

      const result = await client.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('❌ Failed to fetch products without embeddings:', error);
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Perform semantic search
   */
  async semanticSearch(query, limit = 20, threshold = 0.7) {
    try {
      if (!this.model) {
        await this.initializeModel();
      }

      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(query);
      const queryVector = `[${queryEmbedding.join(',')}]`;

      const client = new Pool(this.dockerConfig);
      
      try {
        await client.connect();
        
        const searchQuery = `
          SELECT 
            pe.product_id,
            p.name,
            p.description,
            p.price,
            p.category_id,
            1 - (pe.combined_embedding <=> $1::vector) as similarity
          FROM product_embeddings pe
          JOIN products p ON pe.product_id = p.id
          WHERE 1 - (pe.combined_embedding <=> $1::vector) > $2
          ORDER BY similarity DESC
          LIMIT $3
        `;

        const result = await client.query(searchQuery, [queryVector, threshold, limit]);
        return result.rows;
      } finally {
        await client.end();
      }
    } catch (error) {
      logger.error('❌ Semantic search failed:', error);
      throw error;
    }
  }

  /**
   * Batch process products for embedding generation
   */
  async processBatch(products, batchSize = 10) {
    const results = {
      processed: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}: products ${i + 1}-${Math.min(i + batchSize, products.length)}`);

      for (const product of batch) {
        try {
          const embeddings = await this.generateProductEmbeddings(product);
          await this.storeEmbeddings(embeddings);
          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            product_id: product.id,
            error: error.message
          });
          logger.error(`Failed to process product ${product.id}:`, error.message);
        }
      }

      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

export default SemanticSearchService;
