"use client";

import { motion } from "framer-motion";
import { useEffect, useState, use } from "react";
import {
    Terminal,
    Clock,
    Trophy,
    ArrowLeft,
    Share2,
    Play,
    Shield,
    CheckCircle2,
    AlertCircle,
    Copy,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Loader } from "@/components/hackxtras/loader";
import { toast } from "sonner";

interface Lab {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    objectives: string[];
    tools: string[];
    timeToComplete: number;
    url?: string;
    coverImage?: string;
    isPremium: boolean;
}

export default function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [lab, setLab] = useState<Lab | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [flag, setFlag] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const { id } = use(params);

    useEffect(() => {
        const fetchLab = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/labs/${id}`);

                if (response.status === 404) {
                    notFound();
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch lab');
                }

                const data = await response.json();
                setLab(data);

                // For testing: let's assume if it returns a 200, we check if user has it in completed list
                // Real implementation would check user profile session
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLab();
        }
    }, [id]);

    const handleSubmitFlag = async () => {
        if (!flag) {
            toast.error("Please enter a flag");
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`/api/labs/${id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flag }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Correct flag! Well done.");
                setIsCompleted(true);
                setFlag("");
            } else {
                toast.error(data.error || "Incorrect flag. Try again!");
            }
        } catch (err) {
            toast.error("Verification failed. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !lab) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center p-6 border border-red-500/20 bg-red-500/10 rounded-xl">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Lab</h2>
                    <p className="text-red-400 mb-4">{error || "Lab not found"}</p>
                    <Link href="/labs">
                        <Button variant="outline">Back to Labs</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const difficultyColors: Record<string, string> = {
        Easy: "bg-green-500/10 text-green-400 border-green-500/20",
        Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        Hard: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <div className="relative min-h-screen bg-background">
            <Header />

            <main className="relative z-10 pt-28 pb-20 px-6">
                <div className="mx-auto max-w-5xl">
                    {/* Back Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link href="/labs">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground pl-0">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Labs
                            </Button>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 space-y-8"
                        >
                            {/* Header Info */}
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[lab.difficulty]}`}>
                                        {lab.difficulty}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground">
                                        {lab.category}
                                    </span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                                    {lab.title}
                                </h1>
                            </div>

                            {/* Hero Image / Controls */}
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 bg-card/50 shadow-2xl">
                                {lab.coverImage ? (
                                    <Image
                                        src={lab.coverImage}
                                        alt={lab.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background to-muted/30">
                                        <Terminal className="h-20 w-20 text-green-500/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {lab.url && (
                                            <a href={lab.url} target="_blank" rel="noopener noreferrer">
                                                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold h-11 px-6 shadow-lg shadow-green-500/20">
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Access Lab Machine
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description & Objectives */}
                            <div className="grid gap-8 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Terminal className="h-5 w-5 text-green-500" />
                                        Lab Scenario
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {lab.description}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        Mission Objectives
                                    </h3>
                                    <ul className="space-y-2">
                                        {lab.objectives.map((obj, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                                                {obj}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Verify Section */}
                            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-md p-8 shadow-inner">
                                <div className="max-w-md mx-auto space-y-6 text-center">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-foreground">Mission Verification</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Found the flag? Submit it below to complete the mission and earn points.
                                        </p>
                                    </div>

                                    {isCompleted ? (
                                        <motion.div 
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex flex-col items-center gap-3 py-6 text-green-400 bg-green-500/10 rounded-lg border border-green-500/20"
                                        >
                                            <CheckCircle2 className="h-12 w-12" />
                                            <span className="font-bold text-lg">MISSION ACCOMPLISHED</span>
                                            <p className="text-xs text-green-500/60 uppercase tracking-widest">Points Secured</p>
                                        </motion.div>
                                    ) : (
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Flag{s3cur3_fl4g_h3r3}"
                                                value={flag}
                                                onChange={(e) => setFlag(e.target.value)}
                                                className="w-full bg-background/50 border border-border/50 rounded-lg h-12 px-4 text-center font-mono text-foreground focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
                                            />
                                            <Button 
                                                onClick={handleSubmitFlag}
                                                disabled={submitting}
                                                className="w-full mt-4 bg-green-600 hover:bg-green-700 h-11 transition-all"
                                            >
                                                {submitting ? "Verifying..." : "Submit Verification Flag"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-md p-6 sticky top-24">
                                <h3 className="font-semibold text-lg mb-4 text-foreground">Mission Intel</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                                        <span className="text-sm text-muted-foreground">Estimated Time</span>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span>{lab.timeToComplete} min</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Shield className={`h-4 w-4 ${isCompleted ? "text-green-500" : "text-yellow-500"}`} />
                                            <span className={isCompleted ? "text-green-500" : "text-yellow-500"}>
                                                {isCompleted ? "Completed" : "In Progress"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Required Tools</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {lab.tools.map((tool, i) => (
                                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary-foreground text-[10px] rounded border border-primary/20">
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Button
                                        variant="outline"
                                        className="w-full border-border/50 hover:bg-muted"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success("Intel link copied!");
                                        }}
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share Mission
                                    </Button>
                                </div>
                            </div>

                            {/* Tip Box */}
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 border-l-4 border-l-blue-500">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-foreground">Pro Tip</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Enumerate thoroughly before trying any exploits. Most flags are hidden in non-obvious files or databases.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
