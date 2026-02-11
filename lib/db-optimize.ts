import { connectDB } from './mongodb';
import mongoose from 'mongoose';

export interface OptimizationStats {
    collection: string;
    before: {
        storageSize: number;
        indexSize: number;
    };
    after: {
        storageSize: number;
        indexSize: number;
    };
}

/**
 * Optimizes the database by compacting collections and rebuilding indexes.
 * This reclaims fragmented space and minimizes storage usage.
 */
export async function optimizeDatabase() {
    const db = (await connectDB()).connection.db;
    if (!db) throw new Error("Database connection not established");

    const collections = await db.listCollections().toArray();
    const stats: OptimizationStats[] = [];

    for (const colInfo of collections) {
        const colName = colInfo.name;

        // 1. Get stats before optimization
        let beforeStats;
        try {
            beforeStats = await db.command({ collStats: colName });
        } catch (e) {
            console.warn(`Could not get stats for ${colName}, jumping to next.`);
            continue;
        }

        console.log(`Optimizing collection: ${colName}...`);

        try {
            // 2. Perform Compaction (Reclaims space and rebuilds indexes)
            // Note: COMPACT IS NOT SUPPORTED ON MONGODB ATLAS FREE TIERS (M0/M2/M5)
            // It also may timeout on Vercel for very large collections.
            await db.command({ compact: colName });

            // 3. Get stats after optimization
            const afterStats = await db.command({ collStats: colName });

            stats.push({
                collection: colName,
                before: {
                    storageSize: beforeStats.storageSize,
                    indexSize: beforeStats.totalIndexSize
                },
                after: {
                    storageSize: afterStats.storageSize,
                    indexSize: afterStats.totalIndexSize
                }
            });
        } catch (error: any) {
            // Handle "CommandNotSupported" or "Unauthorized" for Atlas Free Tier
            if (error.codeName === 'CommandNotFound' || error.message.includes('not supported')) {
                console.warn(`Warning: 'compact' command is not supported on this MongoDB tier (likely Atlas Free Tier). Skipping collection: ${colName}`);

                // Still return the current stats so the API doesn't fail
                stats.push({
                    collection: colName,
                    before: { storageSize: beforeStats.storageSize, indexSize: beforeStats.totalIndexSize },
                    after: { storageSize: beforeStats.storageSize, indexSize: beforeStats.totalIndexSize }
                });
            } else {
                console.error(`Failed to optimize collection ${colName}:`, error);
            }
        }
    }

    return stats;
}
