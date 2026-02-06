import { Header } from "@/components/hackxtras/header";
import { connectDB } from "@/lib/db";
import { Tool } from "@/lib/models";
import { ArrowLeft, ExternalLink, Terminal, Copy, Check, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await connectDB();
    const { id } = await params;
    try {
        const tool = await Tool.findById(id);
        if (!tool) return { title: 'Tool Not Found' };
        return {
            title: `${tool.name} - Kali Linux Tools`,
            description: tool.description,
        };
    } catch (e) {
        return { title: 'Error' };
    }
}

async function getTool(id: string) {
    await connectDB();
    try {
        const tool = await Tool.findById(id);
        if (!tool) return null;
        return tool;
    } catch (e) {
        return null;
    }
}

export default async function ToolDetailPage({ params }: Props) {
    const { id } = await params;
    const tool = await getTool(id);

    if (!tool) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            <Header />

            <div className="relative pt-32 pb-20">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

                <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                    <Link href="/tools" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tools
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                        <div className="h-24 w-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                            <Terminal className="h-12 w-12" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold font-display">{tool.name}</h1>
                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
                                    {tool.category}
                                </Badge>
                            </div>
                            <p className="text-xl text-muted-foreground mb-6">
                                {tool.description}
                            </p>
                            <div className="flex gap-4">
                                {tool.sourceUrl && (
                                    <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
                                        <a href={tool.sourceUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" /> Official Site
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8">
                        {/* Install Command */}
                        <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
                            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                                <form className="flex gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500/20" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/20" />
                                </form>
                                <span className="text-xs font-mono text-muted-foreground">Installation</span>
                            </div>
                            <div className="p-6 font-mono text-sm relative group">
                                <span className="text-green-500 mr-2">$</span>
                                {tool.installCommand}
                            </div>
                        </div>

                        {/* Usage Guide */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Copy className="h-6 w-6 text-primary" /> Usage Guide
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <div className="bg-white/5 rounded-xl border border-white/10 p-6 whitespace-pre-wrap font-mono text-sm text-gray-300 shadow-inner">
                                    {tool.usage}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
