import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';
import { authenticateRequest, createErrorResponse } from '@/lib/auth';
import { recordAdminAction } from '@/lib/admin-logger';

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

export async function POST(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        const body = await req.json();
        await connectDB();
        const project = await DevOpsProject.create(body);

        // Record admin action
        await recordAdminAction(
            req,
            auth,
            'CREATE',
            'DevOpsProject',
            project._id.toString(),
            { name: project.name }
        );

        return NextResponse.json({ project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
    }
}
