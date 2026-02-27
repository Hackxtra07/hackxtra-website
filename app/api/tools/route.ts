import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tool } from '@/lib/models';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12'); // Tools might need a larger grid
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || 'All Tools';

        await connectDB();

        let query: any = {};
        if (category && category !== 'All' && category !== 'All Tools') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const totalItems = await Tool.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        const skip = (page - 1) * limit;

        const tools = await Tool.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            tools,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit
            }
        });
    } catch (error) {
        console.error('Fetch tools error:', error);
        return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await authenticateRequest(req);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    try {
        const body = await req.json();
        const newTool = await Tool.create(body);
        return NextResponse.json({ tool: newTool }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
    }
}
