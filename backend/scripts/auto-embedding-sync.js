#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import { modelService } from '../src/services/modelService.js';
import { logger } from '../src/utils/logger.js';

dotenv.config();

const { Pool } = pg;

/**
 * Automated Embedding Sync Cron Job
 * Compares local and Docker databases and generates missing embeddings
 */

class AutoEmbeddingSync {
  constructor() {
    // Local database configuration (main products database)
    this.localDbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'wik_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Abcd@1234',
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
    };

    // Docker database configuration (semantic search database)
    this.dockerDbConfig = {
      host: process.env.DB_HOST_SEMANTIC || 'localhost',
      port: process.env.DB_PORT_SEMANTIC || 5433,
      database: process.env.DB_NAME_SEMANTIC || 'wik_db',
      user: process.env.DB_USER_SEMANTIC || 'postgres',
      password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
    };

    this.isRunning = false;
    this.modelLoaded = false;
  }

  /**
   * Initialize the model service
   */
  async initializeModel() {
    try {
      console.log('🤖 Initializing AI model for embedding generation...');
      await modelService.preloadModel();
      this.modelLoaded = true;
      console.log('✅ AI model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load AI model:', error.message);
      this.modelLoaded = false;
      throw error;
    }
  }

  /**
   * Get all active product IDs from local database
   */
  async getLocalProductIds() {
    console.log('🔄 Creating local database connection...');
    const client = new Pool(this.localDbConfig);
    
    try {
      console.log('🔄 Attempting to connect to local database...');
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Local DB connection timeout')), 5000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ Connected to local database successfully');
      
      console.log('🔄 Querying products table...');
      const queryPromise = client.query(`
        SELECT id, name, description, sku
        FROM products 
        WHERE is_active = true
        ORDER BY id
      `);
      const queryTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Local DB query timeout')), 5000)
      );
      
      const result = await Promise.race([queryPromise, queryTimeoutPromise]);
      
      console.log(`📦 Found ${result.rows.length} active products in local database`);
      console.log('🔄 About to return local products...');
      return result.rows;
      
    } catch (error) {
      console.error('❌ Error fetching local products:', error.message);
      console.error('Error details:', error);
      throw error;
    } finally {
      console.log('🔄 Closing local database connection...');
      try {
        // Temporarily comment out client.end() to test if it's causing the hang
        // await client.end();
        console.log('✅ Local database connection closed successfully (skipped)');
      } catch (endError) {
        console.error('⚠️  Error closing local database connection:', endError.message);
      }
    }
  }

  /**
   * Get all product IDs that have embeddings in Docker database
   */
  async getDockerEmbeddingIds() {
    console.log('🔄 Creating Docker database connection...');
    const client = new Pool(this.dockerDbConfig);
    
    try {
      console.log('🔄 Attempting to connect to Docker database...');
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Docker DB connection timeout')), 5000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ Connected to Docker database successfully');
      
      console.log('🔄 Querying embeddings table...');
      const queryPromise = client.query(`
        SELECT DISTINCT product_id
        FROM product_embeddings
        ORDER BY product_id
      `);
      const queryTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Docker DB query timeout')), 5000)
      );
      
      const result = await Promise.race([queryPromise, queryTimeoutPromise]);
      
      const productIds = result.rows.map(row => row.product_id);
      console.log(`🧠 Found ${productIds.length} products with embeddings in Docker database`);
      return productIds;
      
    } catch (error) {
      console.error('❌ Error fetching Docker embeddings:', error.message);
      console.error('Error details:', error);
      throw error;
    } finally {
      console.log('🔄 Closing Docker database connection...');
      try {
        // Temporarily comment out client.end() to test if it's causing the hang
        // await client.end();
        console.log('✅ Docker database connection closed successfully (skipped)');
      } catch (endError) {
        console.error('⚠️  Error closing Docker database connection:', endError.message);
      }
    }
  }

  /**
   * Generate embeddings for a product
   */
  async generateProductEmbedding(product) {
    try {
      console.log(`🔄 Generating embeddings for product ${product.id}: ${product.name}`);
      
      // Generate embeddings using AI model
      const titleEmbedding = await modelService.generateEmbedding(product.name || '');
      const descriptionEmbedding = await modelService.generateEmbedding(product.description || '');
      
      // Create combined text for better semantic understanding
      const combinedText = `${product.name || ''} ${product.description || ''}`.trim();
      const combinedEmbedding = await modelService.generateEmbedding(combinedText);
      
      return {
        titleEmbedding: Array.from(titleEmbedding),
        descriptionEmbedding: Array.from(descriptionEmbedding),
        combinedEmbedding: Array.from(combinedEmbedding)
      };
      
    } catch (error) {
      console.error(`❌ Error generating embeddings for product ${product.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Store embeddings in Docker database
   */
  async storeEmbeddings(productId, embeddings) {
    const client = new Pool(this.dockerDbConfig);
    
    try {
      await client.connect();
      
      const query = `
        INSERT INTO product_embeddings (product_id, title_embedding, description_embedding, combined_embedding)
        VALUES ($1, $2::vector, $3::vector, $4::vector)
        ON CONFLICT (product_id) DO UPDATE SET
          title_embedding = EXCLUDED.title_embedding,
          description_embedding = EXCLUDED.description_embedding,
          combined_embedding = EXCLUDED.combined_embedding,
          updated_at = NOW()
      `;
      
      await client.query(query, [
        productId,
        `[${embeddings.titleEmbedding.join(',')}]`,
        `[${embeddings.descriptionEmbedding.join(',')}]`,
        `[${embeddings.combinedEmbedding.join(',')}]`
      ]);
      
      console.log(`✅ Stored embeddings for product ${productId}`);
      
    } catch (error) {
      console.error(`❌ Error storing embeddings for product ${productId}:`, error.message);
      throw error;
    } finally {
      try {
        // Temporarily comment out client.end() to prevent hanging
        // await client.end();
        console.log(`🔄 Closed connection for product ${productId} (skipped)`);
      } catch (endError) {
        console.error(`⚠️  Error closing connection for product ${productId}:`, endError.message);
      }
    }
  }

  /**
   * Process a single product (generate and store embeddings)
   */
  async processProduct(product) {
    try {
      // Generate embeddings
      const embeddings = await this.generateProductEmbedding(product);
      
      // Store embeddings
      await this.storeEmbeddings(product.id, embeddings);
      
      return {
        success: true,
        productId: product.id,
        productName: product.name,
        sku: product.sku
      };
      
    } catch (error) {
      return {
        success: false,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        error: error.message
      };
    }
  }

  /**
   * Main sync function - compares databases and generates missing embeddings
   */
  async syncEmbeddings() {
    if (this.isRunning) {
      console.log('⚠️  Sync already running, skipping this execution');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      console.log('\n🚀 Starting Auto Embedding Sync');
      console.log('=================================');
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      
      // Check if model is loaded
      if (!this.modelLoaded) {
        await this.initializeModel();
      }
      
      // Get products from local database
      console.log('\n📦 Fetching products from local database...');
      const localProducts = await this.getLocalProductIds();
      console.log('✅ Local products fetched successfully');
      
      if (localProducts.length === 0) {
        console.log('ℹ️  No active products found in local database');
        return;
      }
      
      // Get existing embeddings from Docker database
      console.log('\n🧠 Fetching existing embeddings from Docker database...');
      console.log('🔄 About to call getDockerEmbeddingIds()...');
      const dockerProductIds = await this.getDockerEmbeddingIds();
      console.log('✅ Docker embeddings fetched successfully');
      
      // Find products that need embeddings
      const productsNeedingEmbeddings = localProducts.filter(product => 
        !dockerProductIds.includes(product.id)
      );
      
      console.log(`\n📊 Sync Summary:`);
      console.log(`   Total products in local DB: ${localProducts.length}`);
      console.log(`   Products with embeddings: ${dockerProductIds.length}`);
      console.log(`   Products needing embeddings: ${productsNeedingEmbeddings.length}`);
      
      if (productsNeedingEmbeddings.length === 0) {
        console.log('✅ All products already have embeddings!');
        return;
      }
      
      // Process products that need embeddings
      console.log(`\n🔄 Processing ${productsNeedingEmbeddings.length} products...`);
      
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of productsNeedingEmbeddings) {
        console.log(`\n📝 Processing: ${product.name} (ID: ${product.id}, SKU: ${product.sku})`);
        
        const result = await this.processProduct(product);
        results.push(result);
        
        if (result.success) {
          successCount++;
          console.log(`✅ Success: ${product.name}`);
        } else {
          errorCount++;
          console.log(`❌ Failed: ${product.name} - ${result.error}`);
        }
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Summary
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`\n🎉 Auto Embedding Sync Completed!`);
      console.log(`===================================`);
      console.log(`⏰ Duration: ${Math.round(duration / 1000)}s`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${errorCount}`);
      console.log(`📊 Success Rate: ${Math.round((successCount / productsNeedingEmbeddings.length) * 100)}%`);
      
      if (errorCount > 0) {
        console.log(`\n❌ Failed Products:`);
        results.filter(r => !r.success).forEach(result => {
          console.log(`   ${result.productId}. ${result.productName} - ${result.error}`);
        });
      }
      
    } catch (error) {
      console.error('\n💥 Auto Embedding Sync Failed:', error.message);
      console.error('Error details:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test the sync function manually
   */
  async testSync() {
    console.log('🧪 Testing Auto Embedding Sync');
    console.log('===============================');
    
    try {
      console.log('🔄 Starting sync test...');
      await this.syncEmbeddings();
      console.log('\n✅ Test completed successfully');
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.error('Error stack:', error.stack);
      process.exit(1);
    }
  }

}

// Export for use in other modules
export { AutoEmbeddingSync };

// If running this script directly, test the sync
console.log('🚀 Script starting...');

// Fix the comparison by normalizing the paths
const scriptPath = process.argv[1];
const normalizedScriptPath = scriptPath.replace(/\\/g, '/');
const normalizedImportUrl = import.meta.url.replace(/\\/g, '/');

console.log('Script path:', normalizedScriptPath);
console.log('Import URL:', normalizedImportUrl);

if (normalizedImportUrl.includes(normalizedScriptPath.split('/').pop())) {
  console.log('✅ Script detected as main module');
  const sync = new AutoEmbeddingSync();
  
  // Add global timeout
  const globalTimeout = setTimeout(() => {
    console.error('\n⏰ Script timeout - taking too long to complete');
    process.exit(1);
  }, 30000); // 30 seconds total timeout
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    // Test mode - run once
    sync.testSync()
      .then(() => {
        clearTimeout(globalTimeout);
        console.log('\n🎯 Test completed');
        process.exit(0);
      })
      .catch(error => {
        clearTimeout(globalTimeout);
        console.error('\n💥 Test failed:', error);
        console.error('Error details:', error);
        process.exit(1);
      });
  } else {
    // Default - show usage
    console.log('🤖 Auto Embedding Sync');
    console.log('======================');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/auto-embedding-sync.js --test    # Run sync once');
    console.log('  node scripts/auto-embedding-sync.js          # Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/auto-embedding-sync.js --test');
    console.log('');
    console.log('This script will:');
    console.log('  1. Compare local and Docker databases');
    console.log('  2. Find products without embeddings');
    console.log('  3. Generate AI embeddings for missing products');
    console.log('  4. Store embeddings in Docker database');
  }
}
