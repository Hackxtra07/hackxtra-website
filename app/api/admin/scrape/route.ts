import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // specific handling for Google Drive to ensure we get the public view
        let targetUrl = url;
        if (url.includes('drive.google.com') && url.includes('/view')) {
            // Ensuring we are fetching the view page which usually has metadata
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract metadata
        let title =
            $('meta[property="og:title"]').attr('content') ||
            $('title').text() ||
            '';

        let description =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            '';

        let image = $('meta[property="og:image"]').attr('content') || '';

        // Clean up Google Drive/Docs titles
        if (url.includes('google.com')) {
            title = title.replace(' - Google Drive', '')
                .replace(' - Google Sheets', '')
                .replace(' - Google Docs', '')
                .replace(' - Google Slides', '');
        }

        // Attempt to guess type from title extension or content-type
        let type = 'Link';
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.endsWith('.pdf')) type = 'PDF';
        else if (lowerTitle.endsWith('.mp4') || lowerTitle.endsWith('.mov') || lowerTitle.endsWith('.avi')) type = 'Video';
        else if (lowerTitle.endsWith('.doc') || lowerTitle.endsWith('.docx') || lowerTitle.endsWith('.txt')) type = 'Document';
        else if (url.includes('youtube.com') || url.includes('youtu.be')) type = 'Video';

        return NextResponse.json({
            title: title.trim(),
            description: description.trim(),
            image,
            type,
            url: url, // return original url
        });
    } catch (error: any) {
        console.error('Scrape error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch URL metadata. Please enter details manually.' },
            { status: 500 }
        );
    }
}
