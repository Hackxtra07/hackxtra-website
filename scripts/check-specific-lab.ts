
import { connectDB } from '../lib/mongodb';
import { Lab } from '../lib/models';

async function checkLab() {
    try {
        await connectDB();
        const lab = await Lab.findOne({ title: /SQL injection vulnerability allowing login bypass/i });
        if (!lab) {
            console.log('Lab not found');
        } else {
            console.log('Lab found');
            console.log('Title:', lab.title);
            console.log('CoverImage:', lab.coverImage);
            console.log('Full JSON:', JSON.stringify(lab, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkLab();
