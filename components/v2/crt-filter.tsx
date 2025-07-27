"use client";

import { useState, useEffect } from 'react';

export function CRTFilter() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let glitchTimeout: NodeJS.Timeout;

    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);

      const nextGlitchIn = 5000 + Math.random() * 10000;
      glitchTimeout = setTimeout(triggerGlitch, nextGlitchIn);
    };

    glitchTimeout = setTimeout(triggerGlitch, 3000);

    return () => clearTimeout(glitchTimeout);
  }, []);

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Simple, visible scanlines */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.3) 2px, rgba(0,255,0,0.3) 4px)',
          animation: 'scanlines 0.1s linear infinite'
        }}
      />
      
      {/* Much lighter vignette */}
      <div 
        className="absolute inset-0" 
        style={{ 
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0.3) 100%)' 
        }} 
      />
      
      {/* Subtle screen curvature effect */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
          transform: 'scale(1.02)'
        }}
      />
      
      {/* Chromatic aberration effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(255,0,0,0.05) 0px, transparent 1px, rgba(0,0,255,0.05) 2px, transparent 3px)',
          transform: isGlitching ? 'translateX(1px)' : 'translateX(0)',
          transition: 'transform 0.1s ease'
        }}
      />
      
      {/* Second chromatic layer for depth */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'repeating-linear-gradient(90deg, rgba(0,255,255,0.03) 0px, transparent 1px, rgba(255,0,255,0.03) 2px, transparent 3px)',
          transform: isGlitching ? 'translateX(-0.5px)' : 'translateX(0)',
          transition: 'transform 0.1s ease'
        }}
      />
    </div>
  );
} 