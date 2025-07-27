import "./globals.css"
import "./animations.css"
import type { Metadata } from 'next'
import localFont from 'next/font/local'

const heavitas = localFont({
  src: '../public/Heavitas.ttf',
  variable: '--font-heavitas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SMP - Sentient Memetic Proliferation',
  description: 'Angelically schizo euro techno Pudgy Penguins experience. Join the sentient memetic proliferation movement.',
  keywords: 'SMP, Sentient Memetic Proliferation, Pudgy Penguins, Crypto, Token, Euro Techno, Abstract Chain',
  openGraph: {
    title: 'SMP - Sentient Memetic Proliferation',
    description: 'Angelically schizo euro techno Pudgy Penguins experience. Join the sentient memetic proliferation movement.',
    images: [
      {
        url: '/1500x500.jpg',
        width: 1500,
        height: 500,
        alt: 'SMP - Sentient Memetic Proliferation',
      },
    ],
    siteName: 'SMP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMP - Sentient Memetic Proliferation',
    description: 'Angelically schizo euro techno Pudgy Penguins experience. Join the sentient memetic proliferation movement.',
    images: ['/1500x500.jpg'],
    creator: '@SMP7700',
  },
  other: {
    // Discord and Telegram will use Open Graph tags
    'og:image:width': '1500',
    'og:image:height': '500',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={heavitas.variable}>
      <body className="h-screen bg-black overflow-hidden">
        {children}
      </body>
    </html>
  )
} 