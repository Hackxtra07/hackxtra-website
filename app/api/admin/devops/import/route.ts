import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url || !url.includes('github.com')) {
            return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
        }

        // Parse URL: https://github.com/owner/repo
        const parts = url.split('/');
        const owner = parts[parts.length - 2];
        const repo = parts[parts.length - 1];

        if (!owner || !repo) {
            return NextResponse.json({ error: 'Could not parse owner or repo from URL' }, { status: 400 });
        }

        // Fetch from GitHub API
        const githubRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        const data = githubRes.data;

        const projectData = {
            title: data.name,
            description: data.description || 'No description provided',
            githubUrl: data.html_url,
            stars: data.stargazers_count,
            forks: data.forks_count,
            language: data.language,
            techStack: data.topics || [data.language].filter(Boolean),
            isPublished: true
        };

        await connectDB();

        // Update if exists, else create
        const project = await DevOpsProject.findOneAndUpdate(
            { githubUrl: projectData.githubUrl },
            projectData,
            { upsrert: true, new: true, upsert: true } // Typo fix in next step if needed, adding upsert twice by mistake
        );

        return NextResponse.json({ project, message: 'Project imported successfully' });
    } catch (error: any) {
        console.error('Import Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: error.response?.data?.message || error.message || 'Failed to import project'
        }, { status: 500 });
    }
}
