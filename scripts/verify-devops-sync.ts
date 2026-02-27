import { DevOpsProject } from './lib/models';
import { connectDB } from './lib/mongodb';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function verifySync() {
    try {
        console.log('Connecting to DB...');
        await connectDB();

        const username = 'Hackxtra07';
        console.log(`Fetching repos for ${username}...`);

        const githubRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=5`, {
            headers: {
                'User-Agent': 'HackXtras-App'
            }
        });

        const repos = githubRes.data;
        console.log(`Found ${repos.length} repos.`);

        for (const repo of repos) {
            console.log(`Processing repo: ${repo.name}`);
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

            await DevOpsProject.findOneAndUpdate(
                { githubUrl: projectData.githubUrl },
                projectData,
                { new: true, upsert: true }
            );
        }

        console.log('Sync verification successful.');
        process.exit(0);
    } catch (error: any) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

verifySync();
