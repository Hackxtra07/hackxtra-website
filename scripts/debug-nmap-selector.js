
const axios = require('axios');
const cheerio = require('cheerio');

async function testSelectors() {
    try {
        console.log("Fetching NMAP page...");
        const res = await axios.get('https://www.kali.org/tools/nmap/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(res.data);

        // Test Description
        let description = "";
        // Try finding the p tag that follows the h3 matching the slug? 
        // Or just the first substantial paragraph.
        // The structure seems to be <h2>...</h2> <p>...description...</p> in some pages, or <h3>...</h3>

        // Strategy: Find "How to install" and go backwards?
        const installP = $('p').filter((i, el) => $(el).text().includes("How to install"));
        if (installP.length > 0) {
            // The description is usually the paragraph BEFORE the install paragraph (or before the dependencies details)
            // Actually, in the HTML: <h3>nmap</h3><p>Description</p><p>Installed size...</p><details>...
            // So we can look for the first p in .col-md-9 (main content)

            description = $('p').first().text().trim();
        }

        // Refined Description Strategy
        // Find the first paragraph that contains " - " or is long enough
        // Or specific to Kali: <div id="main"> ... <p> ...
        const mainP = $('main p').first().text().trim();
        if (mainP) description = mainP;


        // Test Install Command
        let installCommand = "";
        const installCode = $('code:contains("sudo apt install")').first();
        if (installCode.length > 0) {
            installCommand = installCode.text().trim();
        }

        // Test Usage
        let usage = "";
        $('pre').each((i, el) => {
            if (i < 3) {
                usage += $(el).text().trim().substring(0, 50) + "...\n";
            }
        });

        console.log("--- Results ---");
        console.log("Description:", description.substring(0, 150));
        console.log("Install Command:", installCommand);
        console.log("Usage found chunks:", $('pre').length);
        console.log("Usage Preview:\n", usage);

    } catch (e) {
        console.error(e);
    }
}

testSelectors();
