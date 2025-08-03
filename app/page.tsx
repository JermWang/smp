"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { PhotoshopButton } from '@/components/v2/photoshop-button'
import { ScrollingBanner } from '@/components/v2/scrolling-banner'
import { RotatingSpace } from '@/components/v2/rotating-space'
import { AmbientSound } from '@/components/v2/ambient-sound'
import { SocialLinks } from '@/components/v2/social-links'
import { CRTFilter } from '@/components/v2/crt-filter'
import { GreenEyesContainer } from '@/components/green-eyes-container'

import { ContractAddress } from '@/components/v2/contract-address'
import { ScoreTracker } from '@/components/v2/score-tracker'
import { TerminalIntro } from '@/components/v2/terminal-intro'
import { GlobalEchoService } from '@/lib/global-echo-service'

export default function V2Page() {
  const [bursts, setBursts] = useState<Array<{ id: number, key: number, logoRect: DOMRect | null }>>([])
  const [isMelodyMuted, setIsMelodyMuted] = useState(false);
  const [echoScore, setEchoScore] = useState(0);
  const [showTerminal, setShowTerminal] = useState(true);
  const logoRef = useRef<HTMLImageElement>(null);
  // Use a ref for the ID to avoid stale state issues on rapid clicks
  const nextId = useRef(0);

  // This function will be triggered by the button
  const handleBurst = useCallback(async () => {
    // Play the burst sound with a slight delay to separate it from the button's click sound
    setTimeout(() => {
      const audio = new Audio('/smp sound.mp3');
      audio.volume = 1.0; // Set volume to maximum (100%)
      audio.play().catch(e => console.error("Error playing audio:", e));
    }, 100); // 100ms delay

    // Get the current logo position
    const logoRect = logoRef.current?.getBoundingClientRect() || null;

    // Create a single, powerful burst
    const uniqueId = nextId.current++;
    setBursts(currentBursts => [...currentBursts, { id: uniqueId, key: uniqueId, logoRect }]);
    
    // Increment the local echo score
    setEchoScore(prev => prev + 1);
    
    // Increment the global echo count (async, don't wait for it)
    GlobalEchoService.incrementGlobalEchoes().catch(e => 
      console.error("Error incrementing global echoes:", e)
    );
  }, [])

  const resetScore = useCallback(() => {
    setEchoScore(0);
  }, []);

  const handleTerminalComplete = useCallback(() => {
    setShowTerminal(false);
  }, []);

  // Show terminal intro first
  if (showTerminal) {
    return <TerminalIntro onComplete={handleTerminalComplete} />;
  }

  return (
    <main className="relative w-full h-screen min-h-screen bg-black overflow-hidden">
      <CRTFilter />
      <AmbientSound isMelodyMuted={isMelodyMuted} />
      <ScoreTracker currentScore={echoScore} onReset={resetScore} />

      {/* Mute Toggle Button */}
      <button
        onClick={() => setIsMelodyMuted(!isMelodyMuted)}
        className="absolute top-16 sm:top-20 right-4 z-[60] text-white p-2 bg-black/50 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Toggle melody mute"
      >
        {isMelodyMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        )}
      </button>

      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full z-50 safe-top">
        <ScrollingBanner direction="left" />
      </div>

      {/* New 3D Rotating Background */}
      <RotatingSpace />

      {/* Central Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 px-4">
          <Image
            ref={logoRef}
            src="/smpp.png"
            alt="Central Logo"
            width={150}
            height={150}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-[150px] lg:h-[150px]"
            unoptimized
          />
          <div className="text-center space-y-1">
            <h1 
              className="text-sm sm:text-base md:text-lg tracking-[0.15em] sm:tracking-[0.2em] font-sans font-bold"
              style={{
                fontFamily: 'var(--font-heavitas), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                color: '#F5F5DC',
                letterSpacing: '0.15em',
                fontWeight: '800'
              }}
            >
              sentient memetic
            </h1>
            <h2 
              className="text-sm sm:text-base md:text-lg tracking-[0.15em] sm:tracking-[0.2em] font-sans font-bold"
              style={{
                fontFamily: 'var(--font-heavitas), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                color: '#F5F5DC',
                letterSpacing: '0.15em',
                fontWeight: '800'
              }}
            >
              proliferation
            </h2>
          </div>
          <ContractAddress />
        </div>
      </div>

      {/* On-Demand Echo Bursts */}
      {bursts.map((burst) => {
        const glowColor = `hsl(${burst.id * 50}, 100%, 70%)`;
        const logoRect = burst.logoRect;
        
        return (
          <div
            key={burst.key}
            className="absolute pointer-events-none"
            style={{
              left: logoRect ? logoRect.left + logoRect.width / 2 : '50vw',
              top: logoRect ? logoRect.top + logoRect.height / 2 : '50vh',
              transform: 'translate(-50%, -50%)',
            }}
            onAnimationEnd={() => {
              // Clean up bursts from the DOM after they finish animating
              setBursts(currentBursts => currentBursts.filter(b => b.key !== burst.key))
            }}
          >
            <div
              className="relative"
              style={{
                animation: `echo-expand-2d 2s linear forwards`,
                width: '150px',
                height: '150px',
              }}
            >
              <Image
                src="/smpp.png"
                alt="Hypnotic Echo"
                fill
                unoptimized
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
      
      {/* Green Eyes Generator - Bottom Left */}
      <div className="absolute bottom-20 left-4 pointer-events-auto z-20">
        <GreenEyesContainer />
      </div>

      {/* UI Controls - Center Bottom (Original Layout) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-32 md:pb-8">
        <div className="flex flex-col items-center pointer-events-auto space-y-3 sm:space-y-4">
          <SocialLinks />
          <PhotoshopButton onButtonClick={handleBurst} />
        </div>
      </div>

      {/* Bottom Banner - Absolutely positioned at viewport bottom */}
      <div 
        style={{ 
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: 50,
          margin: '0',
          padding: '0',
          transform: 'translateY(0)'
        }}
      >
        <div style={{ margin: '0', padding: '0', lineHeight: '0' }}>
          <ScrollingBanner direction="right" />
        </div>
      </div>
      
      <style jsx global>{`
        /* Aggressive reset to eliminate all spacing */
        * {
          box-sizing: border-box !important;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
          height: 100dvh !important; /* Dynamic viewport height for mobile */
          overflow: hidden !important;
        }
        
        main {
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
          height: 100vh !important;
          height: 100dvh !important; /* Dynamic viewport height for mobile */
        }
        
        /* Mobile viewport fixes */
        @media (max-width: 768px) {
          html, body, main {
            height: 100vh !important;
            height: 100svh !important; /* Small viewport height for mobile */
          }
          
          .safe-top {
            padding-top: env(safe-area-inset-top, 0);
          }
        }
        
        /* Force the banner container to have no spacing */
        .banner-flush {
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          line-height: 0 !important;
        }
      `}</style>
    </main>
  )
} 