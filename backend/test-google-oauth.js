import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api';

// Test Google OAuth status endpoint
async function testGoogleOAuthStatus() {
  try {
    console.log('🔍 Testing Google OAuth Status...');
    const response = await fetch(`${API_BASE_URL}/auth/google/status`);
    const data = await response.json();
    
    console.log('✅ Status Response:', data);
    return data.success;
  } catch (error) {
    console.error('❌ Google OAuth Status Error:', error.message);
    return false;
  }
}

// Test Google OAuth initiation endpoint
async function testGoogleOAuthInitiation() {
  try {
    console.log('🔍 Testing Google OAuth Initiation...');
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'GET',
      redirect: 'manual' // Don't follow redirects
    });
    
    console.log('✅ Initiation Response Status:', response.status);
    console.log('✅ Location Header:', response.headers.get('location'));
    
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location && location.includes('accounts.google.com')) {
        console.log('✅ Google OAuth URL generated successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Google OAuth Initiation Error:', error.message);
    return false;
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  try {
    console.log('🔍 Testing Health Endpoint...');
    const response = await fetch('http://localhost:5001/health');
    const data = await response.json();
    
    console.log('✅ Health Response:', data);
    return data.success;
  } catch (error) {
    console.error('❌ Health Endpoint Error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Google OAuth Backend Tests...\n');
  
  // Test 1: Health check
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('❌ Backend server is not running. Please start the server first.');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Google OAuth status
  const statusOk = await testGoogleOAuthStatus();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Google OAuth initiation
  const initiationOk = await testGoogleOAuthInitiation();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log(`Health Endpoint: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Google OAuth Status: ${statusOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Google OAuth Initiation: ${initiationOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthOk && statusOk && initiationOk) {
    console.log('\n🎉 All tests passed! Google OAuth backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Run tests
runTests().catch(console.error);
