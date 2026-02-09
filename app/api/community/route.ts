import { connectDB } from '@/lib/mongodb';
import { CommunityConfigs } from '@/lib/models';
import { authenticateRequest, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        let config = await CommunityConfigs.findOne().sort({ updatedAt: -1 });

        if (!config) {
            // Return standard defaults if none exists yet
            return createSuccessResponse({
                success: true,
                data: {
                    stats: [
                        { icon: 'Users', value: '50K+', label: 'Active Members' },
                        { icon: 'MessageSquare', value: '1M+', label: 'Messages Sent' },
                        { icon: 'Trophy', value: '500+', label: 'Challenges' },
                        { icon: 'Globe', value: '120+', label: 'Countries' },
                    ],
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

        return createSuccessResponse({ success: true, data: config });
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
