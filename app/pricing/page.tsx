"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Zap, Crown } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #eab308 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <Header />

            <main className="relative z-10 pt-32 pb-24 px-6">
                <div className="mx-auto max-w-7xl">

                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                                Unlock Your <span className="text-yellow-500">Full Potential</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
                                Choose the plan that fits your journey. From mastering the basics to becoming a cybersecurity expert.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">

                        {/* Free Tier */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">Community</h3>
                            </div>
                            <p className="text-muted-foreground mb-6">Perfect for beginners starting their journey.</p>
                            <div className="text-4xl font-bold mb-8">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>

                            <ul className="space-y-4 mb-8">
                                {[
                                    "Access to basic courses",
                                    "Community Discord access",
                                    "Public CTF challenges",
                                    "Basic profile stats"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                                {[
                                    "Advanced Lab environments",
                                    "Pro-only CTF Competitions",
                                    "Verified Certificates",
                                    "Priority Support"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-muted-foreground/50">
                                        <X className="w-5 h-5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button variant="outline" className="w-full text-lg h-12" asChild>
                                <Link href="/signup">Get Started Free</Link>
                            </Button>
                        </motion.div>

                        {/* Pro Tier */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="relative p-8 rounded-3xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-transparent backdrop-blur-sm shadow-2xl shadow-yellow-500/10 scale-105"
                        >
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                                {/* <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-50" /> */}
                            </div>

                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black border-none px-4 py-1 text-sm font-bold shadow-lg">
                                    MOST POPULAR
                                </Badge>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-500">
                                    <Crown className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">HackXtras Pro</h3>
                            </div>
                            <p className="text-muted-foreground mb-6">For serious learners and professionals.</p>
                            <div className="text-4xl font-bold mb-8">$19<span className="text-lg font-normal text-muted-foreground">/mo</span></div>

                            <ul className="space-y-4 mb-8">
                                {[
                                    "Everything in Community",
                                    "Unlimited Private Labs",
                                    "Exclusive Pro-only CTFs",
                                    "Professional Certificates",
                                    "Hardware Hacking Tutorials",
                                    "Priority Instructor Support",
                                    "Exclusive 'Pro' Badge"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium">
                                        <div className="p-0.5 rounded-full bg-yellow-500/20 text-yellow-600">
                                            <Check className="w-4 h-4 shrink-0" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button className="w-full text-lg h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold" asChild>
                                <Link href="/contact">Upgrade to Pro</Link>
                            </Button>
                            <p className="text-xs text-center mt-3 text-muted-foreground">
                                Questions? <Link href="/contact" className="underline hover:text-foreground">Contact our support team</Link>
                            </p>
                        </motion.div>

                    </div>

                    {/* FAQ Section */}
                    <div className="mt-32 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {[
                                { q: "Can I cancel anytime?", a: "Yes! There are no lock-in contracts. You can cancel your subscription at any time via your settings." },
                                { q: "Do you offer student discounts?", a: "Absolutely. Students with a valid .edu email get 50% off. Contact us for details." },
                                { q: "What happens to my progress if I downgrade?", a: "You keep all your badges and completed course history. You just lose access to Pro-exclusive content." },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-xl border border-border/50 bg-card/30">
                                    <h3 className="font-bold text-lg mb-2">{item.q}</h3>
                                    <p className="text-muted-foreground">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
