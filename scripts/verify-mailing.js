const BASE_URL = 'http://localhost:3000';

async function verifyMailingSystem() {
    console.log('Starting Mailing System Verification...');

    // 1. Verify Settings API
    console.log('1. Checking Settings API...');
    try {
        const res = await fetch(`${BASE_URL}/api/settings`);
        if (res.ok) {
            const data = await res.json();
            console.log(`SUCCESS: Fetched settings. Contact Email: ${data.contactEmail}`);
        } else {
            console.error(`FAILED: Settings API return status ${res.status}`);
        }
    } catch (e) {
        console.error('FAILED: Could not fetch Settings API', e.message);
    }

    // 2. Mock Send Email (Contact)
    console.log('2. Sending Mock Contact Email...');
    try {
        const res = await fetch(`${BASE_URL}/api/send-email`, {
            method: 'POST',
            body: JSON.stringify({
                type: 'contact',
                data: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    subject: 'Verification Test',
                    message: 'This is a test message from the verification script.'
                }
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log(`SUCCESS: Contact email processed: ${data.message}`);
        } else {
            console.error(`FAILED: Email API return status ${res.status}`);
        }
    } catch (e) {
        console.error('FAILED: Could not send contact email', e.message);
    }

    // 3. Mock Application
    console.log('3. Sending Mock Application...');
    try {
        const res = await fetch(`${BASE_URL}/api/send-email`, {
            method: 'POST',
            body: JSON.stringify({
                type: 'application',
                data: {
                    position: 'Test Role',
                    name: 'Applicant',
                    email: 'applicant@example.com',
                    resumeLink: 'http://example.com/resume',
                    coverLetter: 'Hire me!'
                }
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log(`SUCCESS: Application email processed: ${data.message}`);
        } else {
            console.error(`FAILED: Email API return status ${res.status}`);
        }
    } catch (e) {
        console.error('FAILED: Could not send application email', e.message);
    }

    console.log('Verification Complete. (Note: "Simulated" is expected if no SMTP credentials in local .env)');
}

verifyMailingSystem();
