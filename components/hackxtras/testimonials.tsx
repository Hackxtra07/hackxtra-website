"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import { useProStatus } from "@/hooks/use-pro-status";

const testimonials = [
  {
    quote:
      "HackXtras transformed my career. The hands-on labs gave me the practical skills I needed to land my dream security role.",
    author: "Sarah Chen",
    role: "Security Engineer at Cloudflare",
    avatar: "SC",
  },
  {
    quote:
      "The depth and quality of content is unmatched. I've tried many platforms, but HackXtras is on another level entirely.",
    author: "Marcus Williams",
    role: "Penetration Tester",
    avatar: "MW",
  },
  {
    quote:
      "As a self-taught developer, the secure coding courses helped me understand vulnerabilities I never knew existed.",
    author: "Alex Rivera",
    role: "Full-Stack Developer",
    avatar: "AR",
  },
];

function TestimonialCard({
  testimonial,
  index,
  isPro,
}: {
  testimonial: (typeof testimonials)[0];
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
      className={`group relative rounded-xl border ${isPro ? 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-border/50 bg-card/50 hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(39,97,195,0.2)]'} p-8 backdrop-blur-sm transition-all duration-200`}
    >
      <Quote className={`mb-4 h-8 w-8 ${isPro ? 'text-yellow-500/30' : 'text-primary/30'}`} />
      <p className={`text-base leading-relaxed ${isPro ? 'text-yellow-50/90' : 'text-foreground/90'}`}>
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isPro ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 'bg-primary/10 text-primary'} text-sm font-medium`}>
          {testimonial.avatar}
        </div>
        <div>
          <p className={`text-sm font-medium ${isPro ? 'text-yellow-50' : 'text-foreground'}`}>{testimonial.author}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const isPro = useProStatus();

  return (
    <section id="community" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className={`font-mono text-sm uppercase tracking-wider ${isPro ? 'text-yellow-500' : 'text-primary'}`}>
            Community
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trusted by security professionals
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground" ref={containerRef}>
            Join thousands of developers and security experts who have advanced
            their careers with HackXtras.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              testimonial={testimonial}
              index={index}
              isPro={isPro}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
