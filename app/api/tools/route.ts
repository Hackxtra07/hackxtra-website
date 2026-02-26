import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tool } from '@/lib/models';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        let query = {};
        if (category && category !== 'All') {
            query = { category };
        }

        const tools = await Tool.find(query).sort({ name: 1 });
        return NextResponse.json({ tools });
    } catch (error) {
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
