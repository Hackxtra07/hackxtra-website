"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, PenTool, Terminal, Shield, Cpu, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Icon mapping for dynamic icons
const iconMap: any = {
    Code,
    PenTool,
    Terminal,
    Shield,
    Cpu,
    Users,
    Briefcase
};

interface Position {
    _id: string;
    title: string;
    type: string;
    description: string;
    skills: string[];
    requirements: string[];
    icon: string;
}

export default function OpenPositionsPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const res = await fetch('/api/positions');
                if (res.ok) {
                    const data = await res.json();
                    setPositions(data);
                }
            } catch (error) {
                console.error('Failed to fetch positions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPositions();
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPosition) return;
        setIsSubmitting(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'application',
                    data: {
                        position: selectedPosition.title,
                        name: formData.get('name'),
                        email: formData.get('email'),
                        resumeLink: formData.get('resume'),
                        coverLetter: formData.get('coverLetter'),
                    }
                }),
            });

            if (res.ok) {
                toast({ title: "Application Sent", description: "Good luck! We'll review your application soon." });
                setSelectedPosition(null);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to send');
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Could not submit application", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            {/* Abstract Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #2761c3 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <Header />

            <main className="relative z-10 pt-32 pb-20 px-6">
                <div className="mx-auto max-w-7xl">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5 px-4 py-1">
                                Join the Team
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                                Help Us Secure the <span className="text-primary">Future</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
                                HackXtras is built by the community, for the community. We're looking for passionate volunteers to help us democratize cybersecurity education.
                            </p>
                        </motion.div>
                    </div>

                    {/* Positions Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : positions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-xl">No open positions at the moment.</p>
                            <p>Check back later!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            {positions.map((job, index) => {
                                const Icon = iconMap[job.icon] || Briefcase;
                                return (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        viewport={{ once: true }}
                                        className="group relative bg-card/50 hover:bg-card/80 border border-border/50 hover:border-primary/50 transition-all duration-300 rounded-2xl p-8 backdrop-blur-sm"
                                    >
                                        <div className="absolute top-6 right-6">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                                {job.type}
                                            </Badge>
                                        </div>

                                        <div className="mb-6">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                                            <p className="text-muted-foreground">{job.description}</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills Needed</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.skills.map(skill => (
                                                        <Badge key={skill} variant="outline" className="bg-background/50">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Requirements</h4>
                                                <ul className="space-y-2">
                                                    {job.requirements.map((req, i) => (
                                                        <li key={i} className="flex items-start text-sm text-muted-foreground">
                                                            <span className="mr-2 text-primary">•</span>
                                                            {req}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-4">
                                                <Button className="w-full group" onClick={() => setSelectedPosition(job)}>
                                                    Apply Now
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    {/* General Application */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-20 max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 to-transparent rounded-3xl p-12 border border-primary/10"
                    >
                        <h3 className="text-2xl font-bold mb-4">Don't see a role for you?</h3>
                        <p className="text-muted-foreground mb-8">
                            We're always looking for talented individuals. If you think you can contribute in other ways, drop us a line and tell us how you can help!
                        </p>
                        <Button size="lg" variant="outline" asChild>
                            <a href="/contact">
                                Get in Touch
                            </a>
                        </Button>
                    </motion.div>

                    {/* Application Modal */}
                    <Dialog open={!!selectedPosition} onOpenChange={(open) => !open && setSelectedPosition(null)}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Apply for {selectedPosition?.title}</DialogTitle>
                                <DialogDescription>
                                    Join us as a {selectedPosition?.type}. Please let us know why you're a good fit!
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleApply} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="resume">Resume / Portfolio Link</Label>
                                    <Input id="resume" name="resume" placeholder="https://linkedin.com/in/..." required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coverLetter">Why do you want to join?</Label>
                                    <Textarea id="coverLetter" name="coverLetter" className="min-h-[100px]" required />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                </div>
            </main>

            <Footer />
        </div>
    );
}
