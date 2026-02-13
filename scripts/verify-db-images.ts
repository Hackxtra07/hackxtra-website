
import { connectDB } from '../lib/mongodb';
import { Course, Lab, Resource } from '../lib/models';

async function verifyImages() {
    try {
        await connectDB();
        console.log('Connected to DB');

        console.log('\n--- Recent Courses ---');
        const courses = await Course.find().sort({ createdAt: -1 }).limit(3);
        courses.forEach((c: any) => console.log(`${c.title}: ${c.coverImage || 'NO IMAGE'}`));

        console.log('\n--- Recent Labs ---');
        const labs = await Lab.find().sort({ createdAt: -1 }).limit(3);
        labs.forEach((l: any) => console.log(`${l.title}: ${l.coverImage || 'NO IMAGE'}`));

        console.log('\n--- Recent Resources ---');
        const resources = await Resource.find().sort({ createdAt: -1 }).limit(3);
        resources.forEach((r: any) => console.log(`${r.title}: ${r.coverImage || 'NO IMAGE'}`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

verifyImages();
