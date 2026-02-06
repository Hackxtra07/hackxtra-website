const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function init() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hackxtras');
    console.log('Connected to MongoDB');

    const adminSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const Admin = mongoose.model('Admin', adminSchema);

    let admin = await Admin.findOne({ email: 'admin@hackxtras.com' });

    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123456', salt);
      admin = new Admin({
        email: 'admin@hackxtras.com',
        password: hashedPassword,
        name: 'Admin User'
      });
      await admin.save();
      console.log('✅ Admin user created!');
      console.log('📧 Email: admin@hackxtras.com');
      console.log('🔑 Password: Admin@123456');
    } else {
      console.log('✅ Admin user already exists');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

init();
