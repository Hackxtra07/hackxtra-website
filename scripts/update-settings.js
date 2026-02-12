const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define schema directly
const SettingsSchema = new mongoose.Schema({
    siteName: String,
    contactEmail: String,
    maintenanceMode: Boolean,
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

async function updateSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const contactEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_CONTACT_EMAIL || 'hackxtras.official@gmail.com';

        console.log('Updating contactEmail to:', contactEmail);

        const settings = await Settings.findOneAndUpdate(
            {},
            { contactEmail: contactEmail },
            { upsert: true, new: true }
        );

        console.log('Updated Settings:', JSON.stringify(settings, null, 2));
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error updating settings:', error);
        process.exit(1);
    }
}

updateSettings();
