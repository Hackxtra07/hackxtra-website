"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Terminal,
  Server,
  Network,
  Database,
  Bug,
  Wifi,
  Play,
  Clock,
  Users,
  Trophy,
  Search,
  Lock,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Loader } from "@/components/hackxtras/loader";
import { TerminalCard } from "@/components/hackxtras/terminal-card";
import Image from "next/image";
import Link from "next/link";
import { useProStatus } from "@/hooks/use-pro-status";

interface Lab {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  duration?: string;
  category?: string;
  points?: number;
  instructions?: string;
  url?: string;
  coverImage?: string;
  isPremium?: boolean;
}

const iconMap: Record<string, any> = {
  Terminal,
  Server,
  Network,
  Database,
  Bug,
  Wifi,
};

function LabCard({ lab, index }: { lab: Lab; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-500/10 text-green-400 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("sql")) return Terminal;
    if (title.toLowerCase().includes("privilege")) return Server;
    if (title.toLowerCase().includes("packet") || title.toLowerCase().includes("network")) return Network;
    if (title.toLowerCase().includes("database")) return Database;
    if (title.toLowerCase().includes("web")) return Bug;
    if (title.toLowerCase().includes("network")) return Wifi;
    return Terminal;
  };

  const IconComponent = getIcon(lab.title);

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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-green-500/60 hover:bg-card hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    >
      {/* Image Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/50 border-b border-border/30">
        {lab.coverImage ? (
          <Image
            src={lab.coverImage}
            alt={lab.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background to-muted">
            <IconComponent className="h-10 w-10 text-green-500/40" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${difficultyColors[lab.difficulty] || difficultyColors.Easy}`}
          >
            {lab.difficulty}
          </span>
        </div>
        {lab.isPremium && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 backdrop-blur-md shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              <Crown className="h-3 w-3" />
              PREMIUM
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 group-hover:bg-green-500/15">
            <IconComponent className="h-5 w-5" />
          </div>
        </div>

        <h3 className="font-display mt-5 text-xl font-medium text-foreground">
          {lab.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {lab.description}
        </p>

        {lab.category && (
          <div className="mt-4 inline-block">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
              {lab.category}
            </span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4 border-t border-border/30 pt-4 text-xs text-muted-foreground">
          {lab.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {lab.duration}
            </span>
          )}
          {lab.points && (
            <span className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              {lab.points} pts
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-4 group/btn text-green-400 hover:bg-green-500/10 hover:text-green-300 w-full"
          onClick={() => {
            if (lab.url) {
              window.open(lab.url, '_blank');
            } else {
              alert("No lab URL specified. Please contact admin.");
            }
          }}
        >
          <Play className="mr-2 h-3.5 w-3.5" />
          Start Lab
        </Button>
      </div>
    </motion.div >
  );
}

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isPro = useProStatus();

  useEffect(() => {
    const checkAuth = () => {
      const userToken = localStorage.getItem('userToken');
      const adminToken = localStorage.getItem('adminToken');
      setIsAuthenticated(!!userToken || !!adminToken);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const fetchLabs = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const response = await fetch("/api/labs");
        if (!response.ok) {
          throw new Error(`Failed to fetch labs: ${response.statusText}`);
        }
        const data = await response.json();
        setLabs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (showLoading) {
          setError(err instanceof Error ? err.message : "Failed to load labs");
          setLabs([]);
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchLabs();

    // Set up polling interval (30 seconds)
    const interval = setInterval(() => fetchLabs(false), 30000);

    return () => clearInterval(interval);
  }, []); // Remove isAuthenticated dependency to fetch for guests too


  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Hide premium content from non-pro users
    if (lab.isPremium && !isPro) return false;

    return true;
  });

  return (
    <div className="relative min-h-screen bg-background">
      {/* Textured Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Techy Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent)
          `,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Tech nodes/dots */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #2761c3 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute -top-40 -right-40 w-96 h-96 opacity-60"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.06 220 / 1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 opacity-50"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.08 230 / 1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        {/* Glassy Edge Effect */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(20, 20, 40, 0.3) 100%)",
            backdropFilter: "blur(0.5px)",
          }}
        />
        {/* Top glassy edge */}
        <div
          className="absolute top-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 100%)",
            backdropFilter: "blur(0.5px)",
          }}
        />
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
              Hands-on practice
            </span>
            <div className="mt-3 flex flex-col md:flex-row justify-between gap-6 md:items-end">
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Hacking Labs
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Real-world scenarios with actual vulnerable applications. Build practical
                  penetration testing skills in a safe, isolated environment.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search labs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
              <p>Error: {error}</p>
            </div>
          )}

          {/* Labs Grid or Auth/Premium Prompt */}
          {!loading && filteredLabs.length === 0 && labs.some(l => l.isPremium) && !isPro ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Crown className="h-10 w-10 text-yellow-500" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Premium Labs Available</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Interactive hacking labs are an exclusive feature for our Premium members. Upgrade to get hands-on experience in isolated environments.
              </p>
              <div className="flex gap-4">
                <Link href="/pricing">
                  <Button className="min-w-[160px] bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-400 hover:to-amber-500 border-0 shadow-lg shadow-yellow-500/20">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Labs Grid */}
              {!loading && filteredLabs.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLabs.map((lab, index) => (
                    <LabCard key={lab._id} lab={lab} index={index} />
                  ))}
                </div>
              )}

              {/* Empty Search State */}
              {!loading && filteredLabs.length === 0 && labs.length > 0 && (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground">No labs found matching "{searchQuery}"</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && labs.length === 0 && !error && isAuthenticated && (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground">No labs available yet.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
