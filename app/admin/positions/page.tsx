'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Briefcase, Code, PenTool, Terminal, Shield, Cpu, Users,
    Plus, Search, Edit2, Trash2, Loader2, Target, Zap, Activity,
    Fingerprint, Globe, ChevronRight, X, AlertCircle
} from "lucide-react";

interface Position {
    _id: string;
    title: string;
    type: string;
    description: string;
    skills: string[];
    requirements: string[];
    icon: string;
    isOpen: boolean;
}

const icons = ['Code', 'PenTool', 'Terminal', 'Shield', 'Cpu', 'Users', 'Briefcase'];

export default function AdminPositionsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [positions, setPositions] = useState<Position[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Volunteer',
        description: '',
        skills: '',
        requirements: '',
        icon: 'Code',
        isOpen: true,
    });

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const data = await request('/api/positions?admin=true');
            setPositions(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch positions', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                title: formData.title,
                type: formData.type,
                description: formData.description,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                requirements: formData.requirements.split('\n').map(r => r.trim()).filter(r => r),
                icon: formData.icon,
                isOpen: formData.isOpen,
            };

            if (editingId) {
                await request(`/api/positions/${editingId}`, {
                    method: 'PUT',
                    body,
                });
                toast({ title: 'Success', description: 'Operations slot recalibrated!' });
            } else {
                await request('/api/positions', {
                    method: 'POST',
                    body,
                });
                toast({ title: 'Success', description: 'Strategic opening deployed!' });
            }
            resetForm();
            fetchPositions();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save tactical data', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to decommission this opening?')) return;
        try {
            await request(`/api/positions/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Opening decommissioned!' });
            fetchPositions();
        } catch (error) {
            toast({ title: 'Error', description: 'Operation failed', variant: 'destructive' });
        }
    };

    const handleEdit = (pos: Position) => {
        setFormData({
            title: pos.title,
            type: pos.type,
            description: pos.description,
            skills: pos.skills.join(', '),
            requirements: pos.requirements.join('\n'),
            icon: pos.icon || 'Code',
            isOpen: pos.isOpen,
        });
        setEditingId(pos._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'Volunteer',
            description: '',
            skills: '',
            requirements: '',
            icon: 'Code',
            isOpen: true,
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Target className="h-8 w-8" />
                        </div>
                        Strategic Openings
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Orchestrate recruitment vectors and expansion protocols for the unit.</p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto relative z-10">
                    <Button
                        onClick={() => (showForm ? resetForm() : setShowForm(true))}
                        className={`h-14 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border flex-1 lg:flex-none ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-amber-600 border-amber-400/30 text-white hover:bg-amber-500 shadow-amber-500/20'}`}
                    >
                        {showForm ? 'Abort Deployment' : <><Plus className="mr-2 h-4 w-4" /> Deploy New Slot</>}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2.5rem]">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Targeting Parameters</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Designation Title</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-amber-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                                            placeholder="e.g. ELITE FRONTEND OPERATIVE"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Engagement Type</Label>
                                            <Input
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="bg-black/40 border-white/10 focus:border-amber-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                                                placeholder="e.g. VOLUNTEER / CORE"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Unit Avatar (Icon)</Label>
                                            <Select
                                                value={formData.icon}
                                                onValueChange={(val) => setFormData({ ...formData, icon: val })}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/10 focus:border-amber-500/50 h-14 text-white rounded-2xl text-[10px] font-black uppercase">
                                                    <SelectValue placeholder="Select Vector" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                    {icons.map(i => (
                                                        <SelectItem key={i} value={i} className="text-[10px] font-black uppercase tracking-widest">{i}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Skill Matrix (Comma Separated)</Label>
                                        <Input
                                            value={formData.skills}
                                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-amber-500/50 h-14 text-white placeholder:text-gray-700 rounded-2xl"
                                            placeholder="REACT, TYPESCRIPT, NEXT.JS, TAILWIND"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-black/20 group/switch">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                            <Activity size={18} className={formData.isOpen ? "animate-pulse" : ""} />
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor="isOpen" className="text-[10px] font-black uppercase tracking-widest text-gray-300">Signal Active</Label>
                                            <p className="text-[9px] text-gray-600 line-clamp-1">Toggle whether the opening is actively broadcasting for candidates.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            id="isOpen"
                                            checked={formData.isOpen}
                                            onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                                            className="h-6 w-12 rounded-full bg-white/5 border border-white/10 checked:bg-amber-600 appearance-none transition-colors cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:h-4 after:w-4 after:bg-white after:rounded-full after:transition-all checked:after:left-7"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Operational Intel</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Mission Abstract (Description)</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-amber-500/50 h-32 text-white text-xs leading-relaxed resize-none p-4 placeholder:text-gray-700 rounded-2xl"
                                            placeholder="Detail the technical responsibilities and unit expectations..."
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600 ml-1">Hardcore Requirements (One Per Line)</Label>
                                        <Textarea
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-amber-500/50 h-40 text-white text-xs leading-relaxed resize-none p-4 placeholder:text-gray-700 rounded-2xl"
                                            placeholder="2+ Years with modern JS frameworks&#10;Proven contribution to open source&#10;Deep understanding of security protocols"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-16 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-amber-500/20 border border-amber-400/20 rounded-2xl" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                                    Synchronizing Grid...
                                </div>
                            ) : editingId ? (
                                <div className="flex items-center gap-3">
                                    <Zap className="h-5 w-5" /> Execute Data Recalibration
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Plus className="h-5 w-5" /> Broadcast New Opening
                                </div>
                            )}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden relative group/table shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover/table:opacity-100 transition-opacity duration-700" />

                <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-amber-500" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Strategic Opening Grid</h2>
                    </div>
                    <div className="relative w-full sm:w-80 group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600 group-focus-within/search:text-amber-400 transition-colors" />
                        <input
                            placeholder="FILTER STRATEGIC SLOTS..."
                            className="w-full bg-black/30 border border-white/10 rounded-2xl h-11 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700 shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse relative z-10">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Designation</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Vector Class</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Broadcasting Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Operational Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {positions.map((pos) => (
                                <tr key={pos._id} className="hover:bg-white/[0.02] transition-colors group/row">
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg group-hover/row:scale-105 transition-transform duration-500 relative">
                                                {pos.icon === 'Code' ? <Code size={20} /> :
                                                    pos.icon === 'PenTool' ? <PenTool size={20} /> :
                                                        pos.icon === 'Terminal' ? <Terminal size={20} /> :
                                                            pos.icon === 'Shield' ? <Shield size={20} /> :
                                                                pos.icon === 'Cpu' ? <Cpu size={20} /> :
                                                                    pos.icon === 'Users' ? <Users size={20} /> :
                                                                        pos.icon === 'Briefcase' ? <Briefcase size={20} /> :
                                                                            <Code size={20} />}
                                                <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-lg opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-white uppercase tracking-tight group-hover/row:text-amber-400 transition-colors">{pos.title}</span>
                                                <span className="text-[10px] text-zinc-500 leading-none mt-1 line-clamp-1 italic max-w-xs group-hover/row:text-zinc-400 transition-colors">"{pos.description}"</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex flex-col gap-2">
                                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 w-fit rounded-lg shadow-sm">
                                                {pos.type}
                                            </Badge>
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {pos.skills.slice(0, 3).map(skill => (
                                                    <span key={skill} className="text-[8px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 font-bold uppercase">{skill}</span>
                                                ))}
                                                {pos.skills.length > 3 && <span className="text-[8px] text-zinc-700 font-bold">+{pos.skills.length - 3}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap">
                                        {pos.isOpen ? (
                                            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2 w-fit group/status">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">LIVE BROADCAST</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-rose-500/5 border border-white/5 rounded-2xl px-4 py-2 w-fit opacity-50 grayscale">
                                                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SIGNAL SHUTDOWN</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="flex justify-end gap-3 translate-x-4 group-hover/row:translate-x-0 opacity-0 group-hover/row:opacity-100 transition-all duration-500">
                                            <Button
                                                size="sm"
                                                onClick={() => handleEdit(pos)}
                                                className="h-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest px-4"
                                            >
                                                <Edit2 className="mr-2 h-3.5 w-3.5" /> Recalibrate
                                            </Button>
                                            <Button
                                                size="icon"
                                                onClick={() => handleDelete(pos._id)}
                                                className="h-10 w-10 bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-xl transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {positions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <Briefcase size={48} className="text-zinc-700" />
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">No strategic openings detected in the recruitment matrix.</p>
                                                <p className="text-[8px] font-mono text-zinc-800 tracking-widest uppercase">Initializing empty slot protocols...</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center flex justify-between items-center relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 italic flex items-center gap-2">
                        <AlertCircle size={12} className="text-zinc-800" />
                        Authorized personnel only. Modifications are logged.
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">Displaying {positions.length} tactical slots</p>
                </div>
            </div>

            <div className="flex justify-center flex-col items-center gap-4 opacity-40">
                <Globe size={24} className="text-zinc-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic">"The network evolves through its components. Curate excellence."</p>
            </div>
        </div>
    );
}
