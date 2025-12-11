// Quick test script to verify auth endpoints
// Run with: node test-auth.js

const testAuth = async () => {
    const baseUrl = 'http://localhost:5000';

    console.log('🧪 Testing Authentication Endpoints\n');

    // Test 1: Register
    console.log('1️⃣ Testing Register...');
    const registerData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
    };

    try {
        const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });

        const registerResult = await registerResponse.json();
        console.log('✅ Register Response:', JSON.stringify(registerResult, null, 2));
        console.log('   User ID:', registerResult.user?.id);
        console.log('   Token:', registerResult.token?.substring(0, 30) + '...\n');

        const token = registerResult.token;

        // Test 2: Get current user
        console.log('2️⃣ Testing /api/auth/me...');
        const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { 'x-auth-token': token }
        });

        const meResult = await meResponse.json();
        console.log('✅ /me Response:', JSON.stringify(meResult, null, 2));
        console.log('   User ID:', meResult.user?.id);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testAuth();
