const axios = require('axios');

/**
 * Compile LaTeX code to PDF using LaTeX.Online API
 * @param {string} latexCode - The LaTeX source code
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
async function compileLatex(latexCode) {
    try {
        // LaTeX.Online API endpoint - uses GET request with text parameter
        const apiUrl = 'https://latexonline.cc/compile';

        // URL encode the LaTeX code
        const encodedLatex = encodeURIComponent(latexCode);

        // Make GET request with LaTeX code as query parameter
        const response = await axios.get(`${apiUrl}?text=${encodedLatex}`, {
            responseType: 'arraybuffer',
            timeout: 60000, // 60 second timeout for compilation
            maxContentLength: 10 * 1024 * 1024, // 10MB max
            headers: {
                'Accept': 'application/pdf'
            }
        });

        if (response.status === 200 && response.data) {
            return Buffer.from(response.data);
        } else {
            throw new Error(`LaTeX compilation failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error('LaTeX Compilation Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data?.toString().substring(0, 500));
        }
        throw new Error('Failed to compile LaTeX to PDF');
    }
}

module.exports = {
    compileLatex
};
