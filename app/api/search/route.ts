import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
    Course,
    Lab,
    Resource,
    News,
    Challenge,
    StoreItem,
    Documentary,
    Channel,
    User,
    Tool
} from '@/lib/models'; // Assuming User is also searchable for admins or community
// Removed User from search for general public to avoid privacy issues unless requested.

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        await connectDB();

        const regex = new RegExp(query, 'i'); // Case-insensitive search

        // Define search promises
        const tasks = [
            Course.find({
                $or: [{ title: regex }, { description: regex }, { category: regex }],
            }).select('title description category _id').limit(5).lean(),

            Lab.find({
                $or: [{ title: regex }, { description: regex }, { category: regex }],
            }).select('title description category _id').limit(5).lean(),

            Resource.find({
                $or: [{ title: regex }, { description: regex }, { tags: regex }],
            }).select('title description type url _id').limit(5).lean(),

            News.find({
                $or: [{ title: regex }, { content: regex }],
                isPublished: true,
            }).select('title _id').limit(5).lean(), // Content might be too heavy

            Challenge.find({
                $or: [{ title: regex }, { description: regex }, { category: regex }],
            }).select('title description category _id type').limit(5).lean(),

            StoreItem.find({
                $or: [{ title: regex }, { description: regex }],
                isActive: true, // Only show active items
            }).select('title description type _id').limit(5).lean(),

            Documentary.find({
                $or: [{ title: regex }, { description: regex }],
            }).select('title description _id').limit(5).lean(),

            Channel.find({
                $or: [{ name: regex }, { description: regex }],
            }).select('name description _id link').limit(5).lean(),

            Tool.find({
                $or: [{ name: regex }, { description: regex }, { category: regex }],
            }).select('name description category _id').limit(5).lean(),
        ];

        const [
            courses,
            labs,
            resources,
            news,
            challenges,
            storeItems,
            documentaries,
            channels,
            tools
        ] = await Promise.all(tasks);

        // Format results
        const results = [
            ...courses.map((item: any) => ({
                id: item._id,
                title: item.title,
                description: item.description?.substring(0, 100),
                type: 'Course',
                url: `/courses/${item._id}`,
            })),
            ...labs.map((item: any) => ({
                id: item._id,
                title: item.title,
                description: item.description?.substring(0, 100),
                type: 'Lab',
                url: `/labs/${item._id}`,
            })),
            ...resources.map((item: any) => ({
                id: item._id,
                title: item.title,
                description: item.description?.substring(0, 100),
                type: 'Resource',
                url: item.url, // Resources might be external links
                isExternal: item.type !== 'Video' && item.type !== 'PDF', // Simplified check
            })),
            ...news.map((item: any) => ({
                id: item._id,
                title: item.title,
                type: 'News',
                url: `/news/${item._id}`,
            })),
            ...challenges.map((item: any) => ({
                id: item._id,
                title: item.title,
                description: item.description?.substring(0, 100),
                type: 'Challenge',
                url: `/challenges`, // Challenges page usually lists them, or specific ID if feasible
            })),
            ...storeItems.map((item: any) => ({
                id: item._id,
                title: item.title,
                type: 'Store',
                url: `/store`,
            })),
            ...documentaries.map((item: any) => ({
                id: item._id,
                title: item.title,
                type: 'Documentary',
                url: `/documentary`,
            })),
            ...channels.map((item: any) => ({
                id: item._id,
                title: item.name,
                type: 'Channel',
                url: item.link,
                isExternal: true
            })),
            ...tools.map((item: any) => ({
                id: item._id,
                title: item.name,
                description: item.description?.substring(0, 100),
                type: 'Tool',
                url: `/tools/${item._id}`,
            })),
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', results: [] }, { status: 500 });
    }
}
