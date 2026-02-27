"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Terminal,
  Lock,
  Code,
  Zap,
  Users,
  Clock,
  ArrowRight,
  Youtube,
  Search,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Loader } from "@/components/hackxtras/loader";
import { useProStatus } from "@/hooks/use-pro-status";

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
  isPremium?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

function CourseCard({
  course,
  index,
}: {
  course: Course;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const levelColors: Record<string, string> = {
    Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
    Intermediate: "bg-primary/10 text-primary border-primary/20",
    Advanced: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  // Map course titles to images
  const getImage = (title: string) => {
    if (title.toLowerCase().includes("defensive") || title.toLowerCase().includes("shield")) return "/images/course-defensive.png";
    if (title.toLowerCase().includes("offensive") || title.toLowerCase().includes("penetration")) return "/images/course-offensive.png";
    if (title.toLowerCase().includes("crypto") || title.toLowerCase().includes("encrypt")) return "/images/course-crypto.png";
    return null;
  };

  const imageSrc = getImage(course.title);

  // Map icons as fallback
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("defensive")) return Shield;
    if (title.toLowerCase().includes("penetration")) return Terminal;
    if (title.toLowerCase().includes("crypto")) return Lock;
    if (title.toLowerCase().includes("secure")) return Code;
    if (title.toLowerCase().includes("incident")) return Zap;
    if (title.toLowerCase().includes("leadership")) return Users;
    return Shield;
  };

  const IconComponent = getIcon(course.title);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/60 hover:bg-card hover:shadow-[0_0_30px_rgba(39,97,195,0.3)]"
    >
      {/* Image Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
        {course.coverImage || imageSrc ? (
          <Image
            src={course.coverImage || imageSrc!}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background to-muted">
            <IconComponent className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${levelColors[course.level] || levelColors.Beginner}`}
          >
            {course.level}
          </span>
        </div>
        {course.isPremium && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 backdrop-blur-md shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              <Crown className="h-3 w-3" />
              PREMIUM
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 pt-4">
        <h3 className="font-display text-xl font-medium text-foreground">
          {course.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {course.description}
        </p>

        <div className="mt-6 flex items-center gap-4 border-t border-border/30 pt-4 text-xs text-muted-foreground">
          {course.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {course.duration}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {course.instructor || "Expert Instructor"}
          </span>
          <div className="flex gap-2">
            {course.youtubeLink && (
              <a href={course.youtubeLink} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group/btn text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Youtube className="h-3.5 w-3.5" />
                  <span className="ml-1 text-xs">Watch</span>
                </Button>
              </a>
            )}
            <Link href={`/courses/${course._id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="group/btn text-primary hover:bg-primary/10 hover:text-primary"
              >
                View Course
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Courses");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isPro = useProStatus();

  useEffect(() => {
    const checkAuth = () => {
      const userToken = localStorage.getItem('userToken');
      const adminToken = localStorage.getItem('adminToken');
      setIsAuthenticated(!!userToken || !!adminToken);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchCourses = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const response = await fetch("/api/courses");
        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (showLoading) {
          setError(err instanceof Error ? err.message : "Failed to load courses");
          setCourses([]);
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchCourses();

    // Set up polling interval (30 seconds)
    const interval = setInterval(() => fetchCourses(false), 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === "All Courses" || course.level === activeFilter;

    if (!matchesSearch || !matchesFilter) return false;

    // Hide premium content from non-pro users
    if (course.isPremium && !isPro) return false;

    return true;
  });

  return (
    <div className="relative min-h-screen bg-background">
      {/* Textured Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Techy Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(39, 97, 195, 0.3) 25%, rgba(39, 97, 195, 0.3) 26%, transparent 27%, transparent 74%, rgba(39, 97, 195, 0.3) 75%, rgba(39, 97, 195, 0.3) 76%, transparent 77%, transparent)
          `,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Tech nodes/dots */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #2761c3 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div
          className="absolute -top-40 -right-40 w-96 h-96 opacity-60"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.06 220 / 1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 opacity-50"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.08 230 / 1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        {/* Glassy Edge Effect */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(20, 20, 40, 0.3) 100%)",
            backdropFilter: "blur(0.5px)",
          }}
        />
        {/* Top glassy edge */}
        <div
          className="absolute top-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 100%)",
            backdropFilter: "blur(0.5px)",
          }}
        />
        {/* Border frame effect */}
        <div className="absolute inset-0 border border-blue-500/10 rounded-3xl" />
      </div>
      <Header />

      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Page Header */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={
              isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <span className="font-mono text-sm uppercase tracking-wider text-primary">
              Learn from experts
            </span>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Security Courses
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Comprehensive, hands-on training programs designed by industry
              professionals. From foundational concepts to advanced techniques,
              master every aspect of cybersecurity.
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
          >
            <div className="flex flex-wrap gap-3">
              {["All Courses", "Beginner", "Intermediate", "Advanced"].map(
                (filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className={
                      activeFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "border-border/50 bg-transparent hover:bg-muted"
                    }
                  >
                    {filter}
                  </Button>
                )
              )}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-background/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
              <p>Error: {error}</p>
            </div>
          )}

          {/* Courses Grid or Auth/Premium Prompt */}
          {!loading && isAuthenticated === false ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Sign in to Access Courses</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Join our community to unlock comprehensive cybersecurity training programs and start learning from experts today.
              </p>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button variant="outline" className="min-w-[120px]">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
                </Link>
              </div>
            </div>
          ) : !loading && isAuthenticated && filteredCourses.length === 0 && courses.some(c => c.isPremium) && !isPro ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Crown className="h-10 w-10 text-yellow-500" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Premium Content Available</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Upgrade to Premium to access our complete library of expert-led security courses and advanced training.
              </p>
              <div className="flex gap-4">
                <Link href="/pricing">
                  <Button className="min-w-[160px] bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-400 hover:to-amber-500 border-0 shadow-lg shadow-yellow-500/20">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Courses Grid */}
              {!loading && filteredCourses.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course, index) => (
                    <CourseCard key={course._id} course={course} index={index} />
                  ))}
                </div>
              )}

              {/* Empty Search State */}
              {!loading && filteredCourses.length === 0 && courses.length > 0 && (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground">No courses found matching "{searchQuery}"</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && courses.length === 0 && !error && isAuthenticated && (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground">No courses available yet.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
