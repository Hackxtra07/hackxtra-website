"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Users, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";

export default function GetStarted() {
  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up for free and choose your learning path",
      icon: Shield,
    },
    {
      number: "02",
      title: "Explore Courses",
      description: "Browse our comprehensive cybersecurity courses",
      icon: BookOpen,
    },
    {
      number: "03",
      title: "Start Learning",
      description: "Begin your journey with interactive lessons",
      icon: Zap,
    },
    {
      number: "04",
      title: "Join Community",
      description: "Connect with other learners and experts",
      icon: Users,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Textured Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, oklch(0.55 0.06 220 / 0.1) 0%, transparent 50%)',
          backgroundSize: '400px 400px',
        }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 80% 80%, oklch(0.65 0.08 230 / 0.08) 0%, transparent 50%)',
          backgroundSize: '500px 500px',
        }} />
      </div>

      <Header />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen pt-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-foreground mb-6">
              Get Started with{" "}
              <span className="text-primary">HackXtras</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Begin your cybersecurity learning journey today. Follow these simple steps to unlock premium courses, labs, and community access.
            </p>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 text-base font-medium group">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Steps Section */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 hover:bg-card/50 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-primary mb-1">
                          {step.number}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
                What You Get
              </h2>
              <p className="text-muted-foreground">
                Everything you need to become a cybersecurity expert
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "100+ Courses", desc: "Comprehensive learning paths" },
                { title: "Live Labs", desc: "Hands-on practice environment" },
                { title: "Expert Community", desc: "Learn from professionals" },
                { title: "Certificates", desc: "Recognized credentials" },
                { title: "24/7 Support", desc: "Always here to help" },
                { title: "Lifetime Access", desc: "Never lose your progress" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                  className="rounded-lg border border-border/30 bg-card/20 p-4 text-center hover:bg-card/40 transition-colors"
                >
                  <h4 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto max-w-2xl text-center rounded-2xl border border-border/50 bg-gradient-to-b from-primary/10 to-primary/5 p-12 backdrop-blur-sm"
          >
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-4">
              Ready to Start?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of learners already mastering cybersecurity on HackXtras
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 font-medium">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="border-border/50 h-11 px-8 font-medium">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
