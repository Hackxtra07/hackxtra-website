const axios = require('axios');
const cheerio = require('cheerio');

async function testFetch(url) {
    console.log(`Testing fetch for: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');

        console.log('--- Metadata ---');
        console.log(`Title: ${title}`);
        console.log(`Description: ${description}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Test with a generic URL since we can't easily test a real GDrive link in this environment without a valid one
testFetch('https://www.google.com'); 
