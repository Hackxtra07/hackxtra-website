import { connectDB } from '@/lib/mongodb';
import { News } from '@/lib/models';
import { createErrorResponse, createSuccessResponse, authenticateRequest } from '@/lib/auth'; // Reusing auth for manual trigger if needed
import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

// You might want to protect this route with a secret key if it's called by an external cron service
// For internal admin testing, we can check for admin session or a specific header.
// For Vercel Cron, check for authorization header.

export async function GET(request: NextRequest) {
    try {
        // 1. Authorization Check
        // Allow if it's an admin user OR if it has a valid CRON_SECRET header
        const authHeader = request.headers.get('authorization');
        let authorized = false;

        // Check for Cron Secret (Simulated for this implementation, ideally use env var)
        // if (authHeader === `Bearer ${process.env.CRON_SECRET}`) authorized = true;

        // Check for Admin User (for manual trigger from UI)
        if (!authorized) {
            // We can't easily use authenticateRequest here if it relies on cookies/headers passed from client 
            // essentially identically.
            // But for safety, let's assume if it's called from the browser by an admin, the auth logic holds.
            // OR simpler: Just rely on the fact that this is a "safe" operation that refreshes news. 
            // But resetting DB is destructive. Let's require some auth.

            // For this MVP, let's check for a query param 'key' or admin auth.
            const url = new URL(request.url);
            const key = url.searchParams.get('key');
            // Check against ENV variable, fail if not set to prevent potential access if env is missing
            const validKey = process.env.CRON_SECRET;

            if (validKey && key === validKey) {
                authorized = true;
            } else {
                const user = await authenticateRequest(request);
                if (user && user.role === 'admin') authorized = true;
            }
        }

        if (!authorized) {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        console.log('DB Connected for Cron Job');

        // 2. Fetch RSS Feeds
        const feedUrl = 'https://thehackernews.com/rss'; // More direct and reliable source
        console.log('🔄 News Sync: Fetching RSS Feed:', feedUrl);
        const parser = new Parser();

        let feed;
        try {
            feed = await parser.parseURL(feedUrl);
        } catch (parseError: any) {
            console.error('❌ News Sync: Parser failure:', parseError);
            throw new Error(`Technical failure in RSS parsing: ${parseError.message}`);
        }

        console.log(`✅ News Sync: Received ${feed.items?.length || 0} items from ${feedUrl}`);

        if (!feed.items || feed.items.length === 0) {
            return createSuccessResponse({ success: true, data: { message: 'No new signals detected in frequency.', count: 0 } });
        }

        // 3. Process Items
        // Get top 8 items for a slightly richer feed
        const topItems = feed.items.slice(0, 8);

        const newArticles = topItems.map(item => ({
            title: item.title || 'RESTRICTED_SIGNAL',
            content: item.contentSnippet || item.content || 'Transmission content encrypted or unavailable.',
            image: item.enclosure?.url || '',
            author: item.creator || 'THE_HACKER_NEWS',
            tags: ['Intelligence', 'Cybersecurity', 'Automated'],
            isPublished: true,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        }));

        console.log(`📡 News Sync: Processed ${newArticles.length} articles for manifestation.`);

        // 4. Update Database
        if (newArticles.length > 0) {
            // This wipes the table to keep only the freshest intelligence, as previously desired
            await News.deleteMany({});
            console.log('🗑️ News Sync: Previous manifest cleared.');

            await News.insertMany(newArticles);
            console.log('✨ News Sync: Global news grid synchronized successfully.');
        }

        return createSuccessResponse({
            success: true,
            data: {
                message: 'Intelligence grid synchronized successfully.',
                count: newArticles.length
            }
        });

    } catch (error: any) {
        console.error('Cron news update error:', error);
        return createErrorResponse(`Failed to refresh news: ${error.message}`, 500);
    }
}
