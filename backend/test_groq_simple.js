const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroqConnection() {
    console.log('Testing Groq Connection...');
    console.log('API Key present:', !!GROQ_API_KEY);
    console.log('API Key length:', GROQ_API_KEY ? GROQ_API_KEY.length : 0);

    if (!GROQ_API_KEY) {
        console.error('ERROR: GROQ_API_KEY is missing');
        return;
    }

    try {
        console.log('Sending request to Groq...');
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama3-70b-8192',
                messages: [
                    { role: 'system', content: 'You are a test assistant. Return JSON object {"status": "ok"}.' },
                    { role: 'user', content: 'Test connection.' }
                ],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Groq API Error Details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testGroqConnection();
