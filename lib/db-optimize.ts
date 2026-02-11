import { connectDB } from './mongodb';
import { Tool, Message } from './models';
import mongoose from 'mongoose';

export interface OptimizationStats {
    collection: string;
    before: {
        storageSize: number;
        indexSize: number;
        count: number;
    };
    after: {
        storageSize: number;
        indexSize: number;
        count: number;
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

    // 4. Perform Logical Trimming
    console.log("Performing logical data trimming...");

    // Trim Tool Descriptions and Usage
    const tools = await Tool.find({});
    for (const tool of tools) {
        let changed = false;
        if (tool.description && tool.description.length > 500) {
            tool.description = tool.description.substring(0, 500) + "...";
            changed = true;
        }
        if (tool.usage && tool.usage.length > 2000) {
            tool.usage = tool.usage.substring(0, 2000) + "...";
            changed = true;
        }
        if (changed) await tool.save();
    }

    // Delete Messages older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await Message.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });

    console.log("Logical trimming completed.");

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
                    indexSize: beforeStats.totalIndexSize,
                    count: beforeStats.count
                },
                after: {
                    storageSize: afterStats.storageSize,
                    indexSize: afterStats.totalIndexSize,
                    count: afterStats.count
                }
            });
        } catch (error: any) {
            // Handle "CommandNotSupported" or "Unauthorized" for Atlas Free Tier
            if (error.codeName === 'CommandNotFound' || error.message.includes('not supported')) {
                console.warn(`Warning: 'compact' command is not supported on this MongoDB tier (likely Atlas Free Tier). Skipping collection: ${colName}`);

                // Still return the current stats so the API doesn't fail
                stats.push({
                    collection: colName,
                    before: { storageSize: beforeStats.storageSize, indexSize: beforeStats.totalIndexSize, count: beforeStats.count },
                    after: { storageSize: beforeStats.storageSize, indexSize: beforeStats.totalIndexSize, count: beforeStats.count }
                });
            } else {
                console.error(`Failed to optimize collection ${colName}:`, error);
            }
        }
    }

    return stats;
}
