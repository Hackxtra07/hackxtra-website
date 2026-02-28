import { connectDB } from '../lib/mongodb';
import { User, Session } from '../lib/models';
import { signToken, authenticateRequest } from '../lib/auth';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

async function testLocalAuth() {
    console.log('--- Testing Local Auth Logic ---');

    try {
        await connectDB();
        console.log('Connected to DB.');

        const email = `test_local_${Date.now()}@example.com`;
        const username = `testlocal_${Date.now()}`;

        // 1. Create a Test User
        console.log('1. Creating test user...');
        const user = await User.create({
            username,
            email,
            password: 'password123',
            points: 0
        });
        console.log('User created:', user._id);

        // 2. Create a Session
        console.log('2. Creating session...');
        const sessionId = 'test-session-id-' + Date.now();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour
        await Session.create({
            userId: user._id,
            userModel: 'User',
            sessionId,
            expiresAt,
            isValid: true
        });
        console.log('Session created.');

        // 3. Sign Token
        console.log('3. Signing token...');
        const token = signToken(email, sessionId);
        console.log('Token signed.');

        // 4. Verify authenticateRequest
        console.log('4. Verifying authenticateRequest...');
        const mockRequest = {
            headers: new Headers({
                'authorization': `Bearer ${token}`
            })
        } as unknown as NextRequest;

        const auth = await authenticateRequest(mockRequest);
        if (auth && auth.email === email && auth.sessionId === sessionId) {
            console.log('Authentication successful.');
        } else {
            throw new Error(`Authentication failed. Result: ${JSON.stringify(auth)}`);
        }

        // 5. Invalidate Session
        console.log('5. Invalidating session...');
        await Session.updateOne({ sessionId }, { $set: { isValid: false } });
        console.log('Session invalidated.');

        // 6. Verify authenticateRequest Fails
        console.log('6. Verifying authentication fails after session invalidation...');
        const authFailed = await authenticateRequest(mockRequest);
        if (authFailed === null) {
            console.log('Authentication successfully failed (null returned).');
        } else {
            throw new Error('Authentication should have failed but returned: ' + JSON.stringify(authFailed));
        }

        console.log('--- Local Auth Verification Passed! ---');
    } catch (error) {
        console.error('--- Local Auth Verification Failed! ---');
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

testLocalAuth();
