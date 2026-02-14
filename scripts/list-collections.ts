
import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';

async function listCollections() {
    try {
        await connectDB();
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:');
        collections.forEach(c => console.log(`- ${c.name}`));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

listCollections();
