"use client";

import { useEffect, useRef } from 'react';

interface AmbientSoundProps {
  isMelodyMuted: boolean;
}

export function AmbientSound({ isMelodyMuted }: AmbientSoundProps) {
  const melodyRef = useRef<HTMLAudioElement | null>(null);
  const effectRef = useRef<HTMLAudioElement | null>(null);
  const interactionListenerAttached = useRef(false);

  // Effect to handle muting the melody
  useEffect(() => {
    if (melodyRef.current) {
      melodyRef.current.muted = isMelodyMuted;
    }
  }, [isMelodyMuted]);

  useEffect(() => {
    // Initialize audio elements once
    if (!melodyRef.current) {
      melodyRef.current = new Audio('/melodic-techno-melody-v2-248886.mp3');
      melodyRef.current.loop = true;
      melodyRef.current.volume = 0.3;
    }
    if (!effectRef.current) {
      effectRef.current = new Audio('/sentient memetic proliferation.wav');
      effectRef.current.volume = 0.5;
    }

    const melody = melodyRef.current;
    const effect = effectRef.current;
    
    let interval: NodeJS.Timeout;

    const playAllSounds = () => {
      const melodyPromise = melody.play();
      const effectPromise = effect.play();
      
      Promise.all([melodyPromise, effectPromise]).catch(error => {
        if (error.name === 'NotAllowedError' && !interactionListenerAttached.current) {
          const startOnInteraction = () => {
            playAllSounds();
          };
          window.addEventListener('click', startOnInteraction, { once: true });
          window.addEventListener('keydown', startOnInteraction, { once: true });
          interactionListenerAttached.current = true;
        }
      });
    };

    const playEffect = () => {
      effect.currentTime = 0;
      effect.play().catch(e => console.error("Could not play effect sound:", e));
    }
    
    // Attempt to play on load
    playAllSounds();

    // Set up the interval for the recurring effect
    interval = setInterval(playEffect, 30000);

    // Clean up on unmount
    return () => {
      clearInterval(interval);
      melody.pause();
      effect.pause();
    };
  }, []);

  return null;
} 