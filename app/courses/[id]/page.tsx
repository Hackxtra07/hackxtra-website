"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Course {
    _id: string;
    title: string;
    description: string;
    level: string;
    duration?: string;
    instructor?: string;
    youtubeLink?: string;
    category?: string;
    createdAt?: string;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Unwrap params using React.use()
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

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">Loading course data...</p>
                </div>
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

    const levelColors: Record<string, string> = {
        Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
        Intermediate: "bg-primary/10 text-primary border-primary/20",
        Advanced: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };

    return (
        <div className="relative min-h-screen bg-background">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(39,97,195,0.1),transparent_40%)]" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle, #2761c3 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }} />
            </div>

            <Header />

            <main className="relative z-10 pt-28 pb-20 px-6">
                <div className="mx-auto max-w-5xl">
                    {/* Breadcrumb / Back Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link href="/courses">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground pl-0">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Courses
                            </Button>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 space-y-8"
                        >
                            {/* Header */}
                            <div>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${levelColors[course.level] || levelColors.Beginner}`}>
                                        {course.level}
                                    </span>
                                    {course.category && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground">
                                            {course.category}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
                                    {course.title}
                                </h1>
                            </div>

                            {/* Video Player Section */}
                            {course.youtubeLink && (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 bg-black/50 shadow-2xl shadow-primary/5">
                                    <iframe
                                        src={course.youtubeLink.replace('watch?v=', 'embed/')}
                                        title={course.title}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Course Overview
                                </h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {course.description}
                                </p>
                            </div>
                        </motion.div>

                        {/* Sidebar Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Course Meta Card */}
                            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-md p-6 sticky top-24">
                                <h3 className="font-semibold text-lg mb-4 text-foreground">Course Details</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">Duration</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{course.duration || "Self-paced"}</span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span className="text-sm">Instructor</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{course.instructor || "HackXtras Team"}</span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Shield className="h-4 w-4" />
                                            <span className="text-sm">Level</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{course.level}</span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">Published</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "Recently"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11">
                                        <Youtube className="mr-2 h-4 w-4" />
                                        Watch on YouTube
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-border/50 hover:bg-muted"
                                        onClick={() => {
                                            const shareData = {
                                                title: course.title,
                                                text: course.description,
                                                url: window.location.href,
                                            };
                                            if (navigator.share) {
                                                navigator.share(shareData).catch(console.error);
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert("Link copied to clipboard!");
                                            }
                                        }}
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share Course
                                    </Button>
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
