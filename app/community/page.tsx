"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MessageSquare,
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  Globe,
  Zap,
  Shield,
  Search,
  Award,
  Github,
  Twitter,
  Linkedin,
  Medal,
  Code,
  X,
  Target,
  ExternalLink,
  ShieldCheck,
  Crown
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Loader } from "@/components/hackxtras/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as LucideIcons from "lucide-react";

// --- Types ---
interface Hacker {
  _id: string;
  username: string;
  points: number;
  badges: string[];
  country: string;
  avatarColor: string;
  isPro?: boolean;
}

interface HackerProfile extends Hacker {
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  createdAt: string;
  solvedChallenges?: string[];
}

interface Certificate {
  _id: string;
  achievement: string;
  certId: string;
  issuedAt: string;
}

// --- Mock Data Fallbacks ---
const communityStats = [
  { icon: Users, value: "50K+", label: "Active Members" },
  { icon: MessageSquare, value: "1M+", label: "Messages Sent" },
  { icon: Trophy, value: "500+", label: "Challenges" },
  { icon: Globe, value: "120+", label: "Countries" },
];

const topContributors = [
  { name: "Alex Chen", role: "Security Researcher", points: 24500, avatar: "AC" },
  { name: "Sarah Kim", role: "Pentester", points: 22100, avatar: "SK" },
  { name: "Mike Johnson", role: "SOC Analyst", points: 19800, avatar: "MJ" },
  { name: "Emma Wilson", role: "Bug Hunter", points: 18200, avatar: "EW" },
  { name: "David Park", role: "Red Teamer", points: 16900, avatar: "DP" },
];

const upcomingEvents = [
  { title: "CTF Competition: Web Hacking", date: "Feb 15, 2026", time: "2:00 PM UTC", participants: 342, type: "Competition" },
  { title: "Live Stream: Malware Analysis", date: "Feb 18, 2026", time: "6:00 PM UTC", participants: 1200, type: "Workshop" },
  { title: "Community Q&A with Core Team", date: "Feb 22, 2026", time: "4:00 PM UTC", participants: 890, type: "AMA" },
];

const channels = [
  { icon: Shield, name: "general", description: "General discussion about cybersecurity", members: 45000 },
  { icon: Zap, name: "ctf-challenges", description: "Discuss and collaborate on CTF challenges", members: 32000 },
  { icon: MessageSquare, name: "help-desk", description: "Get help from community members", members: 28000 },
];

