
import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';

async function searchMisc() {
    try {
        await connectDB();
        const query = /login bypass/i;

        // Manual search because we might not have types for these here
        const challenges = await mongoose.connection.db.collection('challenges').find({ title: query }).toArray();
        console.log('Challenges:', challenges.length);

        const vulns = await mongoose.connection.db.collection('vulnerabilities').find({ title: query }).toArray();
        console.log('Vulnerabilities:', vulns.length);

        [...challenges, ...vulns].forEach(item => {
            console.log(`- Title: ${item.title}, Cover: ${item.coverImage || item.image || 'NONE'}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

searchMisc();
