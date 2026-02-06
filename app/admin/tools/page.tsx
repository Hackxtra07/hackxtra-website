"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Plus, Trash2, Hammer } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Tool {
    _id: string;
    name: string;
    category: string;
    description: string;
}

export default function AdminToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        try {
            const res = await axios.get("/api/tools");
            setTools(res.data.tools);
        } catch (e) {
            toast.error("Failed to fetch tools");
        } finally {
            setLoading(false);
        }
    };

    const syncTools = async () => {
        setSyncing(true);
        try {
            const res = await axios.post("/api/tools/sync");

            if (res.data.remaining > 0) {
                toast.success(`${res.data.message} (${res.data.remaining} remaining)`);
            } else {
                toast.success(res.data.message);
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
            await axios.delete(`/api/tools/${id}`);
            toast.success("Tool deleted successfully");
            setTools(tools.filter(t => t._id !== id));
        } catch (e) {
            toast.error("Failed to delete tool");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                        <Hammer className="h-8 w-8 text-blue-600" />
                        Tools Directory
                    </h1>
                    <p className="text-gray-500 mt-1">Manage Kali Linux tools and sync definitions.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={syncTools}
                        disabled={syncing}
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Sync Repository
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Tool
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => (
                        <Card key={tool._id} className="hover:shadow-md transition-all border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start text-gray-800">
                                    <span>{tool.name}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-mono font-normal">
                                        {tool.category}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-2 h-10">
                                    {tool.description}
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
