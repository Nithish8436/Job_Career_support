const puppeteer = require('puppeteer');

/**
 * Convert HTML to PDF using Puppeteer with retries and improved logging
 * @param {string} htmlContent - The HTML content to convert
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
async function htmlToPdf(htmlContent) {
    let browser;
    // Try a couple of launch configurations to handle different environments
    const launchAttempts = [
        { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] },
        { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process', '--no-zygote'] },
        { headless: true } // last-resort: default options
    ];

    let lastError = null;

    for (const opts of launchAttempts) {
        try {
            console.log('[htmlToPdf] Launching puppeteer with options:', JSON.stringify(opts));
            browser = await puppeteer.launch(opts);
            const page = await browser.newPage();

            // Set content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                // Margins set to 0 because the template uses @page to control printable margins
                margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' }
            });

            // Close browser and return buffer
            try { await browser.close(); } catch (e) { /* ignore */ }
            return pdfBuffer;
        } catch (error) {
            lastError = error;
            console.error('[htmlToPdf] Attempt failed with options:', JSON.stringify(opts));
            console.error('[htmlToPdf] Error:', error && (error.message || error.toString()));
            try { if (browser) await browser.close(); } catch (e) { /* ignore */ }
            browser = null;
            // continue to next attempt
        }
    }

    // If we reach here, all attempts failed
    console.error('[htmlToPdf] All puppeteer launch attempts failed. Last error:', lastError && lastError.stack ? lastError.stack : String(lastError));
    // Provide a clearer error message to the caller
    const err = new Error('Failed to convert HTML to PDF: puppeteer failed to launch or render. See server logs for details.');
    err.cause = lastError;
    throw err;
}

module.exports = {
    htmlToPdf
};
