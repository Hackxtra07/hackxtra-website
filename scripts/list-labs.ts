
import { connectDB } from '../lib/mongodb';
import { Lab } from '../lib/models';

async function listLabs() {
    try {
        await connectDB();
        const labs = await Lab.find({}, { title: 1, coverImage: 1 }).sort({ createdAt: -1 }).limit(10);
        console.log('Recent Labs:');
        labs.forEach(l => {
            console.log(`- Title: ${l.title}`);
            console.log(`  CoverImage: ${l.coverImage}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

listLabs();
