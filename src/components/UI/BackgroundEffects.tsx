'use client';

import { usePlayerStore } from '@/store/playerStore';

export default function BackgroundEffects() {
  const { config } = usePlayerStore();
  const accentColor = config.accentColor || '#24C8D8';

  return (
    <>
      {/* Dynamic ambient glow based on accent color */}
      <div 
        className="pointer-events-none absolute left-0 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[120px] transition-colors duration-1000"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />
      
      {/* Noise overlay for texture */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </>
  );
}
