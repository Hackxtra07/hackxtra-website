import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';
import { authenticateRequest, createErrorResponse } from '@/lib/auth';
import { recordAdminAction } from '@/lib/admin-logger';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }
        const { id } = await params;
        const body = await req.json();
        await connectDB();
        const project = await DevOpsProject.findByIdAndUpdate(id, body, { new: true });
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        // Record admin action
        await recordAdminAction(
            req,
            auth,
            'UPDATE',
            'DevOpsProject',
            id,
            { name: project.name }
        );

        return NextResponse.json({ project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        const { id } = await params;
        console.log(`Attempting to delete DevOps project with ID: ${id}`);
        await connectDB();
        const project = await DevOpsProject.findByIdAndDelete(id);
        if (!project) {
            console.warn(`Project not found with ID: ${id}`);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        console.log(`Successfully deleted project: ${id}`);

        // Record admin action
        await recordAdminAction(
            req,
            auth,
            'DELETE',
            'DevOpsProject',
            id,
            { name: project.name }
        );

        return NextResponse.json({ message: 'Project deleted' });
    } catch (error: any) {
        console.error(`Error deleting project ${(await params).id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
