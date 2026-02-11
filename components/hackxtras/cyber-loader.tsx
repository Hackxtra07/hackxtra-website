"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CyberLoader() {
    const [terminalText, setTerminalText] = useState("");
    const [percent, setPercent] = useState(0);

    // Simulate terminal text "decryption"
    useEffect(() => {
        const texts = [
            "INITIALIZING SYSTEM...",
            "BYPASSING FIREWALL...",
            "DECRYPTING ASSETS...",
            "ESTABLISHING SECURE CONNECTION...",
            "ACCESS GRANTED",
        ];
        let i = 0;
        const interval = setInterval(() => {
            setTerminalText(texts[i % texts.length]);
            i++;
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    // Simulate progress
    useEffect(() => {
        const interval = setInterval(() => {
            setPercent((prev) => (prev < 100 ? prev + 1 : 0));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0f14] overflow-hidden">
            {/* Background Grid Pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, #2761c3 1px, transparent 1px), linear-gradient(to bottom, #2761c3 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Scanning Line */}
            <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(35,220,175,0.5)] z-10"
            />

            {/* Main Hexagonal Logo / Core */}
            <div className="relative mb-12">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-2 border-primary/30 rounded-xl relative"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                    <div className="absolute inset-0 bg-primary/5 blur-xl animate-pulse" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center text-primary font-mono text-2xl font-bold"
                >
                    HX
                </motion.div>
            </div>

            {/* Terminal Text */}
            <div className="w-full max-w-md px-10 text-center space-y-4">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={terminalText}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-primary font-mono text-xs tracking-widest uppercase mb-2 h-4"
                    >
                        {terminalText}
                    </motion.p>
                </AnimatePresence>

                {/* Progress Bar Container */}
                <div className="relative w-full h-1 bg-white/5 border border-white/10 overflow-hidden">
                    <motion.div
                        animate={{ width: `${percent}%` }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-cyan-400 to-primary shadow-[0_0_10px_rgba(35,220,175,0.8)]"
                    />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-white/40 tracking-tighter">
                    <span>SECURE_BOOT_SEQUENCE</span>
                    <span className="text-primary/70">{percent.toString().padStart(3, '0')}%</span>
                </div>
            </div>

            {/* Randomized Background Data */}
            <div className="absolute top-10 left-10 opacity-20 font-mono text-[8px] text-primary/40 leading-tight hidden md:block">
                HEX_STREAM: 0x4F 0x6E 0x65 0x20 0x54 <br />
                IP_ADDRESS: 192.168.1.104 <br />
                PORT_STATUS: LISTENING
            </div>

            <div className="absolute bottom-10 right-10 opacity-20 font-mono text-[8px] text-primary/40 text-right leading-tight hidden md:block">
                USER_ROLE: SPECTRE <br />
                ACCESS_LVL: ROOT <br />
                SYSTEM_UPTIME: 1337ms
            </div>
        </div>
    );
}
