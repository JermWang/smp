"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { RunawayPenguin } from "./runaway-penguin"
import { PhotoshopButton } from "./photoshop-button"
import { XPBouncingText } from "./xp-bouncing-text"
import { WebampPlayer } from "./webamp-player"
import { Floating3DTV } from "./floating-3d-tv"

export function ConcentricEcho() {
  // State for interactive features
  const [secretMode, setSecretMode] = useState(false)
  const [randomMode, setRandomMode] = useState(false)
  const [sacredChaos, setSacredChaos] = useState(false)
  const [strobeMode, setStrobeMode] = useState(false)
  const [activeModeIndex, setActiveModeIndex] = useState(-1) // -1 for OFF
  const [currentTime, setCurrentTime] = useState(0)
  const [ringCount, setRingCount] = useState(20) // Default ring count
  const [particles, setParticles] = useState<Array<{
    id: number,
    left: number,
    top: number,
    duration: number,
    delay: number,
    colorIndex: number
  }>>([])

  // Euro techno timing system - optimized
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1)
    }, 200) // Slower updates for better performance
    return () => clearInterval(interval)
  }, [])

  // Calculate ring count based on screen size (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const maxDimension = Math.max(window.innerWidth, window.innerHeight)
      setRingCount(Math.ceil(maxDimension / 60) + 8)
    }
  }, [])

  // Generate particles on client-side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const particleData = Array.from({ length: 25 }, (_, i) => ({ // Reduced from 50 to 25
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 6 + Math.random() * 4,
        delay: Math.random() * 3,
        colorIndex: i % 3
      }))
      setParticles(particleData)
    }
  }, [])

  // Button click handler - cycles through modes sequentially from left to right
  const handleButtonClick = useCallback(() => {
    const nextModeIndex = (activeModeIndex + 1) % 4; // 4 states: 0:Sacred, 1:Strobe, 2:Random, 3:Off
    setActiveModeIndex(nextModeIndex);

    // Activate the correct mode and deactivate others
    switch (nextModeIndex) {
      case 0: // Sacred Chaos
        setSacredChaos(true);
        setStrobeMode(false);
        setRandomMode(false);
        setTimeout(() => setSacredChaos(false), 8000);
        break;
      case 1: // Strobe Mode
        setSacredChaos(false);
        setStrobeMode(true);
        setRandomMode(false);
        setTimeout(() => setStrobeMode(false), 5000);
        break;
      case 2: // Random Mode
        setSacredChaos(false);
        setStrobeMode(false);
        setRandomMode(true);
        setTimeout(() => setRandomMode(false), 4000);
        break;
      case 3: // All Off
        setSacredChaos(false);
        setStrobeMode(false);
        setRandomMode(false);
        setActiveModeIndex(-1); // Reset index for the next cycle
        break;
    }
  }, [activeModeIndex])

  // Konami trigger function - Enhanced
  const handleKonamiTrigger = () => {
    // Konami code triggers ALL chaos modes simultaneously
    setSecretMode(true)
    setSacredChaos(true)
    setStrobeMode(true)
    setRandomMode(true)
    
    setTimeout(() => {
      setSecretMode(false)
      setSacredChaos(false)
      setStrobeMode(false)
      setRandomMode(false)
    }, 12000) // 12 seconds of total chaos
  }

  // Euro techno color themes - more intense neon palette
  const euroTechnoThemes = [
    { name: 'Neon Pink', colors: ['#ff0080', '#00ff80', '#8000ff'] },
    { name: 'Acid Green', colors: ['#00ff00', '#ffff00', '#ff00ff'] },
    { name: 'Electric Blue', colors: ['#0080ff', '#00ffff', '#ff8000'] },
    { name: 'Laser Red', colors: ['#ff0040', '#40ff00', '#0040ff'] },
    { name: 'Plasma Purple', colors: ['#8040ff', '#ff4080', '#40ff80'] },
    { name: 'Cyber Orange', colors: ['#ff6600', '#00ff66', '#6600ff'] },
    { name: 'Neon Yellow', colors: ['#ccff00', '#ff00cc', '#00ccff'] }
  ]

  const currentTheme = euroTechnoThemes[Math.floor((currentTime / 120) % euroTechnoThemes.length)] // Slower theme cycling

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0">
        {/* Euro techno background gradient */}
        <div className={`absolute inset-0 transition-all duration-2000 ${
          randomMode 
            ? 'bg-gradient-to-br from-pink-950 via-purple-950 to-green-950'
            : secretMode
            ? 'bg-gradient-to-br from-red-950 via-purple-950 to-blue-950'
            : 'bg-gradient-to-br from-purple-950 via-black to-indigo-950'
        }`} />
        
        {/* CRT Scanlines Effect - Optimized */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {[...Array(50)].map((_, i) => ( // Reduced from 200 to 50
            <div
              key={`scanline-${i}`}
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                top: `${i * 2}%`, // Adjusted spacing
                animation: `scanline-flicker ${3 + (i % 3)}s infinite ease-in-out`,
                animationDelay: `${i * 0.02}s`, // Reduced delay calculation
              }}
            />
          ))}
        </div>

        {/* CRT Phosphor Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div 
            className="absolute inset-0 bg-gradient-radial from-green-500/20 via-transparent to-transparent"
            style={{
              animation: 'phosphor-glow 4s infinite ease-in-out',
            }}
          />
        </div>

        {/* Geometric Overlay Patterns - Euro Techno Style - Optimized */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          {/* Vertical grid lines - Reduced */}
          {[...Array(10)].map((_, i) => ( // Reduced from 20 to 10
            <div
              key={`vgrid-${i}`}
              className="absolute h-full w-px"
              style={{
                left: `${i * 10}%`, // Adjusted spacing
                background: `linear-gradient(to bottom, transparent, ${currentTheme.colors[i % 3]}, transparent)`,
                animation: `grid-pulse ${6 + i * 0.3}s infinite ease-in-out`, // Reduced frequency
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
          
          {/* Horizontal grid lines - Reduced */}
          {[...Array(6)].map((_, i) => ( // Reduced from 12 to 6
            <div
              key={`hgrid-${i}`}
              className="absolute w-full h-px"
              style={{
                top: `${i * 16.66}%`, // Adjusted spacing
                background: `linear-gradient(to right, transparent, ${currentTheme.colors[i % 3]}, transparent)`,
                animation: `grid-pulse ${8 + i * 0.3}s infinite ease-in-out`, // Reduced frequency
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}

          {/* Diagonal overlay patterns - Reduced */}
          {[...Array(3)].map((_, i) => ( // Reduced from 6 to 3
            <div
              key={`diagonal-${i}`}
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  ${45 + i * 45}deg,
                  transparent,
                  transparent 80px,
                  ${currentTheme.colors[i % 3]}15 82px,
                  ${currentTheme.colors[i % 3]}15 84px,
                  transparent 86px
                )`,
                animation: `diagonal-shift ${12 + i * 3}s infinite linear`, // Slower animations
                transform: `rotate(${i * 20}deg)`,
              }}
            />
          ))}
        </div>

        {/* Hypnotic Logo Repeat Effect - Optimized for performance */}
        {[...Array(6)].map((_, i) => ( // Reduced from 12 to 6 for better performance
          <div
            key={`hypno-logo-${i}`}
            className="absolute inset-0 flex items-center justify-center hypnotic-element"
            style={{
              animation: `hypnotic-expand ${12}s infinite ease-out`, // Slower: 12s instead of 8s
              animationDelay: `${i * 2}s`, // Longer delays: 2s instead of 0.667s
              opacity: 0,
            }}
          >
            <Image
              src="/smpp.png"
              alt="Hypnotic Logo Echo"
              width={100} // Smaller: 100px instead of 120px
              height={100}
              className="rounded-full"
              unoptimized
              style={{
                filter: `hue-rotate(${i * 60}deg) brightness(${1.1 + i * 0.05}) saturate(${1.3 + i * 0.1})`, // Reduced effects
                mixBlendMode: 'screen',
              }}
            />
          </div>
        ))}

        {/* Pulsing concentric rings - enhanced for euro techno */}
        {[...Array(ringCount)].map((_, i) => (
          <div
            key={`ring-${i}`}
            className={`absolute inset-0 flex items-center justify-center hypnotic-element ${secretMode ? 'animation-paused' : ''}`}
            style={{
              animation: `euro-pulse ${4 + i * 0.1}s infinite ease-out`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <div
              className="border-2 rounded-full opacity-0"
              style={{
                width: `${120 + i * 80}px`,
                height: `${120 + i * 80}px`,
                borderColor: currentTheme.colors[i % 3],
                filter: `blur(${Math.min(i * 0.3, 8)}px) brightness(${1.5})`,
                boxShadow: `0 0 ${20 + i * 5}px ${currentTheme.colors[i % 3]}`,
              }}
            />
          </div>
        ))}

        {/* Floating techno particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-1 h-1 rounded-full floating-particle ${secretMode ? 'animation-paused' : ''}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              backgroundColor: currentTheme.colors[particle.colorIndex],
              animation: `techno-float ${particle.duration}s infinite ease-in-out`,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 10px ${currentTheme.colors[particle.colorIndex]}`,
            }}
          />
        ))}

        {/* Strobe flash overlay */}
        <div 
          className="absolute inset-0 pointer-events-none bg-white opacity-0"
          style={{
            animation: strobeMode ? 'techno-strobe 0.1s infinite' : 'none',
          }}
        />
      </div>

      {/* Sacred Chaos Overlay - Enhanced */}
      {sacredChaos && (
        <>
          {/* Intense light rays - Optimized */}
          {[...Array(8)].map((_, i) => ( // Reduced from 16 to 8
            <div
              key={`chaos-ray-${i}`}
              className="absolute inset-0 pointer-events-none hypnotic-element"
              style={{
                animation: `chaos-ray-burst 3s ease-out forwards`,
                animationDelay: `${i * 0.15}s`, // Slightly increased delay
                transform: `rotate(${i * 45}deg)`, // Adjusted rotation
              }}
            >
              <div 
                className="absolute left-1/2 top-1/2 w-2 h-96 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: `linear-gradient(to top, ${currentTheme.colors[0]}, ${currentTheme.colors[1]}, transparent)`,
                  boxShadow: `0 0 20px ${currentTheme.colors[0]}`,
                }}
              />
            </div>
          ))}
          
          {/* Reality glitch enhanced */}
          <div className="absolute inset-0 pointer-events-none animate-glitch-reality bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
        </>
      )}

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        
        {/* Top Section - XP Bouncing Text with neon glow */}
        <div className="absolute top-8 left-0 right-0 flex justify-center">
          <div style={{ filter: `drop-shadow(0 0 20px ${currentTheme.colors[0]})` }}>
            <XPBouncingText />
          </div>
        </div>

        {/* Center Section - Main Image with intense effects */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`relative ${secretMode ? 'animate-secret-chaos' : 'animate-intense-hypnotic-pulse'}`}>
            <div className="relative">
              <Image
                src="/smpp.png"
                alt="Central hypnotic image"
                width={180}
                height={180}
                className="rounded-full shadow-2xl"
                unoptimized
                style={{
                  filter: `brightness(1.3) saturate(1.5) drop-shadow(0 0 30px ${currentTheme.colors[0]})`,
                }}
              />
              {/* Intense neon glow effect */}
              <div 
                className="absolute inset-0 rounded-full opacity-40 blur-2xl animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${currentTheme.colors[0]}, ${currentTheme.colors[1]}, ${currentTheme.colors[2]})`,
                }}
              />
              {/* Secondary glow ring */}
              <div 
                className="absolute inset-[-20px] rounded-full opacity-20 blur-3xl"
                style={{
                  background: `conic-gradient(${currentTheme.colors[0]}, ${currentTheme.colors[1]}, ${currentTheme.colors[2]}, ${currentTheme.colors[0]})`,
                  animation: 'spin 8s linear infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Interactive Elements */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center space-y-6">
          {/* Photoshop Button with neon enhancement */}
          <div style={{ filter: `drop-shadow(0 0 15px ${currentTheme.colors[1]})` }}>
            <PhotoshopButton 
              onKonamiTrigger={handleKonamiTrigger} 
              onButtonClick={handleButtonClick}
              sacredChaos={sacredChaos}
              strobeMode={strobeMode}
              randomMode={randomMode}
              secretMode={secretMode}
            />
          </div>
          
          {/* Click effects removed for performance */}
        </div>
      </div>
      
      {/* Floating 3D TV */}
      <Floating3DTV />

      {/* Overlay Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Runaway Penguin Game */}
        <RunawayPenguin />
      </div>
      
      {/* Webamp Player - Separate from pointer-events-none container */}
      <WebampPlayer />
    </div>
  )
}
