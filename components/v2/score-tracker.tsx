"use client";

import { useState, useEffect, useRef } from 'react';

interface ScoreTrackerProps {
  currentScore: number;
  onReset: () => void;
}

export function ScoreTracker({ currentScore, onReset }: ScoreTrackerProps) {
  const [highScore, setHighScore] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('smp-high-score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    // Update high score if current score is higher
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('smp-high-score', currentScore.toString());
    }
  }, [currentScore, highScore]);

  const generateScoreCard = async (score: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 630; // Twitter card ratio

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some glow effects
    ctx.shadowColor = '#F5F5DC';
    ctx.shadowBlur = 20;
    
    // Title
    ctx.fillStyle = '#F5F5DC';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SENTIENT MEMETIC PROLIFERATION', canvas.width / 2, 120);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Current Score (Main highlight)
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 96px Arial';
    ctx.fillText(`${score} ECHOES`, canvas.width / 2, 250);
    
    // Current score label
    ctx.fillStyle = '#F5F5DC';
    ctx.font = '28px Arial';
    ctx.fillText('CURRENT SESSION', canvas.width / 2, 290);
    
    // High Score section
    const displayHighScore = Math.max(score, highScore);
    ctx.fillStyle = '#FFD700'; // Gold color for high score
    ctx.font = 'bold 48px Arial';
    ctx.fillText(`HIGH SCORE: ${displayHighScore}`, canvas.width / 2, 380);
    
    // Subtitle
    ctx.fillStyle = '#F5F5DC';
    ctx.font = '24px Arial';
    ctx.fillText('LAUNCHED INTO THE VOID', canvas.width / 2, 420);
    
    // Website
    ctx.fillStyle = '#888888';
    ctx.font = '20px Arial';
    ctx.fillText('Play at SMP7700.com', canvas.width / 2, 520);
    
    // Add decorative elements
    ctx.strokeStyle = '#F5F5DC';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(50, 50, canvas.width - 100, canvas.height - 100);
    ctx.stroke();

    // Add corner decorations
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(40, 40, 20, 3);
    ctx.fillRect(40, 40, 3, 20);
    
    ctx.fillRect(canvas.width - 60, 40, 20, 3);
    ctx.fillRect(canvas.width - 43, 40, 3, 20);
    
    ctx.fillRect(40, canvas.height - 43, 20, 3);
    ctx.fillRect(40, canvas.height - 60, 3, 20);
    
    ctx.fillRect(canvas.width - 60, canvas.height - 43, 20, 3);
    ctx.fillRect(canvas.width - 43, canvas.height - 60, 3, 20);

    return canvas.toDataURL('image/png');
  };

  const handleShare = async () => {
    setShowShareModal(true);
  };

  const downloadScoreCard = async () => {
    const dataUrl = await generateScoreCard(currentScore);
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `smp-score-${currentScore}.png`;
      link.href = dataUrl;
      link.click();
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
        
        {/* Share Button */}
        {currentScore > 0 && (
          <button
            onClick={handleShare}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-2 hover:bg-white/20 transition-colors text-white/80 hover:text-white text-sm font-mono"
          >
            SHARE
          </button>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-xl font-bold mb-4 text-center">Share Your Score!</h3>
            <div className="text-center mb-6">
              <div className="text-cyan-400 text-4xl font-bold">{currentScore}</div>
              <div className="text-white/80 text-sm">Echoes Launched</div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={shareToTwitter}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-3 font-medium transition-colors"
              >
                Share on Twitter
              </button>
              
              <button
                onClick={downloadScoreCard}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-4 py-3 font-medium transition-colors"
              >
                Download Score Card
              </button>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="border border-white/20 text-white/80 hover:text-white rounded-xl px-4 py-3 font-medium transition-colors"
              >
                Close
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