"use client";

import { motion } from "framer-motion";

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="relative w-12 h-12">
        {/* Rotating Outer Hexagon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-primary/40"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        />

        {/* Pulsing Inner Core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-2 bg-primary/20 backdrop-blur-sm"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        >
          <div className="absolute inset-0 bg-primary/30 blur-sm" />
        </motion.div>

        {/* Scanning Line Effect */}
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-full h-0.5 bg-primary/60 shadow-[0_0_8px_rgba(35,220,175,0.8)] z-10"
        />
      </div>

      <span className="font-mono text-[10px] text-primary/60 tracking-[0.2em] uppercase animate-pulse">
        Processing_Data...
      </span>
    </div>
  );
}
