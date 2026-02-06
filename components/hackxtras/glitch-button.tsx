"use client";

export function GlitchButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-8 py-3 font-bold text-primary tracking-wider transition-all duration-200 hover:shadow-[0_0_20px_rgba(39,97,195,0.6)] ${className}`}
      style={{
        background: 'transparent',
        border: '2px solid #2761c3',
        borderRadius: '50px',
        color: '#2761c3',
        fontSize: '14px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span className="relative z-10">{children}</span>
      <div 
        className="absolute inset-0 transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, #2761c3 0%, #27c39f 100%)',
          borderRadius: '50px',
          opacity: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '0';
        }}
      />
    </button>
  );
}
