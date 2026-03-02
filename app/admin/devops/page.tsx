"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Plus, Trash2, Workflow, Github, Link as LinkIcon, Activity, GitBranch, Star, Terminal, Zap, Shield, Globe, Layers } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface DevOpsProject {
    _id: string;
    title: string;
    description: string;
    githubUrl: string;
    stars: number;
    forks: number;
    language?: string;
    techStack: string[];
}

export default function AdminDevOpsPage() {
    const { request, loading: apiLoading } = useApi('admin');
    const [projects, setProjects] = useState<DevOpsProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [githubUrl, setGithubUrl] = useState("");
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await request("/api/admin/devops");
            setProjects(data.projects || []);
        } catch (e) {
            toast.error("Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!githubUrl) return toast.error("Please enter a GitHub URL");
        setImporting(true);
        try {
            const data = await request("/api/admin/devops/import", {
                method: 'POST',
                body: { url: githubUrl }
            });
            toast.success(data.message);
            setGithubUrl("");
            fetchProjects();
        } catch (e: any) {
            toast.error(e.message || "Import failed");
        } finally {
            setImporting(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const data = await request("/api/admin/devops/sync", {
                method: 'POST'
            });
            toast.success(data.message);
            fetchProjects();
        } catch (e: any) {
            toast.error(e.message || "Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await request(`/api/admin/devops/${id}`, { method: 'DELETE' });
            toast.success("Project deleted");
            setProjects(projects.filter(p => p._id !== id));
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Workflow className="h-8 w-8" />
                        </div>
                        DevOps Pipeline
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Orchestrate and synchronize elite security tools from the global repository grid.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
                    <div className="flex gap-2 flex-1 group/input">
                        <div className="relative flex-1 min-w-[200px] md:min-w-[300px]">
                            <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
                            <Input
                                placeholder="Repository Reference..."
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-sm text-white placeholder:text-gray-700 rounded-2xl"
                            />
                        </div>
                        <Button
                            onClick={handleImport}
                            disabled={importing || !githubUrl}
                            className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-indigo-500/20 border border-indigo-400/30 rounded-2xl transition-all"
                        >
                            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : "DEPLOY"}
                        </Button>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                    >
                        {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        SYNC GRID
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 gap-6">
                    <div className="relative">
                        <div className="h-20 w-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity size={24} className="text-indigo-400 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 animate-pulse">Initializing Data Stream</p>
                        <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Awaiting satellite handshake...</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-md opacity-30">
                            <Layers size={60} className="mx-auto mb-6 text-zinc-700" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">No operational tools detected in the pipeline.</p>
                        </div>
                    ) : (
                        projects?.map((project) => (
                            <Card key={project._id} className="bg-white/5 border-white/10 hover:border-indigo-500/40 transition-all duration-700 group relative overflow-hidden flex flex-col rounded-[2.5rem] p-1">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <Github size={120} />
                                </div>

                                <div className="p-8 pb-4 relative">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors truncate">
                                            {project.title}
                                        </h3>
                                        {project.language && (
                                            <span className="text-[8px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-black uppercase tracking-widest border border-indigo-500/20 whitespace-nowrap">
                                                {project.language}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-6">
                                        <Globe size={10} className="text-indigo-500/50" />
                                        PUBLIC REPOSITORY NODE
                                    </div>

                                    <div className="relative">
                                        <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-3 mb-8 min-h-[4.5rem]">
                                            {project.description || "No transmission manifest provided for this operational tool."}
                                        </p>
                                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full" />
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {project.techStack?.slice(0, 4).map(tech => (
                                            <span key={tech} className="text-[8px] bg-white/5 text-zinc-500 px-3 py-1.5 rounded-xl border border-white/5 uppercase font-black tracking-widest hover:text-white hover:bg-white/10 transition-colors cursor-default">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8 mt-auto">
                                        <div className="flex flex-col gap-1 p-4 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group/stat">
                                            <div className="absolute top-0 left-0 w-full h-0.5 bg-yellow-500/30 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Protocol Stars</span>
                                            <div className="flex items-center gap-2 text-sm font-mono font-black text-white">
                                                <Star size={14} className="text-yellow-500 fill-yellow-500/20" />
                                                {project.stars.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 p-4 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group/stat">
                                            <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500/30 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Grid Forks</span>
                                            <div className="flex items-center gap-2 text-sm font-mono font-black text-white">
                                                <GitBranch size={14} className="text-indigo-400" />
                                                {project.forks.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 mt-6">
                                        <div className="flex gap-3">
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 transition-all border border-white/10 shadow-lg"
                                            >
                                                <Github size={18} />
                                            </a>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleDelete(project._id)}
                                                className="h-10 px-4 rounded-xl bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                                            >
                                                <Trash2 size={14} className="mr-2" />
                                                PURGE
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
