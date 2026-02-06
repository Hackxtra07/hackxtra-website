"use client";

export function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(39,97,195,0.4)] ${className}`}
      style={{
        backgroundImage: 'linear-gradient(163deg, #00ff75 0%, #3700ff 100%)',
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300 group-hover:scale-98"
        style={{
          backgroundColor: '#1a1a1a',
        }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
