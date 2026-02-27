"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Users,
  Code,
  Globe,
  Award,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import Link from "next/link";
import Image from "next/image";

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  email: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const teamStats = [
  { icon: Users, value: "15+", label: "Core Contributors" },
  { icon: Code, value: "100+", label: "Open Source Projects" },
  { icon: Globe, value: "50+", label: "Countries Represented" },
  { icon: Award, value: "12", label: "Industry Awards" },
];

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(39,97,195,0.15)]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-primary/20 bg-muted transition-colors group-hover:border-primary/50">
          {member.image && member.image.startsWith('/') ? (
            <Image src={member.image} alt={member.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <span className="text-3xl font-bold">{member.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
        <p className="mb-3 text-sm font-medium text-primary">{member.role}</p>

        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>

        <div className="mt-auto flex gap-3">
          {member.socialLinks?.twitter && (
            <Link href={member.socialLinks.twitter} className="text-muted-foreground transition-colors hover:text-primary">
              <Twitter className="h-4 w-4" />
            </Link>
          )}
          {member.socialLinks?.github && (
            <Link href={member.socialLinks.github} className="text-muted-foreground transition-colors hover:text-primary">
              <Github className="h-4 w-4" />
            </Link>
          )}
          {member.socialLinks?.linkedin && (
            <Link href={member.socialLinks.linkedin} className="text-muted-foreground transition-colors hover:text-primary">
              <Linkedin className="h-4 w-4" />
            </Link>
          )}
          <a href={`mailto:${member.email}`} className="text-muted-foreground transition-colors hover:text-primary">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamPage() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<any[]>(teamStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/team');
        if (response.ok) {
          const resData = await response.json();
          const membersData = resData.data || (Array.isArray(resData) ? resData : []);
          setMembers(membersData);

          if (resData.stats) {
            // Map icons back to stats from API
            const mappedStats = resData.stats.map((s: any) => {
              const original = teamStats.find(os => os.label === s.label);
              return { ...s, icon: original?.icon || Users };
            });
            setStats(mappedStats);
          }
        }
      } catch (error) {
        console.error("Failed to fetch team", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #2761c3 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <Header />

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Hero Section */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="mb-20 text-center"
          >
            <span className="font-mono text-sm uppercase tracking-wider text-primary">
              The Minds Behind the Mission
            </span>
            <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Meet the Team
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              We are a diverse group of security researchers, engineers, and
              educators united by a single goal: to make the digital world safer
              for everyone.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <div className="mb-24 grid grid-cols-2 gap-8 border-y border-border/50 py-12 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {/* @ts-ignore */}
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Team Grid */}
          <div className="mb-16">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Leadership & Core Team</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((member, index) => (
                  <TeamCard key={member._id} member={member} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Join Us CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-foreground">Join Our Mission</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              We're always looking for talented individuals to join our team. If you're passionate about cybersecurity and education, we'd love to hear from you.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/team/join">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  View Open Positions
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
