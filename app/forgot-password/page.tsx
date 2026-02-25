'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Request failed');
            }

            setSubmitted(true);
            toast({ title: "Email sent!", description: "Check your inbox for a reset link." });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                                HackXtras
                            </span>
                        </Link>
                        <h1 className="text-3xl font-bold">Reset Password</h1>
                        <p className="mt-2 text-muted-foreground">
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    <div className="bg-card border border-border/50 p-8 rounded-xl shadow-sm">
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Sending link...' : 'Send Reset Link'}
                                </Button>

                                <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to login
                                </Link>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-green-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Check your email</h2>
                                    <p className="text-muted-foreground">
                                        We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                                    Try another email
                                </Button>
                                <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
