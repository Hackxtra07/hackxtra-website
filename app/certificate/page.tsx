'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Download, Award, Loader2, FileText } from 'lucide-react';

export default function CertificatePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        achievement: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            router.push('/login');
            return;
        }
        // Pre-fill name from profile
        fetch('/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                setForm(f => ({
                    ...f,
                    name: data.username || '',
                    achievement: `Completing Cybersecurity Challenges with ${data.points ?? 0} Points`,
                }));
            })
            .catch(() => { })
            .finally(() => setProfileLoading(false));
    }, []);

    const handleDownload = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) { router.push('/login'); return; }
        if (!form.name.trim()) {
            toast({ title: 'Name required', description: 'Please enter your name for the certificate.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                name: form.name.trim(),
                achievement: form.achievement.trim() || `Completing Cybersecurity Challenges on HackXtras`,
            });
            const res = await fetch(`/api/certificate?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(err.error || 'Generation failed');
            }

            // Trigger browser download
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${form.name.replace(/\s+/g, '_')}-certificate.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({ title: 'Certificate Downloaded!', description: 'Your PDF certificate is ready.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to generate certificate', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-32 pb-24 px-6">
                <div className="max-w-2xl mx-auto space-y-8">

                    {/* Hero */}
                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                                <Award className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold font-display">Certificate Generator</h1>
                        <p className="text-muted-foreground text-lg">
                            Download a professionally designed PDF certificate for your HackXtras achievements.
                        </p>
                    </div>

                    {/* Preview Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-slate-900 via-[#0d1229] to-slate-900 p-8 shadow-2xl">
                        {/* Decorative border top */}
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
                        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

                        <div className="text-center space-y-2 py-6">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-primary font-bold text-sm tracking-widest uppercase">HACK</span>
                                <span className="text-slate-200 font-bold text-sm tracking-widest uppercase">XTRAS</span>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">Certificate of Achievement</p>
                            <p className="text-xs text-slate-500 italic">This certifies that</p>
                            <p className="text-2xl font-bold text-primary truncate">
                                {form.name || <span className="text-slate-600 font-normal italic">Your Name</span>}
                            </p>
                            <p className="text-xs text-slate-500 italic">has successfully completed</p>
                            <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                                {form.achievement || <span className="text-slate-600 italic">Achievement description</span>}
                            </p>
                            <div className="pt-4 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-700/50 mt-4">
                                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span>HackXtras Team</span>
                            </div>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>

                    {/* Form */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-4 h-4 text-primary" />
                                Customize Your Certificate
                            </CardTitle>
                            <CardDescription>Edit the fields below — the preview above updates live.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {profileLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading profile…
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="cert-name">Recipient Name</Label>
                                        <Input
                                            id="cert-name"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="e.g. John Doe"
                                            maxLength={80}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cert-achievement">Achievement</Label>
                                        <Input
                                            id="cert-achievement"
                                            value={form.achievement}
                                            onChange={e => setForm(f => ({ ...f, achievement: e.target.value }))}
                                            placeholder="e.g. Completing 50 CTF Challenges"
                                            maxLength={120}
                                        />
                                        <p className="text-xs text-muted-foreground">Describe what you achieved — keep it concise.</p>
                                    </div>
                                    <Button
                                        onClick={handleDownload}
                                        disabled={loading || !form.name.trim()}
                                        className="w-full gap-2 mt-2"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                                        ) : (
                                            <><Download className="w-4 h-4" /> Download Certificate</>
                                        )}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
