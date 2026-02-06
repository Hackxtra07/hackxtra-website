import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models';
import bcrypt from 'bcryptjs';

async function initializeAdmin() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@hackxtras.com' });

    if (!existingAdmin) {
      // Create default admin
      const adminData = {
        email: 'admin@hackxtras.com',
        password: 'Admin@123456', // This will be hashed by the schema
        name: 'Admin User',
      };

      const admin = new Admin(adminData);
      await admin.save();

      console.log('✅ Default admin user created!');
      console.log('Email: admin@hackxtras.com');
      console.log('Password: Admin@123456');
      console.log('⚠️  Please change this password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    process.exit(1);
  }
}

initializeAdmin();
