"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, use } from "react";
import {
    Clock,
    Youtube,
    User,
    Shield,
    ArrowLeft,
    Calendar,
    Share2,
    BookOpen,
    PlayCircle,
    CheckCircle2,
    Lock,
    ChevronRight,
    HelpCircle,
    Award,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Loader } from "@/components/hackxtras/loader";
import { toast } from "sonner";

interface Module {
    title: string;
    description?: string;
    videoUrl: string;
    quiz?: {
        question: string;
        options: string[];
    };
}

interface Course {
    _id: string;
    title: string;
    description: string;
    level: string;
    duration?: string;
    instructor?: string;
    youtubeLink?: string;
    category?: string;
    coverImage?: string;
    createdAt?: string;
    modules: Module[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [completedModules, setCompletedModules] = useState<number[]>([]);
    const [isCourseCompleted, setIsCourseCompleted] = useState(false);

    const { id } = use(params);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/courses/${id}`);

                if (response.status === 404) {
                    notFound();
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch course');
                }

                const data = await response.json();
                setCourse(data);

                // Fetch user progress for this course (can be added to a public user progress API later)
                // For now, let's assume we can fetch it or it's empty
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id]);

    const handleVerifyModule = async () => {
        if (!quizAnswer) {
            toast.error("Please select an answer");
            return;
        }

        try {
            setVerifying(true);
            const response = await fetch(`/api/courses/${id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moduleIndex: activeModuleIndex,
                    answer: quizAnswer
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Module verified!");
                setCompletedModules(data.progress || []);
                setIsCourseCompleted(data.isCourseCompleted || false);
                setQuizAnswer("");
                
                // Auto-advance to next module if available
                if (course && activeModuleIndex < course.modules.length - 1) {
                    setTimeout(() => setActiveModuleIndex(activeModuleIndex + 1), 1500);
                }
            } else {
                toast.error(data.error || "Incorrect answer. Re-watch the module!");
            }
        } catch (err) {
            toast.error("Verification failed. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center p-6 border border-red-500/20 bg-red-500/10 rounded-xl">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Course</h2>
                    <p className="text-red-400 mb-4">{error || "Course not found"}</p>
                    <Link href="/courses">
                        <Button variant="outline">Back to Courses</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const activeModule = course.modules?.[activeModuleIndex] || (course.youtubeLink ? {
        title: "Introduction",
        videoUrl: course.youtubeLink,
        description: course.description
    } : null);

    const levelColors: Record<string, string> = {
        Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
        Intermediate: "bg-primary/10 text-primary border-primary/20",
        Advanced: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <Header />

            <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div className="space-y-4">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <Link href="/courses">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground pl-0">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        All Courses
                                    </Button>
                                </Link>
                            </motion.div>
                            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
                                {course.title}
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${levelColors[course.level] || levelColors.Beginner}`}>
                                    {course.level}
                                </span>
                                {isCourseCompleted && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-500/20 bg-green-500/10 text-green-400 flex items-center gap-1">
                                        <Award className="h-3 w-3" />
                                        Certified Completed
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="border-border/50" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Course link copied!");
                            }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Video Player & Quiz Area */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Player Wrapper */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-border/50 shadow-2xl">
                                {activeModule ? (
                                    <iframe
                                        key={activeModule.videoUrl}
                                        src={activeModule.videoUrl.replace('watch?v=', 'embed/')}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                                        <PlayCircle className="h-16 w-16 opacity-20" />
                                        <p>Select a module to start learning</p>
                                    </div>
                                )}
                            </div>

                            {/* Module Details & Quiz */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeModuleIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm">
                                                {activeModuleIndex + 1}
                                            </span>
                                            {activeModule?.title}
                                        </h2>
                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                            {activeModule?.description || "In this module, we'll dive deep into the core concepts and practical applications of the subject matter."}
                                        </p>
                                    </div>

                                    {/* Quiz Section */}
                                    {activeModule?.quiz && (
                                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <HelpCircle className="h-6 w-6 text-primary" />
                                                <h3 className="text-xl font-bold">Module Checkpoint</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-lg font-medium text-foreground">
                                                    {activeModule.quiz.question}
                                                </p>

                                                <div className="grid gap-3">
                                                    {activeModule.quiz.options.map((option, idx) => (
                                                        <button
                                                            key={idx}
                                                            disabled={completedModules.includes(activeModuleIndex)}
                                                            onClick={() => setQuizAnswer(option)}
                                                            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group
                                                                ${quizAnswer === option 
                                                                    ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                                                                    : "border-border/50 bg-background/50 hover:bg-muted/50"}
                                                                ${completedModules.includes(activeModuleIndex) ? "cursor-default opacity-80" : "cursor-pointer"}
                                                            `}
                                                        >
                                                            <span className="text-sm sm:text-base">{option}</span>
                                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
                                                                ${quizAnswer === option ? "border-primary bg-primary" : "border-muted-foreground/30"}
                                                            `}>
                                                                {quizAnswer === option && <div className="h-2 w-2 rounded-full bg-white" />}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="pt-4">
                                                    {completedModules.includes(activeModuleIndex) ? (
                                                        <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                                            <CheckCircle2 className="h-5 w-5" />
                                                            Module Verified & Credits Earned
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            onClick={handleVerifyModule}
                                                            disabled={verifying || !quizAnswer}
                                                            className="w-full sm:w-auto px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                                        >
                                                            {verifying ? "Checking..." : "Verify & Next Module"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Sidebar: Module List */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md overflow-hidden sticky top-28">
                                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/30">
                                    <h3 className="font-bold">Course Content</h3>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {completedModules.length} / {course.modules?.length || 0} Done
                                    </span>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {course.modules?.map((m, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveModuleIndex(idx)}
                                            className={`w-full p-4 flex items-start gap-4 text-left transition-all border-b border-border/30 last:border-0
                                                ${activeModuleIndex === idx ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/30"}
                                            `}
                                        >
                                            <div className="mt-1 shrink-0">
                                                {completedModules.includes(idx) ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : activeModuleIndex === idx ? (
                                                    <PlayCircle className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Lock className="h-4 w-4 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-sm font-bold leading-tight ${activeModuleIndex === idx ? "text-primary" : "text-foreground"}`}>
                                                    {m.title}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                                                    Module {idx + 1}
                                                </p>
                                            </div>
                                        </button>
                                    ))}

                                    {!course.modules || course.modules.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground italic text-sm">
                                            No modules added yet for this course.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Author Card */}
                            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Instructor</p>
                                    <p className="font-bold">{course.instructor || "HackXtras Certified"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
