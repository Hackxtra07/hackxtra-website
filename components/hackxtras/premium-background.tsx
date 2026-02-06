"use client";

import { useProStatus } from "@/hooks/use-pro-status";

export function PremiumBackground() {
    const isPro = useProStatus();

    if (!isPro) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Premium Golden Glow - Optimized */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] opacity-10" style={{
                background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />
            <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] opacity-10" style={{
                background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
                filter: 'blur(80px)',
            }} />

            {/* Subtle Golden Grid Highlight */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)',
                backgroundSize: '100px 100px',
            }} />
        </div>
    );
}
