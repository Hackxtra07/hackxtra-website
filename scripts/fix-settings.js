const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
}

const settingsSchema = new mongoose.Schema({
    contactEmail: { type: String, required: true },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

async function updateSettings() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const result = await Settings.findOneAndUpdate(
            {},
            { contactEmail: 'hackxtras.official@gmail.com' },
            { upsert: true, new: true }
        );

        console.log('Updated Settings:', result);
        process.exit(0);
    } catch (error) {
        console.error('Error updating settings:', error);
        process.exit(1);
    }
}

updateSettings();
