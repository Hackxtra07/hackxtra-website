"use client";

export function BackgroundTexture() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Primary gradient circle */}
      <div className="absolute -top-40 -right-40 w-96 h-96 opacity-20" style={{
        background: 'radial-gradient(circle, oklch(0.55 0.06 220 / 0.5) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />
      {/* Secondary gradient circle */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 opacity-15" style={{
        background: 'radial-gradient(circle, oklch(0.65 0.08 230 / 0.4) 0%, transparent 70%)',
        filter: 'blur(100px)',
      }} />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23noise)" /%3E%3C/svg%3E")',
        backgroundSize: '200px 200px',
      }} />
    </div>
  );
}
