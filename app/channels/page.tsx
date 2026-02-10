"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Youtube,
  Twitter,
  Linkedin,
  Github,
  MessageCircle,
  Users,
  Video,
  Play,
  ExternalLink,
  Bell,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";

interface Channel {
  _id: string;
  name: string;
  description: string;
  url?: string;
  handle?: string;
  type?: string;
  followers?: string;
  icon?: any;
  color?: string;
  link?: string;
}

const socialChannels = [
  {
    icon: Youtube,
    name: "YouTube",
    handle: "@HackXtras",
    followers: "125K",
    description: "Weekly tutorials, walkthroughs, and security news. Join our growing community of learners.",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    link: "#",
  },
  {
    icon: Twitter,
    name: "Twitter / X",
    handle: "@HackXtras",
    followers: "180K",
    description:
      "Daily security news, tips, memes, and community highlights. Join the conversation.",
    color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    link: "#",
  },
  {
    icon: MessageCircle,
    name: "Discord",
    handle: "HackXtras Community",
    followers: "50K",
    description:
      "Our main community hub. Get help, share resources, and collaborate on challenges.",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    link: "#",
  },
  {
    icon: Linkedin,
    name: "LinkedIn",
    handle: "HackXtras",
    followers: "85K",
    description:
      "Professional updates, career advice, and industry insights for security professionals.",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    link: "#",
  },
  {
    icon: Github,
    name: "GitHub",
    handle: "HackXtras",
    followers: "35K",
    description:
      "Open-source tools, lab environments, and educational resources. Contributions welcome.",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    link: "#",
  },
];

const recentVideos = [
  {
    title: "Breaking into Bug Bounty: Complete Beginner Guide",
    views: "125K",
    duration: "45:32",
    thumbnail: "BB",
    date: "3 days ago",
  },
  {
    title: "HTB Walkthrough: Exploiting Active Directory",
    views: "89K",
    duration: "1:12:45",
    thumbnail: "AD",
    date: "1 week ago",
  },
  {
    title: "Web Application Firewall Bypass Techniques",
    views: "156K",
    duration: "38:20",
    thumbnail: "WF",
    date: "2 weeks ago",
  },
];

const communityStats = [
  { icon: Users, value: "500K+", label: "Total Followers" },
  { icon: Video, value: "500+", label: "Video Tutorials" },
  { icon: Heart, value: "2M+", label: "Engagement Monthly" },
  { icon: Bell, value: "Daily", label: "Content Updates" },
];

function ChannelCard({
  channel,
  index,
}: {
  channel: (typeof socialChannels)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${channel.color}`}
        >
          <channel.icon className="h-6 w-6" />
        </div>
        <span className="font-mono text-sm font-medium text-foreground">
          {channel.followers}
        </span>
      </div>

      <h3 className="font-display mt-4 text-lg font-medium text-foreground">
        {channel.name}
      </h3>
      <p className="text-sm text-muted-foreground">{channel.handle}</p>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {channel.description}
      </p>

      <a
        href={channel.link}
        className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-transparent py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Follow Us
        <ExternalLink className="h-4 w-4" />
      </a>
    </motion.div>
  );
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<typeof socialChannels>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading since we are using static data for now
    const timer = setTimeout(() => {
      setChannels(socialChannels);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          data: { email },
        }),
      });

      if (res.ok) {
        toast({
          title: "Successfully Subscribed!",
          description: "Welcome to our community. We'll be in touch soon.",
        });
        setEmail("");
      } else {
        throw new Error("Failed to subscribe");
      }
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
              Stay connected
            </span>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Our Channels
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Follow us across platforms for the latest tutorials, security
              news, community updates, and exclusive content. Join our growing
              global community.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {communityStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-card/30 p-6 text-center"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
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

          {/* Social Channels Grid */}
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading channels...</p>
              </div>
            </div>
          )}

          {/* Channels Grid */}
          {!loading && channels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="font-display mb-8 text-2xl font-semibold text-foreground">
                Our Channels
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {channels.map((channel, index) => (
                  <ChannelCard key={channel.name} channel={channel} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Featured Content - YouTube */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                  <Youtube className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-medium text-foreground">
                    Latest from YouTube
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    New videos every week
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden border-border/50 bg-transparent hover:bg-muted sm:flex"
              >
                View Channel
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {recentVideos.map((video, index) => (
                <motion.div
                  key={video.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted">
                    <span className="text-2xl font-semibold text-muted-foreground">
                      {video.thumbnail}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Play className="h-5 w-5 ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-xs font-medium text-foreground">
                      {video.duration}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                    {video.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {video.views} views - {video.date}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12"
          >
            <Bell className="mx-auto h-10 w-10 text-primary" />
            <h2 className="font-display mt-4 text-2xl font-semibold text-foreground">
              Never Miss an Update
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Subscribe to our newsletter for weekly security tips, exclusive
              content, and early access to new courses.
            </p>
            <form onSubmit={handleSubscribe} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
