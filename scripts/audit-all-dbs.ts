import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';

async function audit() {
    try {
        const admin = (await connectDB()).connection.db.admin();
        const dbs = await admin.listDatabases();

        console.log('--- Cluster Wide Database Audit ---');
        console.log(`Total Size on Disk: ${(dbs.totalSize / 1024 / 1024).toFixed(2)} MB`);

        for (const dbInfo of dbs.databases) {
            const db = mongoose.connection.useDb(dbInfo.name).db;
            const stats = await db.command({ dbStats: 1 });

            console.log(`\nDatabase: ${dbInfo.name}`);
            console.log(` - Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(` - Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(` - Collections: ${stats.collections}`);
            console.log(` - Indexes: ${stats.indexes}`);

            if (stats.dataSize > 0) {
                const collections = await db.listCollections().toArray();
                for (const col of collections) {
                    const colStats = await db.command({ collStats: col.name });
                    if (colStats.size > 1024 * 10 || colStats.storageSize > 1024 * 10) { // Only log if > 10KB
                        console.log(`   Collection ${col.name}: Data=${(colStats.size / 1024 / 1024).toFixed(2)}MB, Storage=${(colStats.storageSize / 1024 / 1024).toFixed(2)}MB`);
                    }
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
}

audit();
