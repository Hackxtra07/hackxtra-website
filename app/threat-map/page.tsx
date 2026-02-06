"use client";

import { Header } from "@/components/hackxtras/header";
import { ThreatMap, AttackData } from "@/components/hackxtras/threat-map";
import { COUNTRIES, ATTACK_TYPES } from "@/lib/countries";
import { motion } from "framer-motion";
import { ShieldAlert, Activity, Globe, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThreatMapPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [attacks, setAttacks] = useState<AttackData[]>([]);
    // Fix Hydration Error: Random numbers must be computed on client
    const [attackStats, setAttackStats] = useState({
        attacksPerSec: "CALCULATING...",
        blockedToday: "42,891,002"
    });

    useEffect(() => {
        // Initial cleanup
        setAttacks([]);
        setLogs([]);

        const interval = setInterval(() => {
            // Pick random Source and Target
            const countryKeys = Object.keys(COUNTRIES);
            const srcKey = countryKeys[Math.floor(Math.random() * countryKeys.length)];
            let dstKey = countryKeys[Math.floor(Math.random() * countryKeys.length)];

            // Ensure src != dst
            while (srcKey === dstKey) {
                dstKey = countryKeys[Math.floor(Math.random() * countryKeys.length)];
            }

            const src = COUNTRIES[srcKey];
            const dst = COUNTRIES[dstKey];
            const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];

            // Create Attack Object
            const newAttack: AttackData = {
                startLat: src.lat,
                startLng: src.lng,
                endLat: dst.lat,
                endLng: dst.lng,
                color: type.color,
                name: type.name
            };

            // Add visual attack
            setAttacks(prev => [...prev, newAttack].slice(-30)); // Keep last 30 visually

            // Add Log
            const log = `[${new Date().toLocaleTimeString()}] ${type.name}: ${src.code} -> ${dst.code}`;
            setLogs(prev => [log, ...prev].slice(0, 15)); // Keep last 15 logs

            // Update random stats with slight variation to look live
            setAttackStats(prev => ({
                ...prev,
                attacksPerSec: (Math.random() * 1000 + 400).toFixed(0)
            }));

        }, 1200); // New attack every 1.2s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-primary/30">
            <Header />

            {/* Background Grid/Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <main className="relative z-10 w-full h-screen pt-20 flex flex-col items-center justify-center">

                <div className="absolute top-24 w-full px-6 flex justify-between items-start pointer-events-none">
                    {/* Title / Status */}
                    <div className="pointer-events-auto">
                        <h1 className="text-4xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm">
                            GLOBAL THREAT MAP
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-green-500 font-mono text-sm animate-pulse">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            SYSTEM ONLINE / MONITORING ACTIVE
                        </div>
                    </div>

                    {/* Stats Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/40 backdrop-blur-md border border-green-500/30 p-4 rounded-xl w-64 pointer-events-auto"
                    >
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-500/20">
                            <span className="text-xs text-muted-foreground font-mono">THREAT LEVEL</span>
                            <span className="text-red-500 font-bold font-mono animate-pulse">CRITICAL</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Activity className="h-4 w-4 text-green-400" />
                                <div>
                                    <div className="text-xs text-muted-foreground">Attacks / Sec</div>
                                    <div className="text-lg font-mono font-bold">{attackStats.attacksPerSec}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="h-4 w-4 text-yellow-500" />
                                <div>
                                    <div className="text-xs text-muted-foreground">Blocked Today</div>
                                    <div className="text-lg font-mono font-bold">{attackStats.blockedToday}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* The Globe */}
                <div className="flex-1 w-full relative flex items-center justify-center scale-100 transition-transform duration-500">
                    {/* Globe Container - responsive width */}
                    <div className="w-full h-full md:max-w-4xl md:max-h-[800px] aspect-square">
                        <ThreatMap attacks={attacks} />
                    </div>
                </div>

                {/* Bottom Overlays */}
                <div className="absolute bottom-6 w-full px-6 flex flex-col md:flex-row gap-6 justify-between items-end pointer-events-none">

                    {/* Live Feed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/60 backdrop-blur-md border border-green-500/20 p-4 rounded-xl w-full md:w-96 pointer-events-auto h-48 overflow-hidden mask-gradient-b"
                    >
                        <div className="flex items-center gap-2 mb-2 text-green-400 font-mono text-xs uppercase tracking-widest border-b border-green-500/20 pb-2">
                            <Zap className="h-3 w-3" /> Live Attack Feed
                        </div>
                        <div className="font-mono text-xs space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="truncate text-green-500/80 first:text-white first:font-bold border-l-2 border-transparent first:border-green-500 pl-2 transition-all">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Top Targets */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-black/60 backdrop-blur-md border border-red-500/20 p-4 rounded-xl w-full md:w-64 pointer-events-auto hidden md:block"
                    >
                        <div className="flex items-center gap-2 mb-2 text-red-400 font-mono text-xs uppercase tracking-widest border-b border-red-500/20 pb-2">
                            <Globe className="h-3 w-3" /> Top Targets
                        </div>
                        <div className="space-y-2">
                            {["United States", "India", "Germany", "Brazil"].map((country, i) => (
                                <div key={country} className="flex justify-between items-center text-xs font-mono">
                                    <span className="text-muted-foreground">{i + 1}. {country}</span>
                                    <div className="h-1.5 rounded-full bg-red-900/50 w-16 overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${100 - i * 20}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>

            </main>
        </div>
    );
}
