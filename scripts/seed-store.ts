
import { connectDB } from '../lib/mongodb';
import { StoreItem } from '../lib/models';
import mongoose from 'mongoose';

const INITIAL_ITEMS = [
    {
        title: "50% Off HackTheBox",
        description: "Get 50% off your first month of HackTheBox VIP subscription. Improve your hacking skills with advanced labs.",
        cost: 500,
        type: "deal",
        value: "HTB-50-OFF-2024",
        stock: 50,
        isActive: true,
        image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
        title: "Advanced Pentesting Cheat Sheet",
        description: "A comprehensive PDF cheat sheet covering the latest escalation techniques and reverse shell one-liners.",
        cost: 100,
        type: "resource",
        value: "https://hackxtras.com/resources/pentest-cheatsheet.pdf",
        stock: -1, // Infinite
        isActive: true,
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
        title: "DigitalOcean $100 Credit",
        description: "Start your cloud journey with $100 credit on DigitalOcean. Perfect for hosting your own CTF challenges.",
        cost: 200,
        type: "deal",
        value: "DO-100-CREDIT-XYZ",
        stock: 20,
        isActive: true,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
        title: "Exclusive Python for Hacking Details",
        description: "Unlock access to our private playlist of advanced Python scripting tutorials for security professionals.",
        cost: 300,
        type: "resource",
        value: "https://youtube.com/playlist?list=secret-playlist-id",
        stock: -1,
        isActive: true,
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
        title: "Pro Membership (1 Month)",
        description: "Unlock all premium features on HackXtras for one month. Includes access to exclusive rooms.",
        cost: 1000,
        type: "deal",
        value: "PRO-MONTH-FREE",
        stock: 50,
        isActive: true,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    }
];

async function seed() {
    console.log('🌱 Seeding Store Items...');
    try {
        await connectDB();

        // Optional: Clear existing items to avoid duplicates if running multiple times?
        // Or just check if they exist. For now, let's just insert them.
        // To be safe, let's clear ONLY the ones with these titles OR just append.
        // I'll just append for now, but handle duplicates by title if needed?
        // Let's just create them.

        for (const item of INITIAL_ITEMS) {
            const existing = await StoreItem.findOne({ title: item.title });
            if (!existing) {
                await StoreItem.create(item);
                console.log(`✅ Added: ${item.title}`);
            } else {
                console.log(`⚠️ Skipped (Already exists): ${item.title}`);
            }
        }

        console.log('✨ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        process.exit(0);
    }
}

seed();
