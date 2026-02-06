async function testSignup() {
    const username = `testuser_${Date.now()}`;
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Attempting signup with: ${username}, ${email}`);

    try {
        const res = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (!res.ok) {
            console.error('Signup Failed!');
        } else {
            console.log('Signup Successful!');
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

testSignup();
