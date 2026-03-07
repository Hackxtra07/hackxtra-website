"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Crown } from "lucide-react";
import { useProStatus } from "@/hooks/use-pro-status";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  const { isPro, isAuthenticated } = useProStatus();

  return (
    <section className="relative min-h-screen overflow-hidden pt-24 md:pt-32">
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-[10px] sm:text-xs font-bold text-yellow-500 backdrop-blur-sm animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Crown className="h-3 w-3" />
                <span>PREMIUM PRO CONTENT UNLOCKED</span>
              </div>
            )}
            <div className="mb-6 md:mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm">
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
            className="font-display max-w-4xl text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
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
            className="mt-6 max-w-2xl text-balance text-sm sm:text-lg md:text-xl leading-relaxed text-muted-foreground"
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
            className="mt-8 md:mt-10 flex flex-col items-center gap-4 sm:flex-row w-full sm:w-auto px-4 sm:px-0"
          >
            <Link href={isPro ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className={cn(
                  "w-full group transition-all duration-300",
                  isPro
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)] border-none"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isPro ? (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Access Premium Dashboard
                  </>
                ) : (
                  <>
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </Link>
            <Link href="/courses" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-border/50 bg-transparent text-foreground hover:bg-muted"
              >
                Explore Courses
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 md:mt-20 grid grid-cols-2 gap-y-10 gap-x-4 sm:gap-8 border-t border-border/30 pt-10 sm:grid-cols-4 md:gap-16 w-full"
          >
            {[
              { value: "50K+", label: "Active learners" },
              { value: "200+", label: "Expert courses" },
              { value: "500+", label: "Hands-on labs" },
              { value: "98%", label: "Success rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-1">
                <div className="font-display text-xl font-semibold text-foreground sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] sm:text-sm uppercase tracking-wider text-muted-foreground/70">{stat.label}</div>
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
