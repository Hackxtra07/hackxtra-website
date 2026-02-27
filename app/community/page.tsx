"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  MessageSquare,
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  Globe,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Loader } from "@/components/hackxtras/loader";

const communityStats = [
  { icon: Users, value: "50K+", label: "Active Members" },
  { icon: MessageSquare, value: "1M+", label: "Messages Sent" },
  { icon: Trophy, value: "500+", label: "Challenges" },
  { icon: Globe, value: "120+", label: "Countries" },
];

const topContributors = [
  {
    name: "Alex Chen",
    role: "Security Researcher",
    points: 24500,
    avatar: "AC",
  },
  { name: "Sarah Kim", role: "Pentester", points: 22100, avatar: "SK" },
  { name: "Mike Johnson", role: "SOC Analyst", points: 19800, avatar: "MJ" },
  { name: "Emma Wilson", role: "Bug Hunter", points: 18200, avatar: "EW" },
  { name: "David Park", role: "Red Teamer", points: 16900, avatar: "DP" },
];

const upcomingEvents = [
  {
    title: "CTF Competition: Web Hacking",
    date: "Feb 15, 2026",
    time: "2:00 PM UTC",
    participants: 342,
    type: "Competition",
  },
  {
    title: "Live Stream: Malware Analysis",
    date: "Feb 18, 2026",
    time: "6:00 PM UTC",
    participants: 1200,
    type: "Workshop",
  },
  {
    title: "Community Q&A with Core Team",
    date: "Feb 22, 2026",
    time: "4:00 PM UTC",
    participants: 890,
    type: "AMA",
  },
];

const channels = [
  {
    icon: Shield,
    name: "general",
    description: "General discussion about cybersecurity",
    members: 45000,
  },
  {
    icon: Zap,
    name: "ctf-challenges",
    description: "Discuss and collaborate on CTF challenges",
    members: 32000,
  },
  {
    icon: MessageSquare,
    name: "help-desk",
    description: "Get help from community members",
    members: 28000,
  },
];

import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";

export default function CommunityPage() {
  const [config, setConfig] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const leaderboardRef = useRef(null);
  const isLeaderboardInView = useInView(leaderboardRef, {
    once: true,
    margin: "-100px",
  });

  useEffect(() => {
    fetch("/api/community")
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.data);
      })
      .finally(() => setLoading(false));

    fetch("/api/badges")
      .then(res => res.json())
      .then(data => {
        setBadges(Array.isArray(data) ? data : (data.data || []));
      })
      .catch(err => console.error("Failed to fetch badges", err));
  }, []);

  const getIcon = (iconInput: any) => {
    if (!iconInput) return <LucideIcons.HelpCircle className="h-5 w-5" />;

    if (typeof iconInput === 'string') {
      const Icon = (LucideIcons as any)[iconInput] || LucideIcons.HelpCircle;
      return <Icon className="h-5 w-5" />;
    }

    // If it's already a component
    const Icon = iconInput;
    return <Icon className="h-5 w-5" />;
  };

  const stats = config?.stats || communityStats;
  const contributors = config?.topContributors || topContributors;
  const events = config?.upcomingEvents || upcomingEvents;
  const popularChannels = config?.popularChannels || channels;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center pt-32"><Loader /></div>;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Textured Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Techy Grid Pattern Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
        }} />
        {/* Tech nodes/dots */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #2761c3 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 opacity-60" style={{
          background: 'radial-gradient(circle, oklch(0.55 0.06 220 / 1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 opacity-50" style={{
          background: 'radial-gradient(circle, oklch(0.65 0.08 230 / 1) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }} />
        {/* Glassy Edge Effect */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(20, 20, 40, 0.3) 100%)',
          backdropFilter: 'blur(0.5px)',
        }} />
        {/* Top glassy edge */}
        <div className="absolute top-0 left-0 right-0 h-32" style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 100%)',
          backdropFilter: 'blur(0.5px)',
        }} />
        {/* Border frame effect */}
        <div className="absolute inset-0 border border-blue-500/10 rounded-3xl" />
      </div>
      <Header />

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Page Header */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={
              isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <span className="font-mono text-sm uppercase tracking-wider text-primary">
              Connect & collaborate
            </span>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Community
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Join a global network of security professionals, enthusiasts, and
              learners. Share knowledge, solve challenges together, and grow
              your career in cybersecurity.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat: any) => (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-card/30 p-6 text-center"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  {getIcon(stat.icon)}
                </div>
                <div className="font-display text-2xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Leaderboard */}
            <motion.div
              ref={leaderboardRef}
              initial={{ opacity: 0, y: 30 }}
              animate={
                isLeaderboardInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-1"
            >
              <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-lg font-medium text-foreground">
                    Top Contributors
                  </h2>
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-4">
                  {contributors.map((user: any, index: number) => (
                    <div
                      key={user.name}
                      className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-medium text-foreground">
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-primary">
                        {user.points?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-border/50 bg-transparent hover:bg-muted"
                  asChild
                >
                  <Link href="/leaderboard">
                    View Full Leaderboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Events & Channels */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8 lg:col-span-2"
            >
              {/* Upcoming Events */}
              <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-lg font-medium text-foreground">
                    Upcoming Events
                  </h2>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-4">
                  {events.map((event: any) => (
                    <div
                      key={event.title}
                      className="flex flex-col gap-3 rounded-lg border border-border/30 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <span className="mb-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {event.type}
                        </span>
                        <h3 className="font-medium text-foreground">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {event.date} at {event.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <LucideIcons.Users className="h-3.5 w-3.5" />
                          {event.participants}
                        </span>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-lg font-medium text-foreground">
                    Popular Channels
                  </h2>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-3">
                  {popularChannels.map((channel: any) => (
                    <div
                      key={channel.name}
                      className="group flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                        {getIcon(channel.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          #{channel.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(channel.members / 1000).toFixed(0)}K members
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-border/50 bg-transparent hover:bg-muted"
                  asChild
                >
                  <Link href="/channels">
                    Browse All Channels
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Badges Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-medium text-foreground">
                      Custom Badges
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Earn these badges by completing specific requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {badges.length > 0 ? (
                  badges.map((badge: any) => (
                    <div key={badge._id} className="group relative flex flex-col gap-4 rounded-xl border border-border/40 bg-background/50 p-6 transition-all hover:bg-muted/30 hover:shadow-md hover:border-primary/20">
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                          {getIcon(badge.icon || 'Award')}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground tracking-tight">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-3">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-xl bg-background/30">
                    <Trophy className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground font-medium">No custom badges available yet.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Check back later for new challenges!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
