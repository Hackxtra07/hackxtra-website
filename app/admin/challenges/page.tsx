'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, ChevronRight, Eye, Trophy, Zap, Target, Loader2, Sparkles, Layers, Plus, Activity, Search, Shield, Brain } from "lucide-react";

interface Challenge {
    _id: string;
    title: string;
    description: string;
    points: number;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    type: 'quiz';
    options?: string[];
    flag?: string;
}

export default function AdminChallengesPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points: 50,
        category: 'Web',
        difficulty: 'Easy',
        flag: '',
        type: 'quiz',
        options: ['', '', '', ''],
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const data = await request('/api/challenges?admin=true');
            setChallenges(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch challenges', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate Quiz options
            if (formData.type === 'quiz') {
                if (formData.options.some(opt => !opt.trim())) {
                    toast({ title: 'Error', description: 'All 4 options are required for a quiz.', variant: 'destructive' });
                    return;
                }
                if (!formData.options.includes(formData.flag)) {
                    toast({ title: 'Error', description: 'The correct answer must be one of the options.', variant: 'destructive' });
                    return;
                }
            }

            if (editingId) {
                await request(`/api/challenges/${editingId}`, {
                    method: 'PUT',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Challenge updated!' });
            } else {
                await request('/api/challenges', {
                    method: 'POST',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Challenge created!' });
            }

            resetForm();
            fetchChallenges();
        } catch (error) {
            toast({ title: 'Error', description: editingId ? 'Failed to update challenge' : 'Failed to create challenge', variant: 'destructive' });
        }
    };

    const handleDeleteChallenge = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this challenge?")) return;
        try {
            await request(`/api/challenges/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Challenge deleted!' });
            fetchChallenges();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete challenge', variant: 'destructive' });
        }
    };

    const handleEditChallenge = (challenge: Challenge) => {
        setFormData({
            title: challenge.title,
            description: challenge.description,
            points: challenge.points,
            category: challenge.category,
            difficulty: challenge.difficulty,
            flag: challenge.flag || '',
            type: challenge.type,
            options: challenge.options || ['', '', '', ''],
        });
        setEditingId(challenge._id);
        setShowForm(true);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            points: 50,
            category: 'Web',
            difficulty: 'Easy',
            flag: '',
            type: 'quiz',
            options: ['', '', '', ''],
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleAutoAdd = async () => {
        try {
            await request('/api/admin/challenges/auto-add', { method: 'POST' });
            toast({ title: 'Success', description: 'Added 10 challenges from the pool!' });
            fetchChallenges();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to auto-add challenges', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Brain className="h-8 w-8" />
                        </div>
                        Cognitive Vault
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Architect the challenges that define the elite potential of our operatives.</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto relative z-10">
                    <Button
                        onClick={handleAutoAdd}
                        className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex-1 lg:flex-none"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Auto-Seed</>}
                    </Button>
                    <Button
                        onClick={() => (showForm ? resetForm() : setShowForm(true))}
                        className={`h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border flex-1 lg:flex-none ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-blue-600 border-blue-400/30 text-white hover:bg-blue-500 shadow-blue-500/20'}`}
                    >
                        {showForm ? 'Abort Operation' : <><Plus className="mr-2 h-4 w-4" /> Create Node</>}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2rem]">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Node Configuration</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Challenge Title</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white placeholder:text-gray-700"
                                            placeholder="e.g. SYSTEM BREACH 101"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Points Value</Label>
                                            <Input
                                                type="number"
                                                value={formData.points}
                                                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                                className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12 text-white"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Type Classification</Label>
                                            <div className="bg-white/5 border border-white/10 rounded-lg h-12 flex items-center px-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                                Cognitive Quiz
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Manifest Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-blue-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4 placeholder:text-gray-700"
                                            placeholder="Define the challenge parameters or the question itself..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Operational Category</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/10 h-12 text-white text-[10px] font-black uppercase tracking-widest">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                    <SelectItem value="Web">Web Exploitation</SelectItem>
                                                    <SelectItem value="Crypto">Cryptography</SelectItem>
                                                    <SelectItem value="Forensics">Forensics</SelectItem>
                                                    <SelectItem value="General">General Knowledge</SelectItem>
                                                    <SelectItem value="Misc">Miscellaneous</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Difficulty Tier</Label>
                                            <Select
                                                value={formData.difficulty}
                                                onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
                                            >
                                                <SelectTrigger className={`bg-black/40 border-white/10 h-12 text-[10px] font-black uppercase tracking-widest ${formData.difficulty === 'Easy' ? 'text-emerald-400' : formData.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                                                    <SelectValue placeholder="Difficulty" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                    <SelectItem value="Easy" className="text-emerald-400">Easy</SelectItem>
                                                    <SelectItem value="Medium" className="text-amber-400">Medium</SelectItem>
                                                    <SelectItem value="Hard" className="text-rose-400">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Cognitive Handlers</h3>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-[10px] text-gray-500 font-medium italic opacity-70">"Input the potential response vectors and designate the successful outcome."</p>

                                    <div className="space-y-4">
                                        {formData.options.map((opt, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border transition-all duration-300 relative group/opt ${formData.flag === opt && opt !== '' ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' : 'bg-black/20 border-white/5'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-500 group-hover/opt:text-white transition-colors">
                                                        {(i + 10).toString(36).toUpperCase()}
                                                    </div>
                                                    <Input
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                                        className="bg-transparent border-none focus-visible:ring-0 h-10 text-white text-xs placeholder:text-gray-700"
                                                        placeholder={`RESPONSE VECTOR ${i + 1}...`}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, flag: opt })}
                                                        className={`p-2 rounded-lg transition-all ${formData.flag === opt && opt !== '' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-gray-600 hover:text-white hover:bg-white/10'}`}
                                                    >
                                                        <Target size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {formData.flag && (
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                                            <Shield className="h-4 w-4 text-emerald-500" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">Target Response Locked: <span className="text-emerald-400">{formData.flag}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-14 bg-gradient-to-r from-blue-600 top-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 border border-blue-400/20" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                                    Synchronizing Node...
                                </div>
                            ) : editingId ? (
                                <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" /> Reconfigure Challenge Matrix
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Deploy Operational Node
                                </div>
                            )}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden relative">
                <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Operational Node Archive</h2>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
                        <input
                            placeholder="FILTER NODES..."
                            className="w-full bg-black/20 border border-white/10 rounded-full h-9 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                        />
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 gap-4">
                    {challenges.length === 0 ? (
                        <div className="py-20 flex flex-col items-center gap-4 opacity-30 text-center">
                            <Layers className="h-12 w-12 text-gray-400" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">No cognitive nodes detected in the matrix.</p>
                        </div>
                    ) : (
                        challenges?.map((challenge) => (
                            <div key={challenge._id} className="group relative rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all duration-500 overflow-hidden">
                                <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-base font-black text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">
                                                {challenge.title}
                                            </h3>
                                            <div className="flex gap-2">
                                                <span className="text-[9px] px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black tracking-widest">QUIZ</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-black tracking-widest ${challenge.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    challenge.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}>
                                                    {challenge.difficulty.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{challenge.category}</span>
                                            <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">+{challenge.points} XP</span>
                                        </div>

                                        {challenge.flag && (
                                            <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500/70 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 w-fit">
                                                <Eye className="h-3 w-3" />
                                                <span>MANIFEST_FLAG: <span className="text-emerald-400">{challenge.flag}</span></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                        <Button
                                            size="sm"
                                            onClick={() => handleEditChallenge(challenge)}
                                            className="h-9 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                                        >
                                            <Edit className="mr-2 h-3.5 w-3.5" /> RECONFIGURE
                                        </Button>
                                        <Button
                                            size="icon"
                                            onClick={() => handleDeleteChallenge(challenge._id)}
                                            className="h-9 w-9 rounded-full bg-rose-500/5 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="absolute right-0 bottom-0 p-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                                    <Target size={80} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700">Displaying {challenges.length} active cognitive challenges in the vault</p>
                </div>
            </div>
        </div>
    );
}
