"use client";

import { Header } from "@/components/hackxtras/header";
import { Hero } from "@/components/hackxtras/hero";
import { Features } from "@/components/hackxtras/features";
import { CodePreview } from "@/components/hackxtras/code-preview";
import { Testimonials } from "@/components/hackxtras/testimonials";

import { Footer } from "@/components/hackxtras/footer";
import { ThreeSceneWrapper } from "@/components/hackxtras/three-scene-wrapper";
import { PremiumBackground } from "@/components/hackxtras/premium-background";
import { useProStatus } from "@/hooks/use-pro-status";

export default function Home() {
  const { isPro, isAuthenticated, isLoading } = useProStatus();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
    </div>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <PremiumBackground />
      {/* Textured Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Techy Grid Pattern Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 25%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 26%, transparent 27%, transparent 74%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 75%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 25%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 26%, transparent 27%, transparent 74%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 75%, ${isPro ? 'rgba(234, 179, 8, 0.4)' : 'rgba(39, 97, 195, 0.3)'} 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
        }} />
        {/* Tech nodes/dots */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle, ${isPro ? '#eab308' : '#2761c3'} 1.5px, transparent 1.5px)`,
          backgroundSize: '50px 50px',
        }} />
        {/* Primary gradient circle - Optimized blur */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-40 shadow-[0_0_100px_rgba(234,179,8,0.2)]" style={{
          background: isPro ? 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' : 'radial-gradient(circle, oklch(0.55 0.06 220 / 1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        {/* Secondary gradient circle - Optimized blur */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 opacity-30" style={{
          background: isPro ? 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' : 'radial-gradient(circle, oklch(0.65 0.08 230 / 1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        {/* Golden glow for premium users only */}
        {isPro && (
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 via-transparent to-amber-500/5" />
        )}
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\"0 0 400 400\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"% 3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" /%3E%3C/filter%3E%3Crect width=\"400\" height=\"400\" filter=\"url(%23noise)\" /%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }} />
        {/* Glassy Edge Effect */}
        <div className="absolute inset-0" style={{
          background: isPro ? 'radial-gradient(ellipse at center, transparent 0%, rgba(50, 40, 20, 0.4) 110%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(20, 20, 40, 0.2) 100%)',
        }} />
        {/* Top glassy edge */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent" />
        {/* Border frame effect */}
        <div className={`absolute inset-0 border ${isPro ? 'border-yellow-500/15' : 'border-blue-500/5'} rounded-3xl`} />
      </div>

      {/* 3D Background Scene */}
      <ThreeSceneWrapper />

      {/* Navigation */}
      <Header />

      {/* Hero Section - Dynamically adapts to isPro/isAuthenticated */}
      <Hero />

      {/* Only show Features if guest, show Labs/Courses highlights if member? */}
      <Features />

      {/* Code Preview / Labs Section */}
      <CodePreview />

      {/* Testimonials Section */}
      {!isAuthenticated && <Testimonials />}

      {/* Footer */}
      <Footer />

      {/* Premium Viewport Border */}
      {isPro && (
        <div className="fixed inset-0 pointer-events-none z-[100] border-2 border-yellow-500/20 m-1 rounded-2xl shadow-[inset_0_0_40px_rgba(234,179,8,0.1)]" />
      )}
    </main>
  );
}
