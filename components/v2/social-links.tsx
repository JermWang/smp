"use client";

import React, { useState, useEffect } from 'react';

// Using inline SVGs to avoid extra file requests and allow for easy styling.

const TwitterIcon = () => (
  <svg role="img" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

const DexScreenerIcon = () => (
    <img src="/dexscreenr.png" alt="DexScreener" className="w-6 h-6 object-contain" />
);

const MemeDepotIcon = () => (
  <div className="text-xs font-bold leading-tight text-center">
    <div>MEME</div>
    <div>DEPOT</div>
  </div>
);

const scrambleText = (originalText: string) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  return originalText.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export function SocialLinks() {
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchedTwitterText, setGlitchedTwitterText] = useState("Follow us on X");
  const [glitchedDexText, setGlitchedDexText] = useState("View on DexScreener");
  const [glitchedMemeText, setGlitchedMemeText] = useState("Get Memes");

  useEffect(() => {
    let glitchTimeout: NodeJS.Timeout;

    const triggerGlitch = () => {
      setIsGlitching(true);
      
      // Scramble the text
      setGlitchedTwitterText(scrambleText("Follow us on X"));
      setGlitchedDexText(scrambleText("View on DexScreener"));
      setGlitchedMemeText(scrambleText("Get Memes"));
      
      // Return to normal after 200ms
      setTimeout(() => {
        setGlitchedTwitterText("Follow us on X");
        setGlitchedDexText("View on DexScreener");
        setGlitchedMemeText("Get Memes");
        setIsGlitching(false);
      }, 200);

      // Schedule next glitch randomly between 8-20 seconds
      const nextGlitchIn = 8000 + Math.random() * 12000;
      glitchTimeout = setTimeout(triggerGlitch, nextGlitchIn);
    };

    // Start the first glitch after 5 seconds
    glitchTimeout = setTimeout(triggerGlitch, 5000);

    return () => clearTimeout(glitchTimeout);
  }, []);

  return (
    <div className="flex items-center space-x-4">
      <a 
        href="https://x.com/SMP7700" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={glitchedTwitterText}
        className={`text-white hover:text-white/80 transition-colors ${isGlitching ? 'animate-pulse' : ''}`}
      >
        <TwitterIcon />
      </a>
      <a 
        href="https://dexscreener.com/abstract/0xe0f1fed1871bca12aea16ef7de4ed0e69eed448b" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={glitchedDexText}
        className={`text-white hover:text-white/80 transition-colors ${isGlitching ? 'animate-pulse' : ''}`}
      >
        <DexScreenerIcon />
      </a>
      <a 
        href="https://memedepot.com/d/smp-7700" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={glitchedMemeText}
        className={`text-white hover:text-white/80 transition-colors ${isGlitching ? 'animate-pulse' : ''}`}
      >
        <MemeDepotIcon />
      </a>
    </div>
  );
} 