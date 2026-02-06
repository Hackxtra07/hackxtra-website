import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const baseUrl = req.nextUrl.origin;
    const key = process.env.CRON_SECRET;

    if (!key) {
        return NextResponse.json({ error: 'CRON_SECRET not set' }, { status: 500 });
    }

    try {
        // Trigger News Sync
        console.log('Triggering news sync...');
        const newsPromise = fetch(`${baseUrl}/api/cron/news?key=${key}`).then(r => r.json());

        // Trigger Tools Sync
        console.log('Triggering tools sync...');
        const toolsPromise = fetch(`${baseUrl}/api/tools/sync?key=${key}`).then(r => r.json());

        const [newsResult, toolsResult] = await Promise.all([newsPromise, toolsPromise]);

        return NextResponse.json({
            message: 'Master cron completed',
            news: newsResult,
            tools: toolsResult
        });
    } catch (error: any) {
        console.error('Master cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