export default function CommunityPage() {
  const [config, setConfig] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hackers, setHackers] = useState<Hacker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHackerId, setSelectedHackerId] = useState<string | null>(null);
  const [hackerProfile, setHackerProfile] = useState<HackerProfile | null>(null);
  const [hackerCerts, setHackerCerts] = useState<Certificate[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    // Fetch basic community data
    fetch("/api/community")
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.data);
      })
      .catch(err => console.error("Failed to fetch community config", err));

    fetch("/api/badges")
      .then(res => res.json())
      .then(data => {
        setBadges(Array.isArray(data) ? data : (data.data || []));
      })
      .catch(err => console.error("Failed to fetch badges", err));

    // Fetch hackers list
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setHackers(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to fetch hackers", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedHackerId) {
      setHackerProfile(null);
      setHackerCerts([]);
      return;
    }

    setProfileLoading(true);
    // Fetch detailed profile
    Promise.all([
      fetch(`/api/users/${selectedHackerId}/public`).then(res => res.json()),
      fetch(`/api/users/${selectedHackerId}/certificates`).then(res => res.json())
    ]).then(([profileData, certsData]) => {
      if (profileData.success) setHackerProfile(profileData.data);
      if (certsData.success) setHackerCerts(certsData.data);
    }).catch(err => {
      console.error("Failed to fetch hacker profile details", err);
    }).finally(() => {
      setProfileLoading(false);
    });
  }, [selectedHackerId]);

  const getIcon = (iconInput: any) => {
    if (!iconInput) return <LucideIcons.HelpCircle className="h-5 w-5" />;
    if (typeof iconInput === 'string') {
      const Icon = (LucideIcons as any)[iconInput] || LucideIcons.HelpCircle;
      return <Icon className="h-5 w-5" />;
    }
    const Icon = iconInput;
    return <Icon className="h-5 w-5" />;
  };

  const filteredHackers = hackers.filter((h: Hacker) => 
    h.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = config?.stats || communityStats;
  const contributors = config?.topContributors || topContributors;
  const events = config?.upcomingEvents || upcomingEvents;
  const popularChannels = config?.popularChannels || channels;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center pt-32"><Loader /></div>;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30 bg-blue-500/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] opacity-20 bg-indigo-500/20 blur-[120px] rounded-full" />
      </div>

      <Header />

      <main className="pt-32 pb-24 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          {/* Hero Header */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="font-mono text-sm uppercase tracking-widest text-primary font-bold">The HackXtras Collective</span>
            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">Community</h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Connect with 50,000+ cybersecurity experts. Share tradecraft, solve zero-day challenges, and build the future of ethical hacking.
            </p>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-12">
            <TabsList className="bg-card/30 border border-border/50 p-1 rounded-xl backdrop-blur-xl w-fit">
              <TabsTrigger value="overview" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all">Overview Feed</TabsTrigger>
              <TabsTrigger value="hackers" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all">Hacker Directory</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Internal Overview Logic */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((stat: any) => (
                  <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-md hover:border-primary/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        {getIcon(stat.icon)}
                      </div>
                      <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                 {/* Leaderboard Summary */}
                 <div className="lg:col-span-1 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl">
                   <div className="mb-8 flex items-center justify-between">
                     <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                       <Trophy className="w-5 h-5 text-yellow-500" />
                       Elite Contributors
                     </h2>
                   </div>
                   <div className="space-y-4">
                     {contributors.map((user: any, index: number) => (
                       <div key={user.name} className="flex items-center gap-4 rounded-xl p-3 border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group">
                         <span className="w-4 text-xs font-black text-muted-foreground">{index + 1}</span>
                         <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary group-hover:scale-110 transition-transform">
                           {user.avatar}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold truncate">{user.name}</p>
                           <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{user.role}</p>
                         </div>
                         <div className="text-right">
                           <span className="text-sm font-black text-primary">{user.points?.toLocaleString()}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                   <Button variant="outline" className="mt-8 w-full h-12 rounded-xl border-white/10 hover:bg-primary hover:text-primary-foreground font-black uppercase tracking-widest text-[10px]" asChild>
                     <Link href="/leaderboard">Full Leaderboard <ArrowRight className="ml-2 w-4 h-4" /></Link>
                   </Button>
                 </div>

                 {/* Activity & Channels */}
                 <div className="lg:col-span-2 space-y-8">
                   <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl">
                     <div className="mb-8 flex items-center justify-between">
                       <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                         <Calendar className="w-5 h-5 text-primary" />
                         Operations Briefing
                       </h2>
                     </div>
                     <div className="space-y-4">
                       {events.map((event: any) => (
                         <div key={event.title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
                           <div>
                              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                                <Zap className="w-3 h-3" /> {event.type}
                              </div>
                              <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                              <p className="text-sm text-muted-foreground font-medium">{event.date} • {event.time}</p>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted" />)}
                                <div className="w-6 h-6 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[8px] font-bold">+{event.participants - 3}</div>
                              </div>
                              <Button className="rounded-xl px-6 h-10 font-black uppercase tracking-widest text-[10px]">Deploy</Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl">
                     <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          Secure Channels
                        </h2>
                     </div>
                     <div className="grid sm:grid-cols-2 gap-4">
                        {popularChannels.map((channel: any) => (
                          <div key={channel.name} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                {getIcon(channel.icon)}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm">#{channel.name}</h4>
                                <p className="text-[10px] text-muted-foreground font-bold">{(channel.members / 1000).toFixed(0)}K ACTIVE</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{channel.description}</p>
                          </div>
                        ))}
                     </div>
                   </div>
                 </div>
              </div>

              {/* Global Badges */}
              <div className="mt-16 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Merit Awards</h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Proof of capability. Earned through blood, sweat, and code.</p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {badges.map((badge: any) => (
                    <div key={badge._id} className="group p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-primary/50 transition-all hover:translate-y-[-4px]">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 transition-transform duration-500">
                             {getIcon(badge.icon || 'Award')}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{badge.name}</h3>
                            <div className="flex gap-2 mt-1">
                               {badge.requirements?.requirePro && <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">Pro Only</span>}
                               <span className="text-[8px] font-black uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{badge.requirements?.minPoints || 0} PTS</span>
                            </div>
                          </div>
                       </div>
                       <p className="text-sm text-muted-foreground font-medium leading-relaxed">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hackers" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Search & Toolbelt */}
               <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                 <div className="relative w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Search hacker alias, ID, or specialty..." 
                      className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 transition-all text-lg font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" /> {hackers.length} Registered
                    </div>
                 </div>
               </div>

               {/* Hacker Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {filteredHackers.map((hacker, i) => (
                   <motion.div
                    key={hacker._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedHackerId(hacker._id)}
                    className="group cursor-pointer relative p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-500"
                   >
                     <div className="flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full ${hacker.avatarColor || 'bg-primary/20 text-primary'} border-2 border-white/5 group-hover:border-primary/40 transition-all duration-500 flex items-center justify-center text-2xl font-black mb-4 group-hover:scale-110 shadow-2xl relative`}>
                           {hacker.username.substring(0, 2).toUpperCase()}
                           {hacker.isPro && (
                             <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-background shadow-lg">
                                <Crown className="w-3 h-3 text-black" />
                             </div>
                           )}
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">{hacker.username}</h3>
                        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
                          <Globe className="w-3 h-3" /> {hacker.country || 'GLOBAL'}
                        </div>
                        <div className="w-full grid grid-cols-2 gap-2">
                           <div className="bg-black/20 rounded-xl p-2 border border-white/5">
                              <p className="text-[8px] font-black text-muted-foreground uppercase">Points</p>
                              <p className="text-sm font-black text-primary">{hacker.points}</p>
                           </div>
                           <div className="bg-black/20 rounded-xl p-2 border border-white/5">
                              <p className="text-[8px] font-black text-muted-foreground uppercase">Badges</p>
                              <p className="text-sm font-black text-foreground">{hacker.badges?.length || 0}</p>
                           </div>
                        </div>
                        <Button variant="ghost" className="mt-6 w-full h-10 rounded-xl text-[10px] uppercase font-black tracking-widest bg-white/5 border border-white/5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary opacity-50 group-hover:opacity-100 transition-all">
                          Intercept ID
                        </Button>
                     </div>
                   </motion.div>
                 ))}
               </div>

               {filteredHackers.length === 0 && (
                 <div className="py-32 text-center border-2 border-dashed border-white/10 rounded-3xl">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                    <h3 className="text-2xl font-bold">No Hackers Located</h3>
                    <p className="text-muted-foreground mt-2">Adjust your parameters to find the target.</p>
                 </div>
               )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* --- Hacker Profile Modal --- */}
      <AnimatePresence>
        {selectedHackerId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHackerId(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="absolute top-6 right-6 z-20">
                <Button variant="ghost" size="icon" onClick={() => setSelectedHackerId(null)} className="rounded-full bg-white/5 hover:bg-white/10">
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>

              {profileLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-24 gap-6">
                   <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                   <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary animate-pulse">Decrypting Identity...</div>
                </div>
              ) : hackerProfile ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12">
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Left Column: ID & Socials */}
                  <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-6">
                    <div className={`w-32 h-32 rounded-[2.5rem] ${hackerProfile.avatarColor || 'bg-primary/20 text-primary'} border-2 border-primary/20 flex items-center justify-center text-4xl font-black shadow-[0_0_50px_rgba(39,97,195,0.2)]`}>
                      {hackerProfile.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{hackerProfile.username}</h2>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Level {Math.floor(hackerProfile.points/100)} Hacker</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {hackerProfile.socialLinks?.github && (
                        <a href={hackerProfile.socialLinks.github} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-white transition-all shadow-xl">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {hackerProfile.socialLinks?.twitter && (
                        <a href={hackerProfile.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-400 hover:text-white transition-all shadow-xl">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {hackerProfile.socialLinks?.linkedin && (
                        <a href={hackerProfile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    <div className="w-full space-y-3 pt-4">
                       <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                          <span className="text-[10px] font-black uppercase text-muted-foreground">Joined</span>
                          <span className="text-xs font-bold">{new Date(hackerProfile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                       </div>
                       <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                          <span className="text-[10px] font-black uppercase text-muted-foreground">Location</span>
                          <span className="text-xs font-bold flex items-center gap-1.5"><Globe className="w-3 h-3 text-primary" /> {hackerProfile.country || 'GLOBAL'}</span>
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Bio & Achievements */}
                  <div className="flex-1 space-y-10">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Tactical Biography</h4>
                      <p className="text-muted-foreground leading-relaxed font-medium">
                        {hackerProfile.bio || "No tactical briefing provided by this operator yet. They prefer working in the shadows."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                             <Zap className="w-4 h-4 text-yellow-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Experience</span>
                          </div>
                          <p className="text-2xl font-black">{hackerProfile.points} <span className="text-xs text-muted-foreground">XP</span></p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                             <Medal className="w-4 h-4 text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Merits</span>
                          </div>
                          <p className="text-2xl font-black">{hackerProfile.badges?.length || 0}</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                             <Target className="w-4 h-4 text-red-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Kills</span>
                          </div>
                          <p className="text-2xl font-black">{hackerProfile.solvedChallenges?.length || 0}</p>
                       </div>
                    </div>

                    {/* Certificates */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Verified Operations (Certificates)</h4>
                      {hackerCerts.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                           <Award className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                           <p className="text-xs text-muted-foreground font-bold">No verified credentials found for this operator.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {hackerCerts.map((cert) => (
                            <div key={cert._id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all flex items-center justify-between gap-4">
                               <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                   <Award className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0">
                                   <h5 className="font-bold text-sm truncate">{cert.achievement}</h5>
                                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ID: {cert.certId}</p>
                                 </div>
                               </div>
                               <Button variant="ghost" size="icon" className="group-hover:text-primary" asChild>
                                 <a href={`/api/certificate?userId=${hackerProfile._id}&achievement=${encodeURIComponent(cert.achievement)}`} download>
                                   <ExternalLink className="w-4 h-4" />
                                 </a>
                               </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Badges Grid */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Achievement Assets</h4>
                      <div className="flex flex-wrap gap-3">
                        {hackerProfile.badges?.map((badge: string, idx: number) => (
                          <div key={idx} className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> {badge}
                          </div>
                        ))}
                        {(!hackerProfile.badges || hackerProfile.badges.length === 0) && (
                          <p className="text-xs text-muted-foreground font-medium">No assets acquired yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : null}

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end gap-4 mt-auto">
                 <Button variant="outline" onClick={() => setSelectedHackerId(null)} className="rounded-xl font-black uppercase tracking-widest text-[10px]">Close Briefing</Button>
                 <Button className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px]">Follow Target</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
