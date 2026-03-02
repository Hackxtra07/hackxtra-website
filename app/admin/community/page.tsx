"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Save, Users, MessageSquare, Trophy, Globe, Shield, Zap, Activity } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

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
            toast.success("Community settings saved");
        } catch (e) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const addStat = () => {
        const newStats = [...config.stats, { icon: "Users", value: "0", label: "New Stat" }];
        setConfig({ ...config, stats: newStats });
    };

    const removeStat = (index: number) => {
        const newStats = config.stats.filter((_: any, i: number) => i !== index);
        setConfig({ ...config, stats: newStats });
    };

    const addContributor = () => {
        const newContributors = [...config.topContributors, { name: "", role: "", points: 0, avatar: "" }];
        setConfig({ ...config, topContributors: newContributors });
    };

    const removeContributor = (index: number) => {
        const newContributors = config.topContributors.filter((_: any, i: number) => i !== index);
        setConfig({ ...config, topContributors: newContributors });
    };

    const addEvent = () => {
        const newEvents = [...config.upcomingEvents, { title: "", date: "", time: "", participants: 0, type: "Workshop" }];
        setConfig({ ...config, upcomingEvents: newEvents });
    };

    const removeEvent = (index: number) => {
        const newEvents = config.upcomingEvents.filter((_: any, i: number) => i !== index);
        setConfig({ ...config, upcomingEvents: newEvents });
    };

    const addChannel = () => {
        const newChannels = [...config.popularChannels, { icon: "Shield", name: "", description: "", members: 0 }];
        setConfig({ ...config, popularChannels: newChannels });
    };

    const removeChannel = (index: number) => {
        const newChannels = config.popularChannels.filter((_: any, i: number) => i !== index);
        setConfig({ ...config, popularChannels: newChannels });
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Community Management</h1>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Platform Ecosystem Configuration</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-11 px-8 text-white shadow-lg shadow-blue-500/20 font-bold uppercase tracking-widest text-[10px]">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-8">
                {/* Stats Section */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Activity className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg text-white">Community Stats</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={addStat} className="border-white/10 text-gray-400 hover:bg-white/5 h-8">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 p-6">
                        {config.stats.map((stat: any, i: number) => (
                            <div key={i} className="flex gap-4 items-end p-5 rounded-2xl bg-black/40 border border-white/5 group hover:border-blue-500/30 transition-all">
                                <div className="grid gap-2 flex-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Metric Label</label>
                                    <Input
                                        value={stat.label}
                                        onChange={(e) => {
                                            const newStats = [...config.stats];
                                            newStats[i].label = e.target.value;
                                            setConfig({ ...config, stats: newStats });
                                        }}
                                        className="bg-white/5 border-white/10 h-10 text-sm"
                                    />
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Current Value</label>
                                    <Input
                                        value={stat.value}
                                        onChange={(e) => {
                                            const newStats = [...config.stats];
                                            newStats[i].value = e.target.value;
                                            setConfig({ ...config, stats: newStats });
                                        }}
                                        className="bg-white/5 border-white/10 h-10 text-sm font-mono text-blue-400"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 h-10 w-10 transition-colors"
                                    onClick={() => removeStat(i)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Top Contributors */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg text-white">Elite Contributors</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={addContributor} className="border-white/10 text-gray-400 hover:bg-white/5 h-8">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Entry
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        {config.topContributors.map((user: any, i: number) => (
                            <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end p-5 rounded-2xl bg-black/40 border border-white/5 group hover:border-yellow-500/30 transition-all">
                                <div className="grid gap-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Username</label>
                                    <Input value={user.name} onChange={(e) => {
                                        const next = [...config.topContributors];
                                        next[i].name = e.target.value;
                                        setConfig({ ...config, topContributors: next });
                                    }} className="bg-white/5 border-white/10 h-10 text-sm" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Platform Distinction</label>
                                    <Input value={user.role} onChange={(e) => {
                                        const next = [...config.topContributors];
                                        next[i].role = e.target.value;
                                        setConfig({ ...config, topContributors: next });
                                    }} className="bg-white/5 border-white/10 h-10 text-sm" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Points Pool</label>
                                    <Input type="number" value={user.points} onChange={(e) => {
                                        const next = [...config.topContributors];
                                        next[i].points = parseInt(e.target.value);
                                        setConfig({ ...config, topContributors: next });
                                    }} className="bg-white/5 border-white/10 h-10 text-sm font-mono text-yellow-500" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="grid gap-2 flex-1">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Initials</label>
                                        <Input value={user.avatar} onChange={(e) => {
                                            const next = [...config.topContributors];
                                            next[i].avatar = e.target.value;
                                            setConfig({ ...config, topContributors: next });
                                        }} className="bg-white/5 border-white/10 h-10 text-sm text-center font-bold" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 h-10 w-10 transition-colors" onClick={() => removeContributor(i)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Events */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg text-white">Live Events</CardTitle>
                            </div>
                            <Button variant="outline" size="sm" onClick={addEvent} className="border-white/10 text-gray-400 hover:bg-white/5 h-8">
                                <Plus className="h-3.5 w-3.5 mr-1" /> New
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            {config.upcomingEvents.map((event: any, i: number) => (
                                <div key={i} className="flex flex-col gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 group hover:border-green-500/30 transition-all">
                                    <div className="grid gap-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Event Title</label>
                                        <Input value={event.title} onChange={(e) => {
                                            const next = [...config.upcomingEvents];
                                            next[i].title = e.target.value;
                                            setConfig({ ...config, upcomingEvents: next });
                                        }} className="bg-white/5 border-white/10 h-10 text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Timestamp</label>
                                            <Input value={event.date} onChange={(e) => {
                                                const next = [...config.upcomingEvents];
                                                next[i].date = e.target.value;
                                                setConfig({ ...config, upcomingEvents: next });
                                            }} className="bg-white/5 border-white/10 h-10 text-sm" placeholder="Feb 15, 20:00" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Type</label>
                                            <Input value={event.type} onChange={(e) => {
                                                const next = [...config.upcomingEvents];
                                                next[i].type = e.target.value;
                                                setConfig({ ...config, upcomingEvents: next });
                                            }} className="bg-white/5 border-white/10 h-10 text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button variant="ghost" size="sm" className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 h-8" onClick={() => removeEvent(i)}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Expel Event
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Channels */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg text-white">Core Nodes</CardTitle>
                            </div>
                            <Button variant="outline" size="sm" onClick={addChannel} className="border-white/10 text-gray-400 hover:bg-white/5 h-8">
                                <Plus className="h-3.5 w-3.5 mr-1" /> New
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            {config.popularChannels.map((channel: any, i: number) => (
                                <div key={i} className="flex flex-col gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 group hover:border-purple-500/30 transition-all">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Channel Name</label>
                                            <Input value={channel.name} onChange={(e) => {
                                                const next = [...config.popularChannels];
                                                next[i].name = e.target.value;
                                                setConfig({ ...config, popularChannels: next });
                                            }} className="bg-white/5 border-white/10 h-10 text-sm font-bold text-purple-400" placeholder="general" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Pop. Index</label>
                                            <Input type="number" value={channel.members} onChange={(e) => {
                                                const next = [...config.popularChannels];
                                                next[i].members = parseInt(e.target.value);
                                                setConfig({ ...config, popularChannels: next });
                                            }} className="bg-white/5 border-white/10 h-10 text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Broadcast Description</label>
                                        <Input value={channel.description} onChange={(e) => {
                                            const next = [...config.popularChannels];
                                            next[i].description = e.target.value;
                                            setConfig({ ...config, popularChannels: next });
                                        }} className="bg-white/5 border-white/10 h-10 text-sm text-gray-400" />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button variant="ghost" size="sm" className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 h-8" onClick={() => removeChannel(i)}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Expel Node
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
