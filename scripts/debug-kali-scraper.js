
const axios = require('axios');
const cheerio = require('cheerio');

async function debugKaliFinal() {
    try {
        console.log("Fetching https://www.kali.org/tools/ ...");
        const res = await axios.get('https://www.kali.org/tools/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(res.data);
        const allTools = [];
        const seenUrls = new Set();

        $('a').each((i, el) => {
            let href = $(el).attr('href');
            if (!href) return;

            // Normalize
            if (href.startsWith('/')) {
                href = `https://www.kali.org${href}`;
            }

            // FILTER LOGIC
            // Must contain /tools/
            // Must NOT contain # (anchors)
            // Must NOT be the index page itself or known non-tool pages
            if (href.includes('/tools/') && !href.includes('#') && !href.endsWith('/tools/') && !href.endsWith('/all-tools/')) {
                // Deduplicate
                if (seenUrls.has(href)) return;
                seenUrls.add(href);

                // Extract Name
                // Try from text or URL slug
                let name = $(el).text().trim();
                // If name is empty or generic, extract from slug
                if (!name || name === 'Read More') {
                    const parts = href.split('/').filter(p => p);
                    name = parts[parts.length - 1]; // Last part of URL
                    // Capitalize
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                }

                allTools.push({
                    name: name,
                    url: href
                });
            }
        });

        console.log(`Found ${allTools.length} tools to sync.`);

        // Simulate Batch
        const toolsToSync = allTools.slice(0, 3); // Test first 3

        for (const toolRef of toolsToSync) {
            console.log(`\n--- Fetching ${toolRef.name} at ${toolRef.url} ---`);
            const detailRes = await axios.get(toolRef.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $d = cheerio.load(detailRes.data);

            const parts = toolRef.url.split('/').filter(p => p);
            const slug = parts[parts.length - 1];
            console.log(`Slug: ${slug}`);

            // 1. Description logic
            let description = "";
            const header = $d(`#${slug}`);
            if (header.length > 0) {
                description = header.next('p').text().trim();
            }
            if (!description || description.length < 10) {
                // fallback
                description = "FALLBACK: " + ($d('main p').first().text().trim().substring(0, 50) + "...");
            }
            console.log(`Description: ${description.substring(0, 100)}...`);

            // 2. Install Command logic
            let installCommand = `sudo apt install ${slug}`;
            const installCode = $d('code:contains("sudo apt install")').first();
            if (installCode.length > 0) {
                installCommand = installCode.text().trim();
            }
            console.log(`Install Cmd: ${installCommand}`);

            // 3. Usage count
            let usageCount = 0;
            $d('pre').each((i, el) => {
                usageCount++;
            });
            console.log(`Usage Snippets Found: ${usageCount}`);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

debugKaliFinal();
