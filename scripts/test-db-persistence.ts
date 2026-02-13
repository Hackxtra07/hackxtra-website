
import { connectDB } from '../lib/mongodb';
import { Course } from '../lib/models';

async function testUpdate() {
    try {
        await connectDB();
        console.log('Connected to DB');

        const course = await Course.findOne();
        if (!course) {
            console.log('No course found to test');
            return;
        }

        console.log(`Updating course: ${course.title}`);
        course.coverImage = 'https://example.com/test-image.jpg';
        await course.save();

        const updated = await Course.findById(course._id);
        console.log(`Updated course image: ${updated?.coverImage}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

testUpdate();
