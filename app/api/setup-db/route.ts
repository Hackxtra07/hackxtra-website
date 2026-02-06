import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        // Check if admin already exists
        let admin = await Admin.findOne({ email: 'admin@hackxtras.com' });

        if (!admin || force) {
            if (admin && force) {
                await Admin.deleteOne({ email: 'admin@hackxtras.com' });
            }

            admin = new Admin({
                email: 'admin@hackxtras.com',
                password: 'Admin@123456',
                name: 'Super Admin'
            });
            await admin.save();
            return NextResponse.json({
                message: "Success! Admin user created/reset.",
                email: "admin@hackxtras.com",
                password: "Admin@123456"
            });
        }

        return NextResponse.json({ message: "Admin user already exists! visit ?force=true to reset." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
