import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tool } from '@/lib/models';
import * as cheerio from 'cheerio';
import axios from 'axios';

// Sync external tools from Kali Tools directory
// Scrapes https://www.kali.org/tools/ incrementally to avoid timeouts
export async function GET(req: NextRequest) {
    return handleSync(req);
}

export async function POST(req: NextRequest) {
    return handleSync(req);
}

async function handleSync(req: NextRequest) {
    // 0. Authorization Check
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    const validKey = process.env.CRON_SECRET;

    // Check for Vercel Cron or manual key
    const cronHeader = req.headers.get('x-vercel-cron');
    const isCronOrKey = (validKey && key === validKey) || cronHeader;

    if (!isCronOrKey) {
        // If not cron/key, check for admin session
        const user = await authenticateRequest(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    await connectDB();
    try {
        // 1. Fetch Main Index
        const indexResponse = await axios.get('https://www.kali.org/tools/');
        const $ = cheerio.load(indexResponse.data);

        // 2. Parse all tools from the index list
        const allTools: { name: string; url: string }[] = [];
        const seenUrls = new Set<string>();

        // Find all links containing /tools/
        $('a').each((i, el) => {
            let href = $(el).attr('href');
            if (!href) return;

            // Normalize to absolute URL
            if (href.startsWith('/')) {
                href = `https://www.kali.org${href}`;
            }

            // Filter for valid tool URLs
            // Must contain /tools/
            // Must NOT contain # (anchors)
            // Must NOT be the index page itself or known non-tool pages
            // Must NOT be a documentation page
            if (href.includes('/tools/') && !href.includes('#') && !href.endsWith('/tools/') && !href.endsWith('/all-tools/') && !href.includes('/docs/')) {
                // Deduplicate
                if (seenUrls.has(href)) return;
                seenUrls.add(href);

                // Extract Name
                // Try from text or URL slug
                let name = $(el).text().trim();
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

        console.log(`Found ${allTools.length} potential tools.`);

        // 3. Filter out tools we already have
        const existingCount = await Tool.countDocuments();
        const existingTools = await Tool.find({}, 'sourceUrl'); // Check by URL to be safer
        const existingUrls = new Set(existingTools.map(t => t.sourceUrl));

        const newTools = allTools.filter(t => !existingUrls.has(t.url));

        console.log(`${newTools.length} new tools to sync.`);

        if (newTools.length === 0) {
            return NextResponse.json({ message: 'Database is up to date', count: 0 });
        }

        // 4. Batch Process
        const BATCH_SIZE = 20;
        const toolsToSync = newTools.slice(0, BATCH_SIZE);
        let successCount = 0;
        const addedNames: string[] = [];

        for (const toolRef of toolsToSync) {
            try {
                const detailRes = await axios.get(toolRef.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
                });
                const $d = cheerio.load(detailRes.data);

                // Extract Slug from URL
                const parts = toolRef.url.split('/').filter(p => p);
                const slug = parts[parts.length - 1]; // e.g., 'nmap'

                // Scrape Details
                // 1. Description
                // Try to find the section matching the slug
                let description = "";
                const header = $d(`#${slug}`);
                if (header.length > 0) {
                    description = header.next('p').text().trim();
                }

                // Fallback Description strategies
                if (!description || description.length < 10) {
                    description = $d('meta[name="description"]').attr('content') ||
                        $d('.card-body p').first().text().trim() ||
                        $d('main p').first().text().trim() ||
                        "No description available.";
                }

                // 2. Category
                // Kali often puts category in a sidebar link or breadcrumb
                let category = "General";

                // Prioritize explicit category links
                const catLink = $d('a[href^="/tools/?category="]');
                if (catLink.length > 0) {
                    category = catLink.first().text().trim();
                } else {
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

                // 3. Usage / Commands
                let usage = "";
                $d('pre').each((i, el) => {
                    // Limit text size
                    if (usage.length < 2000 && i < 5) {
                        const code = $d(el).text().trim();
                        if (code.length > 5) {
                            usage += `### Snippet ${i + 1}\n` + '```bash\n' + code + '\n```\n\n';
                        }
                    }
                });

                // 4. Install Command
                // Default to slug
                let installCommand = `sudo apt install ${slug}`;
                // Try to find specific command in the section
                // Often: <p><strong>How to install:</strong> <code>...</code></p>
                const installCode = $d('code:contains("sudo apt install")').first();
                if (installCode.length > 0) {
                    installCommand = installCode.text().trim();
                }

                // Create DB Entry
                await Tool.create({
                    name: toolRef.name,
                    description: description,
                    category: category,
                    usage: usage,
                    installCommand: installCommand,
                    sourceUrl: toolRef.url
                });

                successCount++;
                addedNames.push(toolRef.name);

                // Politeness delay
                await new Promise(r => setTimeout(r, 200));

            } catch (err) {
                console.error(`Failed to sync tool ${toolRef.name}`, err);
            }
        }

        return NextResponse.json({
            message: `Synced ${successCount} new tools. Click Sync again to fetch more.`,
            count: successCount,
            added: addedNames,
            remaining: newTools.length - BATCH_SIZE
        });
    } catch (error) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
