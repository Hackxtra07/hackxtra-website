'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Github, Twitter, Linkedin, LogOut, Code, User, Settings as SettingsIcon, Mail, Crown } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    points: number;
    badges: string[];
    solvedChallenges?: string[];
    bio?: string;
    country: string;
    isPro?: boolean;
    socialLinks: {
        twitter?: string;
        github?: string;
        linkedin?: string;
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState({
        bio: '',
        twitter: '',
        github: '',
        linkedin: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchProfile(token);
    }, []);

    const fetchProfile = async (token: string) => {
        try {
            const res = await fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch profile');

            const data = await res.json();
            setProfile(data);
            setEditForm({
                bio: data.bio || '',
                twitter: data.socialLinks?.twitter || '',
                github: data.socialLinks?.github || '',
                linkedin: data.socialLinks?.linkedin || '',
            });
        } catch (error) {
            console.error(error);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        router.push('/login');
        router.refresh();
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('userToken');
        if (!token) return;

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bio: editForm.bio,
                    socialLinks: {
                        twitter: editForm.twitter,
                        github: editForm.github,
                        linkedin: editForm.linkedin,
                    }
                })
            });

            if (!res.ok) throw new Error('Update failed');

            const updated = await res.json();
            setProfile(updated);
            toast({ title: 'Success', description: 'Profile updated' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!profile) return null;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Hero Profile Info */}
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 border-primary/20 text-4xl font-bold text-primary shadow-lg ring-4 ${profile.isPro ? 'ring-yellow-500/50 bg-gradient-to-br from-yellow-500/20 to-primary/10' : 'ring-background bg-primary/10'}`}>
                            {profile.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left flex-1 space-y-2">
                            <h1 className="text-4xl font-bold font-display">{profile.username}</h1>
                            <p className="text-muted-foreground text-lg">{profile.email}</p>
                            <div className="flex gap-4 justify-center md:justify-start items-center">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                                    {profile.country}
                                </span>
                                {profile.isPro && (
                                    <span className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                        <Crown className="w-3 h-3" /> PREMIUM
                                    </span>
                                )}
                                {profile.socialLinks?.github && (
                                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                                )}
                                {profile.socialLinks?.twitter && (
                                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                                )}
                                {profile.socialLinks?.linkedin && (
                                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
                                )}
                            </div>
                            {profile.isPro && (
                                <div className="text-xs font-bold text-yellow-500/80 tracking-widest uppercase flex items-center gap-2">
                                    <div className="h-px bg-yellow-500/30 flex-1 w-8" />
                                    VIP Access Active
                                    <div className="h-px bg-yellow-500/30 flex-1 w-8" />
                                </div>
                            )}
                            <div className="pt-2">
                                <Link href="/dashboard/inbox">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Mail className="w-4 h-4" /> Inbox
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <Card className={`backdrop-blur-md border-t-2 ${profile.isPro ? 'border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'bg-card/50 border-border/50'}`}>
                                <CardContent className="p-4 text-center">
                                    <div className={`text-3xl font-bold mb-1 ${profile.isPro ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-primary'}`}>{profile.points}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Points</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Bio & Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Bio</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {profile.bio || "This user hasn't written a bio yet."}
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base"><Code className="w-4 h-4" /> Solved Challenges</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{profile.solvedChallenges?.length || 0}</div>
                                            <p className="text-xs text-muted-foreground">Challenges Completed</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base"><Trophy className="w-4 h-4 text-yellow-500" /> Badges Earned</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{profile.badges.length}</div>
                                            <p className="text-xs text-muted-foreground">Total Achievements</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Badges Grid */}
                            <div className="pt-4">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Medal className="w-5 h-5 text-primary" /> Achievements
                                </h3>
                                {profile.badges.length === 0 ? (
                                    <Card className="bg-muted/20 border-border/50 border-dashed">
                                        <CardContent className="p-8 text-center text-muted-foreground">
                                            No badges earned yet. Complete challenges to earn them!
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {profile.badges.map((badge, i) => (
                                            <Card key={i} className={`p-4 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 ${profile.isPro ? 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/40 hover:border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.05)] hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-gradient-to-br from-card to-background border-primary/20 hover:border-primary/50'}`}>
                                                <Medal className={`w-8 h-8 ${profile.isPro ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-yellow-500'}`} />
                                                <span className={`font-medium text-sm ${profile.isPro ? 'text-yellow-100' : ''}`}>{badge}</span>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Settings</CardTitle>
                                    <CardDescription>Update your personal information and profile display.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdate} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Bio</Label>
                                            <Textarea
                                                value={editForm.bio}
                                                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                                placeholder="Tell us about yourself..."
                                                className="min-h-[120px]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label>Twitter</Label>
                                                <Input
                                                    value={editForm.twitter}
                                                    onChange={e => setEditForm({ ...editForm, twitter: e.target.value })}
                                                    placeholder="https://twitter.com/..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>GitHub</Label>
                                                <Input
                                                    value={editForm.github}
                                                    onChange={e => setEditForm({ ...editForm, github: e.target.value })}
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>LinkedIn</Label>
                                                <Input
                                                    value={editForm.linkedin}
                                                    onChange={e => setEditForm({ ...editForm, linkedin: e.target.value })}
                                                    placeholder="https://linkedin.com/..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-4 border-t">
                                            <Button type="button" variant="destructive" onClick={handleLogout} className="gap-2">
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </Button>
                                            <Button type="submit">Save Changes</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
}
