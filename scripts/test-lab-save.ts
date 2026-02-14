
import { connectDB } from '../lib/mongodb';
import { Lab } from '../lib/models';

async function testSave() {
    try {
        await connectDB();
        console.log('Connected to DB');

        const testLab = new Lab({
            title: 'Persistence Test Lab ' + Date.now(),
            description: 'Testing if coverImage persists',
            difficulty: 'Easy',
            category: 'Test',
            timeToComplete: 10,
            coverImage: 'https://example.com/test.jpg'
        });

        const saved = await testLab.save();
        console.log('Saved Lab ID:', saved._id);
        console.log('Saved CoverImage:', saved.coverImage);

        const fetched = await Lab.findById(saved._id);
        console.log('Fetched CoverImage:', fetched?.coverImage);

        // Clean up
        await Lab.deleteOne({ _id: saved._id });
        console.log('Test lab deleted');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

testSave();
