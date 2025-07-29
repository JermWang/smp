"use client";

import { useEffect, useRef, useState } from 'react';

interface AmbientSoundProps {
  isMelodyMuted: boolean;
}

export function AmbientSound({ isMelodyMuted }: AmbientSoundProps) {
  const melodyRef = useRef<HTMLAudioElement | null>(null);
  const effectRef = useRef<HTMLAudioElement | null>(null);
  const interactionListenerAttached = useRef(false);
  const [audioStatus, setAudioStatus] = useState<string>('Initializing...');

  // Effect to handle muting the melody
  useEffect(() => {
    if (melodyRef.current) {
      melodyRef.current.muted = isMelodyMuted;
      console.log(`Melody ${isMelodyMuted ? 'muted' : 'unmuted'}`);
    }
  }, [isMelodyMuted]);

  useEffect(() => {
    console.log('AmbientSound: Initializing audio...');
    
    // Initialize audio elements once
    if (!melodyRef.current) {
      melodyRef.current = new Audio('/Sentient Memetic Proliferation.mp3');
      melodyRef.current.loop = true;
      melodyRef.current.volume = 0.3;
      melodyRef.current.muted = isMelodyMuted;
      
      // Add event listeners for debugging
      melodyRef.current.addEventListener('loadstart', () => console.log('Melody: Load started'));
      melodyRef.current.addEventListener('canplay', () => console.log('Melody: Can play'));
      melodyRef.current.addEventListener('play', () => console.log('Melody: Playing'));
      melodyRef.current.addEventListener('pause', () => console.log('Melody: Paused'));
      melodyRef.current.addEventListener('error', (e) => console.error('Melody error:', e));
    }
    
    if (!effectRef.current) {
      effectRef.current = new Audio('/SMPtag.wav');
      effectRef.current.volume = 0.5;
      
      // Add event listeners for debugging
      effectRef.current.addEventListener('loadstart', () => console.log('Effect: Load started'));
      effectRef.current.addEventListener('canplay', () => console.log('Effect: Can play'));
      effectRef.current.addEventListener('play', () => console.log('Effect: Playing'));
      effectRef.current.addEventListener('error', (e) => console.error('Effect error:', e));
    }

    const melody = melodyRef.current;
    const effect = effectRef.current;
    
    let interval: NodeJS.Timeout;

    const startMelody = async () => {
      try {
        console.log('Attempting to start melody...');
        await melody.play();
        setAudioStatus('Melody playing');
        console.log('Melody started successfully');
      } catch (error: any) {
        console.error('Melody play error:', error);
        setAudioStatus(`Melody blocked: ${error.name}`);
        
        if (error.name === 'NotAllowedError' && !interactionListenerAttached.current) {
          console.log('Adding interaction listeners for melody...');
          const startOnInteraction = async () => {
            try {
              await melody.play();
              setAudioStatus('Melody playing (after interaction)');
              console.log('Melody started after user interaction');
            } catch (e) {
              console.error('Melody failed even after interaction:', e);
              setAudioStatus('Melody failed');
            }
          };
          
          window.addEventListener('click', startOnInteraction, { once: true });
          window.addEventListener('keydown', startOnInteraction, { once: true });
          window.addEventListener('touchstart', startOnInteraction, { once: true });
          interactionListenerAttached.current = true;
          setAudioStatus('Waiting for user interaction...');
        }
      }
    };

    const playEffect = async () => {
      try {
        effect.currentTime = 0;
        await effect.play();
        console.log('Effect played successfully');
      } catch (e) {
        console.error("Could not play effect sound:", e);
      }
    };
    
    // Start melody after a small delay to ensure DOM is ready
    const startTimeout = setTimeout(() => {
      startMelody();
    }, 500);

    // Set up the interval for the recurring effect (wait a bit before starting)
    const intervalTimeout = setTimeout(() => {
      interval = setInterval(playEffect, 30000);
    }, 5000); // Wait 5 seconds before starting effect intervals

    // Clean up on unmount
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(intervalTimeout);
      if (interval) {
        clearInterval(interval);
      }
      if (melody) {
        melody.pause();
        melody.currentTime = 0;
      }
      if (effect) {
        effect.pause();
        effect.currentTime = 0;
      }
      console.log('AmbientSound: Cleaned up');
    };
  }, [isMelodyMuted]);

  // Show debug info in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded z-50 max-w-xs">
        Audio Status: {audioStatus}
      </div>
    );
  }

  return null;
} 