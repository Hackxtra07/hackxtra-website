
import { connectDB } from '../lib/mongodb';
import { Lab } from '../lib/models';

async function findByDifficulty() {
    try {
        await connectDB();
        const labs = await Lab.find({ difficulty: 'Medium' });
        console.log('Medium Labs count:', labs.length);
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

findByDifficulty();
