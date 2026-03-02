'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';
import { Award, Trophy, Shield, Plus, Trash2, Edit2, Loader2, Sparkles, Zap, Target, Info, Search, Activity, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Badge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    requirements?: {
        minSolved?: number;
        minPoints?: number;
        requirePro?: boolean;
    };
    createdAt: string;
}

export default function AdminBadgesPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Award',
        requirements: {
            minSolved: 0,
            minPoints: 0,
            requirePro: false
        }
    });

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const data = await request('/api/badges');
            setBadges(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch badges', variant: 'destructive' });
        }
    };

    const getIcon = (name: string) => {
        const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle || Award;
        return <Icon className="h-5 w-5" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await request(`/api/badges/${editingId}`, {
                    method: 'PUT',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Badge updated!' });
            } else {
                await request('/api/badges', {
                    method: 'POST',
                    body: formData,
                });
                toast({ title: 'Success', description: 'Badge created!' });
            }
            resetForm();
            fetchBadges();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to save badge', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await request(`/api/badges/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Badge deleted!' });
            fetchBadges();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to delete badge', variant: 'destructive' });
        }
    };

    const handleEdit = (badge: Badge) => {
        setFormData({
            name: badge.name,
            description: badge.description,
            icon: badge.icon || 'Award',
            requirements: {
                minSolved: badge.requirements?.minSolved || 0,
                minPoints: badge.requirements?.minPoints || 0,
                requirePro: badge.requirements?.requirePro || false
            }
        });
        setEditingId(badge._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            icon: 'Award',
            requirements: {
                minSolved: 0,
                minPoints: 0,
                requirePro: false
            }
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Trophy className="h-8 w-8" />
                        </div>
                        Badge Matrix
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Orchestrate the awarding system and merit-based achievement protocols.</p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto relative z-10">
                    <Button
                        onClick={() => (showForm ? resetForm() : setShowForm(true))}
                        className={`h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border flex-1 lg:flex-none ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-indigo-600 border-indigo-400/30 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
                    >
                        {showForm ? 'Abort Sequence' : <><Plus className="mr-2 h-4 w-4" /> Initialize Badge</>}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2rem]">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Identity Parameters</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Badge Codename</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white placeholder:text-gray-700"
                                            placeholder="e.g. SYSTEM BREACHER"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Icon Designation (Lucide)</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                value={formData.icon}
                                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                                                placeholder="Award, Shield, Zap..."
                                                required
                                            />
                                            <div className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-indigo-400 shadow-inner">
                                                {getIcon(formData.icon)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Manifestation Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-28 text-white text-xs leading-relaxed resize-none p-4"
                                            placeholder="Detailed conditions for awarding this merit..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Logic Automation</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Minimal Solves</Label>
                                        <Input
                                            type="number"
                                            value={formData.requirements?.minSolved || 0}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                requirements: { ...formData.requirements, minSolved: parseInt(e.target.value) }
                                            })}
                                            className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Minimal Experience</Label>
                                        <Input
                                            type="number"
                                            value={formData.requirements?.minPoints || 0}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                requirements: { ...formData.requirements, minPoints: parseInt(e.target.value) }
                                            })}
                                            className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-12 text-white"
                                        />
                                    </div>

                                    <div className={`col-span-2 p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between ${formData.requirements?.requirePro ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl ${formData.requirements?.requirePro ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-600'}`}>
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Label htmlFor="requirePro" className="font-black text-xs uppercase tracking-widest text-gray-200 cursor-pointer">Elite Access Required</Label>
                                                <p className="text-[10px] text-gray-500">Seal badge for PRO-tier operatives only</p>
                                            </div>
                                        </div>
                                        <Switch
                                            id="requirePro"
                                            checked={formData.requirements?.requirePro || false}
                                            onCheckedChange={(val) => setFormData({
                                                ...formData,
                                                requirements: { ...formData.requirements, requirePro: val }
                                            })}
                                            className="data-[state=checked]:bg-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl border border-indigo-500/10 bg-black/20 flex items-start gap-4">
                                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium italic">"Once committed to the matrix, badges will be automatically distributed via the solve-rotation engine to all eligible operatives."</p>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 border border-indigo-400/20" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                                    Synchronizing Merit Grid...
                                </div>
                            ) : editingId ? (
                                <div className="flex items-center gap-2">
                                    <Edit2 className="h-4 w-4" /> Finalize Badge Reconfiguration
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Deploy New Achievement
                                </div>
                            )}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden relative">
                <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-indigo-500" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Merit Archive Grid</h2>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
                        <input
                            placeholder="FILTER REGISTRY..."
                            className="w-full bg-black/20 border border-white/10 rounded-full h-9 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-700"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full lg:min-w-[900px]">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Merit Icon</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Archived Name</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Award Thresholds</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Operational Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {badges.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Trophy className="h-12 w-12 text-gray-400" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">No custom badges detected in the matrix.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : badges?.map((badge) => (
                                <tr key={badge._id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                                            {getIcon(badge.icon || 'Award')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{badge.name}</div>
                                            <span className="text-[10px] text-gray-500 font-medium italic line-clamp-1 opacity-70">"{badge.description}"</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {badge.requirements?.minSolved ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                                    <Target className="mr-1.5 h-3 w-3" /> {badge.requirements.minSolved} SOLVES
                                                </span>
                                            ) : null}
                                            {badge.requirements?.minPoints ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                                                    <Zap className="mr-1.5 h-3 w-3" /> {badge.requirements.minPoints} XP
                                                </span>
                                            ) : null}
                                            {badge.requirements?.requirePro ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                                                    <Shield className="mr-1.5 h-3 w-3" /> PRIME
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-white/5">
                                                    OPEN ACCESS
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(badge)}
                                                className="h-9 px-4 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[9px] font-black uppercase tracking-widest"
                                            >
                                                <Edit2 className="mr-2 h-3.5 w-3.5" /> RECALIBRATE
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(badge._id)}
                                                className="h-9 w-9 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700">Displaying {badges.length} registered merits in local archive matrix</p>
                </div>
            </div>
        </div>
    );
}
