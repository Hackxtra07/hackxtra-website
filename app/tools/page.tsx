import { Header } from "@/components/hackxtras/header";
import { connectDB } from "@/lib/db";
import { Tool } from "@/lib/models";
import { Hammer, Terminal, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

async function getTools() {
    await connectDB();
    return await Tool.find({}).sort({ name: 1 });
}

export default async function ToolsPage() {
    const tools = await getTools();
    const categories = Array.from(new Set(tools.map((t: any) => t.category)));

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            <Header />

            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Kali Linux Tools Directory
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Comprehensive documentation and usage guides for the industry standard penetration testing distribution.
                    </p>
                </div>

                {categories.map((category: any) => (
                    <div key={category} className="mb-12">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            <Terminal className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold font-mono text-white/90">{category}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tools.filter((t: any) => t.category === category).map((tool: any) => (
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
        </div>
    );
}
