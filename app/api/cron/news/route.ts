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
        const feedUrl = 'https://feeds.feedburner.com/TheHackersNews'; // Reliable source
        console.log('Fetching RSS Feed:', feedUrl);
        const parser = new Parser();
        const feed = await parser.parseURL(feedUrl);
        console.log('RSS Feed Fetched. Items:', feed.items.length);

        // 3. Process Items
        // Get top 5 items
        const topItems = feed.items.slice(0, 5);

        const newArticles = topItems.map(item => ({
            title: item.title || 'No Title',
            content: item.contentSnippet || item.content || '', // Use snippet for brevity or full content
            image: item.enclosure?.url || '', // Try to find image
            author: item.creator || 'The Hacker News',
            tags: ['Cybersecurity', 'Automated'],
            isPublished: true,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        }));

        console.log('Processed Articles:', newArticles.length);

        if (newArticles.length > 0) {
            // 4. Delete Old News (as requested: "previous deleted")
            // This wipes the table. 
            await News.deleteMany({});
            console.log('Old news deleted');

            // 5. Insert New News
            await News.insertMany(newArticles);
            console.log('New news inserted');
        }

        return createSuccessResponse({ success: true, data: { message: 'News refreshed successfully', count: newArticles.length } });

    } catch (error: any) {
        console.error('Cron news update error:', error);
        return createErrorResponse(`Failed to refresh news: ${error.message}`, 500);
    }
}
