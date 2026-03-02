'use client';

import { useEffect, useState, use } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Send, User as UserIcon, Award, Users, ShieldCheck, Sparkles, Fingerprint, Loader2, ArrowRight, X } from 'lucide-react';
import { useApi } from '@/hooks/use-api';

interface User {
    _id: string;
    username: string;
    email: string;
    points: number;
}

export default function AdminCertificatePage() {
    const { toast } = useToast();
    const { request } = useApi();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [achievement, setAchievement] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await request('/api/users');
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            toast({ title: 'Access Denied', description: 'Failed to retrieve operator registry.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filtered = users.filter(u =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered.slice(0, 10)); // Limit to 10 for performance
    }, [searchQuery, users]);

    const handleGenerate = async (notify: boolean) => {
        if (!selectedUser) return;
        setProcessing(true);
        try {
            const params = new URLSearchParams({
                userId: selectedUser._id,
                name: selectedUser.username,
                achievement: achievement || `Completing Cybersecurity Challenges with ${selectedUser.points} Points`,
                notify: notify.toString()
            });

            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/certificate?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown encryption error' }));
                throw new Error(errorData.error || `Server error ${response.status}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${selectedUser.username}-certificate.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);

            if (notify) {
                toast({ title: 'Credential Dispatched', description: `Official certification sent to ${selectedUser.username} terminal.` });
            } else {
                toast({ title: 'Manifest Exported', description: `Local backup of ${selectedUser.username}'s credential finalized.` });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to manifest credential';
            toast({ title: 'Transmission Failure', description: message, variant: 'destructive' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Scanning Operator Registry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10">
                        <Award className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                            Honorary Credentialing
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Issue validated achievement manifolds to verified operatives.</p>
                    </div>
                </div>
                {selectedUser && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedUser(null);
                            setAchievement('');
                        }}
                        className="h-10 rounded-xl border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[9px] px-6"
                    >
                        <X className="mr-2 h-3 w-3" /> Reset Sequence
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Search / User Registry Card */}
                <Card className="lg:col-span-4 border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col h-[650px] rounded-[2.5rem] group">
                    <div className="p-8 border-b border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-400" /> Registry
                            </h3>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/search:text-indigo-400 transition-colors" />
                            <Input
                                placeholder="Sync operator..."
                                className="h-12 pl-12 bg-black/40 border-white/10 focus:border-indigo-500/50 rounded-xl text-white font-bold placeholder:text-gray-700 transition-all text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-none">
                        {filteredUsers.length === 0 && searchQuery && (
                            <div className="text-center py-12 text-gray-700 italic space-y-4 opacity-30">
                                <Search className="w-10 h-10 mx-auto" />
                                <p className="text-xs font-black uppercase tracking-widest">No Matches Found</p>
                            </div>
                        )}
                        {filteredUsers.map(user => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group/user ${selectedUser?._id === user._id
                                    ? 'bg-indigo-600/20 border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                                    : 'bg-white/2 hover:bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all duration-500 ${selectedUser?._id === user._id ? 'bg-indigo-500 text-black rotate-12' : 'bg-white/5 text-gray-500 group-hover/user:rotate-3'
                                        }`}>
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-white truncate">{user.username}</p>
                                        <p className="text-[10px] text-gray-600 font-bold truncate tracking-tight">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-black font-mono text-indigo-400 group-hover:scale-110 transition-transform">{user.points} XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Configuration / Manifest Area */}
                <div className="lg:col-span-8 space-y-10">
                    <Card className={`border-white/10 bg-white/5 backdrop-blur-md transition-all duration-700 rounded-[2.5rem] relative overflow-hidden ${!selectedUser ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-50" />

                        <div className="p-8 md:p-10 space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-2xl">
                                        <Fingerprint className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-1 flex items-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Validation Node
                                        </h3>
                                        <p className="text-2xl font-black text-white tracking-tighter">Manifesting: {selectedUser?.username || 'PENDING'}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block px-6 py-3 rounded-2xl bg-black/20 border border-white/5 text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Status Verification</p>
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Sparkles className="h-3 w-3" />
                                        <span className="text-[10px] font-bold tracking-widest">CLEARANCE GRANTED</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="achievement" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Credential Narration</Label>
                                <div className="relative group/input">
                                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-700 group-focus-within/input:text-indigo-400 transition-colors" />
                                    <Input
                                        id="achievement"
                                        placeholder={selectedUser ? `Completing Cybersecurity Challenges with ${selectedUser.points} Points` : 'Select user to begin...'}
                                        className="bg-black/40 border-white/10 focus:border-indigo-500/50 h-16 pl-14 rounded-2xl text-white font-bold placeholder:text-gray-800 transition-all text-sm"
                                        value={achievement}
                                        onChange={(e) => setAchievement(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-600 leading-relaxed italic ml-1 flex items-center gap-2 font-medium">
                                    <ArrowRight className="h-3 w-3 text-indigo-500/50" />
                                    Left null, it defaults to XP-based achievement manifest synchronization.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                                <Button
                                    className="w-full gap-3 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] shadow-2xl shadow-indigo-500/20 order-2 sm:order-1 border border-indigo-400/20 active:scale-95 transition-all"
                                    onClick={() => handleGenerate(true)}
                                    disabled={processing}
                                >
                                    {processing ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                        <>
                                            Authorize & Notify <Send className="w-5 h-5 text-indigo-200" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full gap-3 h-16 border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] order-1 sm:order-2 active:scale-95 transition-all"
                                    onClick={() => handleGenerate(false)}
                                    disabled={processing}
                                >
                                    Local Decryption <FileText className="w-5 h-5 opacity-40" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {!selectedUser && (
                        <div className="flex flex-col items-center justify-center p-12 text-center gap-6 opacity-40">
                            <div className="relative">
                                <UserIcon className="w-24 h-24 text-gray-800" />
                                <Award className="w-10 h-10 absolute -bottom-2 -right-2 text-indigo-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Waitlist Manifest</h4>
                                <p className="text-xs text-gray-600 font-bold max-w-[250px] mt-2">Initialize the sequence by selecting an operator from the encrypted registry.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
