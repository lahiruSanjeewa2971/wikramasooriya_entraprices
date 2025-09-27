import { AppError } from '../middleware/errorHandler.js';
import { simpleProductService } from '../services/simpleProductService.js';
import { modelService } from '../services/modelService.js';
import { logger } from '../utils/logger.js';
import pg from 'pg';

const { Pool } = pg;

export class SearchController {
  // Test Docker PostgreSQL connection for semantic search
  static async testDockerConnection() {
    try {
      const dockerConfig = {
        host: process.env.DB_HOST_SEMANTIC || 'localhost',
        port: process.env.DB_PORT_SEMANTIC || 5433,
        database: process.env.DB_NAME_SEMANTIC || 'wik_db',
        user: process.env.DB_USER_SEMANTIC || 'postgres',
        password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
        connectionTimeoutMillis: 3000, // 3 second timeout
        idleTimeoutMillis: 10000,
      };

      logger.info('Checking Docker semantic search container connection...');
      const dockerPool = new Pool(dockerConfig);
      const client = await dockerPool.connect();
      
      // Test if pgvector extension is available
      const vectorTest = await client.query('SELECT 1 FROM pg_available_extensions WHERE name = \'vector\'');
      
      client.release();
      await dockerPool.end();
      
      if (vectorTest.rows.length === 0) {
        logger.warn('Docker PostgreSQL is running but pgvector extension is not available');
        logger.info('TIP: Run: npm run docker:stop && npm run docker:start to restart container');
        return { available: false, reason: 'pgvector_not_installed' };
      }
      
      logger.info('SUCCESS: Docker PostgreSQL with pgvector is available for semantic search');
      logger.info('Semantic search functionality is ready!');
      return { available: true };
    } catch (error) {
      logger.warn('Docker PostgreSQL container is not running or not accessible:', {
        error: error.message,
        host: process.env.DB_HOST_SEMANTIC || 'localhost',
        port: process.env.DB_PORT_SEMANTIC || 5433
      });
      logger.info('TIP: To start the container, run: npm run docker:start');
      logger.info('TIP: To check container status, run: npm run docker:status');
      return { available: false, reason: 'docker_not_running', error: error.message };
    }
  }

