'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { useToast } from '@/hooks/use-toast';
import { OTPInput, REGEXP_ONLY_DIGITS, SlotProps } from 'input-otp';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function OtpSlot({ char, hasFakeCaret, isActive }: SlotProps) {
    return (
        <div
            className={cn(
                'w-10 h-12 flex items-center justify-center border rounded-lg text-lg font-mono font-bold transition-all',
                isActive ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card',
                char ? 'text-foreground' : 'text-muted-foreground'
            )}
        >
            {char ?? <span className="text-muted-foreground/30">·</span>}
            {hasFakeCaret && (
                <div className="w-px h-5 bg-primary animate-caret-blink ml-px" />
            )}
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [totpCode, setTotpCode] = useState('');

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/user-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.requires2FA) {
                // Advance to 2FA step
                setStep('2fa');
                return;
            }

            // No 2FA — logged in
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');

            toast({ title: "Welcome back!", description: "Logged in successfully." });
            router.push('/');
            router.refresh();
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

    const handle2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (totpCode.length !== 6) {
            toast({ title: 'Invalid Code', description: 'Please enter the 6-digit code.', variant: 'destructive' });
            return;
        }
        setLoading(true);

        try {
            const res = await fetch('/api/auth/user-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, totpCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid 2FA code');
            }

            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');

            toast({ title: "Welcome back!", description: "Logged in successfully." });
            router.push('/');
            router.refresh();
        } catch (error) {
            toast({
                title: "Invalid Code",
                description: error instanceof Error ? error.message : "2FA verification failed",
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
                    {step === 'credentials' ? (
                        <>
                            <div className="text-center">
                                <h1 className="text-3xl font-bold">Sign in to your account</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Or <Link href="/signup" className="text-primary hover:underline">create a new account</Link>
                                </p>
                            </div>
                            <div className="bg-card border border-border/50 p-8 rounded-xl shadow-sm">
                                <form onSubmit={handleCredentials} className="space-y-6">
                                    <div>
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="password">Password</Label>
                                            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot password?</Link>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Signing in...' : 'Sign in'}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold">Two-Factor Auth</h1>
                                <p className="mt-2 text-muted-foreground text-sm">
                                    Open your authenticator app and enter the 6-digit code.
                                </p>
                            </div>

                            <div className="bg-card border border-border/50 p-8 rounded-xl shadow-sm">
                                <form onSubmit={handle2FA} className="space-y-6">
                                    <div className="flex justify-center">
                                        <OTPInput
                                            id="totp-input"
                                            maxLength={6}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            value={totpCode}
                                            onChange={setTotpCode}
                                            containerClassName="flex gap-2"
                                            render={({ slots }) => (
                                                <>
                                                    {slots.map((slot, idx) => (
                                                        <OtpSlot key={idx} {...slot} />
                                                    ))}
                                                </>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading || totpCode.length !== 6}>
                                        {loading ? 'Verifying...' : 'Verify Code'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => { setStep('credentials'); setTotpCode(''); }}
                                        className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ArrowLeft className="w-3 h-3" /> Back to login
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
