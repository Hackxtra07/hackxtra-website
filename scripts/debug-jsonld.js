
const axios = require('axios');
const cheerio = require('cheerio');

async function debugJsonLD() {
    try {
        console.log("Fetching NMAP page...");
        const res = await axios.get('https://www.kali.org/tools/nmap/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(res.data);

        // Check for JSON-LD
        const jsonLd = $('script[type="application/ld+json"]');
        console.log(`Found ${jsonLd.length} JSON-LD scripts.`);

        jsonLd.each((i, el) => {
            console.log(`--- JSON-LD Script ${i + 1} ---`);
            try {
                const data = JSON.parse($(el).html());
                console.log(JSON.stringify(data, null, 2));
            } catch (e) {
                console.log("Failed to parse JSON:", e.message);
            }
        });

        // Also check if there are any other specific metadata tags
        const categoryMeta = $('meta[name="category"], meta[property="article:section"]');
        console.log(`Found ${categoryMeta.length} category meta tags.`);
        categoryMeta.each((i, el) => {
            console.log($(el).attr('content'));
        });

    } catch (e) {
        console.error(e);
    }
}

debugJsonLD();
