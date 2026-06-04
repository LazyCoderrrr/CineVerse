import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CineVerse — Stream Movies & Series',
  description: 'Your premier hub for streaming Movies, TV Shows, Anime, and Cartoons.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a' }}>
        {children}
      </body>
    </html>
  )
}
