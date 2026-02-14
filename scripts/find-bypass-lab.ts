
import { connectDB } from '../lib/mongodb';
import { Lab } from '../lib/models';

async function findSpecificLab() {
    try {
        await connectDB();
        const labs = await Lab.find({ title: /login bypass/i });
        console.log('Labs matching "login bypass":', labs.length);
        labs.forEach(l => {
            console.log('ID:', l._id);
            console.log('Title:', l.title);
            console.log('CoverImage:', l.coverImage);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

findSpecificLab();
