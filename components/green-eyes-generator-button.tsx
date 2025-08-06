"use client"

import { useState } from "react"
import { Eye, Zap } from "lucide-react"

interface GreenEyesGeneratorButtonProps {
  onClick: () => void
  className?: string
}

export function GreenEyesGeneratorButton({ onClick, className = "" }: GreenEyesGeneratorButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleButtonPress = () => {
    setIsPressed(true)
    onClick()
    
    // Enhanced haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50])
    }
    
    // Reset button state
    setTimeout(() => {
      setIsPressed(false)
    }, 150)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleButtonPress}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative focus:outline-none group transition-all duration-300"
      >
        {/* Main Sleek Button */}
        <div className={`
          relative px-4 py-3 rounded-lg border border-green-400/30
          bg-gradient-to-r from-green-950/90 to-emerald-900/90 
          backdrop-blur-md transition-all duration-300
          ${isPressed ? 'scale-95 shadow-inner' : 'scale-100'}
          ${isHovered ? 'border-green-300/60 shadow-lg shadow-green-400/20' : ''}
          hover:shadow-xl hover:shadow-green-400/25
          min-w-[120px]
        `}>
          {/* Animated glow effect */}
          <div className={`
            absolute inset-0 rounded-lg opacity-20 blur-sm
            bg-gradient-to-r from-green-400/30 to-emerald-300/30
            ${isHovered ? 'opacity-40 scale-105' : 'opacity-20'}
            transition-all duration-500
          `} />
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center space-x-2">
            {/* Eye Icon */}
            <div className="relative">
              <Eye 
                size={18} 
                className={`text-green-300 transition-all duration-300 ${
                  isHovered ? 'text-green-200 drop-shadow-sm' : ''
                }`}
              />
              {/* Zap overlay for electric effect */}
              <Zap 
                size={10} 
                className={`absolute -top-1 -right-1 text-green-400 transition-all duration-300 ${
                  isHovered ? 'text-green-300 animate-pulse' : 'opacity-60'
                }`}
              />
            </div>
            
            {/* Text */}
            <span className={`text-sm font-medium transition-all duration-300 ${
              isHovered ? 'text-green-200' : 'text-green-300'
            }`}>
              MEME EDITOR
            </span>
          </div>
          
          {/* Subtle scan line effect */}
          <div className="absolute inset-0 rounded-lg opacity-10 pointer-events-none overflow-hidden">
            <div className={`w-full h-[1px] bg-green-400 transition-all duration-1000 ${
              isHovered ? 'animate-pulse' : ''
            }`} style={{
              background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.5), transparent)',
              animation: isHovered ? 'scan 2s linear infinite' : 'none'
            }} />
          </div>
        </div>
      </button>
      
      {/* Minimal status indicator */}
      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-60'
      }`}>
        <div className={`w-1 h-1 rounded-full bg-green-400 ${
          isHovered ? 'animate-pulse shadow-sm shadow-green-400/50' : ''
        }`} />
      </div>
      
      {/* Sleek tooltip on hover */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                       bg-black/90 text-green-200 text-xs px-3 py-1.5 rounded-md
                       border border-green-400/20 backdrop-blur-sm z-30
                       animate-fade-in whitespace-nowrap shadow-lg">
          <div className="flex items-center space-x-1">
            <Eye size={12} className="text-green-400" />
            <span>Deep Fry Memes</span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 rotate-45 bg-black/90 border-r border-b border-green-400/20" />
          </div>
        </div>
      )}
    </div>
  )
}