'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Award, Globe, Clock, UserCog, Trash2, Save, Plus, Loader2, Shield, Search, Mail, ExternalLink, Calendar, MapPin, Fingerprint, Zap, Filter } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SocialLinks {
    twitter?: string;
    github?: string;
    linkedin?: string;
}

interface User {
    _id: string;
    username: string;
    email: string;
    points: number;
    badges: string[];
    country: string;
    role: 'user' | 'admin';
    bio?: string;
    socialLinks?: SocialLinks;
    avatarColor?: string;
    change?: 'up' | 'down' | 'same';
    isPro?: boolean;
    subscriptionExpiresAt?: string;
}

export default function AdminUsersPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        points: 0,
        badges: '',
        country: 'US',
        role: 'user',
        bio: '',
        twitter: '',
        github: '',
        linkedin: '',
        avatarColor: 'bg-indigo-500/20 text-indigo-400',
        change: 'same',
        password: '',
        isPro: false,
        subscriptionExpiresAt: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await request('/api/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                username: formData.username,
                email: formData.email,
                points: Number(formData.points),
                badges: formData.badges.split(',').map(t => t.trim()).filter(t => t),
                country: formData.country,
                role: formData.role,
                bio: formData.bio,
                socialLinks: {
                    twitter: formData.twitter,
                    github: formData.github,
                    linkedin: formData.linkedin,
                },
                avatarColor: formData.avatarColor,
                change: formData.change,
                password: formData.password || undefined,
                isPro: formData.isPro,
                subscriptionExpiresAt: formData.subscriptionExpiresAt || undefined,
            };

            if (editingId) {
                await request(`/api/users/${editingId}`, {
                    method: 'PUT',
                    body,
                });
                toast({ title: 'Success', description: 'Operative profile synchronized!' });
            } else {
                await request('/api/users', {
                    method: 'POST',
                    body,
                });
                toast({ title: 'Success', description: 'New operative instantiated!' });
            }
            resetForm();
            fetchUsers();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to harmonize operative data', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This extraction is irreversible.')) return;
        try {
            await request(`/api/users/${id}`, { method: 'DELETE' });
            toast({ title: 'Success', description: 'Operative decommissioned!' });
            fetchUsers();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to decommission operative', variant: 'destructive' });
        }
    };

    const handleEdit = (user: User) => {
        setFormData({
            username: user.username,
            email: user.email,
            points: user.points,
            badges: user.badges.join(', '),
            country: user.country,
            role: user.role,
            bio: user.bio || '',
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || '',
            linkedin: user.socialLinks?.linkedin || '',
            avatarColor: user.avatarColor || 'bg-indigo-500/20 text-indigo-400',
            change: (user.change as string) || 'same',
            password: '',
            isPro: user.isPro || false,
            subscriptionExpiresAt: user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toISOString().split('T')[0] : '',
        });
        setEditingId(user._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            points: 0,
            badges: '',
            country: 'US',
            role: 'user',
            bio: '',
            twitter: '',
            github: '',
            linkedin: '',
            avatarColor: 'bg-indigo-500/20 text-indigo-400',
            change: 'same',
            password: '',
            isPro: false,
            subscriptionExpiresAt: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredUsers = Array.isArray(users) ? users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:rotate-12 duration-500">
                            <Users className="h-8 w-8" />
                        </div>
                        Operative Directory
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Orchestrate credentials, authorities, and platform resonance for the global network.</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto relative z-10">
                    <div className="relative flex-1 lg:min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="SCAN REGISTRY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 pl-12 bg-black/40 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-indigo-500/50 transition-all placeholder:text-gray-700"
                        />
                    </div>
                    <Button
                        onClick={() => (showForm ? resetForm() : setShowForm(true))}
                        className={`h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all border flex-1 lg:flex-none ${showForm ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-indigo-600 border-indigo-400/30 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
                    >
                        {showForm ? 'Abort Entry' : <><Plus className="mr-2 h-4 w-4" /> New Operative</>}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 relative rounded-[2.5rem]">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Account Details */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Core Credentials</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Username Identifier</Label>
                                            <div className="relative">
                                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                                <Input
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-white placeholder:text-gray-700 rounded-2xl"
                                                    placeholder="GHOST_OPERATIVE"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Email Terminal</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-white placeholder:text-gray-700 rounded-2xl"
                                                    placeholder="terminal@operative.grid"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Security Phrase {editingId && '(Optional Update)'}</Label>
                                        <Input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 text-white placeholder:text-gray-700 font-mono rounded-2xl"
                                            required={!editingId}
                                            placeholder={editingId ? "••••••••" : "Harmonize base key"}
                                            minLength={6}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Access Authority</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={(val: any) => setFormData({ ...formData, role: val })}
                                            >
                                                <SelectTrigger className="bg-black/40 border-white/10 h-14 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:border-indigo-500/50">
                                                    <SelectValue placeholder="Select Clearance" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                    <SelectItem value="user" className="text-[10px] font-black uppercase tracking-widest py-3">User Access</SelectItem>
                                                    <SelectItem value="admin" className="text-[10px] font-black uppercase tracking-widest py-3 text-rose-400">Admin Root</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Combat Merits</Label>
                                            <div className="relative">
                                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                                <Input
                                                    type="number"
                                                    value={formData.points}
                                                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                                    className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-white font-mono text-indigo-400 font-black rounded-2xl"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${formData.isPro ? 'bg-amber-500/5 border-amber-500/20 ring-1 ring-amber-500/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                    {formData.isPro && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.05),transparent)] pointer-events-none" />}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${formData.isPro ? 'bg-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-gray-500/20 text-gray-600'}`}>
                                                <Award className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <Label htmlFor="isPro" className="font-black text-xs uppercase tracking-[0.2em] text-gray-200 cursor-pointer block">PRIME ELITE STATUS</Label>
                                                <p className="text-[10px] text-gray-500 font-medium">Elevate operative to high-clearance assets.</p>
                                            </div>
                                        </div>
                                        <Switch
                                            id="isPro"
                                            checked={formData.isPro}
                                            onCheckedChange={(val) => setFormData({ ...formData, isPro: val })}
                                            className="data-[state=checked]:bg-amber-500"
                                        />
                                    </div>

                                    {formData.isPro && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-amber-500/70 ml-1">Temporal Expiration</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
                                                <Input
                                                    type="date"
                                                    value={formData.subscriptionExpiresAt}
                                                    onChange={(e) => setFormData({ ...formData, subscriptionExpiresAt: e.target.value })}
                                                    className="bg-black/60 border-amber-500/10 focus:border-amber-500/50 h-12 pl-12 text-sm text-white invert-calendar-icon rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Operative Profile</h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Region Code</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                                <Input
                                                    value={formData.country}
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                    className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-white uppercase font-black tracking-widest placeholder:text-gray-800 rounded-2xl"
                                                    required
                                                    maxLength={2}
                                                    placeholder="US"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 grid gap-2">
                                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Distinction Tags (CSV)</Label>
                                            <div className="relative">
                                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                                <Input
                                                    value={formData.badges}
                                                    onChange={(e) => setFormData({ ...formData, badges: e.target.value })}
                                                    className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-14 pl-12 text-white text-[10px] font-black uppercase tracking-widest placeholder:text-gray-800 rounded-2xl"
                                                    placeholder="ELITE, SENTINEL, PHANTOM"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Operative Manifest (Bio)</Label>
                                        <Textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-32 text-white text-[11px] font-medium leading-relaxed resize-none p-6 placeholder:text-gray-800 rounded-[2rem]"
                                            placeholder="Documentative background and technical proficiencies..."
                                        />
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-gray-600" />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Neural Integrations</h4>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 group-focus-within:text-blue-400">X-LINK</span>
                                                <Input
                                                    value={formData.twitter}
                                                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                                    className="bg-black/20 border-white/5 focus:border-white/10 pl-20 h-12 text-[10px] font-bold text-white rounded-xl"
                                                    placeholder="PROFILE_KEY"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 group-focus-within:text-white">GH-LINK</span>
                                                <Input
                                                    value={formData.github}
                                                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                                    className="bg-black/20 border-white/5 focus:border-white/10 pl-20 h-12 text-[10px] font-bold text-white rounded-xl"
                                                    placeholder="PROFILE_KEY"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 group-focus-within:text-indigo-400">IN-LINK</span>
                                                <Input
                                                    value={formData.linkedin}
                                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                                    className="bg-black/20 border-white/5 focus:border-white/10 pl-20 h-12 text-[10px] font-bold text-white rounded-xl"
                                                    placeholder="PROFILE_KEY"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-16 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-xl shadow-indigo-500/20 border border-indigo-400/20 rounded-2xl" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                                    Harmonizing Operative...
                                </div>
                            ) : editingId ? (
                                <div className="flex items-center gap-3">
                                    <Save className="h-5 w-5" /> Finalize Profile Update
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Zap className="h-5 w-5" /> Instantiate Base Operative
                                </div>
                            )}
                        </Button>
                    </form>
                </Card>
            )}

            {/* Registry Table */}
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.03]">
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Registry Entry</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Authority</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Merit Points</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Distinctions</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="group hover:bg-white/[0.03] transition-all duration-500">
                                    <td className="px-8 py-8 whitespace-nowrap">
                                        <div className="flex items-center gap-5">
                                            <div className={`flex-shrink-0 h-16 w-16 rounded-[1.5rem] ${user.avatarColor || 'bg-white/5'} border border-white/10 flex items-center justify-center text-lg font-black text-white uppercase shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 relative overflow-hidden`}>
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                                {user.username.substring(0, 2)}
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <div className="text-base font-black text-white tracking-tight flex items-center gap-3">
                                                    {user.username}
                                                    {user.isPro && (
                                                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[8px] h-4.5 px-2 flex items-center font-black uppercase tracking-[0.2em] rounded-md shadow-[0_0_10px_rgba(245,158,11,0.2)]">PRIME</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                                    <Mail className="h-3 w-3 opacity-30" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-3 pt-1">
                                                    <div className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black tracking-widest text-indigo-400 flex items-center gap-2">
                                                        <MapPin size={10} />
                                                        {user.country || 'GL'}
                                                    </div>
                                                    {user.isPro && user.subscriptionExpiresAt && (
                                                        <div className="text-[9px] text-amber-500/60 flex items-center gap-1.5 font-bold italic">
                                                            <Clock size={10} />
                                                            {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap">
                                        <Badge className={`h-8 px-4 text-[9px] font-black uppercase tracking-[0.2em] border rounded-xl shadow-lg shadow-black/20 ${user.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-4 ring-rose-500/5' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 ring-4 ring-indigo-500/5'}`}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-white font-mono tracking-tighter group-hover:text-indigo-400 transition-colors uppercase flex items-center gap-2">
                                                <Zap size={18} className="text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                {user.points.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-7">Registry Acumen</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex flex-wrap gap-2 min-w-[180px]">
                                            {user.badges.slice(0, 2).map((b, i) => (
                                                <span key={i} className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.1em] rounded-xl bg-white/5 text-gray-400 border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                                                    {b}
                                                </span>
                                            ))}
                                            {user.badges.length > 2 && (
                                                <span className="w-8 h-8 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black text-indigo-400 flex items-center justify-center">
                                                    +{user.badges.length - 2}
                                                </span>
                                            )}
                                            {user.badges.length === 0 && (
                                                <span className="text-[9px] text-gray-700 italic font-medium px-1">VOID DISTINCTION</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 whitespace-nowrap text-right text-transparent group-hover:text-amber-500">
                                        <div className="flex justify-end items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 rounded-2xl transition-all shadow-lg"
                                                onClick={() => window.location.href = `/admin/certificate?userId=${user._id}`}
                                                title="Neural Certificate Build"
                                            >
                                                <FileText className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(user)}
                                                className="h-12 w-12 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all shadow-lg"
                                            >
                                                <UserCog className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(user._id)}
                                                className="h-12 w-12 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-2xl transition-all shadow-lg"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-8 group/empty">
                                            <div className="p-10 rounded-[3rem] bg-indigo-500/5 border-2 border-dashed border-indigo-500/10 transition-all group-hover/empty:scale-105 duration-700">
                                                <Users className="h-20 w-20 text-indigo-500 opacity-20" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Operative registry is currently void.</p>
                                                <p className="text-[8px] font-mono text-gray-800 tracking-[0.3em] uppercase">Initialize primary entry sequence to begin population...</p>
                                            </div>
                                            <Button
                                                onClick={() => setShowForm(true)}
                                                variant="outline"
                                                className="h-12 px-10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all"
                                            >
                                                Initialize Sequence
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        Displaying <span className="text-white">{filteredUsers.length}</span> Entitities in Grid
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" disabled className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-30 border border-white/5">Previous</Button>
                        <Button variant="ghost" disabled className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-30 border border-white/5">Next Block</Button>
                    </div>
                </div>
            </div>

            <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none p-20 select-none">
                <Users size={400} />
            </div>
        </div>
    );
}
