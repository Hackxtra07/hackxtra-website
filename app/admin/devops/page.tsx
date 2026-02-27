"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Plus, Trash2, Workflow, Github, Link as LinkIcon } from "lucide-react";
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                        <Workflow className="h-8 w-8 text-indigo-600" />
                        DevOps Projects
                    </h1>
                    <p className="text-gray-500 mt-1">Add and manage GitHub projects for the community.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="flex gap-2 flex-1">
                        <Input
                            placeholder="GitHub Repo URL..."
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="max-w-[300px]"
                        />
                        <Button
                            onClick={handleImport}
                            disabled={importing || !githubUrl}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                            Import
                        </Button>
                        <Button
                            onClick={handleSync}
                            disabled={syncing}
                            variant="outline"
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Sync All
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects?.map((project) => (
                        <Card key={project._id} className="hover:shadow-md transition-all border-gray-200 overflow-hidden group">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-start text-gray-800">
                                    <span className="truncate pr-2">{project.title}</span>
                                    {project.language && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono border border-indigo-100">
                                            {project.language}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-4 italic">
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {project.techStack?.slice(0, 3).map(tech => (
                                        <span key={tech} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Github className="h-3 w-3" /> {project.stars}</span>
                                        <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> {project.forks}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(project._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
