"use client"

import Image from "next/image"

interface FloatingPenguinProps {
  count?: number
  glitchMode?: boolean
}

export function FloatingPenguins({ count = 8, glitchMode = false }: FloatingPenguinProps) {
  // Array of penguin images - replace these with your actual PNG files
  const penguinImages = [
    "/penguin1.png", // Replace with your actual penguin PNG files
    "/penguin2.png",
    "/penguin3.png",
    "/penguin4.png",
    "/penguin5.png",
    "/penguin6.png",
    "/penguin7.png",
    "/penguin8.png",
  ]

  return (
    <>
      {[...Array(count)].map((_, i) => {
        const angle = (i / count) * 360
        const radius = 200 + Math.random() * 100
        const x = Math.cos((angle * Math.PI) / 180) * radius
        const y = Math.sin((angle * Math.PI) / 180) * radius
        const size = 40 + Math.random() * 20
        const delay = i * 0.5
        const duration = 8 + Math.random() * 4

        return (
          <div
            key={`penguin-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animation: `orbit-penguin ${duration}s infinite linear`,
              animationDelay: `${delay}s`,
              animationPlayState: glitchMode ? 'paused' : 'running',
            }}
          >
            <div
              className="relative"
              style={{
                animation: `penguin-float ${3 + Math.random() * 2}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <Image
                src={penguinImages[i % penguinImages.length]}
                alt={`Floating Penguin ${i + 1}`}
                width={size}
                height={size}
                className="rounded-full"
                unoptimized
                style={{
                  filter: glitchMode 
                    ? `hue-rotate(${Math.random() * 360}deg) brightness(${0.5 + Math.random()})`
                    : `hue-rotate(${i * 45}deg) brightness(${0.8 + Math.random() * 0.4})`,
                  transform: glitchMode 
                    ? `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) rotate(${Math.random() * 360}deg)`
                    : 'none',
                }}
              />
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-30"
                style={{
                  background: `radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)`,
                  animation: `penguin-glow ${2 + Math.random() * 2}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            </div>
          </div>
        )
      })}
    </>
  )
} 