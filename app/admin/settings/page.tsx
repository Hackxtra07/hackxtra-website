'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import {
    Settings, Mail, ShieldAlert, Server, Save, Loader2,
    Globe, Database, Terminal, Construction, UserPlus,
    Megaphone, Power, AlertTriangle, BadgeAlert
} from 'lucide-react';

export default function AdminSettingsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();

    const [settings, setSettings] = useState({
        contactEmail: '',
        maintenanceMode: false,
        allowSignups: true,
        announcement: '',
        announcementActive: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await request('/api/settings');
            if (data) {
                setSettings({
                    contactEmail: data.contactEmail || '',
                    maintenanceMode: !!data.maintenanceMode,
                    allowSignups: data.allowSignups !== false,
                    announcement: data.announcement || '',
                    announcementActive: !!data.announcementActive
                });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch global variables', variant: 'destructive' });
        }
    };

    const handleUpdateField = (field: string, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await request('/api/settings', {
                method: 'PUT',
                body: settings,
            });
            toast({ title: 'Success', description: 'System parameters synchronized!' });
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
                        Nexus Command
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md uppercase text-[10px] tracking-[0.2em]">Operational Parameter Calibration Hub</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        SYSTEM_LINK[OK]
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Critical Controls Card */}
                    <Card className="border-rose-500/20 bg-rose-500/5 backdrop-blur-md overflow-hidden relative rounded-[2.5rem] p-8">
                        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                            <Power size={150} className="text-rose-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-rose-400 uppercase tracking-wider">Kill Switches</h2>
                                    <p className="text-[10px] text-rose-500/50 font-bold uppercase tracking-widest mt-1">Matrix Emergency Overrides</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/5 transition-all hover:border-rose-500/30 group">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-tight">
                                            <Construction className="h-4 w-4 text-rose-500" />
                                            Maintenance Mode
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Lock the entire platform grid</p>
                                    </div>
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onCheckedChange={(val) => handleUpdateField('maintenanceMode', val)}
                                        className="data-[state=checked]:bg-rose-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/5 transition-all hover:border-indigo-500/30">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-tight">
                                            <UserPlus className="h-4 w-4 text-indigo-500" />
                                            Operative Ingress
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Toggle new account creation</p>
                                    </div>
                                    <Switch
                                        checked={settings.allowSignups}
                                        onCheckedChange={(val) => handleUpdateField('allowSignups', val)}
                                        className="data-[state=checked]:bg-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Announcement Card */}
                    <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md overflow-hidden relative rounded-[2.5rem] p-8">
                        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                            <Megaphone size={150} className="text-indigo-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    <Megaphone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Broadcast Terminal</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Platform-Wide Intelligence Feed</p>
                                </div>
                                <div className="ml-auto">
                                    <Switch
                                        checked={settings.announcementActive}
                                        onCheckedChange={(val) => handleUpdateField('announcementActive', val)}
                                        className="data-[state=checked]:bg-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Payload Content</Label>
                                <Textarea
                                    value={settings.announcement}
                                    onChange={(e) => handleUpdateField('announcement', e.target.value)}
                                    placeholder="Enter global communication payload..."
                                    className="min-h-[120px] bg-black/40 border-white/10 focus:border-indigo-500/50 rounded-2xl text-white font-mono text-xs leading-relaxed"
                                />
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                    <AlertTriangle size={12} />
                                    Signals only manifest if toggle is [ACTIVE]
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Mail Routing Card */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden relative rounded-[2.5rem] p-8 lg:col-span-2">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <Mail size={150} className="text-indigo-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Intelligence Hub</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Operational Destination Endpoint</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1">Admin Signal Hub</Label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-focus-within:bg-indigo-500 group-focus-within:text-white transition-all">
                                                <Database className="h-3.5 w-3.5" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={settings.contactEmail}
                                                onChange={(e) => handleUpdateField('contactEmail', e.target.value)}
                                                placeholder="admin@hackxtra.grid"
                                                required
                                                className="h-14 pl-14 bg-black/40 border-white/10 focus:border-indigo-500/50 rounded-2xl text-white font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-blue-500" />
                                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Grid Manifestation</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium italic">
                                            Handshakes from Contact Terminals and Hive Mind suggestions will be routed to this endpoint for manual decryption.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-black/60 p-8 rounded-[2rem] border border-white/5 font-mono text-[11px] space-y-4 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-30">
                                        <Server size={30} className="text-zinc-600" />
                                    </div>
                                    <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">ENV_DEPENDENCIES</h3>
                                    {[
                                        { k: 'SMTP_HOST', v: 'smtp.grid.net' },
                                        { k: 'SMTP_PORT', v: '587' },
                                        { k: 'SMTP_USER', v: 'admin@node' },
                                        { k: 'SMTP_STATUS', v: 'LOCKED', color: 'text-rose-500' }
                                    ].map(itm => (
                                        <div key={itm.k} className="flex justify-between items-center group/env">
                                            <span className="text-zinc-600 font-black">{itm.k}</span>
                                            <span className={`${itm.color || 'text-zinc-400'} group-hover/env:text-white transition-colors`}>{itm.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Footer Save Button */}
                <div className="flex justify-center pt-8">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-16 px-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-indigo-500/30 border border-indigo-400/20 rounded-3xl transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin opacity-50" />
                                COMMITTING_CHANGES...
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 relative z-10">
                                <Save className="h-5 w-5 transition-transform group-hover:scale-110" />
                                SYNCHRONIZE COMMANDS
                            </div>
                        )}
                    </Button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-10 opacity-20 py-10 grayscale pointer-events-none">
                <Globe size={30} />
                <Server size={30} />
                <Database size={30} />
                <ShieldAlert size={30} />
            </div>
        </div>
    );
}
