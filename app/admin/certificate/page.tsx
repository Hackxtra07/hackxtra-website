'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Send, User as UserIcon, Award } from 'lucide-react';
import { useApi } from '@/hooks/use-api';

interface User {
    _id: string;
    username: string;
    email: string;
    points: number;
}

export default function AdminCertificatePage() {
    const { toast } = useToast();
    const { request, loading: apiLoading } = useApi();
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');
        if (userId && users.length > 0) {
            const user = users.find(u => u._id === userId);
            if (user) setSelectedUser(user);
        }
    }, [users]);

    const fetchUsers = async () => {
        try {
            const data = await request('/api/users');
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
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

            // Use fetch with auth token — window.open() strips the Authorization header
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/certificate?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `Server error ${response.status}`);
            }

            // Download the PDF as a blob
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
                toast({ title: 'Success', description: `Certificate generated and user ${selectedUser.username} notified via message.` });
            } else {
                toast({ title: 'Success', description: `Certificate generated for ${selectedUser.username}.` });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to generate certificate';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Award className="w-8 h-8 text-blue-500" /> Certificate Manager
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">Issue official achievement certificates to platform users.</p>
                </div>
                {selectedUser && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedUser(null);
                            setAchievement('');
                        }}
                        className="w-fit border-white/10 text-gray-400 hover:text-white"
                    >
                        Clear Selection
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Search Section */}
                <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col h-[500px] md:h-[600px]">
                    <CardHeader className="pb-3 px-4 md:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <Search className="w-4 h-4 text-blue-400" /> Find User
                        </CardTitle>
                        <CardDescription className="text-gray-500 text-xs text-balance">Search by username or email address.</CardDescription>
                    </CardHeader>
                    <div className="px-4 md:px-6 pb-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <Input
                                placeholder="Filter users..."
                                className="pl-10 bg-black/40 border-white/10 focus:border-blue-500/50 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <CardContent className="flex-1 overflow-y-auto pr-1 px-2 md:px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                        {filteredUsers.length === 0 && searchQuery && (
                            <div className="text-center py-12 text-gray-500 italic space-y-2">
                                <Users className="w-8 h-8 mx-auto opacity-20" />
                                <p>No users found matching "{searchQuery}"</p>
                            </div>
                        )}
                        {filteredUsers.map(user => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedUser?._id === user._id
                                    ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${selectedUser?._id === user._id ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                                        }`}>
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-gray-200 truncate">{user.username}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-mono font-bold text-blue-400">{user.points} pt</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Configuration Section */}
                <Card className={`lg:col-span-3 border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 ${!selectedUser ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                    <CardHeader className="px-4 md:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <FileText className="w-4 h-4 text-blue-400" /> Certificate Options
                        </CardTitle>
                        <CardDescription className="text-gray-500 text-xs">Configure details for the selected recipient.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-4 md:px-6">
                        {selectedUser ? (
                            <>
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <Label className="text-[10px] uppercase tracking-widest text-blue-400/70 font-bold mb-1 block">Active Recipient</Label>
                                        <p className="text-xl font-bold text-white truncate">{selectedUser.username}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="achievement" className="text-gray-300 text-sm">Custom Achievement Text</Label>
                                    <Input
                                        id="achievement"
                                        placeholder={`Completing Cybersecurity Challenges with ${selectedUser.points} Points`}
                                        className="bg-black/40 border-white/10 focus:border-blue-500/50 h-12"
                                        value={achievement}
                                        onChange={(e) => setAchievement(e.target.value)}
                                    />
                                    <div className="flex items-start gap-2 bg-white/5 p-3 rounded-lg">
                                        <InformationCircle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                            If left blank, it defaults to: "Completing Cybersecurity Challenges with {selectedUser.points} Points"
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <Button
                                        className="w-full gap-2 h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 order-2 sm:order-1"
                                        onClick={() => handleGenerate(true)}
                                        disabled={processing}
                                    >
                                        {processing ? 'Processing...' : (
                                            <>
                                                <Send className="w-5 h-5" /> Generate & Notify
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 h-14 border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 order-1 sm:order-2"
                                        onClick={() => handleGenerate(false)}
                                        disabled={processing}
                                    >
                                        <FileText className="w-5 h-5" /> Instant Download
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="py-24 text-center flex flex-col items-center gap-4 text-gray-600">
                                <div className="relative">
                                    <UserIcon className="w-16 h-16 opacity-10" />
                                    <Award className="w-8 h-8 absolute -bottom-2 -right-2 text-blue-500 opacity-20" />
                                </div>
                                <p className="max-w-[200px] text-sm">Select a user from the list to visualize and configure their certificate</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Simple Info Icon replacement since I don't know if Info exists in lucide-react here
function InformationCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
    );
}
