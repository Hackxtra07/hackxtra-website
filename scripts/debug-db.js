const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Mocking the model locally for the script if we can't import easily
const settingsSchema = new mongoose.Schema({
    contactEmail: { type: String, required: true, default: 'admin@example.com' },
}, { timestamps: true });

// We need to match the actual collection name if possible, usually plural of model name lowercased: 'settings'
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

async function testDB() {
    console.log('Testing DB Connection...');
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined in env');
        return;
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        console.log('Finding Settings...');
        let settings = await Settings.findOne();
        if (!settings) {
            console.log('No settings found, creating default...');
            settings = await Settings.create({ contactEmail: 'admin@example.com' });
        }
        console.log('Settings:', settings);

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (e) {
        console.error('DB Error:', e);
    }
}

testDB();
