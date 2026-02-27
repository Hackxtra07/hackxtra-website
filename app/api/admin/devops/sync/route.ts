import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DevOpsProject } from '@/lib/models';
import axios from 'axios';

export async function POST() {
    try {
        const username = 'Hackxtra07';

        // Fetch all public repos for the user
        const githubRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
            headers: {
                'User-Agent': 'HackXtras-App'
            }
        });

        const repos = githubRes.data;
        if (!Array.isArray(repos)) {
            return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
        }

        await connectDB();

        const results = [];
        for (const repo of repos) {
            const projectData = {
                title: repo.name,
                description: repo.description || 'No description provided',
                githubUrl: repo.html_url,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                techStack: (repo.topics && repo.topics.length > 0) ? repo.topics : [repo.language].filter(Boolean),
                isPublished: true
            };

            const project = await DevOpsProject.findOneAndUpdate(
                { githubUrl: projectData.githubUrl },
                projectData,
                { new: true, upsert: true }
            );
            results.push(project);
        }

        return NextResponse.json({
            message: `Successfully synced ${results.length} projects from ${username}`,
            count: results.length
        });
    } catch (error: any) {
        console.error('Sync Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: error.response?.data?.message || error.message || 'Failed to sync projects'
        }, { status: 500 });
    }
}
