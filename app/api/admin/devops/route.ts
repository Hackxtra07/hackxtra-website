import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';

// Middleware simulation for admin auth would be here if needed
// Assuming general admin route protection via layout/middleware

export async function GET() {
    try {
        await connectDB();
        const projects = await DevOpsProject.find().sort({ createdAt: -1 });
        return NextResponse.json({ projects });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await connectDB();
        const project = await DevOpsProject.create(body);
        return NextResponse.json({ project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
    }
}
