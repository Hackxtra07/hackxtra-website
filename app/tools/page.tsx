"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/hackxtras/header";
import { Hammer, Terminal, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/hackxtras/loader";

interface Tool {
    _id: string;
    name: string;
    description: string;
    category: string;
}

import { Pagination } from "@/components/hackxtras/pagination";

// ... existing interfaces ...

export default function ToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All Tools");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 12
    });

    // We still need all categories for the filter pills
    const [categories, setCategories] = useState(["All Tools"]);

    const fetchTools = async (page = 1, search = searchQuery, cat = activeCategory, showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                search: search,
                category: cat,
                limit: "12"
            });

            const res = await fetch(`/api/tools?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setTools(data.tools || []);
                    setPagination(data.pagination || pagination);

                    // Update categories if we don't have them yet
                    if (categories.length === 1) {
                        const resAll = await fetch('/api/tools?limit=1000'); // Fetch more to get all categories
                        const allData = await resAll.json();
                        if (allData && allData.tools) {
                            const fetchedCategories = Array.from(new Set(allData.tools.map((t: Tool) => t.category)));
                            setCategories(["All Tools", ...fetchedCategories as string[]]);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch tools:", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTools(1, searchQuery, activeCategory);
    }, [activeCategory]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTools(1, searchQuery, activeCategory);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePageChange = (page: number) => {
        fetchTools(page, searchQuery, activeCategory);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const groupedTools = tools.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<string, Tool[]>);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            <Header />

            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Kali Linux Tools Directory
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Comprehensive documentation and usage guides for the industry standard penetration testing distribution.
                    </p>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border-white/10 pl-10 h-12 text-lg"
                            />
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map(cat => (
                                <Button
                                    key={cat}
                                    variant={activeCategory === cat ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveCategory(cat)}
                                    className={activeCategory === cat ? "bg-primary" : "border-white/10 bg-white/5 hover:bg-white/10"}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader />
                    </div>
                ) : Object.keys(groupedTools).length > 0 ? (
                    <>
                        <div className="space-y-12">
                            {Object.entries(groupedTools).map(([category, catTools]) => (
                                <div key={category} className="mb-12">
                                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                                        <Terminal className="h-5 w-5 text-primary" />
                                        <h2 className="text-2xl font-bold font-mono text-white/90">{category}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {catTools.map((tool) => (
                                            <div key={tool._id} className="group relative bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all hover:bg-white/[0.07] overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="h-5 w-5 text-primary" />
                                                </div>

                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <Hammer className="h-6 w-6" />
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
                                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 h-15">
                                                    {tool.description}
                                                </p>

                                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                                    <Badge variant="outline" className="font-mono text-xs border-white/10 text-white/60">
                                                        {tool.category}
                                                    </Badge>
                                                    <Link href={`/tools/${tool._id}`} className="text-xs font-bold text-primary hover:underline">
                                                        VIEW DOCS -&gt;
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            className="mt-16"
                        />
                    </>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-muted-foreground">No tools found matching your search or category filter.</p>
                        <Button
                            variant="link"
                            className="text-primary mt-2"
                            onClick={() => {
                                setSearchQuery("");
                                setActiveCategory("All Tools");
                            }}
                        >
                            Reset filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
