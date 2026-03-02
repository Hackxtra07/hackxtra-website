'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Lock, Mail, Loader2, Cpu, Fingerprint, Zap, Globe, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identity verification failed');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminEmail', data.admin.email);
      toast({ title: 'Authentication Successful', description: 'Access granted to the HackXtra Command Center.' });
      router.push('/admin/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Identity verification failed';
      toast({ title: 'Access Denied', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

          <div className="p-10 md:p-14">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="p-4 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 shadow-lg shadow-blue-500/10">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
                Nexus Portal
              </h1>
              <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
                HackXtra Administrative Terminal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Identity Identifier</Label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="OPERATIVE_ID@HACKXTRA.GRID"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-16 pl-14 bg-black/40 border-white/10 focus:border-blue-500/50 rounded-2xl text-white font-mono placeholder:text-gray-800 transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Security Key</Label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-16 pl-14 bg-black/40 border-white/10 focus:border-blue-500/50 rounded-2xl text-white font-mono placeholder:text-gray-800 transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-blue-500/20 border border-blue-400/20 rounded-2xl transition-all active:scale-95 group"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin opacity-50" />
                      Decrypting Access...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Initialize Authorization
                    </div>
                  )}
                </Button>

                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Audit Protocol Active</span>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-700">AES-256 Encrypted</div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
              <Cpu size={14} className="text-blue-500" />
              <Zap size={14} className="text-indigo-500" />
              <Globe size={14} className="text-emerald-500" />
            </div>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-relaxed max-w-[280px]">
              Access restricted to Level-5 Clearance Operatives only. Unauthorized entry attempts are logged and reported to Central Command.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Footer Branding */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 opacity-20 flex flex-col items-center gap-2 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-white">HackXtra</p>
        <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>
    </div>
  );
}
