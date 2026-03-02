'use client';

import { useEffect, useState } from 'react';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
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
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold font-display flex items-center gap-3">
                            <Award className="w-10 h-10 text-primary" /> Admin Certificate Manager
                        </h1>
                        <p className="text-muted-foreground text-lg">Search for a user and generate their official achievement certificate.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Search Section */}
                        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Search className="w-5 h-5 text-primary" /> Find User
                                </CardTitle>
                                <CardDescription>Search by username or email.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter name or email..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {filteredUsers.length === 0 && searchQuery && (
                                        <p className="text-center py-8 text-muted-foreground italic">No users found matching "{searchQuery}"</p>
                                    )}
                                    {filteredUsers.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => setSelectedUser(user)}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${selectedUser?._id === user._id
                                                ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]'
                                                : 'bg-background hover:bg-muted/50 border-border'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{user.username}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-primary">{user.points} pts</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Configuration Section */}
                        <Card className={`border-primary/20 bg-card/50 backdrop-blur-sm transition-opacity ${!selectedUser ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <FileText className="w-5 h-5 text-primary" /> Certificate Options
                                </CardTitle>
                                <CardDescription>Configure details for the selected user.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {selectedUser ? (
                                    <>
                                        <div className="pb-4 border-b border-border/50">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Generating for</Label>
                                            <p className="text-2xl font-bold flex items-center gap-2">
                                                <UserIcon className="w-5 h-5 text-primary" /> {selectedUser.username}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="achievement">Custom Achievement Text (Optional)</Label>
                                            <Input
                                                id="achievement"
                                                placeholder={`Completing Cybersecurity Challenges with ${selectedUser.points} Points`}
                                                value={achievement}
                                                onChange={(e) => setAchievement(e.target.value)}
                                            />
                                            <p className="text-[10px] text-muted-foreground">Leave empty to use the default achievement text based on points.</p>
                                        </div>

                                        <div className="pt-4 flex flex-col gap-3">
                                            <Button
                                                className="w-full gap-2 h-12 text-lg shadow-lg shadow-primary/20"
                                                onClick={() => handleGenerate(true)}
                                                disabled={processing}
                                            >
                                                <Send className="w-5 h-5" /> Generate & Notify User
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2"
                                                onClick={() => handleGenerate(false)}
                                                disabled={processing}
                                            >
                                                <FileText className="w-4 h-4" /> Just Download PDF
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
                                        <UserIcon className="w-12 h-12 opacity-20" />
                                        <p>Select a user from the list to continue</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
