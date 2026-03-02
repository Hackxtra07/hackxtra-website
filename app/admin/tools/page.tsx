"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Plus, Trash2, Hammer } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface Tool {
    _id: string;
    name: string;
    category: string;
    description: string;
}

export default function AdminToolsPage() {
    const { request, loading: apiLoading } = useApi('admin');
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        try {
            const data = await request("/api/tools");
            setTools(data.tools || []);
        } catch (e) {
            toast.error("Failed to fetch tools");
        } finally {
            setLoading(false);
        }
    };

    const syncTools = async () => {
        setSyncing(true);
        try {
            const data = await request("/api/tools/sync", { method: 'POST' });

            if (data.remaining > 0) {
                toast.success(`${data.message} (${data.remaining} remaining)`);
            } else {
                toast.success(data.message);
            }

            fetchTools();
        } catch (e) {
            toast.error("Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    const handleDeleteTool = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this tool?")) return;

        try {
            await request(`/api/tools/${id}`, { method: 'DELETE' });
            toast.success("Tool deleted successfully");
            setTools(tools.filter(t => t._id !== id));
        } catch (e) {
            toast.error("Failed to delete tool");
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white tracking-tighter">
                        <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Hammer className="h-8 w-8" />
                        </div>
                        Tools Repository
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Manage and synchronize the platform's primary penetration testing arsenal.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
                    <Button
                        onClick={syncTools}
                        disabled={syncing}
                        variant="outline"
                        className="h-12 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white px-6 font-bold uppercase tracking-widest text-[10px]"
                    >
                        {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Sync Definition Grid
                    </Button>
                    <Button className="h-12 bg-blue-600 hover:bg-blue-500 px-6 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 border border-blue-400/30">
                        <Plus className="mr-2 h-4 w-4" /> Add New Asset
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-24 gap-4">
                    <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-gray-500 font-mono text-sm animate-pulse">Scanning Archive...</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tools.map((tool) => (
                        <Card key={tool._id} className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all duration-500 group relative flex flex-col">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start gap-3">
                                    <CardTitle className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                                        {tool.name}
                                    </CardTitle>
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-black uppercase tracking-widest border border-blue-500/20 whitespace-nowrap">
                                        {tool.category || 'General'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-6 italic opacity-80">
                                    {tool.description || "No documentation available for this asset."}
                                </p>
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex gap-1">
                                        <div className="h-1 w-4 rounded-full bg-blue-600" />
                                        <div className="h-1 w-2 rounded-full bg-blue-600/30" />
                                        <div className="h-1 w-1 rounded-full bg-blue-600/10" />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        onClick={() => handleDeleteTool(tool._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
