const BASE_URL = 'http://localhost:3000';

async function testSessionAuth() {
    const username = `testsession_${Date.now()}`;
    const email = `test_session_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`--- Testing Session Auth for user: ${username} ---`);

    try {
        // 1. Signup
        console.log('1. Signing up...');
        const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok) throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
        const token = signupData.token;
        console.log('Signup successful, token obtained.');

        // 2. Verify Profile Access
        console.log('2. Verifying profile access with token...');
        const profileRes = await fetch(`${BASE_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error(`Profile access failed: ${JSON.stringify(profileData)}`);
        console.log('Profile access successful.');

        // 3. Logout
        console.log('3. Logging out...');
        const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const logoutData = await logoutRes.json();
        if (!logoutRes.ok) throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`);
        console.log('Logout successful.');

        // 4. Verify Profile Access Denied
        console.log('4. Verifying profile access is now denied...');
        const profileDeniedRes = await fetch(`${BASE_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileDeniedData = await profileDeniedRes.json();
        if (profileDeniedRes.status === 401) {
            console.log('Profile access successfully denied (401 Unauthorized).');
        } else {
            console.error('FAILED: Profile access was still allowed or returned unexpected status:', profileDeniedRes.status);
            process.exit(1);
        }

        console.log('--- Session Auth Verification Passed! ---');
    } catch (error) {
        console.error('--- Session Auth Verification Failed! ---');
        console.error(error);
        process.exit(1);
    }
}

testSessionAuth();
