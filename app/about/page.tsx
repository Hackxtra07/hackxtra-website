"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Target,
  Heart,
  Zap,
  Users,
  Globe,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import Link from "next/link";

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "500+", label: "Courses & Labs" },
  { value: "120+", label: "Countries Reached" },
  { value: "95%", label: "Success Rate" },
];

const values = [
  {
    icon: Shield,
    title: "Security First",
    description:
      "We believe everyone deserves access to quality cybersecurity education. Our mission is to democratize security knowledge.",
  },
  {
    icon: Target,
    title: "Practical Learning",
    description:
      "Theory is important, but practice makes perfect. Our hands-on labs simulate real-world scenarios for effective skill building.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description:
      "Learning is better together. We foster a supportive community where members help each other grow and succeed.",
  },
  {
    icon: Zap,
    title: "Always Evolving",
    description:
      "Cybersecurity never stands still, and neither do we. We continuously update our content to reflect the latest threats and techniques.",
  },
];

const milestones = [
  {
    year: "2019",
    title: "The Beginning",
    description:
      "HackXtras started as a YouTube channel with simple security tutorials.",
  },
  {
    year: "2020",
    title: "Community Growth",
    description:
      "Launched Discord community, reaching 10K members within months.",
  },
  {
    year: "2021",
    title: "Platform Launch",
    description:
      "Introduced interactive labs and structured learning paths for serious learners.",
  },
  {
    year: "2022",
    title: "Global Expansion",
    description:
      "Content localized in 12 languages, serving learners across 100+ countries.",
  },
  {
    year: "2023",
    title: "Industry Recognition",
    description:
      "Won multiple awards for cybersecurity education excellence.",
  },
  {
    year: "2024",
    title: "Documentary Release",
    description:
      "Launched original documentary series showcasing real security professionals.",
  },
  {
    year: "2025",
    title: "AI-Powered Learning",
    description:
      "Introduced personalized learning paths powered by AI technology.",
  },
];

const partners = [
  "Microsoft",
  "AWS",
  "Google Cloud",
  "HackerOne",
  "Bugcrowd",
  "SANS Institute",
];

export default function AboutPage() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const missionRef = useRef(null);
  const isMissionInView = useInView(missionRef, {
    once: true,
    margin: "-100px",
  });

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
            className="mb-16 text-center"
          >
            <span className="font-mono text-sm uppercase tracking-wider text-primary">
              Our Story
            </span>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              About HackXtras
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Empowering the next generation of cybersecurity professionals
              through world-class education, hands-on labs, and a supportive
              global community.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/50 bg-card/30 p-6 text-center"
              >
                <div className="font-display text-3xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Mission Section */}
          <motion.div
            ref={missionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={
              isMissionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20 grid items-center gap-12 lg:grid-cols-2"
          >
            <div>
              <span className="font-mono text-sm uppercase tracking-wider text-primary">
                Our Mission
              </span>
              <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
                Making Cybersecurity Accessible to Everyone
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                In a world where digital threats are constantly evolving, we
                believe that quality cybersecurity education should not be
                limited by geography, background, or financial constraints.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                HackXtras was founded with a simple mission: to provide
                practical, hands-on security training that prepares learners for
                real-world challenges. From beginners taking their first steps
                in security to professionals looking to sharpen their skills, we
                have something for everyone.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Free foundational courses for all",
                  "Hands-on labs that simulate real attacks",
                  "Industry-recognized certifications",
                  "Mentorship from security professionals",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex aspect-square items-center justify-center rounded-xl border border-border/50 bg-card/50">
                  <Users className="h-16 w-16 text-primary/50" />
                </div>
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border/50 bg-card/50">
                  <Globe className="h-12 w-12 text-primary/50" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border/50 bg-card/50">
                  <Award className="h-12 w-12 text-primary/50" />
                </div>
                <div className="flex aspect-square items-center justify-center rounded-xl border border-border/50 bg-card/50">
                  <BookOpen className="h-16 w-16 text-primary/50" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <div className="mb-10 text-center">
              <span className="font-mono text-sm uppercase tracking-wider text-primary">
                What We Stand For
              </span>
              <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
                Our Core Values
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="rounded-xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border hover:bg-card"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-20"
          >
            <div className="mb-10 text-center">
              <span className="font-mono text-sm uppercase tracking-wider text-primary">
                Our Journey
              </span>
              <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
                Key Milestones
              </h2>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 h-full w-px bg-border/50 md:left-1/2 md:-translate-x-px" />

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className={`relative flex items-center gap-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`hidden flex-1 md:block ${index % 2 === 0 ? "text-right" : "text-left"}`}
                    >
                      <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                        <span className="font-mono text-sm text-primary">
                          {milestone.year}
                        </span>
                        <h3 className="font-display mt-1 font-medium text-foreground">
                          {milestone.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    {/* Circle */}
                    <div className="absolute left-4 z-10 flex h-3 w-3 items-center justify-center rounded-full bg-primary md:static md:h-4 md:w-4" />

                    <div className="flex-1 pl-10 md:hidden">
                      <span className="font-mono text-sm text-primary">
                        {milestone.year}
                      </span>
                      <h3 className="font-display mt-1 font-medium text-foreground">
                        {milestone.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>

                    <div className="hidden flex-1 md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Partners */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-20 text-center"
          >
            <span className="font-mono text-sm uppercase tracking-wider text-primary">
              Trusted By
            </span>
            <h2 className="font-display mt-3 text-2xl font-semibold text-foreground">
              Our Partners
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {partners.map((partner) => (
                <div
                  key={partner}
                  className="rounded-lg border border-border/30 bg-card/30 px-8 py-4 text-lg font-medium text-muted-foreground"
                >
                  {partner}
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of learners who have transformed their careers
              through HackXtras. Start with our free courses today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/team">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/50 bg-transparent hover:bg-muted"
                >
                  Meet the Team
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
