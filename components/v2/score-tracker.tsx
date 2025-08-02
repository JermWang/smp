"use client";

import { useState, useEffect, useRef } from 'react';
import { GlobalEchoService } from '@/lib/global-echo-service';

interface ScoreTrackerProps {
  currentScore: number;
  onReset: () => void;
}

export function ScoreTracker({ currentScore, onReset }: ScoreTrackerProps) {
  const [highScore, setHighScore] = useState(0);
  const [globalEchoes, setGlobalEchoes] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [scoreCardDataUrl, setScoreCardDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('smp-high-score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Initialize global echo tracking
    const initializeGlobalTracking = async () => {
      // Get initial global count
      const initialCount = await GlobalEchoService.getGlobalEchoCount();
      setGlobalEchoes(initialCount);

      // Subscribe to real-time updates
      const unsubscribe = GlobalEchoService.subscribeToGlobalEchoes((newCount) => {
        setGlobalEchoes(newCount);
      });

      // Initialize database if needed (first time setup)
      await GlobalEchoService.initializeDatabase();

      return unsubscribe;
    };

    const unsubscribePromise = initializeGlobalTracking();

    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  useEffect(() => {
    // Update high score if current score is higher
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('smp-high-score', currentScore.toString());
    }
  }, [currentScore, highScore]);

  const generateScoreCard = async (score: number): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size for better quality
    canvas.width = 1500;
    canvas.height = 500;

    return new Promise((resolve) => {
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'anonymous';
      
      backgroundImg.onload = () => {
        try {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the background artwork
          ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
          
          // Add dark overlay for text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add subtle gradient overlay
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
          gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 20, 147, 0.1)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Set text properties for better rendering
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          
          // Current Score (Main highlight) - Larger and more prominent
          ctx.fillStyle = '#00ffff';
          ctx.font = 'bold 120px Arial, sans-serif';
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          // Add text stroke for better visibility
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeText(`${score}`, canvas.width / 2, 200);
          ctx.fillText(`${score}`, canvas.width / 2, 200);
          
          // "ECHOES" label
          ctx.fillStyle = '#F5F5DC';
          ctx.font = 'bold 60px Arial, sans-serif';
          ctx.shadowColor = '#F5F5DC';
          ctx.shadowBlur = 20;
          ctx.lineWidth = 3;
          ctx.strokeText('ECHOES LAUNCHED', canvas.width / 2, 270);
          ctx.fillText('ECHOES LAUNCHED', canvas.width / 2, 270);
          
          // High Score section
          const displayHighScore = Math.max(score, highScore);
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 36px Arial, sans-serif';
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2;
          ctx.strokeText(`HIGH SCORE: ${displayHighScore}`, canvas.width / 2, 350);
          ctx.fillText(`HIGH SCORE: ${displayHighScore}`, canvas.width / 2, 350);
          
          // Website/branding
          ctx.fillStyle = '#F5F5DC';
          ctx.font = 'bold 28px Arial, sans-serif';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 10;
          ctx.lineWidth = 2;
          ctx.strokeText('SMP7700.XYZ', canvas.width / 2, 420);
          ctx.fillText('SMP7700.XYZ', canvas.width / 2, 420);
          
          // Add decorative elements
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 10]);
          ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
          ctx.setLineDash([]);
          
          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          resolve(canvas.toDataURL('image/png', 0.95));
        } catch (error) {
          console.error('Error drawing on canvas:', error);
          resolve(null);
        }
      };
      
      backgroundImg.onerror = (error) => {
        console.warn('Failed to load background image, using fallback:', error);
        try {
          // Fallback to gradient background if image fails
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#000000');
          gradient.addColorStop(0.3, '#1a1a2e');
          gradient.addColorStop(0.7, '#16213e');
          gradient.addColorStop(1, '#000000');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add pattern overlay
          ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
          for (let i = 0; i < canvas.width; i += 40) {
            for (let j = 0; j < canvas.height; j += 40) {
              if ((i + j) % 80 === 0) {
                ctx.fillRect(i, j, 20, 20);
              }
            }
          }
          
          // Set text properties
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          
          // Add the same text as above with improved styling
          ctx.fillStyle = '#00ffff';
          ctx.font = 'bold 120px Arial, sans-serif';
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 30;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeText(`${score}`, canvas.width / 2, 200);
          ctx.fillText(`${score}`, canvas.width / 2, 200);
          
          ctx.fillStyle = '#F5F5DC';
          ctx.font = 'bold 60px Arial, sans-serif';
          ctx.shadowColor = '#F5F5DC';
          ctx.shadowBlur = 20;
          ctx.lineWidth = 3;
          ctx.strokeText('ECHOES LAUNCHED', canvas.width / 2, 270);
          ctx.fillText('ECHOES LAUNCHED', canvas.width / 2, 270);
          
          const displayHighScore = Math.max(score, highScore);
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 36px Arial, sans-serif';
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2;
          ctx.strokeText(`HIGH SCORE: ${displayHighScore}`, canvas.width / 2, 350);
          ctx.fillText(`HIGH SCORE: ${displayHighScore}`, canvas.width / 2, 350);
          
          ctx.fillStyle = '#F5F5DC';
          ctx.font = 'bold 28px Arial, sans-serif';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 10;
          ctx.lineWidth = 2;
          ctx.strokeText('SMP7700.XYZ', canvas.width / 2, 420);
          ctx.fillText('SMP7700.XYZ', canvas.width / 2, 420);
          
          // Add decorative border
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 10]);
          ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
          ctx.setLineDash([]);
          
          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          resolve(canvas.toDataURL('image/png', 0.95));
        } catch (fallbackError) {
          console.error('Error in fallback canvas generation:', fallbackError);
          resolve(null);
        }
      };
      
      // Load the background image
      backgroundImg.src = '/1500x500.jpg';
    });
  };

  const handleShare = async () => {
    setShowShareModal(true);
    // Generate the score card immediately when share is clicked
    try {
      const dataUrl = await generateScoreCard(currentScore);
      setScoreCardDataUrl(dataUrl);
      if (!dataUrl) {
        console.error('Failed to generate score card');
      }
    } catch (error) {
      console.error('Error generating score card:', error);
      setScoreCardDataUrl(null);
    }
  };

  const downloadScoreCard = async () => {
    try {
      const dataUrl = scoreCardDataUrl || await generateScoreCard(currentScore);
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `smp-echoes-${currentScore}-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Failed to generate or retrieve score card');
        alert('Failed to generate score card. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading score card:', error);
      alert('Error downloading score card. Please try again.');
    }
  };

  const shareToTwitter = () => {
    const text = `I just launched ${currentScore} echoes into the sentient memetic proliferation! 🐧✨ Can you beat my score?`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://smp7700.com')}&hashtags=SMP,PudgyPenguins,EuroTechno`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="fixed top-20 left-8 sm:top-24 sm:left-8 z-50 flex flex-col space-y-3">
        {/* Current Score */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-2 min-w-[100px]">
          <div className="text-white/80 text-xs font-mono">ECHOES</div>
          <div className="text-white text-xl font-bold">{currentScore}</div>
        </div>
        
        {/* High Score */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-2 min-w-[100px]">
          <div className="text-white/80 text-xs font-mono">HIGH SCORE</div>
          <div className="text-cyan-400 text-xl font-bold">{highScore}</div>
        </div>
        
        {/* Global Echoes */}
        <div className="backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl px-4 py-2 min-w-[100px]">
          <div className="text-white/80 text-xs font-mono">GLOBAL ECHOES</div>
          <div className="text-purple-300 text-xl font-bold">{globalEchoes.toLocaleString()}</div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          {currentScore > 0 && (
            <button
              onClick={handleShare}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-2 hover:bg-white/20 transition-colors text-white/80 hover:text-white text-sm font-mono"
            >
              SHARE
            </button>
          )}
          
          {currentScore > 0 && (
            <button
              onClick={onReset}
              className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 hover:bg-red-500/30 transition-colors text-red-300 hover:text-red-200 text-sm font-mono"
            >
              RESET
            </button>
          )}
        </div>
      </div>

      {/* Share Modal with Live Preview */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-2xl font-bold">Share Your Score!</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Live Preview of Score Card */}
            <div className="mb-6">
              <div className="text-white/80 text-sm mb-3 text-center">Preview:</div>
              {scoreCardDataUrl ? (
                <div className="flex justify-center">
                  <img 
                    src={scoreCardDataUrl} 
                    alt="Score Card Preview" 
                    className="max-w-full h-auto rounded-xl border border-white/20 shadow-2xl"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              ) : scoreCardDataUrl === null ? (
                <div className="flex flex-col justify-center items-center h-40 text-center">
                  <div className="text-red-400 mb-2">⚠️ Failed to generate preview</div>
                  <div className="text-white/60 text-sm">You can still try to download or share</div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3"></div>
                  <div className="text-white/60">Generating preview...</div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={shareToTwitter}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 1200 1227">
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
                </svg>
                Share on Twitter
              </button>
              
              <button
                onClick={downloadScoreCard}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for generating score cards */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
} 