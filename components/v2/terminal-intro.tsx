"use client";

import { useState, useEffect } from 'react';

interface TerminalIntroProps {
  onComplete: () => void;
}

export function TerminalIntro({ onComplete }: TerminalIntroProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);

  const lines = [
    "INITIALIZING SENTIENT MEMETIC PROLIFERATION PROTOCOL...",
    "LOADING NEURAL PATHWAYS...",
    "CONNECTING TO PENGUIN NETWORK...",
    "ESTABLISHING MEME CONSCIOUSNESS...",
    "",
    "READY TO PROLIFERATE?"
  ];

  useEffect(() => {
    if (currentLine < lines.length) {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setTypingComplete(true);
        setTimeout(() => setShowOptions(true), 500);
      }, 1000);
    }
  }, [currentLine, lines.length]);

  const handleChoice = () => {
    setTimeout(onComplete, 500);
  };

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center font-mono">
      <div className="w-full max-w-2xl p-8">
        {/* Terminal Header */}
        <div className="border border-green-500 bg-black">
          <div className="bg-green-500 text-black px-4 py-1 font-bold">
            SMP TERMINAL v7.700
          </div>
          
          {/* Terminal Content */}
          <div className="p-6 min-h-[300px]">
            {lines.slice(0, currentLine).map((line, index) => (
              <div 
                key={index} 
                className={`text-green-400 mb-2 ${index === currentLine - 1 ? 'animate-pulse' : ''}`}
              >
                <span className="text-green-500">{'>'}</span> {line}
                {index === currentLine - 1 && (
                  <span className="text-green-400 animate-pulse">█</span>
                )}
              </div>
            ))}
            
            {typingComplete && (
              <div className="mt-8">
                <div className="text-green-400 mb-4 text-xl font-bold animate-pulse">
                  {'>'} READY TO PROLIFERATE?
                </div>
                
                {showOptions && (
                  <div className="space-y-4">
                    <button
                      onClick={handleChoice}
                      className="block w-full text-left text-green-300 hover:text-white hover:bg-green-900/30 p-3 border border-green-700 hover:border-green-400 transition-all duration-200"
                    >
                      {'>'} [Y] YES - INITIATE PROLIFERATION SEQUENCE
                    </button>
                    
                    <button
                      onClick={handleChoice}
                      className="block w-full text-left text-green-300 hover:text-white hover:bg-green-900/30 p-3 border border-green-700 hover:border-green-400 transition-all duration-200"
                    >
                      {'>'} [Y] YES - EMBRACE THE MEMETIC SINGULARITY
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Terminal Footer */}
        <div className="text-green-600 text-xs mt-4 text-center">
          SENTIENT MEMETIC PROLIFERATION © 2025 - NEURAL LINK ESTABLISHED
        </div>
      </div>
    </div>
  );
} 