"use client";

export function Loader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #00f2ea 0deg, #a855f7 90deg, #00f2ea 360deg)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <div className="absolute inset-1 rounded-full bg-background" />
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
