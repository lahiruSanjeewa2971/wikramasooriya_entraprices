/**
 * Debug Google OAuth Callback Test
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api';

console.log('🔍 Debugging Google OAuth Callback...\n');

async function testGoogleCallback() {
  try {
    const testData = {
      googleId: 'test-google-id-debug',
      name: 'Debug Test User',
      email: 'debug@example.com',
      avatarUrl: 'https://example.com/debug-avatar.jpg'
    };

    console.log('📤 Sending test data:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ Google OAuth callback is working!');
      console.log('   - User:', data.user.name, `(${data.user.email})`);
      console.log('   - Provider:', data.user.provider);
      console.log('   - Avatar URL:', data.user.avatar_url);
    } else {
      console.log('\n❌ Google OAuth callback failed');
      console.log('   - Status:', response.status);
      console.log('   - Error:', responseText);
    }

  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
  }
}

testGoogleCallback();
