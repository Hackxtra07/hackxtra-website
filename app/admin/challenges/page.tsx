'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus, Search, Edit2, Trash2, Loader2, Target,
    Activity, Globe, Zap, Shield, Cpu, Terminal,
    Trophy, Flag, Database, Network, Code, Layers,
    ChevronRight, AlertCircle, Radio, Signal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface Challenge {
    _id: string;
    title: string;
    type: string;
    difficulty: string;
    points: number;
    solveCount?: number;
}

export default function AdminChallengesPage() {
    const { request, loading } = useApi();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const data = await request("/api/challenges");
            setChallenges(data || []);
        } catch (error) {
            toast.error("Failed to fetch trial parameters");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to decommission this trial?")) return;
        try {
            await request(`/api/challenges/${id}`, { method: "DELETE" });
            toast.success("Trial decommissioned successfully");
            setChallenges(challenges.filter(c => c._id !== id));
        } catch (error) {
            toast.error("Process failure during trial decommissioning");
        }
    };

    const filteredChallenges = (challenges || []).filter(challenge =>
        challenge.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDifficultyColor = (diff: string) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10';
            case 'hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10 text-left">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter uppercase">
                        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Terminal className="h-8 w-8" />
                        </div>
                        Cognitive Trials
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Orchestrate high-stakes infiltration vectors and recalibrate trial difficulty gradients.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
                    <div className="relative group/search flex-1 sm:w-64 text-left">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover/search:text-amber-400 transition-colors" />
                        <Input
                            placeholder="Identify Trial Node..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 bg-black/40 border-white/10 h-14 text-white placeholder:text-zinc-700 rounded-2xl focus:border-amber-500/50 transition-all font-mono text-xs"
                        />
                    </div>
                    <Button
                        className="h-14 px-8 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-amber-500/20 border border-amber-400/30 rounded-2xl transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Instantiate Trial
                    </Button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden relative group/table shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover/table:opacity-100 transition-opacity duration-700" />

                <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Cpu className="h-4 w-4 text-amber-500" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Computational Audit</h2>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse relative z-10">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Trial Node / Category</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Gradient / Impact</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Bypass Data</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Operational Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredChallenges.map((challenge) => (
                                <tr key={challenge._id} className="hover:bg-white/[0.02] transition-colors group/row">
                                    <td className="px-8 py-8 text-left">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg group-hover/row:scale-105 transition-transform duration-500 relative shrink-0">
                                                <Target size={20} />
                                                <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-lg opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-base font-black text-white uppercase tracking-tight group-hover/row:text-amber-400 transition-colors truncate">{challenge.title}</span>
                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">{challenge.type || 'REVERSE'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Badge className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${getDifficultyColor(challenge.difficulty)}`}>
                                                {challenge.difficulty}
                                            </Badge>
                                            <span className="text-[10px] font-mono font-black text-zinc-500">+{challenge.points} CREDITS</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-xl font-mono font-black text-white group-hover:text-amber-400 transition-colors leading-none">{challenge.solveCount || 0}</span>
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">BYPASSES</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="flex justify-end gap-3 translate-x-4 group-hover/row:translate-x-0 opacity-0 group-hover/row:opacity-100 transition-all duration-500">
                                            <Button
                                                size="sm"
                                                className="h-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest px-4"
                                            >
                                                <Edit2 className="mr-2 h-3.5 w-3.5" /> Recalibrate
                                            </Button>
                                            <Button
                                                size="icon"
                                                onClick={() => handleDelete(challenge._id)}
                                                className="h-10 w-10 bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-xl transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredChallenges.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <Database size={48} className="text-zinc-700" />
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">No trials found in active database.</p>
                                                <p className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">Awaiting trial initialization protocols...</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 italic flex items-center gap-2">
                        <AlertCircle size={12} className="text-zinc-800" />
                        Trial data integrity at 100%. Encryption robust.
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">Displaying {filteredChallenges.length} active trial nodes</p>
                </div>
            </div>

            <div className="flex justify-center flex-col items-center gap-4 opacity-40">
                <Globe size={24} className="text-zinc-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic">"Security is a state of mind. Trials are the proof."</p>
            </div>
        </div>
    );
}
