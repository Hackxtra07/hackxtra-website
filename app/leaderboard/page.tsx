"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
    Trophy,
    Medal,
    Crown,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Shield,
    Zap,
    Target,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Loader } from "@/components/hackxtras/loader";

interface Ranking {
    _id: string;
    username: string;
    points: number;
    badges: string[];
    country: string;
    avatarColor: string;
    change: "up" | "down" | "same";
}

function RankRow({ user, index }: { user: Ranking; index: number }) {
    const isTop3 = index < 3;
    const rank = index + 1;

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.2 }}
            className="group border-b border-border/30 transition-colors hover:bg-muted/30"
        >
            <td className="py-4 pl-4 sm:pl-6">
                <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold ${index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                        index === 1 ? "bg-gray-400/20 text-gray-400" :
                            index === 2 ? "bg-amber-700/20 text-amber-700" :
                                "text-muted-foreground"
                        }`}>
                        {rank}
                    </div>
                    {isTop3 && <Crown className={`h-4 w-4 ${index === 0 ? "text-yellow-500" :
                        index === 1 ? "text-gray-400" :
                            "text-amber-700"
                        }`} />}
                </div>
            </td>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${user.avatarColor || 'bg-blue-500/20 text-blue-500'} flex items-center justify-center text-xs font-bold`}>
                        {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{user.username}</span>
                        <span className="text-xs text-muted-foreground uppercase">{user.country}</span>
                    </div>
                </div>
            </td>
            <td className="py-4">
                <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge, i) => (
                        <span key={i} className="inline-flex items-center rounded-sm border border-border/50 bg-background/50 px-2 py-0.5 text-xs text-muted-foreground">
                            {badge}
                        </span>
                    ))}
                </div>
            </td>
            <td className="py-4 pr-4 text-right font-mono font-medium text-foreground sm:pr-6">
                {user.points.toLocaleString()}
            </td>
        </motion.tr>
    );
}

export default function LeaderboardPage() {
    const [loading, setLoading] = useState(true);
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [stats, setStats] = useState({
        activeHackers: "...",
        challengesSolved: "...",
        totalPointsAwarded: "..."
    });
    const [userStats, setUserStats] = useState({
        rank: "--",
        points: 0
    });
    const [searchQuery, setSearchQuery] = useState("");
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Rankings
                const rankingsRes = await fetch('/api/users');
                if (rankingsRes.ok) {
                    const data = await rankingsRes.json();
                    setRankings(data);
                }

                // Fetch Global Stats
                const statsRes = await fetch('/api/leaderboard/stats');
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats({
                        activeHackers: data.activeHackers.toLocaleString(),
                        challengesSolved: data.challengesSolved > 1000 ? `${(data.challengesSolved / 1000).toFixed(1)}K` : data.challengesSolved.toString(),
                        totalPointsAwarded: data.totalPointsAwarded > 1000000 ? `${(data.totalPointsAwarded / 1000000).toFixed(1)}M` : data.totalPointsAwarded.toLocaleString()
                    });
                }

                // Fetch User Stats if logged in
                const userToken = localStorage.getItem('userToken');
                if (userToken) {
                    const profileRes = await fetch('/api/users/profile', {
                        headers: { 'Authorization': `Bearer ${userToken}` }
                    });
                    if (profileRes.ok) {
                        const data = await profileRes.json();
                        setUserStats({
                            rank: data.rank ? `#${data.rank}` : "--",
                            points: data.points || 0
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredRankings = rankings.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative min-h-screen bg-background">
            {/* ... Background elements ... */}

            {/* ... Header and Main content start ... */}
            <Header />

            <main className="pt-32 pb-24">
                <div className="mx-auto max-w-7xl px-6">
                    {/* ... Page Header ... */}
                    <motion.div
                        ref={headerRef}
                        initial={{ opacity: 0, y: 30 }}
                        animate={
                            isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                        }
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-12"
                    >
                        {/* ... Header Text ... */}
                        <span className="font-mono text-sm uppercase tracking-wider text-primary">
                            Global Rankings
                        </span>
                        <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                    Leaderboard
                                </h1>
                                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                                    See who's topping the charts. Compete in CTFs, complete labs, and
                                    earn badges to climb the ranks.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <div className="hidden flex-col items-center gap-1 rounded-lg border border-border/50 bg-card/50 p-3 text-center sm:flex">
                                    <span className="text-xs text-muted-foreground uppercase">Your Rank</span>
                                    <span className="font-mono text-xl font-bold text-foreground">{userStats.rank}</span>
                                </div>
                                <div className="hidden flex-col items-center gap-1 rounded-lg border border-border/50 bg-card/50 p-3 text-center sm:flex">
                                    <span className="text-xs text-muted-foreground uppercase">Points</span>
                                    <span className="font-mono text-xl font-bold text-primary">{userStats.points.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ... Stats Cards ... */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-12">
                        {[
                            { label: "Active Hackers", value: stats.activeHackers, icon: Users, color: "text-blue-400" },
                            { label: "Challenges Solved", value: stats.challengesSolved, icon: Target, color: "text-green-400" },
                            { label: "Points Awarded", value: stats.totalPointsAwarded, icon: Zap, color: "text-yellow-400" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm"
                            >
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-background/50 border border-border/50 ${stat.color}`}>
                                    {/* @ts-ignore */}
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Leaderboard Table Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-md"
                    >
                        {/* Toolbar */}
                        <div className="flex flex-col gap-4 border-b border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search hackers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-border/50 bg-background/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-background/50 h-9">
                                    <Filter className="mr-2 h-3.5 w-3.5" />
                                    Filter
                                </Button>
                                <Button variant="outline" size="sm" className="bg-background/50 h-9">
                                    This Month
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader />
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium sm:pl-6 w-20">Rank</th>
                                            <th className="px-4 py-3 font-medium">Hacker</th>
                                            <th className="px-4 py-3 font-medium">Badges</th>
                                            <th className="px-4 py-3 pr-4 text-right font-medium sm:pr-6">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {filteredRankings.map((user, index) => (
                                            <RankRow key={user._id || index} user={user} index={index} />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-border/50 p-4">
                            <span className="text-xs text-muted-foreground">
                                Showing <span className="font-medium text-foreground">1-{rankings.length}</span> of <span className="font-medium text-foreground">{rankings.length}+</span>
                            </span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" disabled>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
