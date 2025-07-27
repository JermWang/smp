"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface PhotoshopButtonProps {
  onKonamiTrigger: () => void
  onButtonClick: () => void
  sacredChaos?: boolean
  strobeMode?: boolean
  randomMode?: boolean
  secretMode?: boolean
}

export function PhotoshopButton({ 
  onKonamiTrigger, 
  onButtonClick, 
  sacredChaos = false,
  strobeMode = false, 
  randomMode = false,
  secretMode = false 
}: PhotoshopButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [konamiCode, setKonamiCode] = useState<number[]>([])

  // Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65] // Up, up, down, down, left, right, left, right, B, A
      
      setKonamiCode(prev => {
        const newCode = [...prev, e.keyCode]
        if (newCode.length > 10) newCode.shift()
        
        if (newCode.join(',') === konami.join(',')) {
          onKonamiTrigger()
          setKonamiCode([])
          return []
        }
        
        return newCode
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onKonamiTrigger])

  const handleButtonPress = () => {
    // Immediate response
    setIsPressed(true)
    
    // Trigger mode cycle effect
    onButtonClick()
    
    // Enhanced haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50]) // Single tap for faster response
    }
    
    // Reset button state after longer duration to show image switch
    setTimeout(() => {
      setIsPressed(false)
    }, 200) // Increased duration to see the image switch
  }

  // Define what each circle represents
  const getCircleState = (index: number) => {
    switch(index) {
      case 0: 
      case 1: 
        // Circles 0-1: Konami code progress
        return index < konamiCode.length 
          ? { active: true, color: 'bg-blue-400', label: 'Konami Progress' }
          : { active: false, color: 'bg-gray-400/30', label: 'Inactive' }
      
      case 2:
        // Circle 2: Sacred Chaos mode
        return sacredChaos 
          ? { active: true, color: 'bg-yellow-400', label: 'Sacred Chaos' }
          : { active: false, color: 'bg-gray-400/30', label: 'Inactive' }
      
      case 3:
        // Circle 3: Strobe mode  
        return strobeMode
          ? { active: true, color: 'bg-white', label: 'Strobe Mode' }
          : { active: false, color: 'bg-gray-400/30', label: 'Inactive' }
      
      case 4:
        // Circle 4: Random mode
        return randomMode
          ? { active: true, color: 'bg-purple-400', label: 'Random Mode' }
          : { active: false, color: 'bg-gray-400/30', label: 'Inactive' }
      
      case 5:
        // Circle 5: Secret mode (Konami total chaos)
        return secretMode
          ? { active: true, color: 'bg-green-400', label: 'Secret Mode' }
          : { active: false, color: 'bg-gray-400/30', label: 'Inactive' }
      
      default:
        // Circles 6-9: Additional Konami progress
        return (index - 4) < konamiCode.length 
          ? { active: true, color: 'bg-blue-400', label: 'Konami Progress' }
          : { active: false, color: 'bg-gray-400/30', label: 'Inactive' }
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={handleButtonPress}
        className="relative focus:outline-none"
      >
        <Image
          src={isPressed ? "/button-pressed.png" : "/button-unpressed.png"}
          alt="Chaos Button"
          width={128}
          height={128}
          className="drop-shadow-2xl"
          unoptimized
        />
      </button>
      
      {/* Mode indicator circles */}
      <div className="mt-4 flex justify-center space-x-2">
        {[...Array(10)].map((_, i) => {
          const state = getCircleState(i)
          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-150 ${state.color} ${
                state.active ? 'shadow-sm scale-110' : ''
              }`}
            />
          )
        })}
      </div>
    </div>
  )
} 