"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const TerminalCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    content?: string;
  }
>(({ className, title = "Terminal", content = "> hackxtras", ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(39,97,195,0.3)]", className)}>
    <div className="border border-border/50 bg-background/50 rounded-lg overflow-hidden backdrop-blur-sm hover:border-blue-500/40">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background/30">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{title}</span>
      </div>
      {/* Terminal Content */}
      <div className="p-4 font-mono text-sm text-primary/80">
        <span className="text-primary">$</span> <span>{content}</span>
      </div>
    </div>
  </div>
));

TerminalCard.displayName = "TerminalCard";

export { TerminalCard };
