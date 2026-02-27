import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        await connectDB();
        const project = await DevOpsProject.findByIdAndUpdate(id, body, { new: true });
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        return NextResponse.json({ project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        console.log(`Attempting to delete DevOps project with ID: ${id}`);
        await connectDB();
        const project = await DevOpsProject.findByIdAndDelete(id);
        if (!project) {
            console.warn(`Project not found with ID: ${id}`);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        console.log(`Successfully deleted project: ${id}`);
        return NextResponse.json({ message: 'Project deleted' });
    } catch (error: any) {
        console.error(`Error deleting project ${id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
