"use client";

import { useEffect, useState } from "react";
import { CyberLoader } from "./cyber-loader";
import { AnimatePresence, motion } from "framer-motion";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
    const [isPageReady, setIsPageReady] = useState(false);
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        // Page is considered ready once this effect runs (initial mount)
        const timer = setTimeout(() => {
            setIsPageReady(true);
        }, 1000); // Give a baseline minimum visibility for aesthetics
        return () => clearTimeout(timer);
    }, []);

    const handleLoaderComplete = () => {
        setShowLoader(false);
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {showLoader && (
                    <motion.div
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999]"
                    >
                        <CyberLoader isFinishing={isPageReady} onComplete={handleLoaderComplete} />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={showLoader ? "hidden" : "block transition-opacity duration-1000"}>
                {children}
            </div>
        </>
    );
}
