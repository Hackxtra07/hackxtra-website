import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tool } from '@/lib/models';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const { id } = await params;
        const tool = await Tool.findById(id);
        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }
        return NextResponse.json(tool);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await authenticateRequest(req);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    try {
        const { id } = await params;
        const body = await req.json();
        const tool = await Tool.findByIdAndUpdate(id, body, { new: true });
        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }
        return NextResponse.json(tool);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await authenticateRequest(req);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    try {
        const { id } = await params;
        const tool = await Tool.findByIdAndDelete(id);
        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Tool deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
    }
}
