#!/usr/bin/env node

import axios from 'axios';

/**
 * Test Semantic Search API with specific query
 */

async function testSemanticSearchAPI() {
  console.log('🧪 Testing Semantic Search API');
  console.log('==============================');
  
  const query = 'something to connect pipes together';
  const apiUrl = `http://localhost:5001/api/search/semantic?q=${encodeURIComponent(query)}`;
  
  console.log(`\n🔍 Testing Query: "${query}"`);
  console.log(`📡 API URL: ${apiUrl}`);
  
  try {
    // Test 1: Health Check
    console.log('\n📊 Step 1: Health Check');
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('✅ Server is running');
    console.log(`   AI Search Available: ${healthResponse.data.aiSearch?.available}`);
    console.log(`   Model Cached: ${healthResponse.data.aiSearch?.modelCached}`);
    console.log(`   Model Loading: ${healthResponse.data.aiSearch?.modelLoading}`);
    
    // Test 2: Semantic Search
    console.log('\n🧠 Step 2: Semantic Search');
    const startTime = Date.now();
    
    const response = await axios.get(apiUrl);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ Response received in ${responseTime}ms`);
    
    // Display response details
    console.log('\n📋 Response Details:');
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Search Type: ${response.data.data.searchType}`);
    console.log(`   AI Enabled: ${response.data.data.aiEnabled}`);
    console.log(`   Query: "${response.data.data.query}"`);
    console.log(`   Message: ${response.data.data.message}`);
    console.log(`   Products Found: ${response.data.data.products.length}`);
    
    // Display search metadata
    if (response.data.data.searchMetadata) {
      console.log('\n📊 Search Metadata:');
      console.log(`   Threshold: ${response.data.data.searchMetadata.threshold}`);
      console.log(`   Average Similarity: ${Math.round(response.data.data.searchMetadata.avgSimilarity * 100)}%`);
      console.log(`   Top Similarity: ${Math.round(response.data.data.searchMetadata.topSimilarity * 100)}%`);
    }
    
    // Display products with similarity scores
    console.log('\n🛍️  Search Results:');
    if (response.data.data.products.length > 0) {
      response.data.data.products.forEach((product, index) => {
        console.log(`\n   ${index + 1}. ${product.name}`);
        console.log(`      ID: ${product.id}`);
        console.log(`      Price: $${product.price}`);
        console.log(`      Similarity: ${Math.round(product.similarity * 100)}%`);
        console.log(`      Search Type: ${product.searchType}`);
        console.log(`      Description: ${product.description?.substring(0, 100)}...`);
      });
    } else {
      console.log('   No products found');
    }
    
    // Display warning if any
    if (response.data.warning) {
      console.log('\n⚠️  Warning:');
      console.log(`   Message: ${response.data.warning.message}`);
      console.log(`   Reason: ${response.data.warning.reason}`);
      console.log(`   Fallback Used: ${response.data.warning.fallbackUsed}`);
    }
    
    // Test 3: Compare with regular search
    console.log('\n🔍 Step 3: Compare with Regular Search');
    const regularSearchUrl = `http://localhost:5001/api/products?q=${encodeURIComponent(query)}`;
    
    try {
      const regularResponse = await axios.get(regularSearchUrl);
      console.log(`✅ Regular search found ${regularResponse.data.data.products.length} products`);
      
      // Compare results
      const semanticCount = response.data.data.products.length;
      const regularCount = regularResponse.data.data.products.length;
      
      console.log(`\n📊 Comparison:`);
      console.log(`   Semantic Search: ${semanticCount} products`);
      console.log(`   Regular Search: ${regularCount} products`);
      
      if (semanticCount > regularCount) {
        console.log(`   ✅ AI Search found ${semanticCount - regularCount} more relevant products!`);
      } else if (semanticCount === regularCount) {
        console.log(`   ⚖️  Both searches found the same number of products`);
      } else {
        console.log(`   ℹ️  Regular search found ${regularCount - semanticCount} more products`);
      }
      
    } catch (regularError) {
      console.log(`❌ Regular search failed: ${regularError.message}`);
    }
    
    // Summary
    console.log('\n🎉 Test Summary');
    console.log('===============');
    console.log(`✅ API Response: ${responseTime}ms`);
    console.log(`✅ Search Type: ${response.data.data.searchType}`);
    console.log(`✅ Products Found: ${response.data.data.products.length}`);
    console.log(`✅ AI Enabled: ${response.data.data.aiEnabled}`);
    
    if (response.data.data.searchMetadata) {
      console.log(`✅ Average Similarity: ${Math.round(response.data.data.searchMetadata.avgSimilarity * 100)}%`);
    }
    
    console.log('\n✅ Semantic search API test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Response Status:', error.response.status);
      console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received. Is the server running?');
      console.error('   Try: npm run dev');
    } else {
      console.error('   Error:', error.message);
    }
    
    process.exit(1);
  }
}

testSemanticSearchAPI()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
