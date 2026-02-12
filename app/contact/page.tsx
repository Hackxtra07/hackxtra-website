"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, MapPin, Send, Github, Twitter, Linkedin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { SuggestionBox } from "@/components/suggestion-box";

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contact', data }),
            });

            if (res.ok) {
                toast({
                    title: "Message Sent",
                    description: "Thanks for reaching out! We'll get back to you soon.",
                });
                form.reset();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to send');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <Header />

            <main className="relative z-10 pt-32 pb-20 px-6">
                <div className="mx-auto max-w-7xl">

                    <div className="grid lg:grid-cols-2 gap-12 items-start">

                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                Get in <span className="text-primary">Touch</span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                Have a question, suggestion, or just want to say hi? We'd love to hear from you. Fill out the form or reach us directly.
                            </p>

                            <div className="space-y-6 mb-12">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Email Us</h3>
                                        <p className="text-muted-foreground">Detailed inquiries and support</p>
                                        <a href="mailto:hello@hackxtras.com" className="text-primary hover:underline mt-1 block">
                                            hello@hackxtras.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Community</h3>
                                        <p className="text-muted-foreground">Join the discussion on Discord</p>
                                        <a href="#" className="text-primary hover:underline mt-1 block">
                                            discord.gg/hackxtras
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border/50">
                                <h3 className="font-semibold mb-4">Follow Us</h3>
                                <div className="flex gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Suggestion Box */}
                            <SuggestionBox />

                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="p-8 border-border/50 backdrop-blur-sm bg-card/50 shadow-xl">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                                            <Input id="firstName" name="firstName" placeholder="John" required className="bg-background/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                                            <Input id="lastName" name="lastName" placeholder="Doe" required className="bg-background/50" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                        <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-background/50" />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                        <Input id="subject" name="subject" placeholder="How can we help?" required className="bg-background/50" />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder="Tell us more about your inquiry..."
                                            className="min-h-[150px] bg-background/50 resize-none"
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                Send Message <Send className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
