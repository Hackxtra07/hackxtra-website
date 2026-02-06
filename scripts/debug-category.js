
const axios = require('axios');
const cheerio = require('cheerio');

async function debugCategoryFinal() {
    try {
        console.log("Fetching NMAP page...");
        const res = await axios.get('https://www.kali.org/tools/nmap/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $d = cheerio.load(res.data);
        const description = "The Network MapperNmap is a utility for network exploration or security auditing. It supports ping scanning (determine which hosts are up), many port scanning techniques...";

        // Logic Copy
        let category = "General";

        // Prioritize explicit category links
        const catLink = $d('a[href^="/tools/?category="]');
        if (catLink.length > 0) {
            category = catLink.first().text().trim();
            console.log("Found explicitly via Selector");
        } else {
            console.log("Selector not found, using heuristic...");
            // Heuristic fallback based on description
            const descLower = description.toLowerCase();
            if (descLower.includes('password') || descLower.includes('cracker') || descLower.includes('hash')) category = "Password Attacks";
            else if (descLower.includes('wireless') || descLower.includes('wifi') || descLower.includes('bluetooth')) category = "Wireless Attacks";
            else if (descLower.includes('scan') || descLower.includes('enumerate') || descLower.includes('discovery')) category = "Information Gathering";
            else if (descLower.includes('sniff') || descLower.includes('spoof')) category = "Sniffing & Spoofing";
            else if (descLower.includes('exploit')) category = "Exploitation Tools";
            else if (descLower.includes('forensic')) category = "Forensics";
            else if (descLower.includes('reverse') || descLower.includes('debug')) category = "Reverse Engineering";
            else if (descLower.includes('web')) category = "Web Applications";
        }

        console.log(`Final Category: "${category}"`);
        if (category === "Known Issues") {
            console.error("FAIL: Still getting Known Issues!");
        } else {
            console.log("SUCCESS: Category is sane.");
        }

    } catch (e) {
        console.error(e);
    }
}

debugCategoryFinal();
