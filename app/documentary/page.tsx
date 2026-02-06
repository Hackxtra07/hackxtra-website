"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Film,
  Star,
  Clock,
  Award,
  Share2,
  ThumbsUp,
  Info,
  Calendar,
  Quote,
  ChevronRight,
  ExternalLink,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";

interface Documentary {
  _id: string;
  title: string;
  description: string;
  duration?: string;
  releaseDate?: string;
  rating?: string;
  views?: string;
  url?: string;
  category?: string;
  thumbnail?: string;
  featured?: boolean;
  tags?: string[];
  episodes?: { title: string; duration: string }[];
}

const testimonials = [
  {
    quote:
      "The most authentic portrayal of cybersecurity I have ever seen on screen. This should be required viewing for anyone interested in the field.",
    author: "Alex Stamos",
    role: "Former CSO, Facebook",
  },
  {
    quote:
      "HackXtras has done what Hollywood could not - show the real, fascinating world of ethical hacking without the dramatization.",
    author: "Katie Moussouris",
    role: "Founder, Luta Security",
  },
  {
    quote:
      "An incredible resource that inspires the next generation of security professionals. Beautifully produced and technically accurate.",
    author: "Troy Hunt",
    role: "Creator, Have I Been Pwned",
  },
];

const stats = [
  { icon: Film, value: "3", label: "Documentary Series" },
  { icon: Users, value: "5M+", label: "Total Views" },
  { icon: Award, value: "12", label: "Industry Awards" },
  { icon: Clock, value: "8+", label: "Hours of Content" },
];

function DocumentaryCard({
  documentary,
  index,
}: {
  documentary: Documentary;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showEpisodes, setShowEpisodes] = useState(false);

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
      className="group overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {documentary.thumbnail && documentary.thumbnail.startsWith('/') ? (
          <Image src={documentary.thumbnail} alt={documentary.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-muted-foreground/50">
              {documentary.title.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110">
            <Play className="h-7 w-7 ml-1" />
          </button>
        </div>
        {documentary.featured && (
          <span className="absolute top-4 left-4 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            Featured
          </span>
        )}
        {documentary.duration && (
          <span className="absolute bottom-4 right-4 rounded bg-background/80 px-2 py-1 text-xs font-medium text-foreground">
            {documentary.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
          {documentary.releaseDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(documentary.releaseDate).getFullYear()}
            </span>
          )}
          {documentary.rating && (
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {documentary.rating}/5
            </span>
          )}
          {documentary.category && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              {documentary.category}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-medium text-foreground">
          {documentary.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {documentary.description}
        </p>

        {documentary.episodes && (
          <div className="mt-4">
            <button
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {showEpisodes ? "Hide" : "Show"} Episodes
              <ChevronRight
                className={`h-4 w-4 transition-transform ${showEpisodes ? "rotate-90" : ""}`}
              />
            </button>
            {showEpisodes && (
              <div className="mt-3 space-y-2 rounded-lg border border-border/30 bg-muted/30 p-3">
                {documentary.episodes.map((episode, i) => (
                  <div
                    key={episode.title}
                    className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted/50"
                  >
                    <span className="text-foreground">{episode.title}</span>
                    <span className="text-muted-foreground">
                      {episode.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="mr-2 h-4 w-4" />
            Watch Now
          </Button>
          <Button
            variant="outline"
            className="border-border/50 bg-transparent hover:bg-muted"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function DocumentaryPage() {
  const [docs, setDocs] = useState<Documentary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch('/api/documentaries');
        if (res.ok) {
          const data = await res.json();
          setDocs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

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
              Original content
            </span>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Documentary
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Explore the world of cybersecurity through our award-winning
              documentaries. Real stories, real hackers, real impact.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
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

          {/* All Documentaries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="font-display mb-8 text-2xl font-semibold text-foreground">
              Documentaries
            </h2>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  <p className="mt-4 text-muted-foreground">Loading documentaries...</p>
                </div>
              </div>
            )}

            {/* Documentaries Grid */}
            {!loading && docs.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc, index) => (
                  <DocumentaryCard key={doc._id} documentary={doc} index={index} />
                ))}
              </div>
            )}
            {!loading && docs.length === 0 && (
              <div className="text-center text-muted-foreground py-10">No documentaries found.</div>
            )}
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-xl border border-border/50 bg-card/50 p-8 sm:p-12"
          >
            <div className="mb-8 flex items-center gap-3">
              <Quote className="h-6 w-6 text-primary" />
              <h2 className="font-display text-xl font-medium text-foreground">
                What Industry Leaders Say
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="rounded-lg border border-border/30 bg-muted/30 p-6"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-border/30 pt-4">
                    <p className="font-medium text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
