/**
 * Frontend Google OAuth Test Script
 * Tests the complete Google OAuth flow
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://localhost:8080';

console.log('🧪 Testing Frontend Google OAuth Integration...\n');

// Test 1: Check if frontend is running
async function testFrontendRunning() {
  console.log('1️⃣ Testing Frontend Server...');
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log('✅ Frontend server is running on http://localhost:8080');
      return true;
    } else {
      console.log('❌ Frontend server returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend server is not running:', error.message);
    return false;
  }
}

// Test 2: Check if backend Google OAuth is configured
async function testBackendGoogleOAuth() {
  console.log('\n2️⃣ Testing Backend Google OAuth Configuration...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google/status`);
    const data = await response.json();
    
    if (data.success && data.configured) {
      console.log('✅ Backend Google OAuth is configured and ready');
      console.log(`   - Client ID: ${data.clientId}`);
      console.log(`   - Callback URL: ${data.callbackUrl}`);
      return true;
    } else {
      console.log('❌ Backend Google OAuth is not configured');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend Google OAuth test failed:', error.message);
    return false;
  }
}

// Test 3: Test Google OAuth callback endpoint
async function testGoogleCallbackEndpoint() {
  console.log('\n3️⃣ Testing Google OAuth Callback Endpoint...');
  try {
    const testData = {
      googleId: 'test-google-id-123',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Google OAuth callback endpoint is working');
      console.log(`   - User created: ${data.user.name} (${data.user.email})`);
      console.log(`   - Provider: ${data.user.provider}`);
      console.log(`   - Avatar URL: ${data.user.avatar_url || 'None'}`);
      return true;
    } else {
      console.log('❌ Google OAuth callback endpoint failed:', data.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Google OAuth callback test failed:', error.message);
    return false;
  }
}

// Test 4: Test frontend login page
async function testLoginPage() {
  console.log('\n4️⃣ Testing Frontend Login Page...');
  try {
    const response = await fetch(`${FRONTEND_URL}/login`);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Continue with Google') && html.includes('GoogleOAuthProvider')) {
        console.log('✅ Frontend login page has Google OAuth integration');
        return true;
      } else {
        console.log('❌ Frontend login page missing Google OAuth elements');
        return false;
      }
    } else {
      console.log('❌ Frontend login page not accessible:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend login page test failed:', error.message);
    return false;
  }
}

// Test 5: Test TopNav component
async function testTopNavComponent() {
  console.log('\n5️⃣ Testing TopNav Component...');
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Wikramasooriya Enterprises') && html.includes('TopNav')) {
        console.log('✅ TopNav component is loaded');
        return true;
      } else {
        console.log('❌ TopNav component not found');
        return false;
      }
    } else {
      console.log('❌ Frontend home page not accessible:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ TopNav component test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Google OAuth Frontend Tests...\n');
  
  const results = [];
  
  results.push(await testFrontendRunning());
  results.push(await testBackendGoogleOAuth());
  results.push(await testGoogleCallbackEndpoint());
  results.push(await testLoginPage());
  results.push(await testTopNavComponent());
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Google OAuth frontend integration is working correctly.');
    console.log('\n📝 Next Steps:');
    console.log('1. Open http://localhost:8080/login in your browser');
    console.log('2. Click "Continue with Google" button');
    console.log('3. Complete Google OAuth flow');
    console.log('4. Verify user profile picture appears in TopNav');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
