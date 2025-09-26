import { AppError } from '../middleware/errorHandler.js';
import { simpleProductService } from '../services/simpleProductService.js';
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
      const { q: query } = req.query;
      
      if (!query || query.trim() === '') {
        throw new AppError('Search query is required', 400, 'INVALID_INPUT');
      }

      // Check if Docker container with pgvector is available
      const dockerStatus = await SearchController.testDockerConnection();
      
      if (!dockerStatus.available) {
        // Fallback to regular search with AI unavailable message
        logger.info('Semantic search unavailable, falling back to regular search');
        
        const options = {
          page: 1,
          limit: 50,
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

      // Docker is available - proceed with semantic search (placeholder for now)
      logger.info('Proceeding with semantic search - Docker container is running');
      
      // For now, still use regular search but indicate AI is available
      const options = {
        page: 1,
        limit: 50,
        search: query.trim(),
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      const result = await simpleProductService.getAllProducts(options);

      res.json({
        success: true,
        data: {
          products: result.products,
          pagination: result.pagination,
          searchType: 'semantic_ready', // Indicate semantic search is ready but not implemented yet
          query: query.trim(),
          aiEnabled: true,
          message: 'AI Search is ready - semantic search implementation pending'
        }
      });
    } catch (error) {
      logger.error('ERROR: Semantic search error:', error);
      throw new AppError(error.message, 500, 'SEMANTIC_SEARCH_ERROR');
    }
  }
}
