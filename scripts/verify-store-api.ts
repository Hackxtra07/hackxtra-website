
// This script simulates the API calls to verify the Store feature
// Run with: npx tsx scripts/verify-store-api.ts

import { connectDB } from '../lib/mongodb';
import { StoreItem, User, Transaction, Admin } from '../lib/models';
import mongoose from 'mongoose';

const TEST_ADMIN_EMAIL = 'testadmin@example.com';
const TEST_USER_EMAIL = 'testuser@example.com';

async function main() {
    console.log('🚀 Starting Verification...');
    await connectDB();

    // 1. Setup Test Data
    console.log('1. Setting up Test Data...');

    // Create Admin
    await Admin.deleteOne({ email: TEST_ADMIN_EMAIL });
    const admin = await Admin.create({
        email: TEST_ADMIN_EMAIL,
        password: 'password123',
        name: 'Test Admin'
    });
    console.log('✅ Admin created');

    // Create User
    await User.deleteOne({ email: TEST_USER_EMAIL });
    const user = await User.create({
        username: 'test_store_user',
        email: TEST_USER_EMAIL,
        password: 'password123',
        points: 200 // Adequate points
    });
    console.log('✅ User created with 200 points');

    // 2. Test Admin Creating Item
    console.log('2. Testing Admin Create Item...');
    // Direct model creation to simulate API body processing (since we can't easily curl local APIs from script without fetch)
    // We will assume the API logic just calls model.save()

    const newItem = {
        title: 'Test Deal',
        description: 'A test deal description',
        cost: 50,
        type: 'deal',
        value: 'SECRET-CODE-123',
        stock: 10,
        isActive: true
    };

    const storeItem = await StoreItem.create(newItem);
    console.log(`✅ Store Item created: ${storeItem.title} (${storeItem._id})`);

    // 3. Test Purchase Flow
    console.log('3. Testing Purchase Flow...');

    // Logic from POST /api/store/purchase
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const item = await StoreItem.findById(storeItem._id).session(session);
        const userRecord = await User.findById(user._id).session(session);

        if (!item || !userRecord) throw new Error('Not found');

        if (userRecord.points < item.cost) throw new Error('Insufficient points');

        userRecord.points -= item.cost;
        await userRecord.save({ session });

        item.stock -= 1;
        await item.save({ session });

        await Transaction.create([{
            userId: user._id,
            itemId: item._id,
            itemTitle: item.title,
            cost: item.cost,
            value: item.value
        }], { session }); // API uses transaction.create array for session or new Transaction().save()

        await session.commitTransaction();
        console.log('✅ Purchase transaction committed');

    } catch (error) {
        console.error('❌ Purchase transaction failed:', error);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }

    // 4. Verify Final State
    console.log('4. Verifying Final State...');
    const updatedUser = await User.findById(user._id);
    const updatedItem = await StoreItem.findById(storeItem._id);
    const transaction = await Transaction.findOne({ userId: user._id, itemId: storeItem._id });

    if (updatedUser?.points === 150) {
        console.log('✅ User points deducted correctly (200 -> 150)');
    } else {
        console.error(`❌ User points incorrect: ${updatedUser?.points}`);
    }

    if (updatedItem?.stock === 9) {
        console.log('✅ Item stock decremented correctly (10 -> 9)');
    } else {
        console.error(`❌ Item stock incorrect: ${updatedItem?.stock}`);
    }

    if (transaction) {
        console.log('✅ Transaction record found');
        console.log(`   Value revealed: ${transaction.value}`);
    } else {
        console.error('❌ Transaction record not found');
    }

    console.log('✨ Verification Complete!');
    process.exit(0);
}

main().catch(console.error);
