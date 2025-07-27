"use client"

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { PhotoshopButton } from '@/components/v2/photoshop-button'
import { ScrollingBanner } from '@/components/v2/scrolling-banner'
import { RotatingSpace } from '@/components/v2/rotating-space'
import { AmbientSound } from '@/components/v2/ambient-sound'
import { SocialLinks } from '@/components/v2/social-links'
import { CRTFilter } from '@/components/v2/crt-filter'
import { PudgyCursor } from '@/components/v2/pudgy-cursor'

export default function V2Page() {
  const [bursts, setBursts] = useState<Array<{ id: number, key: number }>>([])
  const [isMelodyMuted, setIsMelodyMuted] = useState(false);
  // Use a ref for the ID to avoid stale state issues on rapid clicks
  const nextId = useRef(0);

  // This function will be triggered by the button
  const handleBurst = useCallback(() => {
    // Play the burst sound with a slight delay to separate it from the button's click sound
    setTimeout(() => {
      const audio = new Audio('/smp sound.mp3');
      audio.volume = 1.0; // Set volume to maximum (100%)
      audio.play().catch(e => console.error("Error playing audio:", e));
    }, 100); // 100ms delay

    // Create a single, powerful burst
    const uniqueId = nextId.current++;
    setBursts(currentBursts => [...currentBursts, { id: uniqueId, key: uniqueId }]);
  }, [])

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      <PudgyCursor />
      <CRTFilter />
      <AmbientSound isMelodyMuted={isMelodyMuted} />

      {/* Mute Toggle Button */}
      <button 
        onClick={() => setIsMelodyMuted(!isMelodyMuted)} 
        className="absolute top-4 right-4 z-50 text-white p-2 bg-black/50 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Toggle melody mute"
      >
        {isMelodyMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        )}
      </button>

      {/* New 3D Rotating Background */}
      <RotatingSpace />

      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full z-50">
        <ScrollingBanner direction="left" />
      </div>

      {/* Central Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/smpp.png"
          alt="Central Logo"
          width={150}
          height={150}
        />
      </div>

      {/* On-Demand Echo Bursts */}
      {bursts.map((burst) => {
        const glowColor = `hsl(${burst.id * 50}, 100%, 70%)`;
        return (
          <div
            key={burst.key}
            className="absolute inset-0 flex items-center justify-center"
            onAnimationEnd={() => {
              // Clean up bursts from the DOM after they finish animating
              setBursts(currentBursts => currentBursts.filter(b => b.key !== burst.key))
            }}
          >
            <div
              className="absolute flex items-center justify-center"
              style={{
                animation: `echo-expand-2d 2s ease-out forwards`,
              }}
            >
              <Image
                src="/smpp.png"
                alt="Hypnotic Echo"
                fill
                style={{
                  mixBlendMode: 'screen',
                  filter: `hue-rotate(${burst.id * 50}deg) 
                           saturate(1.5) 
                           brightness(1.2) 
                           drop-shadow(0 0 7px ${glowColor}) 
                           drop-shadow(0 0 15px ${glowColor})`,
                }}
              />
            </div>
          </div>
        )
      })}
      
      {/* UI Controls */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-8">
        <div className="flex flex-col items-center pointer-events-auto space-y-4">
          <SocialLinks />
          <PhotoshopButton onButtonClick={handleBurst} />
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="absolute bottom-0 left-0 w-full z-50">
        <ScrollingBanner direction="right" />
      </div>
    </main>
  )
} 