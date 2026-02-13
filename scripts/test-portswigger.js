const axios = require('axios');
const cheerio = require('cheerio');

async function testPortSwigger(url) {
    try {
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const title = $('h1').text().trim() || $('title').text().trim();
        const description = $('p').first().text().trim() || $('meta[name="description"]').attr('content');

        console.log('--- Metadata ---');
        console.log('Title:', title);
        console.log('Description:', description);
        console.log('--- OpenGraph ---');
        console.log('--- Debug ---');
        console.log('Meta Description:', $('meta[name="description"]').attr('content'));
        console.log('Twitter Description:', $('meta[name="twitter:description"]').attr('content'));
        $('p').slice(0, 3).each((i, el) => {
            console.log(`P[${i}]:`, $(el).text().trim());
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Test with the topic page
testPortSwigger('https://portswigger.net/web-security/cross-site-scripting/reflected');
