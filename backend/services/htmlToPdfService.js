const puppeteer = require('puppeteer');

let cachedBrowser = null;
let browserLaunchPromise = null;
let pagePool = [];
const MAX_POOL_SIZE = 3;

/**
 * Get a page from the pool or create a new one
 */
async function getPage(browser) {
    if (pagePool.length > 0) {
        return pagePool.pop();
    }
    return await browser.newPage();
}

/**
 * Return a page to the pool
 */
async function returnPageToPool(page) {
    if (pagePool.length < MAX_POOL_SIZE) {
        try {
            // Clear page content before returning to pool
            await page.goto('about:blank');
            pagePool.push(page);
        } catch (e) {
            // If page is broken, close it instead
            try { await page.close(); } catch (err) { /* ignore */ }
        }
    } else {
        // Pool is full, close the page
        try { await page.close(); } catch (e) { /* ignore */ }
    }
}

/**
 * Get or create a cached Puppeteer browser instance
 */
async function getBrowser() {
    // If browser exists and is connected, return it
    if (cachedBrowser && cachedBrowser.isConnected && cachedBrowser.isConnected()) {
        return cachedBrowser;
    }

    // If a launch is already in progress, wait for it
    if (browserLaunchPromise) {
        return browserLaunchPromise;
    }

    // Otherwise, launch a new browser and cache it
    browserLaunchPromise = (async () => {
        const launchAttempts = [
            { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] },
            { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process', '--no-zygote'] },
            { headless: true }
        ];

        let lastError = null;

        for (const opts of launchAttempts) {
            try {
                console.log('[getBrowser] Launching Puppeteer with options:', JSON.stringify(opts));
                const start = Date.now();
                cachedBrowser = await puppeteer.launch(opts);
                console.log(`[getBrowser] Browser launched successfully in ${Date.now() - start}ms`);

                // Close browser gracefully on process exit
                process.on('exit', async () => {
                    if (cachedBrowser) {
                        try {
                            await cachedBrowser.close();
                        } catch (e) {
                            console.warn('[getBrowser] Error closing browser on exit:', e.message);
                        }
                    }
                });

                return cachedBrowser;
            } catch (error) {
                lastError = error;
                console.error('[getBrowser] Launch failed with options:', JSON.stringify(opts), 'Error:', error.message);
            }
        }

        const err = new Error('Failed to launch Puppeteer after all attempts: ' + (lastError ? lastError.message : 'unknown error'));
        err.cause = lastError;
        throw err;
    })();

    try {
        cachedBrowser = await browserLaunchPromise;
        return cachedBrowser;
    } finally {
        browserLaunchPromise = null;
    }
}

/**
 * Convert HTML to PDF using cached Puppeteer browser
 * @param {string} htmlContent - The HTML content to convert
 * @returns {Promise<Buffer>} - PDF file as buffer
 */
async function htmlToPdf(htmlContent) {
    const startTime = Date.now();
    console.log('[htmlToPdf] Starting PDF conversion...');

    let page = null;
    try {
        const browser = await getBrowser();
        console.log(`[htmlToPdf] Got browser instance in ${Date.now() - startTime}ms`);

        const pageStart = Date.now();
        page = await getPage(browser);
        console.log(`[htmlToPdf] Got page (from pool or new) in ${Date.now() - pageStart}ms`);

        // Disable images and stylesheets that aren't needed for faster rendering
        await page.setRequestInterception(false);
        
        // Set content with faster waitUntil option (domcontentloaded instead of networkidle0)
        const contentStart = Date.now();
        await Promise.race([
            page.setContent(htmlContent, { waitUntil: 'domcontentloaded' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('setContent timeout (8s)')), 8000))
        ]);
        console.log(`[htmlToPdf] HTML content set in ${Date.now() - contentStart}ms`);

        // Add small delay for fonts to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate PDF with timeout
        const pdfStart = Date.now();
        const pdfBuffer = await Promise.race([
            page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
                preferCSSPageSize: true  // Use page size from CSS @page rule
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('PDF generation timeout (12s)')), 12000))
        ]);
        console.log(`[htmlToPdf] PDF generated in ${Date.now() - pdfStart}ms, size: ${pdfBuffer.length} bytes`);

        const totalTime = Date.now() - startTime;
        console.log(`[htmlToPdf] PDF conversion completed in ${totalTime}ms total (page pool size: ${pagePool.length})`);

        // Log if it took longer than 3 seconds
        if (totalTime > 3000) {
            console.warn(`[htmlToPdf] ⚠️ Slow PDF generation detected: ${totalTime}ms`);
        }

        return pdfBuffer;
    } catch (error) {
        console.error('[htmlToPdf] Error:', error.message);
        console.error('[htmlToPdf] Stack:', error.stack);

        // On critical failures, invalidate the cached browser so next request will relaunch
        if (error.message && error.message.includes('timeout')) {
            console.warn('[htmlToPdf] Timeout detected, invalidating cached browser');
            cachedBrowser = null;
        }

        const err = new Error('Failed to convert HTML to PDF: ' + (error.message || 'unknown error'));
        err.cause = error;
        throw err;
    } finally {
        // Return page to pool instead of closing it
        if (page) {
            try {
                await returnPageToPool(page);
            } catch (e) {
                console.warn('[htmlToPdf] Error returning page to pool:', e.message);
            }
        }
    }
}

module.exports = {
    htmlToPdf
};
