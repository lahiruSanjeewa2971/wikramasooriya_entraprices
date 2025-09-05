/**
 * Test Google Login Flow
 * This script simulates the Google login flow to debug the issue
 */

console.log('🧪 Testing Google Login Flow...\n');

// Simulate the Google OAuth callback response
const mockGoogleCallbackResponse = {
  success: true,
  user: {
    id: 123,
    name: 'Test Google User',
    email: 'testgoogle@example.com',
    google_id: 'google-123456789',
    avatar_url: 'https://lh3.googleusercontent.com/a/test-avatar.jpg',
    provider: 'google',
    email_verified: true,
    role: 'user',
    is_active: true,
    created_at: '2024-09-05T05:20:00.000Z',
    updated_at: '2024-09-05T05:20:00.000Z'
  },
  tokens: {
    accessToken: 'mock-access-token-123',
    refreshToken: 'mock-refresh-token-456'
  }
};

console.log('📤 Mock Google Callback Response:');
console.log(JSON.stringify(mockGoogleCallbackResponse, null, 2));

// Simulate what the auth service does
console.log('\n📥 Simulating Auth Service Google Login:');

// Store tokens and user data (simulating localStorage)
localStorage.setItem('accessToken', mockGoogleCallbackResponse.tokens.accessToken);
localStorage.setItem('refreshToken', mockGoogleCallbackResponse.tokens.refreshToken);
localStorage.setItem('user', JSON.stringify(mockGoogleCallbackResponse.user));

console.log('✅ Tokens and user data stored in localStorage');

// Dispatch login event (simulating the event)
const loginEvent = new CustomEvent('auth:login', { 
  detail: { user: mockGoogleCallbackResponse.user } 
});
window.dispatchEvent(loginEvent);

console.log('✅ Login event dispatched');

// Check what's in localStorage
console.log('\n📋 localStorage contents:');
console.log('accessToken:', localStorage.getItem('accessToken'));
console.log('refreshToken:', localStorage.getItem('refreshToken'));
console.log('user:', localStorage.getItem('user'));

// Parse and display user data
const storedUser = JSON.parse(localStorage.getItem('user'));
console.log('\n👤 Stored User Data:');
console.log('Name:', storedUser.name);
console.log('Email:', storedUser.email);
console.log('Avatar URL:', storedUser.avatar_url);
console.log('Provider:', storedUser.provider);
console.log('Google ID:', storedUser.google_id);

console.log('\n✅ Google Login Flow Test Complete!');
