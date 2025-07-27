"use client"

import Image from 'next/image'

const banners = [
  "/SMP7700.gif",
  "/SMP7700 2.gif",
  "/SMP7700 3.gif",
  "/SMP7700 4.gif",
  "/SMP7700 5.gif",
]

interface ScrollingBannerProps {
  direction?: 'left' | 'right'
}

export function ScrollingBanner({ direction = 'left' }: ScrollingBannerProps) {
  const duration = 80 // Slower for more content
  const animationName = direction === 'left' ? 'scroll-left' : 'scroll-right'
  
  // Repeat banners to create a long track that's wider than any screen
  const longTrackOfBanners = Array(5).fill(banners).flat()

  const Track = () => (
    <div className="flex flex-shrink-0 items-center justify-start">
      {longTrackOfBanners.map((banner, index) => (
        <div key={index} className="flex-shrink-0 mx-2">
          <Image
            src={banner}
            alt={`Scrolling banner ${index + 1}`}
            width={150}
            height={50}
            unoptimized
            className="max-w-none"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-hidden pointer-events-none z-50 py-2">
      <div 
        className="flex"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
        }}
      >
        <Track />
        <Track />
      </div>
    </div>
  )
} 