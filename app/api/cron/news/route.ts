import { connectDB } from '@/lib/mongodb';
import { News } from '@/lib/models';
import { createErrorResponse, createSuccessResponse, authenticateRequest } from '@/lib/auth'; // Reusing auth for manual trigger if needed
import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

// You might want to protect this route with a secret key if it's called by an external cron service
// For internal admin testing, we can check for admin session or a specific header.
// For Vercel Cron, check for authorization header.

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // ... (auth logic remains similar but streamlined)
        const url = new URL(request.url);
        const key = url.searchParams.get('key');
        const validKey = process.env.CRON_SECRET;
        let authorized = false;

        if (validKey && key === validKey) {
            authorized = true;
        } else {
            const user = await authenticateRequest(request);
            if (user && user.role === 'admin') authorized = true;
        }

        if (!authorized) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        console.log('🔄 News Sync: Initiating grid synchronization...');

        // 2. Multi-Source RSS Fetching
        const parser = new Parser();
        const sources = [
            { url: 'https://feeds.feedburner.com/TheHackersNews', author: 'THE_HACKER_NEWS' },
            { url: 'https://www.bleepingcomputer.com/feed/', author: 'BLEEPING_COMPUTER' }
        ];

        let allItems: any[] = [];
        for (const source of sources) {
            try {
                console.log(`📡 Fetching: ${source.url}`);
                const feed = await parser.parseURL(source.url);
                const items = (feed.items || []).map(item => ({
                    ...item,
                    defaultAuthor: source.author
                }));
                allItems = [...allItems, ...items];
            } catch (err) {
                console.error(`❌ Source failure [${source.url}]:`, err);
            }
        }

        if (allItems.length === 0) {
            return createSuccessResponse({ success: true, data: { message: 'Zero signals detected in current frequency clusters.', count: 0 } });
        }

        // 3. Intelligence Processing & De-duplication
        const processedArticles = allItems
            .filter(item => !!item.title)
            .map(item => ({
                title: item.title,
                content: item.contentSnippet || item.content || 'Transmission content encrypted or unavailable.',
                image: item.enclosure?.url || '',
                author: item.creator || item.defaultAuthor,
                tags: ['Intelligence', 'Cybersecurity', 'Automated'],
                isPublished: true,
                publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            }))
            .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
            .slice(0, 12); // Take top 12 newest unique items

        console.log(`🔎 Intelligence Hub: Found ${processedArticles.length} new signals.`);

        // 4. Update Database
        if (processedArticles.length > 0) {
            // Delete ALL previous news to perform a fresh sync
            await News.deleteMany({});
            
            // Insert the new intelligence nodes
            await News.insertMany(processedArticles);
            
            console.log('✨ Global intelligence grid synchronized (Reset & Rebuild).');
        }

        return createSuccessResponse({
            success: true,
            data: {
                message: processedArticles.length > 0 
                    ? `Detected and manifested ${processedArticles.length} new intelligence nodes.` 
                    : 'Intelligence grid is already synchronized with latest clusters.',
                count: processedArticles.length
            }
        });

    } catch (error: any) {
        console.error('Cron news update error:', error);
        return createErrorResponse(`Failed to refresh news: ${error.message}`, 500);
    }
}

