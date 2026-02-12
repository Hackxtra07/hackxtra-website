const axios = require('axios');

async function simulateSubmit() {
    const url = 'http://localhost:3000/api/send-email';
    const data = {
        type: 'contact',
        data: {
            firstName: 'Diag',
            lastName: 'Test',
            email: 'diag@test.com',
            subject: 'Diagnostic Test',
            message: 'Testing from simulate-fetch-axios.js'
        }
    };

    console.log('Simulating request to:', url);
    try {
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Status:', response.status);
        console.log('Response body:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Request error:', error.message);
        }
    }
}

simulateSubmit();
