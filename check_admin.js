const mongoose = require('mongoose');

async function checkAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hackxtras');
        console.log('Connected to MongoDB');

        const adminSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            name: { type: String, required: true }
        });
        const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

        const admin = await Admin.findOne({ email: 'admin@hackxtras.com' });
        if (admin) {
            console.log('Admin user found:', admin.email);
            console.log('Hashed Password:', admin.password);
        } else {
            console.log('Admin user NOT found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkAdmin();