  static async semanticSearch(req, res) {
    try {
      const { q: query, limit = 20, threshold = 0.1 } = req.query;

      if (!query || query.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      logger.info(`Starting semantic search for query: "${query.trim()}"`);

      // Check if Docker container with pgvector is available
      const dockerStatus = await SearchController.testDockerConnection();

      if (!dockerStatus.available) {
        // Fallback to regular search with AI unavailable message
        logger.info('Semantic search unavailable, falling back to regular search');

        const options = {
          page: 1,
          limit: parseInt(limit) || 50,
          search: query.trim(),
          sortBy: 'created_at',
          sortOrder: 'DESC'
        };

        const result = await simpleProductService.getAllProducts(options);

        return res.json({
          success: true,
          data: {
            products: result.products,
            pagination: result.pagination,
            searchType: 'fallback',
            query: query.trim(),
            aiEnabled: false,
            message: 'AI Search temporarily unavailable - Docker container not running'
          },
          warning: {
            message: 'AI Search feature is currently disabled - Docker container not running',
            reason: dockerStatus.reason,
            fallbackUsed: true,
            instructions: 'Run "npm run docker:start" to enable AI search functionality'
          }
        });
      }

      // Docker is available - proceed with semantic search
      logger.info('Proceeding with semantic search - Docker container is running');

      try {
        // Generate embedding for search query using cached model
        const queryEmbedding = await modelService.generateEmbedding(query.trim());
        const queryVector = `[${Array.from(queryEmbedding).join(',')}]`;

        logger.info('Query embedding generated successfully');

        // Connect to semantic database
        const dockerConfig = {
          host: process.env.DB_HOST_SEMANTIC || 'localhost',
          port: process.env.DB_PORT_SEMANTIC || 5433,
          database: process.env.DB_NAME_SEMANTIC || 'wik_db',
          user: process.env.DB_USER_SEMANTIC || 'postgres',
          password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
          connectionTimeoutMillis: 5000,
        };

        const semanticClient = new Pool(dockerConfig);
        
        // Step 1: Get semantic search results from Docker database (embeddings only)
        const semanticSearchQuery = `
          SELECT 
            pe.product_id,
            1 - (pe.combined_embedding <=> $1::vector) as similarity
          FROM product_embeddings pe
          WHERE 1 - (pe.combined_embedding <=> $1::vector) > $2
          ORDER BY similarity DESC
          LIMIT $3
        `;

        const semanticResult = await semanticClient.query(semanticSearchQuery, [
          queryVector, 
          parseFloat(threshold), 
          parseInt(limit)
        ]);

        await semanticClient.end();

        // Step 2: Get product details from local database
        let products = [];
        if (semanticResult.rows.length === 0) {
          // No semantic matches found
          products = [];
        } else {
          // Extract product IDs from semantic results
          const productIds = semanticResult.rows.map(row => row.product_id);
          
          // Connect to local database to get product details
          const localDbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'wik_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'Abcd@1234',
            connectionTimeoutMillis: 5000,
          };

          const localClient = new Pool(localDbConfig);
          
          // Get product details for the semantic matches
          const productDetailsQuery = `
            SELECT id, name, description, price, image_url, category_id, stock_qty, featured, new_arrival, is_active, created_at, updated_at
            FROM products
            WHERE id = ANY($1) AND is_active = true
            ORDER BY array_position($1, id)
          `;
          
          const productDetailsResult = await localClient.query(productDetailsQuery, [productIds]);
          await localClient.end();

          // Step 3: Combine semantic results with product details
          products = productDetailsResult.rows.map(product => {
            // Find the corresponding similarity score
            const semanticMatch = semanticResult.rows.find(row => row.product_id === product.id);
            
            return {
              id: product.id,
              name: product.name,
              description: product.description,
              price: parseFloat(product.price),
              image_url: product.image_url,
              category_id: product.category_id,
              stock_qty: product.stock_qty,
              featured: product.featured,
              new_arrival: product.new_arrival,
              is_active: product.is_active,
              created_at: product.created_at,
              updated_at: product.updated_at,
              // Add semantic search specific fields
              similarity: Math.round(semanticMatch.similarity * 100) / 100,
              searchType: 'semantic'
            };
          });
        }

        logger.info(`Semantic search completed: ${products.length} results found`);

        // If no semantic results found, fallback to regular search
        if (products.length === 0) {
          logger.info('No semantic results found, falling back to regular search');

          const options = {
            page: 1,
            limit: parseInt(limit) || 50,
            search: query.trim(),
            sortBy: 'created_at',
            sortOrder: 'DESC'
          };

          const fallbackResult = await simpleProductService.getAllProducts(options);

          return res.json({
            success: true,
            data: {
              products: fallbackResult.products,
              pagination: fallbackResult.pagination,
              searchType: 'semantic_fallback',
              query: query.trim(),
              aiEnabled: true,
              message: 'No semantic matches found, showing regular search results'
            },
            warning: {
              message: 'No semantic matches found for your query',
              fallbackUsed: true,
              reason: 'no_semantic_matches'
            }
          });
        }

        // Return semantic search results
        return res.json({
          success: true,
          data: {
            products: products,
            pagination: {
              page: 1,
              limit: parseInt(limit),
              total: products.length,
              pages: 1
            },
            searchType: 'semantic',
            query: query.trim(),
            aiEnabled: true,
            message: `AI Search found ${products.length} semantically relevant products`,
            searchMetadata: {
              threshold: parseFloat(threshold),
              avgSimilarity: products.length > 0 ?
                Math.round((products.reduce((sum, p) => sum + p.similarity, 0) / products.length) * 100) / 100 : 0,
              topSimilarity: products.length > 0 ? products[0].similarity : 0
            }
          }
        });

      } catch (semanticError) {
        logger.error('Semantic search error:', semanticError);

        // Fallback to regular search on semantic error
        logger.info('Semantic search failed, falling back to regular search');

        const options = {
          page: 1,
          limit: parseInt(limit) || 50,
          search: query.trim(),
          sortBy: 'created_at',
          sortOrder: 'DESC'
        };

        const result = await simpleProductService.getAllProducts(options);

        return res.json({
          success: true,
          data: {
            products: result.products,
            pagination: result.pagination,
            searchType: 'semantic_error_fallback',
            query: query.trim(),
            aiEnabled: true,
            message: 'AI Search encountered an error, showing regular search results'
          },
          warning: {
            message: 'AI Search temporarily unavailable due to technical error',
            fallbackUsed: true,
            reason: 'semantic_error',
            error: semanticError.message
          }
        });
      }

    } catch (error) {
      logger.error('ERROR: Semantic search error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
