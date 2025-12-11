const puppeteer = require('puppeteer');

/**
 * Extract GitHub URL from text
 * @param {string} text 
 * @returns {string|null}
 */
const extractGitHubUrl = (text) => {
    // Regex to find github.com/username
    // Matches: github.com/user, https://github.com/user, www.github.com/user
    const regex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
    const match = text.match(regex);
    if (match) {
        // Return full URL
        return `https://github.com/${match[1]}`;
    }
    return null;
};

/**
 * Scrape GitHub profile data
 * @param {string} url 
 * @returns {Promise<Object>}
 */
const scrapeGitHubProfile = async (url) => {
    let browser = null;
    try {
        console.log(`Analyzing GitHub profile: ${url}`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Go to specific tab to get pinning info if needed, but main profile is usually enough
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Check if 404
        const title = await page.title();
        if (title.includes('Page not found') || title.includes('404')) {
            return { error: 'Profile not found' };
        }

        const stats = await page.evaluate(() => {
            const data = {
                contributions: 0,
                repoCount: 0,
                pinnedRepos: []
            };

            // 1. Get Contribution Count (last year)
            // GitHub usually has "X contributions in the last year" text
            const contribElement = document.querySelector('.js-yearly-contributions h2');
            if (contribElement) {
                const text = contribElement.innerText;
                const match = text.match(/([\d,]+)\s+contributions/);
                if (match) {
                    data.contributions = parseInt(match[1].replace(/,/g, ''), 10);
                }
            }

            // 2. Get Repository Count from tabs
            // Tab with "Repositories" usually has a counter badge
            const repoTab = Array.from(document.querySelectorAll('.UnderlineNav-item')).find(el => el.innerText.includes('Repositories'));
            if (repoTab) {
                const counter = repoTab.querySelector('.Counter');
                if (counter) {
                    data.repoCount = parseInt(counter.innerText.trim(), 10);
                } else {
                    // Fallback to text parsing if badged differently
                    const match = repoTab.innerText.match(/Repositories\s*([\d,]+)/);
                    if (match) data.repoCount = parseInt(match[1], 10);
                }
            }

            // 3. Get Pinned Repos
            const pinnedItems = document.querySelectorAll('.pinned-item-list-item');
            pinnedItems.forEach(item => {
                const repoName = item.querySelector('span.repo')?.innerText;
                const desc = item.querySelector('.pinned-item-desc')?.innerText;
                const lang = item.querySelector('[itemprop="programmingLanguage"]')?.innerText;
                if (repoName) {
                    data.pinnedRepos.push({
                        name: repoName,
                        description: desc || '',
                        language: lang || 'Unknown'
                    });
                }
            });

            return data;
        });

        console.log('GitHub Stats:', stats);
        return stats;

    } catch (error) {
        console.error('GitHub Scraping Error:', error.message);
        return { error: 'Failed to analyze profile' };
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = {
    extractGitHubUrl,
    scrapeGitHubProfile
};
