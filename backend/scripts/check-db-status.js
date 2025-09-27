#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function checkDatabaseStatus() {
  console.log('🔍 Checking Database Status');
  console.log('===========================');
  
  // Main database config
  const mainDbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'wik_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Abcd@1234',
    connectionTimeoutMillis: 5000,
  };

  // Semantic database config
  const dockerConfig = {
    host: process.env.DB_HOST_SEMANTIC || 'localhost',
    port: process.env.DB_PORT_SEMANTIC || 5433,
    database: process.env.DB_NAME_SEMANTIC || 'wik_db',
    user: process.env.DB_USER_SEMANTIC || 'postgres',
    password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
    connectionTimeoutMillis: 5000,
  };

  try {
    // Check main database
    console.log('\n📊 Main Database (Products):');
    const mainClient = new Pool(mainDbConfig);
    
    const productsResult = await mainClient.query('SELECT COUNT(*) as total FROM products');
    const productCount = parseInt(productsResult.rows[0].total);
    console.log(`   Total Products: ${productCount}`);
    
    if (productCount > 0) {
      const sampleProducts = await mainClient.query('SELECT id, name FROM products LIMIT 3');
      console.log('   Sample Products:');
      sampleProducts.rows.forEach(product => {
        console.log(`     ${product.id}: ${product.name}`);
      });
    }
    
    await mainClient.end();

    // Check semantic database
    console.log('\n🧠 Semantic Database (Embeddings):');
    const semanticClient = new Pool(dockerConfig);
    
    // Check if product_embeddings table exists
    const tableCheck = await semanticClient.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'product_embeddings'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('   ✅ product_embeddings table exists');
      
      const embeddingsResult = await semanticClient.query('SELECT COUNT(*) as total FROM product_embeddings');
      const embeddingCount = parseInt(embeddingsResult.rows[0].total);
      console.log(`   Total Embeddings: ${embeddingCount}`);
      
      if (embeddingCount > 0) {
        const sampleEmbeddings = await semanticClient.query(`
          SELECT product_id, created_at 
          FROM product_embeddings 
          ORDER BY created_at DESC 
          LIMIT 3
        `);
        console.log('   Recent Embeddings:');
        sampleEmbeddings.rows.forEach(row => {
          console.log(`     Product ${row.product_id}: ${row.created_at}`);
        });
      } else {
        console.log('   ❌ No embeddings found! This is why semantic search is not working.');
        console.log('   💡 You need to generate embeddings first.');
      }
    } else {
      console.log('   ❌ product_embeddings table does not exist!');
      console.log('   💡 Run: npm run test:schema to create the table');
    }
    
    await semanticClient.end();

    // Summary
    console.log('\n📋 Summary:');
    console.log(`   Products in main DB: ${productCount}`);
    if (tableCheck.rows[0].exists) {
      const embeddingsResult = await semanticClient.query('SELECT COUNT(*) as total FROM product_embeddings');
      const embeddingCount = parseInt(embeddingsResult.rows[0].total);
      console.log(`   Embeddings in semantic DB: ${embeddingCount}`);
      
      if (productCount > 0 && embeddingCount === 0) {
        console.log('\n🔧 Next Steps:');
        console.log('   1. Generate embeddings for existing products');
        console.log('   2. Create a script to populate product_embeddings table');
        console.log('   3. Then semantic search will work properly');
      } else if (embeddingCount > 0) {
        console.log('\n✅ Setup looks good! Semantic search should work.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabaseStatus()
  .then(() => {
    console.log('\n✅ Database status check completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
