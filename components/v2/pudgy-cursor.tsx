"use client";

import { useEffect, useRef } from 'react';

export function PudgyCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const isVisible = useRef(false);
  const animationId = useRef<number>();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Animation loop using requestAnimationFrame for smooth 60fps
    const animate = () => {
      if (cursor && isVisible.current) {
        // Use transform3d for GPU acceleration and better performance
        cursor.style.transform = `translate3d(${mousePosition.current.x - 16}px, ${mousePosition.current.y - 16}px, 0)`;
      }
      animationId.current = requestAnimationFrame(animate);
    };

    // Throttled mouse move handler for better performance
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        // Update position immediately but only render on next frame
        mousePosition.current = { x: e.clientX, y: e.clientY };
        
        if (!isVisible.current) {
          isVisible.current = true;
          if (cursor) {
            cursor.style.opacity = '1';
          }
        }
        
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
        });
      }
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
      if (cursor) {
        cursor.style.opacity = '0';
      }
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
      if (cursor) {
        cursor.style.opacity = '1';
      }
    };

    // Start animation loop
    animationId.current = requestAnimationFrame(animate);

    // Add optimized event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    return () => {
      // Restore default cursor
      document.body.style.cursor = 'auto';
      
      // Cancel animation
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      
      // Remove event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[200] will-change-transform"
      style={{
        opacity: 0,
        transform: 'translate3d(-16px, -16px, 0)', // Initial position offscreen
      }}
    >
      <img
        src="/mua-muah.gif"
        alt="Pudgy Cursor"
        className="w-8 h-8 object-contain"
        draggable={false}
        style={{ 
          imageRendering: 'pixelated', // Crisp pixel art rendering
          backfaceVisibility: 'hidden', // Prevent flickering
        }}
      />
    </div>
  );
} 