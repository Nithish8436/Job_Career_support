const { analyzeMatch } = require('./services/aiService');
require('dotenv').config();

async function testAnalyze() {
    console.log('--- Starting Test ---');

    // Mock Data
    const mockResumeText = `
    John Doe
    Software Engineer
    
    Skills: JavaScript, React, Node.js, Python, AWS
    
    Experience:
    Senior Developer at Tech Co (2020-Present)
    - Built scalable web apps using React and Node.js
    - Managed AWS infrastructure
    
    Education:
    BS Computer Science, University of Technology
    `;

    const mockJobDescription = `
    We are looking for a Software Engineer with experience in:
    - JavaScript, React, Node.js
    - Cloud platforms (AWS/GCP)
    - Python is a plus
    `;

    try {
        console.log('Calling analyzeMatch...');
        const result = await analyzeMatch(mockResumeText, mockJobDescription);
        console.log('--- Success ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('--- Failed ---');
        console.error(error);
    }
}

testAnalyze();
