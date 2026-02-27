"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Star, GitFork, ExternalLink, Cpu, Code2, Rocket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/hackxtras/header";
import axios from "axios";

interface Project {
    _id: string;
    title: string;
    description: string;
    githubUrl: string;
    stars: number;
    forks: number;
    language?: string;
    techStack: string[];
}

export default function DevOpsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get("/api/devops");
                setProjects(res.data.projects || []);
            } catch (error) {
                console.error("Fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filtered = projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.techStack.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            <Header />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                {/* Hero Section */}
                <div className="relative mb-16">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
                    <div className="relative z-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400"
                        >
                            DevOps Showcase
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-400 max-w-2xl"
                        >
                            Explore open-source security tools, automation scripts, and DevOps pipelines built for the modern security researcher.
                        </motion.p>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex gap-2">
                            <Rocket className="h-4 w-4" /> Submit Repo
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((project, idx) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-white/[0.02] transition-all duration-500"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 via-transparent to-indigo-600/0 group-hover:from-indigo-600/5 group-hover:to-indigo-600/5 transition-all rounded-2xl" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                                            <Cpu className="h-5 w-5" />
                                        </div>
                                        <div className="flex gap-3 text-xs font-mono text-gray-500">
                                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {project.stars}</span>
                                            <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {project.forks}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-3 mb-6 h-15 font-mono">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.techStack.slice(0, 4).map(tech => (
                                            <span key={tech} className="text-[10px] uppercase tracking-wider font-bold bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                            <Code2 className="h-3 w-3" />
                                            {project.language || "Unknown"}
                                        </div>
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-indigo-500/20"
                                        >
                                            <Github className="h-4 w-4" /> Source <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                        <div className="text-gray-500 font-mono mb-4 text-xl">No projects found for "{search}"</div>
                        <Button variant="ghost" className="text-indigo-400 border border-indigo-500/20" onClick={() => setSearch("")}>
                            Clear Search
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
