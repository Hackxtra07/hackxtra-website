import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tool } from '@/lib/models';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    await connectDB();
    try {
        const tool = await Tool.findById(params.id);
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
    { params }: { params: { id: string } }
) {
    await connectDB();
    try {
        const body = await req.json();
        const tool = await Tool.findByIdAndUpdate(params.id, body, { new: true });
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
    { params }: { params: { id: string } }
) {
    await connectDB();
    try {
        const tool = await Tool.findByIdAndDelete(params.id);
        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Tool deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
    }
}
