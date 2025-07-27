"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface WebampPlayerProps {
  tracks?: Array<{
    url: string
    duration: number
    title: string
    artist: string
  }>
}

export function WebampPlayer({ tracks = [] }: WebampPlayerProps) {
  const webampRef = useRef<any>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 }) // Safe default position
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsClient(true)
    // Set initial position in bottom right when client loads
    if (typeof window !== 'undefined') {
      setPosition({ 
        x: window.innerWidth - 295, 
        y: window.innerHeight - 136 
      })
    }
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === "undefined" || webampRef.current) {
      return
    }

    // A small delay to ensure the container is ready before rendering Webamp
    setTimeout(() => {
      // Dynamically import webamp only on client side
      import("webamp").then((Webamp) => {
        // Check if the container exists before rendering
        const container = document.getElementById("webamp-container");
        if (!container) return;

        // Initialize Webamp
        webampRef.current = new Webamp.default({
          initialTracks: tracks.length > 0 ? tracks : [
            {
              url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@master/demo.mp3",
              duration: 5.322286,
              title: "Test Track",
              artist: "Test Artist",
            }
          ],
        })

        // Render Webamp
        webampRef.current.renderWhenReady(container)
      })
    }, 100)

    return () => {
      if (webampRef.current) {
        webampRef.current.dispose()
        webampRef.current = null
      }
    }
  }, [isClient, tracks])

  // Mouse drag handlers - only trigger from drag handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow dragging if clicked on our drag handle
    if (e.target !== dragHandleRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }, [position.x, position.y])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    e.preventDefault()
    
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    
    // Keep within screen bounds
    const maxX = (window?.innerWidth || 1920) - 275
    const maxY = (window?.innerHeight || 1080) - 116
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    })
  }, [isDragging, dragOffset.x, dragOffset.y])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { capture: true })
      document.addEventListener('mouseup', handleMouseUp, { capture: true })
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, { capture: true })
        document.removeEventListener('mouseup', handleMouseUp, { capture: true })
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!isClient) {
    return (
      <div 
        className="fixed z-[9999]"
        style={{ 
          left: 20, 
          top: 20,
          width: "275px", 
          height: "116px" 
        }}
      />
    )
  }

  return (
    <div 
      className="fixed z-[9999] select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        width: "275px", 
        height: "116px",
        filter: 'drop-shadow(0 0 15px #40ff80) drop-shadow(0 0 30px #40ff80)',
        userSelect: 'none',
      }}
    >
      {/* Dedicated drag handle - only this area triggers dragging */}
      <div
        ref={dragHandleRef}
        className={`absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-b border-green-400/30 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } hover:bg-green-500/30 transition-colors`}
        onMouseDown={handleMouseDown}
        style={{ 
          zIndex: 10001,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Webamp container - no drag events here */}
      <div 
        id="webamp-container" 
        className="relative w-full h-full"
        style={{ 
          pointerEvents: isDragging ? 'none' : 'auto',
          userSelect: 'none',
        }}
      />
    </div>
  )
} 