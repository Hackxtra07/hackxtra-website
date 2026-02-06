"use client";

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe to avoid SSR issues with window/canvas
const Globe = dynamic(() => import('react-globe.gl'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-green-500 font-mono animate-pulse">INITIALIZING SECURE CONNECTION...</div>
});

export interface AttackData {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string;
    name?: string;
}

interface ThreatMapProps {
    attacks: AttackData[];
}

export function ThreatMap({ attacks }: ThreatMapProps) {
    const globeEl = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const controls = globeEl.current?.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }

        // Optimization: Pause animation when tab is inactive
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (globeEl.current) {
                    // Pause via controls if possible, or just knowing React might unmount logic
                    // react-globe.gl doesn't expose a simple 'pause' prop, but we can stop autoRotate
                    if (controls) controls.autoRotate = false;
                }
            } else {
                if (controls) controls.autoRotate = true;
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [mounted]);

    return (
        <div className="w-full h-full relative bg-transparent flex items-center justify-center">
            {mounted && (
                <Globe
                    ref={globeEl}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    width={800} // Ideally responsive
                    height={800}
                    backgroundColor="rgba(0,0,0,0)"

                    // Arc (Attack Beams)
                    arcsData={attacks}
                    arcStartLat="startLat"
                    arcStartLng="startLng"
                    arcEndLat="endLat"
                    arcEndLng="endLng"
                    arcColor="color"
                    arcDashLength={0.4}
                    arcDashGap={0.2}
                    arcDashInitialGap={(d: any) => Math.random()} // Random start for variance
                    arcDashAnimateTime={1500} // Speed
                    arcStroke={0.5}

                    // Rings (Impacts) - Create separate rings data from attacks
                    ringsData={attacks}
                    ringLat="endLat"
                    ringLng="endLng"
                    ringColor="color"
                    ringMaxRadius={5}
                    ringPropagationSpeed={5}
                    ringRepeatPeriod={800}

                    // Atmosphere
                    atmosphereColor="#3a228a"
                    atmosphereAltitude={0.25}
                />
            )}

            {/* Overlay Grid or framing can go here */}
            <div className="absolute inset-0 pointer-events-none rounded-full border border-primary/10 opacity-20" />
        </div>
    );
}
