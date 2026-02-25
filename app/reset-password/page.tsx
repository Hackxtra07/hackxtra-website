'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast({
                title: "Invalid Link",
                description: "Password reset token is missing.",
                variant: "destructive"
            });
            router.push('/login');
        }
    }, [token, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive"
            });
        }

        if (password.length < 8) {
            return toast({
                title: "Error",
                description: "Password must be at least 8 characters.",
                variant: "destructive"
            });
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Reset failed');
            }

            setSuccess(true);
            toast({ title: "Success!", description: "Password updated." });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
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

    if (!token) return null;

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
                        <h1 className="text-3xl font-bold">Choose new password</h1>
                        <p className="mt-2 text-muted-foreground">
                            Enter your new password below.
                        </p>
                    </div>

                    <div className="bg-card border border-border/50 p-8 rounded-xl shadow-sm">
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        placeholder="Repeat your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Success!</h2>
                                    <p className="text-muted-foreground">
                                        Your password has been reset. Redirecting you to login...
                                    </p>
                                </div>
                                <Link href="/login">
                                    <Button className="w-full">Sign In Now</Button>
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
