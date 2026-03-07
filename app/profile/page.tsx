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
import { Trophy, Medal, Github, Twitter, Linkedin, LogOut, Code, User, Settings as SettingsIcon, Mail, Crown, ShieldCheck, ShieldOff, Shield } from 'lucide-react';
import Link from 'next/link';
import { OTPInput, REGEXP_ONLY_DIGITS, SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';

interface Certificate {
    _id: string;
    achievement: string;
    certId: string;
    issuedAt: string;
}

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    points: number;
    badges: string[];
    solvedChallenges?: string[];
    certificates?: Certificate[];
    bio?: string;
    country: string;
    isPro?: boolean;
    twoFA?: { enabled: boolean };
    socialLinks: {
        twitter?: string;
        github?: string;
        linkedin?: string;
    };
}

function OtpSlot({ char, hasFakeCaret, isActive }: SlotProps) {
    return (
        <div className={cn(
            'w-10 h-12 flex items-center justify-center border rounded-lg text-lg font-mono font-bold transition-all',
            isActive ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card',
        )}>
            {char ?? <span className="text-muted-foreground/30">·</span>}
            {hasFakeCaret && <div className="w-px h-5 bg-primary animate-caret-blink ml-px" />}
        </div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState({ bio: '', twitter: '', github: '', linkedin: '' });

    // 2FA state
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [twoFAStep, setTwoFAStep] = useState<'idle' | 'setup' | 'disabling'>('idle');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [twoFALoading, setTwoFALoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) { router.push('/login'); return; }
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
            setTwoFAEnabled(!!data.twoFA?.enabled);
            setEditForm({
                bio: data.bio || '',
                twitter: data.socialLinks?.twitter || '',
                github: data.socialLinks?.github || '',
                linkedin: data.socialLinks?.linkedin || '',
            });
        } catch {
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    bio: editForm.bio,
                    socialLinks: { twitter: editForm.twitter, github: editForm.github, linkedin: editForm.linkedin },
                }),
            });
            if (!res.ok) throw new Error('Update failed');
            const updated = await res.json();
            setProfile(updated);
            toast({ title: 'Success', description: 'Profile updated' });
        } catch {
            toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
        }
    };

    // ── 2FA handlers ──────────────────────────────────────────────────────────
    const startSetup2FA = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        setTwoFALoading(true);
        try {
            const res = await fetch('/api/auth/2fa/setup', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setQrDataUrl(data.qrDataUrl);
            setTotpCode('');
            setTwoFAStep('setup');
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to start 2FA setup', variant: 'destructive' });
        } finally {
            setTwoFALoading(false);
        }
    };

    const confirmSetup2FA = async () => {
        if (totpCode.length !== 6) return;
        const token = localStorage.getItem('userToken');
        if (!token) return;
        setTwoFALoading(true);
        try {
            const res = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ token: totpCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTwoFAEnabled(true);
            setTwoFAStep('idle');
            setTotpCode('');
            toast({ title: '2FA Enabled', description: 'Two-factor authentication is now active.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Invalid code', variant: 'destructive' });
        } finally {
            setTwoFALoading(false);
        }
    };

    const disable2FA = async () => {
        if (totpCode.length !== 6) return;
        const token = localStorage.getItem('userToken');
        if (!token) return;
        setTwoFALoading(true);
        try {
            const res = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ token: totpCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTwoFAEnabled(false);
            setTwoFAStep('idle');
            setTotpCode('');
            toast({ title: '2FA Disabled', description: 'Two-factor authentication has been turned off.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Invalid code', variant: 'destructive' });
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleDownloadCertificate = async (achievement: string) => {
        const token = localStorage.getItem('userToken');
        if (!token || !profile) return;

        try {
            const params = new URLSearchParams({
                userId: profile._id,
                achievement: achievement
            });
            const res = await fetch(`/api/certificate?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate-${achievement.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            toast({ title: 'Error', description: 'Failed to download certificate', variant: 'destructive' });
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
                        <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="certificates">Certificates</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="certificates" className="space-y-6">
                            <Card className="border-border/50 bg-card/30 backdrop-blur-xl group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                                <CardHeader className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                <Award className="w-6 h-6 text-primary" />
                                                Verified Credentials
                                            </CardTitle>
                                            <CardDescription className="font-medium mt-1">Official manifolds of your cybersecurity prowess.</CardDescription>
                                        </div>
                                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Verified
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    {!profile.certificates || profile.certificates.length === 0 ? (
                                        <div className="py-20 text-center flex flex-col items-center gap-6 opacity-40">
                                            <Award className="w-20 h-20 text-muted-foreground" />
                                            <div>
                                                <p className="font-bold text-lg">No Credentials Issued</p>
                                                <p className="text-sm">Complete high-level challenges or achievements to earn professional certification.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {profile.certificates.map((cert) => (
                                                <Card key={cert._id} className="bg-black/40 border-white/5 hover:border-primary/40 transition-all duration-500 overflow-hidden group/cert">
                                                    <div className="p-6 flex gap-6">
                                                        <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover/cert:scale-110 transition-transform duration-500 shadow-2xl">
                                                            <Award className="w-10 h-10" />
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <h4 className="font-black text-white tracking-tight leading-tight line-clamp-2">{cert.achievement}</h4>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">ID: {cert.certId}</span>
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => handleDownloadCertificate(cert.achievement)}
                                                                className="w-full h-10 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-black uppercase tracking-widest text-[9px] gap-2 rounded-xl border border-primary/20 transition-all active:scale-95"
                                                            >
                                                                Download Credential
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
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
                                                <Input value={editForm.twitter} onChange={e => setEditForm({ ...editForm, twitter: e.target.value })} placeholder="https://twitter.com/..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>GitHub</Label>
                                                <Input value={editForm.github} onChange={e => setEditForm({ ...editForm, github: e.target.value })} placeholder="https://github.com/..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>LinkedIn</Label>
                                                <Input value={editForm.linkedin} onChange={e => setEditForm({ ...editForm, linkedin: e.target.value })} placeholder="https://linkedin.com/..." />
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-4 border-t">
                                            <Button type="button" variant="destructive" onClick={handleLogout} className="gap-2">
                                                <LogOut className="w-4 h-4" /> Logout
                                            </Button>
                                            <Button type="submit">Save Changes</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Security Tab ─────────────────────────────────────────────── */}
                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" /> Two-Factor Authentication
                                    </CardTitle>
                                    <CardDescription>
                                        Add an extra layer of security. You'll need your authenticator app when signing in.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/20">
                                        {twoFAEnabled ? (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-green-500">2FA is Active</p>
                                                    <p className="text-xs text-muted-foreground">Your account is protected with TOTP.</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
                                                    <ShieldOff className="w-5 h-5 text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-orange-400">2FA is Disabled</p>
                                                    <p className="text-xs text-muted-foreground">Enable 2FA to secure your account.</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* ── Idle — Show action buttons ────────────────── */}
                                    {twoFAStep === 'idle' && (
                                        <div className="flex gap-3">
                                            {!twoFAEnabled ? (
                                                <Button onClick={startSetup2FA} disabled={twoFALoading} className="gap-2">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    {twoFALoading ? 'Generating QR...' : 'Enable 2FA'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => { setTwoFAStep('disabling'); setTotpCode(''); }}
                                                    className="gap-2"
                                                >
                                                    <ShieldOff className="w-4 h-4" /> Disable 2FA
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Setup flow ───────────────────────────────── */}
                                    {twoFAStep === 'setup' && (
                                        <div className="space-y-5 max-w-sm">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Step 1 — Scan the QR code</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Open <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app and scan:
                                                </p>
                                            </div>
                                            {qrDataUrl && (
                                                <div className="p-3 rounded-xl border bg-white w-fit">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={qrDataUrl} alt="2FA QR Code" className="w-44 h-44" />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Step 2 — Enter the 6-digit code to confirm</p>
                                                <OTPInput
                                                    id="setup-totp"
                                                    maxLength={6}
                                                    pattern={REGEXP_ONLY_DIGITS}
                                                    value={totpCode}
                                                    onChange={setTotpCode}
                                                    containerClassName="flex gap-2"
                                                    render={({ slots }) => (
                                                        <>{slots.map((slot, i) => <OtpSlot key={i} {...slot} />)}</>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={confirmSetup2FA}
                                                    disabled={twoFALoading || totpCode.length !== 6}
                                                    className="gap-2"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                    {twoFALoading ? 'Verifying...' : 'Confirm & Activate'}
                                                </Button>
                                                <Button variant="outline" onClick={() => { setTwoFAStep('idle'); setTotpCode(''); }}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Disable flow ─────────────────────────────── */}
                                    {twoFAStep === 'disabling' && (
                                        <div className="space-y-5 max-w-sm">
                                            <p className="text-sm text-muted-foreground">
                                                Enter your current authenticator code to disable 2FA.
                                            </p>
                                            <OTPInput
                                                id="disable-totp"
                                                maxLength={6}
                                                pattern={REGEXP_ONLY_DIGITS}
                                                value={totpCode}
                                                onChange={setTotpCode}
                                                containerClassName="flex gap-2"
                                                render={({ slots }) => (
                                                    <>{slots.map((slot, i) => <OtpSlot key={i} {...slot} />)}</>
                                                )}
                                            />
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="destructive"
                                                    onClick={disable2FA}
                                                    disabled={twoFALoading || totpCode.length !== 6}
                                                    className="gap-2"
                                                >
                                                    <ShieldOff className="w-4 h-4" />
                                                    {twoFALoading ? 'Disabling...' : 'Confirm Disable'}
                                                </Button>
                                                <Button variant="outline" onClick={() => { setTwoFAStep('idle'); setTotpCode(''); }}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                </CardContent>
                            </Card>


                        </TabsContent>
                    </Tabs>
                </div>
            </main >
            <Footer />
        </div >
    );
}
