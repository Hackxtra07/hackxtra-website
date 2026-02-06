const { MongoClient } = require('mongodb');

async function checkAndEnablePro(email) {
    const uri = 'mongodb://localhost:27017/hackxtras';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('hackxtras');
        const users = db.collection('users');

        const user = await users.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }

        console.log(`Current status for ${email}: isPro = ${user.isPro}`);

        if (!user.isPro) {
            await users.updateOne({ email }, { $set: { isPro: true } });
            console.log(`Successfully enabled Pro status for ${email}`);
        } else {
            console.log('User is already Pro.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Please provide an email as an argument.');
} else {
    checkAndEnablePro(email);
}
