"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"

export function RunawayPenguin() {
  const [position, setPosition] = useState({ x: 300, y: 300 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [message, setMessage] = useState("Try to catch the penguin!")
  const lastTeleportTime = useRef<number>(0)

  // High-frequency mouse tracking
  const updateMousePosition = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition, { passive: true })
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [updateMousePosition])

  // Optimized distance checking - runs on every mouse move
  useEffect(() => {
    if (!isVisible) return

    const distance = Math.sqrt(
      Math.pow(mousePosition.x - position.x, 2) + 
      Math.pow(mousePosition.y - position.y, 2)
    )

    const now = Date.now()
    
    // More responsive: 150px range, minimum 200ms between teleports
    if (distance < 150 && (now - lastTeleportTime.current) > 200) {
      lastTeleportTime.current = now
      
      // Hide penguin immediately
      setIsVisible(false)
      
      // Quick teleport
      setTimeout(() => {
        const padding = 80
        const newX = padding + Math.random() * (window.innerWidth - padding * 2)
        const newY = padding + Math.random() * (window.innerHeight - padding * 2)
        
        setPosition({ x: newX, y: newY })
        setIsVisible(true)
        
        // Fun messages
        const messages = [
          "Too slow! 🐧",
          "Nope! 😄", 
          "Can't catch me! 🏃‍♂️",
          "Nice try! 😜",
          "Mua-muah! 😘",
          "Haha! 🤣",
          "Better luck next time! 🎯"
        ]
        setMessage(messages[Math.floor(Math.random() * messages.length)])
      }, 30) // Ultra fast teleport: 30ms
    }
  }, [mousePosition.x, mousePosition.y, position.x, position.y, isVisible])

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Runaway penguin */}
      <div
        className={`absolute transition-all duration-75 pointer-events-auto ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
        }}
      >
        <div className="relative group">
          <Image
            src="/mua-muah.gif"
            alt="Runaway Penguin"
            width={70}
            height={70}
            className="rounded-full hover:scale-105 transition-transform pointer-events-none"
            unoptimized
            priority
          />
          {/* Simplified glow effect for better performance */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-30 blur-md animate-pulse" />
          
          {/* Message bubble - only show briefly after teleport */}
          {!isVisible && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-cyan-300 text-xs rounded-md whitespace-nowrap animate-bounce">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 