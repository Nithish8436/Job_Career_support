const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const runDiagnosis = async () => {
    const secret = process.env.JWT_SECRET;

    // Prefer env port, but fallback list
    const envPort = process.env.PORT;
    const ports = envPort ? [envPort] : [5000, 8000];

    console.log(`\n--- Starting Connectivity & Token Diagnosis ---`);
    console.log(`Checking ports: ${ports.join(', ')}`);

    const fakeId = '000000000000000000000000';
    const payload = { user: { id: fakeId } };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    let serverFound = false;

    for (const port of ports) {
        const verifyUrl = `http://127.0.0.1:${port}/api/auth/verify-email?token=${token}`;
        console.log(`\nTesting: ${verifyUrl}`);

        try {
            await axios.get(verifyUrl);
            console.log(`❓ [Port ${port}] UNEXPECTED: Server returned 200 OK?`);
            serverFound = true;
        } catch (apiError) {
            if (apiError.response) {
                console.log(`✅ [Port ${port}] SERVER REACHED! Status: ${apiError.response.status}`);
                serverFound = true;

                const errorMsg = apiError.response.data.error;
                console.log(`   Message: "${errorMsg}"`);

                if (errorMsg === 'User not found') {
                    console.log('\n✅ DIAGNOSIS SUCCESS: Token signature was ACCEPTED.');
                    console.log('The backend is running and using the correct JWT_SECRET.');
                    process.exit(0);
                } else if (errorMsg === 'Invalid or expired verification link') {
                    console.log('\n❌ DIAGNOSIS FAILED: Token REJECTED.');
                    console.log('The running server has a DIFFERENT JWT_SECRET.');
                    console.log('ACTION REQUIRED: Restart the Backend Server.');
                    process.exit(1);
                }
            } else {
                console.log(`❌ [Port ${port}] CONNECTION FAILED: ${apiError.code || apiError.message}`);
            }
        }
    }

    if (!serverFound) {
        console.log('\n❌ Could not connect to the backend.');
        console.log('Possibilities:');
        console.log('1. The backend server is NOT running.');
        console.log('2. It crashed due to the previous internet/DB issues.');
        console.log('   (Run "npm start" or "npm run server" in the backend folder)');
        process.exit(1);
    }
};

runDiagnosis();
