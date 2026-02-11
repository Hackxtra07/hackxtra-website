import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';

async function analyze() {
    try {
        const db = (await connectDB()).connection.db;
        if (!db) throw new Error("DB not found");
        const collections = await db.listCollections().toArray();

        console.log('--- Collection Storage Analysis ---');
        for (const col of collections) {
            const stats = await db.command({ collStats: col.name });
            console.log(`Collection: ${col.name}`);
            console.log(` - Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(` - Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(` - Indexes Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(` - Free storage (Reclaimable): ${((stats.storageSize - stats.size) > 0 ? (stats.storageSize - stats.size) / 1024 / 1024 : 0).toFixed(2)} MB`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Analysis failed:', error);
        process.exit(1);
    }
}

analyze();
