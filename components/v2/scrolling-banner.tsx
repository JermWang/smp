"use client";

import React from 'react';
import Image from 'next/image';

interface ScrollingBannerProps {
  direction: 'left' | 'right';
}

export function ScrollingBanner({ direction }: ScrollingBannerProps) {
  const bannerImages = [
    '/SMP7700.gif',
    '/SMP7700 2.gif', 
    '/SMP7700 3.gif',
    '/SMP7700 4.gif',
    '/SMP7700 5.gif'
  ];

  // Create a long seamless track by repeating the images many times
  const seamlessTrack = Array(10).fill(bannerImages).flat();
  const animationClass = direction === 'left' ? 'animate-scroll-left-seamless' : 'animate-scroll-right-seamless';

  return (
    <div 
      style={{ 
        width: '100%',
        height: '48px', // Fixed height instead of responsive
        overflow: 'hidden',
        background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.2), transparent)',
        margin: '0', 
        padding: '0', 
        lineHeight: '0',
        fontSize: '0',
        display: 'block',
        position: 'relative'
      }}
    >
      <div className={`flex ${animationClass} h-full`} style={{ margin: '0', padding: '0' }}>
        {seamlessTrack.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Banner ${index + 1}`}
            width={120}
            height={40}
            className="mx-1 sm:mx-2 w-20 h-8 sm:w-24 sm:h-10 md:w-[120px] md:h-[40px] object-cover flex-shrink-0"
            unoptimized
            style={{ margin: '0 4px', display: 'block' }}
          />
        ))}
      </div>
    </div>
  );
} 