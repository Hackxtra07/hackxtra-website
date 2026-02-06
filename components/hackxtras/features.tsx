"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Terminal, Lock, Code, Zap, Users } from "lucide-react";
import { useProStatus } from "@/hooks/use-pro-status";

const features = [
  {
    icon: Shield,
    title: "Defensive Security",
    description:
      "Learn to build robust defenses against modern threats with enterprise-grade techniques.",
  },
  {
    icon: Terminal,
    title: "Penetration Testing",
    description:
      "Master ethical hacking methodologies used by security professionals worldwide.",
  },
  {
    icon: Lock,
    title: "Cryptography",
    description:
      "Deep dive into encryption, authentication, and secure communication protocols.",
  },
  {
    icon: Code,
    title: "Secure Development",
    description:
      "Write bulletproof code with security-first practices and vulnerability prevention.",
  },
  {
    icon: Zap,
    title: "Incident Response",
    description:
      "Develop rapid response capabilities to detect, contain, and recover from breaches.",
  },
  {
    icon: Users,
    title: "Security Culture",
    description:
      "Build and lead security-aware teams with effective policies and training programs.",
  },
];

function FeatureCard({
  feature,
  index,
  isPro,
}: {
  feature: (typeof features)[0];
  index: number;
  isPro?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative rounded-xl border ${isPro ? 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-border/50 bg-card/50 hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(39,97,195,0.2)]'} p-6 backdrop-blur-sm transition-all duration-200 hover:bg-card`}
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${isPro ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-primary/10 border-primary/20 text-primary'} border transition-colors duration-300 group-hover:bg-primary/15`}>
        <feature.icon className="h-5 w-5" />
      </div>
      <h3 className={`font-display text-lg font-medium ${isPro ? 'text-yellow-50' : 'text-foreground'}`}>
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function Features() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const isPro = useProStatus();

  return (
    <section id="courses" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-2xl"
        >
          <span className={`font-mono text-sm uppercase tracking-wider ${isPro ? 'text-yellow-500' : 'text-primary'}`}>
            What you&apos;ll learn
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Comprehensive security training
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            From foundational concepts to advanced techniques, our curriculum
            covers every aspect of modern cybersecurity.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} isPro={isPro} />
          ))}
        </div>
      </div>
    </section>
  );
}
