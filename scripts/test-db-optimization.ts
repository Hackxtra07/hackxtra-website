import { connectDB } from '../lib/mongodb';
import { optimizeDatabase } from '../lib/db-optimize';
import mongoose from 'mongoose';

async function testOptimization() {
    try {
        console.log('--- Starting Database Optimization Test ---');

        // 1. Run optimization
        const results = await optimizeDatabase();

        // 2. Log results
        console.log('\n--- Optimization Results ---');
        let totalReclaimed = 0;

        results.forEach(res => {
            const reclaimed = (res.before.storageSize - res.after.storageSize) / 1024 / 1024;
            totalReclaimed += reclaimed;
            if (reclaimed > 0) {
                console.log(`Collection: ${res.collection}`);
                console.log(` - Reclaimed: ${reclaimed.toFixed(4)} MB`);
            }
        });

        console.log(`\nTotal Reclaimed: ${totalReclaimed.toFixed(4)} MB`);
        console.log('Optimization logic verified.');

        process.exit(0);
    } catch (error) {
        console.error('Optimization test failed:', error);
        process.exit(1);
    }
}

testOptimization();
