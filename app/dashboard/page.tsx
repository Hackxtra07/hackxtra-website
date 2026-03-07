'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProStatus } from '@/hooks/use-pro-status';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Shield,
    Users,
    FileText,
    ArrowRight,
    Zap,
    Lock,
    Crown,
    ShieldCheck,
    Sparkles,
    History,
    Activity,
    Inbox
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
    username: string;
    email: string;
    points: number;
    badges: string[];
    rank: number;
    isPro: boolean;
}

export default function DashboardPage() {
    const { isPro, isAuthenticated, isLoading, isAdmin } = useProStatus();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
            fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setProfile(data))
                .catch(() => { });
        }
    }, [isAuthenticated]);

    if (isLoading || !isAuthenticated || !profile) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Synchronizing Terminal Status...</p>
                </div>
            </div>
        );
    }

    // Color theme based on Pro status
    const accentColor = isPro ? 'text-yellow-500' : 'text-primary';
    const borderColor = isPro ? 'border-yellow-500/30' : 'border-primary/20';
    const glowColor = isPro ? 'shadow-yellow-500/20' : 'shadow-primary/20';
    const bgGradient = isPro
        ? 'bg-[radial-gradient(ellipse_at_top_right,rgba(234,179,8,0.1),transparent)]'
        : 'bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent)]';

    return (
        <div className={`min-h-screen bg-black text-white selection:bg-primary selection:text-white transition-all duration-1000 overflow-x-hidden`}>
            <Header />

            <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative">
                {/* Visual Background Effects */}
                <div className={`fixed inset-0 ${bgGradient} pointer-events-none`} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-20" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] -z-10 opacity-20" />

                {/* Hero / Welcome Message */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-16 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`px-4 py-1 rounded-full ${isPro ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-primary/10 border-primary/20 text-primary'} border text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                                {isPro ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                {isPro ? 'Premium Node Active' : 'Verified Operator'}
                            </div>
                            {isAdmin && (
                                <div className="px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Root Access
                                </div>
                            )}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-tight">
                            Welcome, <span className={`bg-gradient-to-r ${isPro ? 'from-yellow-400 to-amber-600' : 'from-primary to-blue-400'} bg-clip-text text-transparent`}>{profile.username}</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-xl font-medium">
                            Your centralized control panel for cybersecurity mastery. Complete challenges, earn certifications, and climb the global ranks.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/profile">
                            <div className={`w-28 h-28 rounded-3xl ${isPro ? 'bg-yellow-500 border-yellow-400 shadow-yellow-500/30' : 'bg-primary border-primary shadow-primary/30'} border-4 shadow-2xl flex items-center justify-center text-black font-black text-3xl rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer`}>
                                {profile.username.substring(0, 2).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
                    <Card className={`border-white/10 bg-white/5 backdrop-blur-xl group hover:border-primary/50 transition-all duration-500 p-8 rounded-[2rem]`}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Experience Points</h4>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-black text-white">{profile.points}</p>
                            <Zap className={`w-6 h-6 ${accentColor} animate-pulse`} />
                        </div>
                    </Card>
                    <Card className={`border-white/10 bg-white/5 backdrop-blur-xl group hover:border-primary/50 transition-all duration-500 p-8 rounded-[2rem]`}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Global Rank</h4>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-black text-white">#{profile.rank}</p>
                            <Activity className={`w-6 h-6 ${accentColor}`} />
                        </div>
                    </Card>
                    <Card className={`border-white/10 bg-white/5 backdrop-blur-xl group hover:border-primary/50 transition-all duration-500 p-8 rounded-[2rem]`}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Badges Earned</h4>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-black text-white">{profile.badges.length}</p>
                            <Trophy className={`w-6 h-6 ${accentColor}`} />
                        </div>
                    </Card>
                    <Card className={`border-white/10 bg-white/5 backdrop-blur-xl group hover:border-primary/50 transition-all duration-500 p-8 rounded-[2rem]`}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">System Status</h4>
                        <div className="flex items-end justify-between">
                            <p className="text-xl font-bold text-emerald-400">ONLINE</p>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mb-2" />
                        </div>
                    </Card>
                </div>

                {/* Main Dashboard Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                    {/* Primary Navigation / Actions */}
                    <div className="lg:col-span-8 space-y-10">
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-600 mb-6 flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-primary" /> Core Systems
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link href="/academy" className="group">
                                    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-500 h-full flex flex-col justify-between group-hover:border-primary/30">
                                        <div>
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-2xl font-black mb-2">The Academy</h4>
                                            <p className="text-gray-500 text-sm font-medium">Access premium cybersecurity courses and structured learning paths.</p>
                                        </div>
                                        <div className="mt-8 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                            Initialize Core <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/labs" className="group">
                                    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-500 h-full flex flex-col justify-between group-hover:border-indigo-400/30">
                                        <div>
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-2xl font-black mb-2">Practice Labs</h4>
                                            <p className="text-gray-500 text-sm font-medium">Hands-on virtual labs to master exploitation and defense techniques.</p>
                                        </div>
                                        <div className="mt-8 flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                            Start Lab Session <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/challenges" className="group">
                                    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-500 h-full flex flex-col justify-between group-hover:border-emerald-400/30">
                                        <div>
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-2xl font-black mb-2">Quizzes & CTF</h4>
                                            <p className="text-gray-500 text-sm font-medium">Test your knowledge and compete for a spot on the leaderboard.</p>
                                        </div>
                                        <div className="mt-8 flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                            Open Challenge <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/profile?tab=certificates" className="group">
                                    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-500 h-full flex flex-col justify-between group-hover:border-amber-400/30">
                                        <div>
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-2xl font-black mb-2">Certification</h4>
                                            <p className="text-gray-500 text-sm font-medium">View and download your earned professional cybersecurity credentials.</p>
                                        </div>
                                        <div className="mt-8 flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                            View Manifest <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Secondary Info */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Terminal Feed / Recent Notifications */}
                        <Card className="border-white/10 bg-white/2 backdrop-blur-xl rounded-[2.5rem] overflow-hidden flex flex-col h-[500px]">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Inbox className="w-3.5 h-3.5" /> Intelligence Feed
                                </h3>
                                <Link href="/dashboard/inbox">
                                    <Button variant="ghost" className="h-6 px-2 text-[8px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">View All</Button>
                                </Link>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white mb-1">System Security Audit</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Welcome to the HackXtras secure grid. Your node is now protected by our dual-factor biometric synchronization.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 opacity-70">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white mb-1">XP Node Re-Sync</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Your daily XP rewards have been updated. Log solve completions to accelerate node leveling.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 opacity-50">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                                        <Inbox className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white mb-1">Broadcast Incoming</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Maintenance mode activated earlier to update core encryption layers. All systems now nominal.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-black/40 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Encrypted Tunnel Active</p>
                                </div>
                            </div>
                        </Card>

                        {/* Recent History Shortcut */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-2xl shadow-indigo-500/20 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <History className="w-8 h-8 text-white/50 mb-6" />
                                <h4 className="text-xl font-black mb-2">Back To Academy?</h4>
                                <p className="text-white/70 text-sm mb-6 leading-relaxed">Resume your last course: "Python For Ethical Hackers". You were at 60% completion.</p>
                                <Button className="h-12 w-full bg-white text-indigo-700 font-black rounded-xl hover:bg-gray-100 transition-all font-mono uppercase tracking-widest text-[9px] group-hover:scale-105">
                                    Resume Session
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
