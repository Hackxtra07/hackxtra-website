const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define schema directly to avoid import issues
const SettingsSchema = new mongoose.Schema({
    siteName: String,
    contactEmail: String,
    maintenanceMode: Boolean,
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const settings = await Settings.findOne();
        console.log('Current Settings in DB:', JSON.stringify(settings, null, 2));
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error checking settings:', error);
        process.exit(1);
    }
}

checkSettings();
