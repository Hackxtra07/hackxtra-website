
import { connectDB } from '../lib/mongodb';
import { Lab, News, Resource, Course } from '../lib/models';

async function globalSearch() {
    try {
        await connectDB();
        const query = /login bypass/i;

        const labs = await Lab.find({ title: query });
        console.log('Labs:', labs.length);

        const news = await News.find({ title: query });
        console.log('News:', news.length);

        const resources = await Resource.find({ title: query });
        console.log('Resources:', resources.length);

        const courses = await Course.find({ title: query });
        console.log('Courses:', courses.length);

        [...labs, ...news, ...resources, ...courses].forEach(item => {
            console.log(`- Type: ${item.constructor.modelName}, Title: ${item.title}, Cover: ${item.coverImage || item.image || 'NONE'}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

globalSearch();
