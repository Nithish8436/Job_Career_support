const { extractGitHubUrl, scrapeGitHubProfile } = require('./services/githubService');

const runTest = async () => {
    const text = "Checking profile for https://github.com/torvalds/linux";
    const url = extractGitHubUrl(text);
    console.log('Extracted URL:', url);

    if (url) {
        const stats = await scrapeGitHubProfile(url);
        console.log('Result:', stats);
    }
};

runTest();
