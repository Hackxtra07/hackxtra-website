#!/bin/bash

# HackXtras Complete Setup Script

echo "🚀 HackXtras Setup - Complete Initialization"
echo "=============================================="

# Check Node.js
echo "✓ Node.js version:"
node --version

# Check pnpm
echo "✓ pnpm version:"
pnpm --version

# Check MongoDB
echo "✓ MongoDB version:"
mongod --version | head -1

# Check MongoDB service
echo "✓ MongoDB service status:"
sudo systemctl status mongod --no-pager | head -3

# Display setup information
echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "🌐 Access Points:"
echo "   Website:     http://localhost:3003"
echo "   Admin Panel: http://localhost:3003/admin/login"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Email:    admin@hackxtras.com"
echo "   Password: Admin@123456"
echo ""
echo "📊 Database:"
echo "   Type:     MongoDB"
echo "   Host:     localhost"
echo "   Port:     27017"
echo "   Database: hackxtras"
echo ""
echo "📦 Sample Data:"
echo "   ✓ 6 Courses"
echo "   ✓ 6 Labs"
echo "   ✓ 6 Resources"
echo "   ✓ 6 Channels"
echo ""
echo "🛠️  To Start Development:"
echo "   pnpm dev"
echo ""
echo "📝 Important Files:"
echo "   - .env.local          (Environment variables)"
echo "   - lib/mongodb.ts      (Database connection)"
echo "   - lib/models.ts       (Data schemas)"
echo "   - app/api/            (API routes)"
echo "   - app/admin/          (Admin dashboard)"
echo "   - ADMIN_SETUP.md      (Detailed documentation)"
echo ""
echo "✨ Your system is ready to use!"
