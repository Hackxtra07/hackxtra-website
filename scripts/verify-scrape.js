// scripts/test-scrape-api.js
// We'll use the existing test-portswigger.js logic which effectively tests what we implemented
// But let's create a verifying script that mimics the improved logic to confirm it works as expected

const axios = require('axios');
const cheerio = require('cheerio');

async function verifyLogic(url) {
    try {
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        const $ = cheerio.load(response.data);
        let title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        let description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

        // Emulate the logic we added to route.ts
        if (url.includes('portswigger.net')) {
            const potentialTitle = $('h1').first().text().trim();
            if (potentialTitle) title = potentialTitle;

            const potentialDesc = $('meta[name="description"]').attr('content');
            if (potentialDesc) description = potentialDesc;
        }

        console.log('--- Extracted Data ---');
        console.log('Title:', title);
        console.log('Description:', description);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyLogic('https://portswigger.net/web-security/cross-site-scripting/reflected');
