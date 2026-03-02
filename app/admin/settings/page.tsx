'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Settings, Mail, ShieldAlert, Server, Save, Loader2, Globe, Database, Terminal } from 'lucide-react';

export default function AdminSettingsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [contactEmail, setContactEmail] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await request('/api/settings');
            if (data && data.contactEmail) {
                setContactEmail(data.contactEmail);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch global variables', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await request('/api/settings', {
                method: 'PUT',
                body: { contactEmail },
            });
            toast({ title: 'Success', description: 'System variables synchronized!' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to harmonize settings', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:rotate-12 duration-500">
                            <Settings className="h-8 w-8" />
                        </div>
                        System Configuration
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Calibrate global platform parameters and infrastructure endpoints.</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        GRID ONLINE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Email Config Card */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden relative rounded-[2.5rem] p-8 md:p-10">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Mail size={150} className="text-indigo-500" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">Mail Routing</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Configure alert destination nodes</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-10 max-w-2xl leading-relaxed">
                            Define the primary administrative terminal where all system-generated intelligence (Contact Forms, High-Level Applications, User Suggestions) shall be aggregated.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
                            <div className="grid gap-3">
                                <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Alert Destination Terminal</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-focus-within:bg-indigo-500 group-focus-within:text-white transition-all">
                                        <Database className="h-3.5 w-3.5" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="admin@hackxtra.grid"
                                        required
                                        className="h-14 pl-14 bg-black/40 border-white/10 focus:border-indigo-500/50 rounded-2xl text-white font-mono"
                                    />
                                </div>
                                <p className="text-[9px] text-gray-500 font-medium italic ml-1 flex items-center gap-2">
                                    <ShieldAlert className="h-3 w-3" />
                                    This endpoint serves as the central hub for all automated form ingestions.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-14 px-10 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-indigo-500/20 border border-indigo-400/20 rounded-2xl transition-all"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                        Synchronizing Data...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Save className="h-4 w-4" /> Finalize Calibration
                                    </div>
                                )}
                            </Button>
                        </form>
                    </div>
                </Card>

                {/* SMTP Server Info - Static for now */}
                <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md overflow-hidden relative rounded-[2.5rem] p-8 md:p-10">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Server size={150} className="text-amber-500" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                <Terminal className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-amber-500 uppercase tracking-wider">Infrastructure Variables</h2>
                                <p className="text-[10px] text-amber-500/50 font-bold uppercase tracking-widest mt-1">Core Environment Dependencies</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-8 max-w-2xl leading-relaxed">
                            To maintain orbital communication stability, ensure the following SMTP parameters are correctly defined in your local <span className="text-amber-500 font-mono">.env</span> matrix.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/60 p-6 rounded-[2rem] border border-amber-500/10 font-mono text-[11px] space-y-3 shadow-inner">
                                <div className="flex justify-between items-center group">
                                    <span className="text-amber-500/40 font-black">SMTP_HOST</span>
                                    <span className="text-gray-300 group-hover:text-white transition-colors">smtp.grid.net</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-amber-500/40 font-black">SMTP_PORT</span>
                                    <span className="text-gray-300 group-hover:text-white transition-colors">587</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-amber-500/40 font-black">SMTP_SECURE</span>
                                    <span className="text-gray-300 group-hover:text-white transition-colors">false</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-amber-500/40 font-black">SMTP_USER</span>
                                    <span className="text-gray-300 group-hover:text-white transition-colors">admin@network.net</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-amber-500/40 font-black">SMTP_PASS</span>
                                    <span className="text-gray-300 group-hover:text-white transition-colors">••••••••••••••</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-4 p-6 bg-amber-500/10 rounded-[2rem] border border-amber-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-[10px]">!</div>
                                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Security Protocol</span>
                                </div>
                                <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium">
                                    Never expose these credentials in the frontend manifest. System variables are restricted to server-side orchestration only.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex items-center justify-center gap-10 opacity-20 py-10 grayscale pointer-events-none">
                <Globe size={40} />
                <Server size={40} />
                <Database size={40} />
                <ShieldAlert size={40} />
            </div>
        </div>
    );
}
