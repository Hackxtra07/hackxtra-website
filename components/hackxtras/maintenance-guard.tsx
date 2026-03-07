'use client';

import { useEffect, useState } from 'react';
import { useProStatus } from '@/hooks/use-pro-status';
import { Construction, ShieldAlert, WifiOff, Terminal, Power, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading: authLoading } = useProStatus();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const [announcementActive, setAnnouncementActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setMaintenanceMode(!!data.maintenanceMode);
                    setAnnouncement(data.announcement || '');
                    setAnnouncementActive(!!data.announcementActive);
                }
            } catch (e) {
                console.error('Failed to fetch settings for guard');
            } finally {
                setLoading(false);
            }
        };

        checkMaintenance();
    }, []);

    // Check if current path is admin
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    if (loading || authLoading) return children;

    // If maintenance is on and user is not an admin, and we're not on an admin path
    if (maintenanceMode && !isAdmin && !isAdminPath) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 blur-[120px] rounded-full animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center max-w-2xl"
                >
                    <div className="inline-flex p-6 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-8 shadow-2xl shadow-rose-500/10 active:scale-95 transition-transform cursor-pointer group">
                        <Power className="h-16 w-16 group-hover:rotate-12 transition-transform duration-500" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 italic">
                        Node Disconnected
                    </h1>

                    <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

                        <p className="text-gray-400 font-medium text-lg leading-relaxed mb-8">
                            Platform Command has initiated a temporary <span className="text-rose-500 font-black italic">Grid Blackout</span> for critical infrastructure calibration. Normal operations will resume shortly.
                        </p>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-6 opacity-30">
                                <WifiOff size={20} />
                                <ShieldAlert size={20} />
                                <Terminal size={20} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">AES-256 Lockdown Protocol Active</p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-6">
                        <Button asChild variant="ghost" className="text-zinc-500 hover:text-white uppercase font-black tracking-[0.3em] text-[10px]">
                            <Link href="/">Retry Handshake</Link>
                        </Button>
                        <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
                    </div>
                </motion.div>

                <div className="fixed bottom-10 left-10 opacity-20 hidden md:block">
                    <p className="text-[10px] font-mono text-zinc-400">ERR_SYSTEM_MAINTENANCE_LOCKED</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {announcementActive && announcement && !isAdminPath && (
                <div className="bg-indigo-600 text-white py-2.5 px-4 relative z-[60] overflow-hidden group">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10 text-center">
                        <Megaphone className="h-4 w-4 shrink-0 animate-bounce" />
                        <p className="text-[11px] font-black uppercase tracking-widest leading-none">
                            {announcement}
                        </p>
                    </div>
                </div>
            )}
            {children}
        </>
    );
}
