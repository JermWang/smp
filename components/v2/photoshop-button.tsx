"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PhotoshopButtonProps {
  onButtonClick: () => void;
}

export function PhotoshopButton({ onButtonClick }: PhotoshopButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Play the click sound only when the button enters the 'pressed' state.
    if (isPressed) {
      const audio = new Audio('/click-tap-computer-mouse-352734.mp3');
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  }, [isPressed]);

  const handleMouseDown = () => {
    setIsPressed(true);
    onButtonClick();
  };

  // This will handle both mouse up and mouse leave events
  const handleRelease = () => {
    if (isPressed) {
      // Keep the button pressed for a short duration for better visual feedback
      setTimeout(() => {
        setIsPressed(false);
      }, 150);
    }
  };

  return (
    <div className="relative flex justify-center items-center">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        className="relative focus:outline-none"
        aria-label="Burst Button"
      >
        <Image
          src={isPressed ? "/button-pressed.png" : "/button-unpressed.png"}
          alt="Photoshop-style button"
          width={160}
          height={160}
          unoptimized
          priority
        />
      </button>
    </div>
  );
} 