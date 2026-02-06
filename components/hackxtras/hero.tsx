"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Crown } from "lucide-react";
import { useProStatus } from "@/hooks/use-pro-status";

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  const isPro = useProStatus();

  return (
    <section className="relative min-h-screen overflow-hidden pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {isPro && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-xs font-bold text-yellow-500 backdrop-blur-sm animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Crown className="h-3 w-3" />
                <span>PREMIUM PRO CONTENT UNLOCKED</span>
              </div>
            )}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>Next-generation security training</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-balance">
              Master the art of{" "}
              <span className={isPro ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" : "text-primary"}>
                cybersecurity
              </span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
          >
            An elite platform designed for developers and security enthusiasts.
            Build real-world skills through hands-on labs, expert-led courses,
            and a community of like-minded professionals.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="group bg-primary text-primary-foreground hover:bg-primary/90">
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 bg-transparent text-foreground hover:bg-muted"
            >
              Explore Courses
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 gap-8 border-t border-border/30 pt-10 sm:grid-cols-4 md:gap-16"
          >
            {[
              { value: "50K+", label: "Active learners" },
              { value: "200+", label: "Expert courses" },
              { value: "500+", label: "Hands-on labs" },
              { value: "98%", label: "Success rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
