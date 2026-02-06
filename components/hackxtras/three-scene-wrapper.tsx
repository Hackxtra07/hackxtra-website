"use client";

import dynamic from 'next/dynamic';

const ThreeScene = dynamic(() => import('./three-scene').then(mod => mod.ThreeScene), {
    ssr: false,
    loading: () => <div className="absolute inset-0 -z-10 bg-background" />
});

export function ThreeSceneWrapper() {
    return <ThreeScene />;
}
