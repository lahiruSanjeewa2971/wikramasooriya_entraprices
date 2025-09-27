#!/usr/bin/env node

import { modelService } from '../src/services/modelService.js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function testSemanticSearchCore() {
  console.log('🔧 Testing Semantic Search Core Components');
  console.log('==========================================');
  
  try {
    // Test 1: Model Service
    console.log('\n🧠 Test 1: Model Service');
    await modelService.preloadModel();
    console.log('✅ Model loaded successfully');
    
    const testEmbedding = await modelService.generateEmbedding('pipe connector');
    console.log(`✅ Generated embedding: ${testEmbedding.length} dimensions`);
    
    // Test 2: Database Connection
    console.log('\n🔗 Test 2: Database Connections');
    
    const semanticDbConfig = {
      host: process.env.DB_HOST_SEMANTIC || 'localhost',
      port: process.env.DB_PORT_SEMANTIC || 5433,
      database: process.env.DB_NAME_SEMANTIC || 'wik_db',
      user: process.env.DB_USER_SEMANTIC || 'postgres',
      password: process.env.DB_PASSWORD_SEMANTIC || 'Abcd@1234',
      connectionTimeoutMillis: 5000,
    };
    
    const semanticClient = new Pool(semanticDbConfig);
    
    // Test connection
    const connectionTest = await semanticClient.query('SELECT NOW()');
    console.log('✅ Semantic database connection successful');
    
    // Test embeddings table
    const embeddingsCount = await semanticClient.query('SELECT COUNT(*) as total FROM product_embeddings');
    console.log(`✅ Found ${embeddingsCount.rows[0].total} embeddings in database`);
    
    // Test 3: Vector Search Query
    console.log('\n🔍 Test 3: Direct Vector Search');
    
    const queryVector = `[${Array.from(testEmbedding).join(',')}]`;
    
    const searchQuery = `
      SELECT 
        pe.product_id,
        1 - (pe.combined_embedding <=> $1::vector) as similarity
      FROM product_embeddings pe
      WHERE 1 - (pe.combined_embedding <=> $1::vector) > 0.1
      ORDER BY similarity DESC
      LIMIT 3
    `;
    
    console.log('🔄 Executing vector similarity search...');
    const startTime = Date.now();
    
    const searchResult = await semanticClient.query(searchQuery, [queryVector]);
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Vector search completed in ${queryTime}ms`);
    console.log(`   Found ${searchResult.rows.length} results`);
    
    if (searchResult.rows.length > 0) {
      searchResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. Product ${row.product_id}: ${Math.round(row.similarity * 100)}% similarity`);
      });
    }
    
    // Test 4: Full Query with Product Details
    console.log('\n📊 Test 4: Full Query with Product Details');
    
    const fullQuery = `
      SELECT 
        pe.product_id,
        p.name,
        p.description,
        1 - (pe.combined_embedding <=> $1::vector) as similarity
      FROM product_embeddings pe
      LEFT JOIN (
        SELECT id, name, description
        FROM products
        WHERE is_active = true
      ) p ON pe.product_id = p.id
      WHERE 1 - (pe.combined_embedding <=> $1::vector) > 0.1
        AND p.id IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 3
    `;
    
    console.log('🔄 Executing full search query...');
    const fullStartTime = Date.now();
    
    const fullResult = await semanticClient.query(fullQuery, [queryVector]);
    
    const fullQueryTime = Date.now() - fullStartTime;
    console.log(`✅ Full search completed in ${fullQueryTime}ms`);
    console.log(`   Found ${fullResult.rows.length} results`);
    
    if (fullResult.rows.length > 0) {
      fullResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.name}`);
        console.log(`      Similarity: ${Math.round(row.similarity * 100)}%`);
        console.log(`      Description: ${row.description?.substring(0, 80)}...`);
      });
    }
    
    await semanticClient.end();
    
    console.log('\n🎉 All Core Tests Passed!');
    console.log('✅ Model Service: Working');
    console.log('✅ Database Connection: Working');
    console.log('✅ Vector Search: Working');
    console.log('✅ Full Query: Working');
    
    console.log('\n💡 The core components are working. The API timeout might be due to:');
    console.log('   - Network issues');
    console.log('   - Server middleware hanging');
    console.log('   - Connection pool issues');
    console.log('   - Model loading delays in the API');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testSemanticSearchCore()
  .then(() => {
    console.log('\n✅ Core component test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
