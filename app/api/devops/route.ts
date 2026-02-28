import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');
        const search = searchParams.get('search') || '';
        const techStack = searchParams.get('techStack') || 'All Projects';

        await connectDB();

        let query: any = { isPublished: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { techStack: { $regex: search, $options: 'i' } }
            ];
        }

        if (techStack !== 'All Projects') {
            query.techStack = techStack;
        }

        const skip = (page - 1) * limit;

        // Run count and find in parallel for performance
        const [totalItems, projects] = await Promise.all([
            DevOpsProject.countDocuments(query),
            DevOpsProject.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('title description githubUrl techStack stars forks language isPublished createdAt') // Only fetch needed fields
                .lean() // Plain JavaScript objects are faster than full Mongoose documents
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            projects,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit
            }
        });
    } catch (error) {
        console.error('DevOps GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
