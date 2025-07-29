"use client";

import { useEffect, useRef } from 'react';

export function NeonCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const updateCursor = () => {
      if (cursor) {
        cursor.style.left = mousePos.current.x + 'px';
        cursor.style.top = mousePos.current.y + 'px';
      }
      rafId.current = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    // Start the animation loop
    rafId.current = requestAnimationFrame(updateCursor);

    // Add mouse listener with passive flag for better performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div ref={cursorRef} className="neon-cursor" />;
} 