import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@hackxtras.com' });

        if (!existingAdmin) {
            const admin = new Admin({
                email: 'admin@hackxtras.com',
                password: 'Admin@123456',
                name: 'Super Admin'
            });
            await admin.save();
            return NextResponse.json({ message: "Success! Admin user created. Use: admin@hackxtras.com / Admin@123456" });
        }

        return NextResponse.json({ message: "Admin user already exists!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
