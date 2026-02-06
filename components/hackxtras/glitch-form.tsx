"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const GlitchForm = forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement> & {
    title?: string;
    submitText?: string;
  }
>(({ className, title = "SECURE_DATA", submitText = "INITIATE_CONNECTION", children, ...props }, ref) => (
  <form
    ref={ref}
    className={cn(
      "rounded-lg overflow-hidden border border-border/50 bg-background/40 backdrop-blur-xl p-6 space-y-4",
      className
    )}
    {...props}
  >
    {/* Header */}
    <div className="pb-4 border-b border-border/30">
      <h3 className="text-sm font-mono font-semibold text-primary tracking-wider">{title}</h3>
    </div>

    {/* Form Fields */}
    <div className="space-y-4">
      {children}
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      className="w-full px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg font-mono text-sm font-semibold hover:bg-primary/20 transition-colors duration-200"
    >
      {submitText}
    </button>
  </form>
));

GlitchForm.displayName = "GlitchForm";

export { GlitchForm };
