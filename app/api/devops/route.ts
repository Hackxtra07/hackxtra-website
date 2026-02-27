import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';

export async function GET() {
    try {
        await connectDB();
        const projects = await DevOpsProject.find({ isPublished: true }).sort({ createdAt: -1 });
        return NextResponse.json({ projects });
    } catch (error) {
        console.error('DevOps GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
