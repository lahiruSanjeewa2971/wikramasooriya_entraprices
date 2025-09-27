#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Schema Creation Test Script
 * Tests the creation of product_embeddings table for semantic search
 */

class DatabaseSchemaTester {
  constructor() {
    this.dockerConfig = {
      host: process.env.DB_HOST_SEMANTIC || 'localhost',
      port: process.env.DB_PORT_SEMANTIC || 5433,
      database: process.env.DB_NAME_SEMANTIC || 'wik_db',
      user: process.env.DB_USER_SEMANTIC || 'postgres',
      password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    };
    
    this.pool = null;
  }

  async connect() {
    try {
      console.log('🔍 Connecting to Docker PostgreSQL with pgvector...');
      this.pool = new Pool(this.dockerConfig);
      const client = await this.pool.connect();
      
      // Test connection
      const result = await client.query('SELECT version()');
      console.log('✅ Connected to:', result.rows[0].version.split(' ')[0]);
      
      client.release();
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }

  async checkPgVectorExtension() {
    try {
      console.log('\n🔍 Checking pgvector extension...');
      const client = await this.pool.connect();
      
      const result = await client.query(`
        SELECT extname, extversion 
        FROM pg_extension 
        WHERE extname = 'vector'
      `);
      
      client.release();
      
      if (result.rows.length > 0) {
        console.log('✅ pgvector extension is installed:', result.rows[0].extversion);
        return true;
      } else {
        console.log('❌ pgvector extension is not installed');
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking pgvector:', error.message);
      return false;
    }
  }

  async runMigration() {
    try {
      console.log('\n🔍 Running database migration...');
      
      // Read migration file
      const migrationPath = path.join(__dirname, '..', 'db', 'migrations', 'create-product-embeddings-table.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      const client = await this.pool.connect();
      
      // Execute migration
      await client.query(migrationSQL);
      
      client.release();
      console.log('✅ Migration executed successfully');
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
  }

  async verifyTableCreation() {
    try {
      console.log('\n🔍 Verifying table creation...');
      const client = await this.pool.connect();
      
      // Check if table exists
      const tableCheck = await client.query(`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'product_embeddings' 
        ORDER BY ordinal_position
      `);
      
      if (tableCheck.rows.length === 0) {
        console.log('❌ product_embeddings table not found');
        client.release();
        return false;
      }
      
      console.log('✅ product_embeddings table created with columns:');
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // Check indexes
      const indexCheck = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes 
        WHERE tablename = 'product_embeddings'
        ORDER BY indexname
      `);
      
      console.log('\n✅ Indexes created:');
      indexCheck.rows.forEach(row => {
        console.log(`   - ${row.indexname}`);
      });
      
      // Check constraints
      const constraintCheck = await client.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints 
        WHERE table_name = 'product_embeddings'
        ORDER BY constraint_name
      `);
      
      console.log('\n✅ Constraints created:');
      constraintCheck.rows.forEach(row => {
        console.log(`   - ${row.constraint_name}: ${row.constraint_type}`);
      });
      
      client.release();
      return true;
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
  }

  async testVectorOperations() {
    try {
      console.log('\n🔍 Testing vector operations...');
      const client = await this.pool.connect();
      
      // Test vector creation and operations
      const testVector = Array(384).fill(0.1); // Create a test vector
      const vectorString = `[${testVector.join(',')}]`;
      
      // First, check if we can create a test product or if products table exists
      let testProductId = 999999;
      
      try {
        // Try to create a test product first
        await client.query(`
          INSERT INTO products (id, title, description, price, category_id, created_at, updated_at)
          VALUES ($1, 'Test Product', 'Test Description', 100.00, 1, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [testProductId]);
      } catch (error) {
        // If products table doesn't exist or has different structure, skip foreign key test
        console.log('⚠️  Products table not accessible, testing vector operations without foreign key');
        
        // Temporarily disable foreign key constraint for testing
        await client.query('ALTER TABLE product_embeddings DROP CONSTRAINT IF EXISTS product_embeddings_product_id_fkey');
        
        // Test inserting a vector
        await client.query(`
          INSERT INTO product_embeddings (product_id, title_embedding, description_embedding, combined_embedding)
          VALUES ($1, $2::vector, $2::vector, $2::vector)
        `, [testProductId, vectorString]);
        
        // Test vector similarity search
        const similarityResult = await client.query(`
          SELECT product_id, 
                 1 - (combined_embedding <=> $1::vector) as similarity
          FROM product_embeddings 
          WHERE product_id = $2
        `, [vectorString, testProductId]);
        
        if (similarityResult.rows.length > 0) {
          console.log('✅ Vector operations working correctly');
          console.log(`   - Similarity score: ${similarityResult.rows[0].similarity}`);
        }
        
        // Clean up test data
        await client.query('DELETE FROM product_embeddings WHERE product_id = $1', [testProductId]);
        
        // Re-add foreign key constraint
        await client.query(`
          ALTER TABLE product_embeddings 
          ADD CONSTRAINT product_embeddings_product_id_fkey 
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        `);
        
        client.release();
        return true;
      }
      
      // If we get here, products table exists and we can test normally
      // Test inserting a vector
      await client.query(`
        INSERT INTO product_embeddings (product_id, title_embedding, description_embedding, combined_embedding)
        VALUES ($1, $2::vector, $2::vector, $2::vector)
      `, [testProductId, vectorString]);
      
      // Test vector similarity search
      const similarityResult = await client.query(`
        SELECT product_id, 
               1 - (combined_embedding <=> $1::vector) as similarity
        FROM product_embeddings 
        WHERE product_id = $2
      `, [vectorString, testProductId]);
      
      if (similarityResult.rows.length > 0) {
        console.log('✅ Vector operations working correctly');
        console.log(`   - Similarity score: ${similarityResult.rows[0].similarity}`);
      }
      
      // Clean up test data
      await client.query('DELETE FROM product_embeddings WHERE product_id = $1', [testProductId]);
      await client.query('DELETE FROM products WHERE id = $1', [testProductId]);
      
      client.release();
      return true;
    } catch (error) {
      console.error('❌ Vector operations test failed:', error.message);
      return false;
    }
  }

  async runFullTest() {
    console.log('🚀 Starting Database Schema Creation Test');
    console.log('==========================================');
    
    const results = {
      connection: false,
      pgvector: false,
      migration: false,
      verification: false,
      vectorOps: false
    };
    
    // Test connection
    results.connection = await this.connect();
    if (!results.connection) {
      console.log('\n❌ Test failed: Cannot connect to database');
      return false;
    }
    
    // Check pgvector extension
    results.pgvector = await this.checkPgVectorExtension();
    if (!results.pgvector) {
      console.log('\n❌ Test failed: pgvector extension not available');
      return false;
    }
    
    // Run migration
    results.migration = await this.runMigration();
    if (!results.migration) {
      console.log('\n❌ Test failed: Migration execution failed');
      return false;
    }
    
    // Verify table creation
    results.verification = await this.verifyTableCreation();
    if (!results.verification) {
      console.log('\n❌ Test failed: Table verification failed');
      return false;
    }
    
    // Test vector operations
    results.vectorOps = await this.testVectorOperations();
    if (!results.vectorOps) {
      console.log('\n❌ Test failed: Vector operations test failed');
      return false;
    }
    
    // Summary
    console.log('\n🎉 Test Results Summary');
    console.log('======================');
    console.log(`✅ Database Connection: ${results.connection ? 'PASS' : 'FAIL'}`);
    console.log(`✅ pgvector Extension: ${results.pgvector ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Migration Execution: ${results.migration ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Table Verification: ${results.verification ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Vector Operations: ${results.vectorOps ? 'PASS' : 'FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Database schema is ready for semantic search.');
    } else {
      console.log('\n❌ Some tests failed. Please check the errors above.');
    }
    
    return allPassed;
  }

  async cleanup() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Run the test
const tester = new DatabaseSchemaTester();

tester.runFullTest()
  .then(success => {
    if (success) {
      console.log('\n✅ Database schema creation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Database schema creation failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  })
  .finally(() => {
    tester.cleanup();
  });
