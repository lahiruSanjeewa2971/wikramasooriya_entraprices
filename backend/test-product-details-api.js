#!/usr/bin/env node

/**
 * Test Script for Product Details API Endpoints
 * Tests the new enhanced product details functionality with reviews and related products
 * 
 * Usage: node test-product-details-api.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api';
const API_ENDPOINTS = {
  health: `${BASE_URL.replace('/api', '')}/health`,
  products: `${BASE_URL}/products`,
  productDetails: (id) => `${BASE_URL}/products/${id}/details`,
  productReviews: (id) => `${BASE_URL}/products/${id}/reviews`,
  relatedProducts: (id) => `${BASE_URL}/products/${id}/related`
};

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  testProductId: 1 // Will be determined dynamically
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName, status, details = '') => {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  log(`${statusIcon} ${testName}: ${status}`, statusColor);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
const testHealthCheck = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.health, {
      method: 'GET',
      timeout: TEST_CONFIG.timeout
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logTest('Health Check', 'PASS', `Server is running - ${data.message}`);
      return true;
    } else {
      logTest('Health Check', 'FAIL', `Server responded with error: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logTest('Health Check', 'FAIL', `Connection failed: ${error.message}`);
    return false;
  }
};

const getTestProductId = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.products, {
      method: 'GET',
      timeout: TEST_CONFIG.timeout
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.data.products.length > 0) {
      const productId = data.data.products[0].id;
      logTest('Get Test Product ID', 'PASS', `Using product ID: ${productId}`);
      return productId;
    } else {
      logTest('Get Test Product ID', 'FAIL', 'No products found in database');
      return null;
    }
  } catch (error) {
    logTest('Get Test Product ID', 'FAIL', `Failed to fetch products: ${error.message}`);
    return null;
  }
};

const testProductDetails = async (productId) => {
  try {
    const response = await fetch(API_ENDPOINTS.productDetails(productId), {
      method: 'GET',
      timeout: TEST_CONFIG.timeout
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const product = data.data.product;
      const hasRequiredFields = product.id && product.name && product.price;
      const hasReviewData = product.average_rating !== undefined && product.review_count !== undefined;
      const hasImages = product.images && Array.isArray(product.images);
      const hasRelatedProducts = product.related_products && Array.isArray(product.related_products);
      const hasRecentReviews = product.recent_reviews && Array.isArray(product.recent_reviews);
      
      const details = [
        `Product: ${product.name}`,
        `Price: $${product.price}`,
        `Category: ${product.category_name || 'N/A'}`,
        `Rating: ${product.average_rating}/5 (${product.review_count} reviews)`,
        `Images: ${product.images.length}`,
        `Related Products: ${product.related_products.length}`,
        `Recent Reviews: ${product.recent_reviews.length}`
      ].join(', ');
      
      if (hasRequiredFields && hasReviewData && hasImages && hasRelatedProducts && hasRecentReviews) {
        logTest('Product Details API', 'PASS', details);
        return true;
      } else {
        logTest('Product Details API', 'FAIL', 'Missing required fields in response');
        return false;
      }
    } else {
      logTest('Product Details API', 'FAIL', `API error: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logTest('Product Details API', 'FAIL', `Request failed: ${error.message}`);
    return false;
  }
};

const testProductReviews = async (productId) => {
  try {
    const response = await fetch(API_ENDPOINTS.productReviews(productId), {
      method: 'GET',
      timeout: TEST_CONFIG.timeout
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const reviews = data.data.reviews;
      const pagination = data.data.pagination;
      
      const hasPagination = pagination && typeof pagination.totalItems === 'number';
      const hasReviews = Array.isArray(reviews);
      const reviewStructure = reviews.length === 0 || (
        reviews[0].id && 
        reviews[0].rating && 
        reviews[0].title && 
        reviews[0].comment &&
        reviews[0].user_name
      );
      
      const details = [
        `Total Reviews: ${pagination?.totalItems || 0}`,
        `Current Page: ${pagination?.currentPage || 1}`,
        `Reviews in Response: ${reviews.length}`
      ].join(', ');
      
      if (hasPagination && hasReviews && reviewStructure) {
        logTest('Product Reviews API', 'PASS', details);
        return true;
      } else {
        logTest('Product Reviews API', 'FAIL', 'Invalid response structure');
        return false;
      }
    } else {
      logTest('Product Reviews API', 'FAIL', `API error: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logTest('Product Reviews API', 'FAIL', `Request failed: ${error.message}`);
    return false;
  }
};

const testRelatedProducts = async (productId) => {
  try {
    const response = await fetch(API_ENDPOINTS.relatedProducts(productId), {
      method: 'GET',
      timeout: TEST_CONFIG.timeout
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const products = data.data.products;
      const hasProducts = Array.isArray(products);
      const productStructure = products.length === 0 || (
        products[0].id && 
        products[0].name && 
        products[0].price &&
        products[0].category_name
      );
      
      const details = `Related Products: ${products.length}`;
      
      if (hasProducts && productStructure) {
        logTest('Related Products API', 'PASS', details);
        return true;
      } else {
        logTest('Related Products API', 'FAIL', 'Invalid response structure');
        return false;
      }
    } else {
      logTest('Related Products API', 'FAIL', `API error: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logTest('Related Products API', 'FAIL', `Request failed: ${error.message}`);
    return false;
  }
};

const testReviewSorting = async (productId) => {
  const sortOptions = ['newest', 'oldest', 'highest_rating', 'lowest_rating', 'most_helpful'];
  let passedTests = 0;
  
  for (const sort of sortOptions) {
    try {
      const response = await fetch(`${API_ENDPOINTS.productReviews(productId)}?sort=${sort}`, {
        method: 'GET',
        timeout: TEST_CONFIG.timeout
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        logTest(`Review Sorting (${sort})`, 'PASS', `${data.data.reviews.length} reviews returned`);
        passedTests++;
      } else {
        logTest(`Review Sorting (${sort})`, 'FAIL', `API error: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      logTest(`Review Sorting (${sort})`, 'FAIL', `Request failed: ${error.message}`);
    }
  }
  
  return passedTests === sortOptions.length;
};

const testReviewPagination = async (productId) => {
  try {
    // Test first page
    const response1 = await fetch(`${API_ENDPOINTS.productReviews(productId)}?page=1&limit=2`, {
      method: 'GET',
      timeout: TEST_CONFIG.timeout
    });
    
    const data1 = await response1.json();
    
    if (response1.ok && data1.success) {
      const pagination1 = data1.data.pagination;
      const hasPagination = pagination1 && 
        typeof pagination1.currentPage === 'number' &&
        typeof pagination1.totalPages === 'number' &&
        typeof pagination1.totalItems === 'number' &&
        typeof pagination1.hasNextPage === 'boolean' &&
        typeof pagination1.hasPrevPage === 'boolean';
      
      if (hasPagination) {
        logTest('Review Pagination', 'PASS', `Page 1: ${pagination1.currentPage}/${pagination1.totalPages} (${pagination1.totalItems} total)`);
        return true;
      } else {
        logTest('Review Pagination', 'FAIL', 'Invalid pagination structure');
        return false;
      }
    } else {
      logTest('Review Pagination', 'FAIL', `API error: ${data1.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logTest('Review Pagination', 'FAIL', `Request failed: ${error.message}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  log('\n🚀 Starting Product Details API Tests', 'bright');
  log('=' .repeat(50), 'blue');
  
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Health Check
  totalTests++;
  if (await testHealthCheck()) {
    passedTests++;
  }
  
  await sleep(1000);
  
  // Test 2: Get Test Product ID
  totalTests++;
  const productId = await getTestProductId();
  if (productId) {
    passedTests++;
  } else {
    log('\n❌ Cannot continue tests without a valid product ID', 'red');
    return;
  }
  
  await sleep(1000);
  
  // Test 3: Product Details API
  totalTests++;
  if (await testProductDetails(productId)) {
    passedTests++;
  }
  
  await sleep(1000);
  
  // Test 4: Product Reviews API
  totalTests++;
  if (await testProductReviews(productId)) {
    passedTests++;
  }
  
  await sleep(1000);
  
  // Test 5: Related Products API
  totalTests++;
  if (await testRelatedProducts(productId)) {
    passedTests++;
  }
  
  await sleep(1000);
  
  // Test 6: Review Sorting
  totalTests++;
  if (await testReviewSorting(productId)) {
    passedTests++;
  }
  
  await sleep(1000);
  
  // Test 7: Review Pagination
  totalTests++;
  if (await testReviewPagination(productId)) {
    passedTests++;
  }
  
  // Test Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n' + '=' .repeat(50), 'blue');
  log('📊 Test Summary', 'bright');
  log('=' .repeat(50), 'blue');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const statusColor = successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red';
  
  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  log(`Success Rate: ${successRate}%`, statusColor);
  log(`Duration: ${duration}s`, 'cyan');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Product Details API is working perfectly!', 'green');
  } else if (passedTests >= totalTests * 0.8) {
    log('\n⚠️  Most tests passed. Some issues need attention.', 'yellow');
  } else {
    log('\n❌ Multiple test failures. Please check the implementation.', 'red');
  }
  
  log('\n📋 Tested Endpoints:', 'bright');
  log(`• GET ${API_ENDPOINTS.health}`, 'cyan');
  log(`• GET ${API_ENDPOINTS.products}`, 'cyan');
  log(`• GET ${API_ENDPOINTS.productDetails(productId)}`, 'cyan');
  log(`• GET ${API_ENDPOINTS.productReviews(productId)}`, 'cyan');
  log(`• GET ${API_ENDPOINTS.relatedProducts(productId)}`, 'cyan');
  
  log('\n✨ Test completed!', 'bright');
};

// Error handling
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  log(`\n❌ Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
