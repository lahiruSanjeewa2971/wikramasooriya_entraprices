#!/usr/bin/env node

import { modelService } from '../src/services/modelService.js';
import { logger } from '../src/utils/logger.js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function generateMissingEmbeddings() {
  console.log('🚀 Generating Missing Product Embeddings');
  console.log('========================================');
  
  try {
    // Initialize model
    await modelService.preloadModel();
    console.log('✅ AI model loaded');

    // Database configurations
    const mainDbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'wik_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Abcd@1234',
    };

    const semanticDbConfig = {
      host: process.env.DB_HOST_SEMANTIC || 'localhost',
      port: process.env.DB_PORT_SEMANTIC || 5433,
      database: process.env.DB_NAME_SEMANTIC || 'wik_db',
      user: process.env.DB_USER_SEMANTIC || 'postgres',
      password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
    };

    const mainClient = new Pool(mainDbConfig);
    const semanticClient = new Pool(semanticDbConfig);

    // Get products that don't have embeddings
    const missingEmbeddingsQuery = `
      SELECT p.id, p.name, p.description
      FROM products p
      LEFT JOIN product_embeddings pe ON p.id = pe.product_id
      WHERE pe.product_id IS NULL AND p.is_active = true
    `;

    const missingProducts = await mainClient.query(missingEmbeddingsQuery);
    console.log(`\n📊 Found ${missingProducts.rows.length} products without embeddings`);

    if (missingProducts.rows.length === 0) {
      console.log('✅ All products already have embeddings!');
      await mainClient.end();
      await semanticClient.end();
      return;
    }

    // Generate embeddings for missing products
    for (const product of missingProducts.rows) {
      console.log(`\n🔄 Processing product ${product.id}: ${product.name}`);
      
      try {
        // Generate embeddings
        const titleEmbedding = await modelService.generateEmbedding(product.name || '');
        const descriptionEmbedding = await modelService.generateEmbedding(product.description || '');
        
        // Create combined text and embedding
        const combinedText = `${product.name || ''} ${product.description || ''}`.trim();
        const combinedEmbedding = await modelService.generateEmbedding(combinedText);

        // Store embeddings
        const insertQuery = `
          INSERT INTO product_embeddings (product_id, title_embedding, description_embedding, combined_embedding)
          VALUES ($1, $2::vector, $3::vector, $4::vector)
          ON CONFLICT (product_id) DO UPDATE SET
            title_embedding = EXCLUDED.title_embedding,
            description_embedding = EXCLUDED.description_embedding,
            combined_embedding = EXCLUDED.combined_embedding,
            updated_at = NOW()
        `;

        await semanticClient.query(insertQuery, [
          product.id,
          `[${Array.from(titleEmbedding).join(',')}]`,
          `[${Array.from(descriptionEmbedding).join(',')}]`,
          `[${Array.from(combinedEmbedding).join(',')}]`
        ]);

        console.log(`✅ Generated embeddings for product ${product.id}`);

      } catch (error) {
        console.error(`❌ Failed to generate embeddings for product ${product.id}:`, error.message);
      }
    }

    // Verify results
    const totalEmbeddings = await semanticClient.query('SELECT COUNT(*) as total FROM product_embeddings');
    console.log(`\n🎉 Generation Complete!`);
    console.log(`   Total embeddings now: ${totalEmbeddings.rows[0].total}`);

    await mainClient.end();
    await semanticClient.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateMissingEmbeddings()
  .then(() => {
    console.log('\n✅ Missing embeddings generation completed!');
    console.log('🚀 Semantic search should now work properly!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
