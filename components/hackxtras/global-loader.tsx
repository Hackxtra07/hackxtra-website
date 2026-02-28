"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CyberLoader } from "./cyber-loader";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPageReady, setIsPageReady] = useState(false);
    const [showLoader, setShowLoader] = useState(true);
    const lastPathRef = useRef(pathname + searchParams.toString());

    // Effect to handle "finishing" the loader on initial mount and route changes
    useEffect(() => {
        // When the path or search params change, we consider the "new" page as not ready yet
        // but since Next.js might have already rendered it, we trigger the finishing sequence
        const currentPath = pathname + searchParams.toString();

        if (currentPath !== lastPathRef.current) {
            lastPathRef.current = currentPath;
            // If we're already showing the loader, just mark as finishing
            // If not (e.g. fast transition), we'd need to show it again (handled by click listener)
            setIsPageReady(true);
        } else {
            // Initial mount
            const timer = setTimeout(() => {
                setIsPageReady(true);
            }, 300); // Shorter baseline for "fast" feel
            return () => clearTimeout(timer);
        }
    }, [pathname, searchParams]);

    // Global click listener to catch internal link clicks for immediate feedback
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (anchor &&
                anchor instanceof HTMLAnchorElement &&
                anchor.href &&
                anchor.href.startsWith(window.location.origin) &&
                !anchor.target &&
                !anchor.hasAttribute("download") &&
                anchor.pathname !== pathname // Only if it's a different path
            ) {
                // Trigger loader immediately for perceived speed
                setShowLoader(true);
                setIsPageReady(false);
            }
        };

        document.addEventListener("click", handleLinkClick);
        return () => document.removeEventListener("click", handleLinkClick);
    }, [pathname]);

    const handleLoaderComplete = useCallback(() => {
        setShowLoader(false);
    }, []);

    return (
        <>
            <AnimatePresence mode="wait">
                {showLoader && (
                    <motion.div
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999]"
                    >
                        <CyberLoader isFinishing={isPageReady} onComplete={handleLoaderComplete} />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={showLoader ? "hidden" : "block"}>
                {children}
            </div>
        </>
    );
}
