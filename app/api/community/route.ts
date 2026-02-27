import { connectDB } from '@/lib/mongodb';
import { CommunityConfigs, User, Message, Challenge } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        // Fetch real-time counts
        const [config, memberCount, messageCount, challengeCount, countries] = await Promise.all([
            CommunityConfigs.findOne().sort({ updatedAt: -1 }),
            User.countDocuments(),
            Message.countDocuments(),
            Challenge.countDocuments(),
            User.distinct('country')
        ]);

        const liveStats = [
            { icon: 'Users', value: `${(memberCount / 1000).toFixed(memberCount >= 1000 ? 1 : 0)}${memberCount >= 1000 ? 'K' : ''}+`, label: 'Active Members' },
            { icon: 'MessageSquare', value: `${(messageCount / 1000).toFixed(messageCount >= 1000 ? 1 : 0)}${messageCount >= 1000 ? 'K' : ''}+`, label: 'Messages Sent' },
            { icon: 'Trophy', value: `${challengeCount}+`, label: 'Challenges' },
            { icon: 'Globe', value: `${countries.length}+`, label: 'Countries' },
        ];

        if (!config) {
            // Return standard defaults with live stats if none exists yet
            return createSuccessResponse({
                success: true,
                data: {
                    stats: liveStats,
                    topContributors: [
                        { name: "Alex Chen", role: "Security Researcher", points: 24500, avatar: "AC" },
                        { name: "Sarah Kim", role: "Pentester", points: 22100, avatar: "SK" },
                        { name: "Mike Johnson", role: "SOC Analyst", points: 19800, avatar: "MJ" },
                        { name: "Emma Wilson", role: "Bug Hunter", points: 18200, avatar: "EW" },
                        { name: "David Park", role: "Red Teamer", points: 16900, avatar: "DP" },
                    ],
                    upcomingEvents: [
                        { title: "CTF Competition: Web Hacking", date: "Feb 15, 2026", time: "2:00 PM UTC", participants: 342, type: "Competition" },
                        { title: "Live Stream: Malware Analysis", date: "Feb 18, 2026", time: "6:00 PM UTC", participants: 1200, type: "Workshop" },
                        { title: "Community Q&A with Core Team", date: "Feb 22, 2026", time: "4:00 PM UTC", participants: 890, type: "AMA" },
                    ],
                    popularChannels: [
                        { icon: 'Shield', name: "general", description: "General discussion about cybersecurity", members: 45000 },
                        { icon: 'Zap', name: "ctf-challenges", description: "Discuss and collaborate on CTF challenges", members: 32000 },
                        { icon: 'MessageSquare', name: "help-desk", description: "Get help from community members", members: 28000 },
                    ]
                }
            });
        }

        // If config exists, we still want to inject the live stats for the main labels
        const mergedStats = config.stats.map((stat: any) => {
            if (stat.label === 'Active Members') return { ...stat, value: liveStats[0].value };
            if (stat.label === 'Messages Sent') return { ...stat, value: liveStats[1].value };
            if (stat.label === 'Challenges') return { ...stat, value: liveStats[2].value };
            if (stat.label === 'Countries') return { ...stat, value: liveStats[3].value };
            return stat;
        });

        // Convert the mongoose document to a plain object to modify it
        const configObj = config.toObject();
        configObj.stats = mergedStats;

        return createSuccessResponse({ success: true, data: configObj });
    } catch (error) {
        console.error('Fetch community configs error:', error);
        return createErrorResponse('Failed to fetch community configs', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return createErrorResponse('Unauthorized', 401);
        }

        await connectDB();
        const body = await request.json();

        let config = await CommunityConfigs.findOne();
        if (config) {
            config = await CommunityConfigs.findByIdAndUpdate(config._id, body, { new: true });
        } else {
            config = await CommunityConfigs.create(body);
        }

        return createSuccessResponse({ success: true, data: config });
    } catch (error) {
        console.error('Update community configs error:', error);
        return createErrorResponse('Failed to update community configs', 500);
    }
}
