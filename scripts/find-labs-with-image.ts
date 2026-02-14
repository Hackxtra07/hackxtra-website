
import { connectDB } from '../lib/mongodb';
import { Lab } from '../lib/models';

async function findWithImage() {
    try {
        await connectDB();
        const count = await Lab.countDocuments({ coverImage: { $exists: true, $ne: '' } });
        console.log('Count of labs with coverImage:', count);

        if (count > 0) {
            const labs = await Lab.find({ coverImage: { $exists: true, $ne: '' } }).limit(5);
            labs.forEach(l => {
                console.log(`- Title: ${l.title}`);
                console.log(`  CoverImage: ${l.coverImage}`);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

findWithImage();
