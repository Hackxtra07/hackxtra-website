'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users, BarChart3, Star, Calendar, MessageSquare,
    Shield, Globe, Activity, Zap, Search, Target,
    Trophy, Radio, MapPin, Loader2, ArrowUpRight,
    Cpu, Network, Fingerprint, Plus, Trash2, Edit2, Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { toast } from 'sonner';

export default function AdminCommunityPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axios.get("/api/community");
            setConfig(res.data.data);
        } catch (e) {
            toast.error("Failed to fetch community settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post("/api/community", config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Nexus parameters synchronized");
        } catch (e) {
            toast.error("Failed to synchronize settings");
        } finally {
            setSaving(false);
        }
    };

    const addStat = () => {
        setConfig({ ...config, stats: [...config.stats, { icon: "Users", value: "0", label: "NEW_METRIC" }] });
    };

    const removeStat = (idx: number) => {
        setConfig({ ...config, stats: config.stats.filter((_: any, i: number) => i !== idx) });
    };

    const addContributor = () => {
        setConfig({ ...config, topContributors: [...config.topContributors, { name: "", role: "", points: 0, avatar: "JD" }] });
    };

    const removeContributor = (idx: number) => {
        setConfig({ ...config, topContributors: config.topContributors.filter((_: any, i: number) => i !== idx) });
    };

    const addEvent = () => {
        setConfig({ ...config, upcomingEvents: [...config.upcomingEvents, { title: "", date: "", time: "", participants: 0, type: "WORKSHOP" }] });
    };

    const removeEvent = (idx: number) => {
        setConfig({ ...config, upcomingEvents: config.upcomingEvents.filter((_: any, i: number) => i !== idx) });
    };

    const addChannel = () => {
        setConfig({ ...config, popularChannels: [...config.popularChannels, { icon: "Shield", name: "", description: "", members: 0 }] });
    };

    const removeChannel = (idx: number) => {
        setConfig({ ...config, popularChannels: config.popularChannels.filter((_: any, i: number) => i !== idx) });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
            <div className="relative">
                <div className="h-20 w-20 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Network size={24} className="text-violet-400 animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-violet-500 animate-pulse">Establishing Nexus Connection</p>
                <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Synchronizing network parameters...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10 text-left">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter uppercase">
                        <div className="p-3 rounded-2xl bg-violet-500/20 border border-violet-500/30 text-violet-400 shadow-lg shadow-violet-500/10 transition-transform group-hover:scale-110 duration-500">
                            <Network className="h-8 w-8" />
                        </div>
                        Nexus Control
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Oversee network integrity, operative engagements, and strategic social vectors.</p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto relative z-10">
                    <Button onClick={handleSave} disabled={saving} className="h-14 w-full px-8 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-violet-500/20 border border-violet-400/30 rounded-2xl transition-all">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Commit Synchronizations
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="stats" className="space-y-10">
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                    <TabsList className="bg-white/5 border border-white/10 p-1.5 h-16 rounded-2xl md:rounded-[2rem] flex w-max md:w-full">
                        <TabsTrigger value="stats" className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white h-full rounded-xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all gap-3 px-6">
                            <BarChart3 size={16} /> <span className="hidden md:inline">Quantum Stats</span>
                        </TabsTrigger>
                        <TabsTrigger value="contributors" className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white h-full rounded-xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all gap-3 px-6">
                            <Trophy size={16} /> <span className="hidden md:inline">Elite Assets</span>
                        </TabsTrigger>
                        <TabsTrigger value="events" className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white h-full rounded-xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all gap-3 px-6">
                            <Calendar size={16} /> <span className="hidden md:inline">Engagements</span>
                        </TabsTrigger>
                        <TabsTrigger value="channels" className="flex-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white h-full rounded-xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all gap-3 px-6">
                            <Radio size={16} /> <span className="hidden md:inline">Nodes</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="stats">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-4">
                                <BarChart3 className="text-violet-500" />
                                Quantum Stats Matrix
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={addStat} className="border-white/10 text-gray-400 hover:bg-white/5 h-10 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                <Plus size={14} className="mr-2" /> Add Metric
                            </Button>
                        </CardHeader>
                        <CardContent className="p-10 grid gap-6 md:grid-cols-2">
                            {config.stats.map((stat: any, i: number) => (
                                <div key={i} className="flex gap-4 items-end p-6 rounded-2xl bg-black/40 border border-white/5 group hover:border-violet-500/30 transition-all">
                                    <div className="grid gap-2 flex-1">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Metric Label</Label>
                                        <Input
                                            value={stat.label}
                                            onChange={(e) => {
                                                const next = [...config.stats];
                                                next[i].label = e.target.value;
                                                setConfig({ ...config, stats: next });
                                            }}
                                            className="bg-white/5 border-white/10 h-12 text-sm text-white rounded-xl"
                                        />
                                    </div>
                                    <div className="grid gap-2 flex-1">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Metric Value</Label>
                                        <Input
                                            value={stat.value}
                                            onChange={(e) => {
                                                const next = [...config.stats];
                                                next[i].value = e.target.value;
                                                setConfig({ ...config, stats: next });
                                            }}
                                            className="bg-white/5 border-white/10 h-12 text-sm font-mono text-violet-400 rounded-xl"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 h-12 w-12 rounded-xl" onClick={() => removeStat(i)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contributors">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-4">
                                <Trophy className="text-amber-500" />
                                High-Value Operatives
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={addContributor} className="border-white/10 text-gray-400 hover:bg-white/5 h-10 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                <Plus size={14} className="mr-2" /> Add Asset
                            </Button>
                        </CardHeader>
                        <CardContent className="p-10 space-y-4">
                            {config.topContributors.map((user: any, i: number) => (
                                <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end p-6 rounded-2xl bg-black/40 border border-white/5 group hover:border-amber-500/30 transition-all">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Designation</Label>
                                        <Input value={user.name} onChange={(e) => {
                                            const next = [...config.topContributors];
                                            next[i].name = e.target.value;
                                            setConfig({ ...config, topContributors: next });
                                        }} className="bg-white/5 border-white/10 h-12 text-sm text-white rounded-xl" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Unit Class</Label>
                                        <Input value={user.role} onChange={(e) => {
                                            const next = [...config.topContributors];
                                            next[i].role = e.target.value;
                                            setConfig({ ...config, topContributors: next });
                                        }} className="bg-white/5 border-white/10 h-12 text-sm text-white rounded-xl" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Credit Score</Label>
                                        <Input type="number" value={user.points} onChange={(e) => {
                                            const next = [...config.topContributors];
                                            next[i].points = parseInt(e.target.value);
                                            setConfig({ ...config, topContributors: next });
                                        }} className="bg-white/5 border-white/10 h-12 text-sm font-mono text-amber-500 rounded-xl" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="grid gap-2 flex-1">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Vector ID</Label>
                                            <Input value={user.avatar} onChange={(e) => {
                                                const next = [...config.topContributors];
                                                next[i].avatar = e.target.value;
                                                setConfig({ ...config, topContributors: next });
                                            }} className="bg-white/5 border-white/10 h-12 text-sm text-center font-bold text-white rounded-xl" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 h-12 w-12 rounded-xl transition-colors" onClick={() => removeContributor(i)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-4">
                                <Calendar className="text-violet-500" />
                                Strategic Engagements
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={addEvent} className="border-white/10 text-gray-400 hover:bg-white/5 h-10 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                <Plus size={14} className="mr-2" /> Schedule Engagement
                            </Button>
                        </CardHeader>
                        <CardContent className="p-10 space-y-4">
                            {config.upcomingEvents.map((event: any, i: number) => (
                                <div key={i} className="flex flex-col gap-6 p-8 rounded-2xl bg-black/40 border border-white/5 group hover:border-violet-500/30 transition-all">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Engagement Objective</Label>
                                        <Input value={event.title} onChange={(e) => {
                                            const next = [...config.upcomingEvents];
                                            next[i].title = e.target.value;
                                            setConfig({ ...config, upcomingEvents: next });
                                        }} className="bg-white/5 border-white/10 h-12 text-sm text-white rounded-xl" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Timing Parameters</Label>
                                            <Input value={event.date} onChange={(e) => {
                                                const next = [...config.upcomingEvents];
                                                next[i].date = e.target.value;
                                                setConfig({ ...config, upcomingEvents: next });
                                            }} className="bg-white/5 border-white/10 h-12 text-sm text-white rounded-xl" placeholder="e.g. MAY 14, 2026" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Mission Type</Label>
                                            <Input value={event.type} onChange={(e) => {
                                                const next = [...config.upcomingEvents];
                                                next[i].type = e.target.value;
                                                setConfig({ ...config, upcomingEvents: next });
                                            }} className="bg-white/5 border-white/10 h-12 text-sm text-white rounded-xl" placeholder="WORKSHOP" />
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Button variant="ghost" className="text-rose-500 hover:text-white hover:bg-rose-500/20 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => removeEvent(i)}>
                                                <Trash2 size={14} className="mr-2" /> Decommission
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="channels">
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-4">
                                <Radio className="text-violet-500" />
                                Communication Nodes
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={addChannel} className="border-white/10 text-gray-400 hover:bg-white/5 h-10 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                <Plus size={14} className="mr-2" /> Instantiate Node
                            </Button>
                        </CardHeader>
                        <CardContent className="p-10 space-y-4">
                            {config.popularChannels.map((channel: any, i: number) => (
                                <div key={i} className="flex flex-col gap-6 p-8 rounded-2xl bg-black/40 border border-white/5 group hover:border-violet-500/30 transition-all">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Node Designation</Label>
                                            <Input value={channel.name} onChange={(e) => {
                                                const next = [...config.popularChannels];
                                                next[i].name = e.target.value;
                                                setConfig({ ...config, popularChannels: next });
                                            }} className="bg-white/5 border-white/10 h-12 text-sm font-black text-violet-400 rounded-xl" placeholder="general" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Signal Strength (Members)</Label>
                                            <Input type="number" value={channel.members} onChange={(e) => {
                                                const next = [...config.popularChannels];
                                                next[i].members = parseInt(e.target.value);
                                                setConfig({ ...config, popularChannels: next });
                                            }} className="bg-white/5 border-white/10 h-12 text-sm text-white rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-600">Node Description</Label>
                                        <Input value={channel.description} onChange={(e) => {
                                            const next = [...config.popularChannels];
                                            next[i].description = e.target.value;
                                            setConfig({ ...config, popularChannels: next });
                                        }} className="bg-white/5 border-white/10 h-12 text-sm text-gray-400 rounded-xl" />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button variant="ghost" className="text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 h-10 rounded-xl" onClick={() => removeChannel(i)}>
                                            <Trash2 size={16} className="mr-2" /> Expel Node
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-center flex-col items-center gap-4 opacity-40 mt-10">
                <Globe size={24} className="text-zinc-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic">"Network evolution is continuous. Maintain the nexus."</p>
            </div>
        </div>
    );
}
