"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function XPBouncingText() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [direction, setDirection] = useState({ x: 1, y: 1 })
  const [currentTime, setCurrentTime] = useState(0)

  // Euro techno timing system - optimized
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1)
    }, 200) // Slower updates for better performance
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + direction.x * 3 // Slightly slower movement
        const newY = prev.y + direction.y * 2
        
        let newDirectionX = direction.x
        let newDirectionY = direction.y
        
        // Bounce off horizontal edges
        if (newX > window.innerWidth - 400) {
          newDirectionX = -1
        } else if (newX < 0) {
          newDirectionX = 1
        }
        
        // Bounce off vertical edges
        if (newY > window.innerHeight - 80) {
          newDirectionY = -1
        } else if (newY < 0) {
          newDirectionY = 1
        }
        
        setDirection({ x: newDirectionX, y: newDirectionY })
        
        return {
          x: newDirectionX === direction.x ? newX : (newDirectionX === 1 ? 0 : window.innerWidth - 400),
          y: newDirectionY === direction.y ? newY : (newDirectionY === 1 ? 0 : window.innerHeight - 80)
        }
      })
    }, 50) // Slightly slower update rate

    return () => clearInterval(interval)
  }, [direction])

  // Euro techno color cycle - less frequent
  const colorCycle = [
    '#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ffff00'
  ]
  const currentColor = colorCycle[Math.floor((currentTime / 15) % colorCycle.length)] // Slower cycling

  return (
    <div 
      className="fixed z-0 pointer-events-none select-none hypnotic-element"
      style={{ 
        left: position.x, 
        top: position.y,
        filter: `drop-shadow(0 0 20px ${currentColor}) drop-shadow(0 0 40px ${currentColor})`,
      }}
    >
      {/* Enhanced Image with multiple effects */}
      <div className="relative">
        <Image
          src="/sentient memetic proliferation.png"
          alt="Sentient Memetic Proliferation"
          width={400}
          height={80}
          className="transform transition-transform duration-100"
          unoptimized
          style={{
            filter: `brightness(1.5) saturate(2) hue-rotate(${currentTime * 2}deg)`,
            textShadow: `0 0 10px ${currentColor}, 0 0 20px ${currentColor}, 0 0 40px ${currentColor}`,
          }}
        />
        
        {/* Neon glow overlay */}
        <div 
          className="absolute inset-0 opacity-60 blur-sm"
          style={{
            background: `linear-gradient(45deg, ${currentColor}40, transparent, ${currentColor}40)`,
            mixBlendMode: 'screen',
            animation: 'techno-text-glow 2s infinite ease-in-out',
          }}
        />
        
        {/* Secondary glow */}
        <div 
          className="absolute inset-[-10px] opacity-30 blur-lg"
          style={{
            background: `radial-gradient(ellipse, ${currentColor}60, transparent)`,
            animation: 'techno-text-pulse 3s infinite ease-in-out',
          }}
        />

        {/* Scanline overlay on text */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`text-scanline-${i}`}
              className="absolute w-full h-px bg-current"
              style={{
                top: `${i * 12.5}%`,
                color: currentColor,
                animation: `text-scanline-drift ${4 + i * 0.5}s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 