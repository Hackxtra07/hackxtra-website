"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Save, Users, MessageSquare, Trophy, Globe, Shield, Zap } from "lucide-react";
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
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Community Management</h1>
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            {/* Stats Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Community Stats</CardTitle>
                    <Button variant="outline" size="sm" onClick={addStat}><Plus className="h-4 w-4 mr-2" /> Add Stat</Button>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    {config.stats.map((stat: any, i: number) => (
                        <div key={i} className="flex gap-2 items-end p-4 border rounded-lg bg-muted/20">
                            <div className="grid gap-2 flex-1">
                                <label className="text-xs font-medium">Label</label>
                                <Input value={stat.label} onChange={(e) => {
                                    const newStats = [...config.stats];
                                    newStats[i].label = e.target.value;
                                    setConfig({ ...config, stats: newStats });
                                }} />
                            </div>
                            <div className="grid gap-2 flex-1">
                                <label className="text-xs font-medium">Value</label>
                                <Input value={stat.value} onChange={(e) => {
                                    const newStats = [...config.stats];
                                    newStats[i].value = e.target.value;
                                    setConfig({ ...config, stats: newStats });
                                }} />
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeStat(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Top Contributors</CardTitle>
                    <Button variant="outline" size="sm" onClick={addContributor}><Plus className="h-4 w-4 mr-2" /> Add Contributor</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {config.topContributors.map((user: any, i: number) => (
                        <div key={i} className="grid grid-cols-4 gap-2 items-end p-4 border rounded-lg bg-muted/20">
                            <div className="grid gap-2">
                                <label className="text-xs font-medium">Name</label>
                                <Input value={user.name} onChange={(e) => {
                                    const next = [...config.topContributors];
                                    next[i].name = e.target.value;
                                    setConfig({ ...config, topContributors: next });
                                }} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-medium">Role</label>
                                <Input value={user.role} onChange={(e) => {
                                    const next = [...config.topContributors];
                                    next[i].role = e.target.value;
                                    setConfig({ ...config, topContributors: next });
                                }} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-medium">Points</label>
                                <Input type="number" value={user.points} onChange={(e) => {
                                    const next = [...config.topContributors];
                                    next[i].points = parseInt(e.target.value);
                                    setConfig({ ...config, topContributors: next });
                                }} />
                            </div>
                            <div className="flex gap-2">
                                <div className="grid gap-2 flex-1">
                                    <label className="text-xs font-medium">Initials</label>
                                    <Input value={user.avatar} onChange={(e) => {
                                        const next = [...config.topContributors];
                                        next[i].avatar = e.target.value;
                                        setConfig({ ...config, topContributors: next });
                                    }} />
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeContributor(i)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Events */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Upcoming Events</CardTitle>
                    <Button variant="outline" size="sm" onClick={addEvent}><Plus className="h-4 w-4 mr-2" /> Add Event</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {config.upcomingEvents.map((event: any, i: number) => (
                        <div key={i} className="grid grid-cols-5 gap-2 items-end p-4 border rounded-lg bg-muted/20">
                            <div className="grid gap-2 col-span-2">
                                <label className="text-xs font-medium">Title</label>
                                <Input value={event.title} onChange={(e) => {
                                    const next = [...config.upcomingEvents];
                                    next[i].title = e.target.value;
                                    setConfig({ ...config, upcomingEvents: next });
                                }} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-medium">Date/Time</label>
                                <Input value={event.date} onChange={(e) => {
                                    const next = [...config.upcomingEvents];
                                    next[i].date = e.target.value;
                                    setConfig({ ...config, upcomingEvents: next });
                                }} placeholder="Feb 15, 2026" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-medium">Type</label>
                                <Input value={event.type} onChange={(e) => {
                                    const next = [...config.upcomingEvents];
                                    next[i].type = e.target.value;
                                    setConfig({ ...config, upcomingEvents: next });
                                }} />
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500 mb-1" onClick={() => removeEvent(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </CardContent>
                {/* Channels */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Popular Channels</CardTitle>
                        <Button variant="outline" size="sm" onClick={addChannel}><Plus className="h-4 w-4 mr-2" /> Add Channel</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {config.popularChannels.map((channel: any, i: number) => (
                            <div key={i} className="grid grid-cols-4 gap-2 items-end p-4 border rounded-lg bg-muted/20">
                                <div className="grid gap-2">
                                    <label className="text-xs font-medium">Name</label>
                                    <Input value={channel.name} onChange={(e) => {
                                        const next = [...config.popularChannels];
                                        next[i].name = e.target.value;
                                        setConfig({ ...config, popularChannels: next });
                                    }} placeholder="general" />
                                </div>
                                <div className="grid gap-2 col-span-2">
                                    <label className="text-xs font-medium">Description</label>
                                    <Input value={channel.description} onChange={(e) => {
                                        const next = [...config.popularChannels];
                                        next[i].description = e.target.value;
                                        setConfig({ ...config, popularChannels: next });
                                    }} />
                                </div>
                                <div className="flex gap-2">
                                    <div className="grid gap-2 flex-1">
                                        <label className="text-xs font-medium">Members</label>
                                        <Input type="number" value={channel.members} onChange={(e) => {
                                            const next = [...config.popularChannels];
                                            next[i].members = parseInt(e.target.value);
                                            setConfig({ ...config, popularChannels: next });
                                        }} />
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeChannel(i)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
        </div>
    );
}
