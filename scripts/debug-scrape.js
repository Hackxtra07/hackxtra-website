const axios = require('axios');
const cheerio = require('cheerio');

async function debugScrape(url) {
    console.log(`Debug scraping: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        const html = response.data;
        // console.log(html);

        const $ = cheerio.load(html);
        const title = $('title').text();
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDesc = $('meta[property="og:description"]').attr('content');
        const desc = $('meta[name="description"]').attr('content');

        console.log('--- Extracted Metadata ---');
        console.log(`Title Tag: ${title}`);
        console.log(`OG Title: ${ogTitle}`);
        console.log(`OG Description: ${ogDesc}`);
        console.log(`Meta Description: ${desc}`);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
        }
    }
}

// Trying a known public spreadsheet
debugScrape('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0');
