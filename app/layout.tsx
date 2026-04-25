import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Liste de naissance · Géraldine & Jonathan',
  description: 'Notre liste de naissance — réservez un cadeau pour notre bébé !',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${lato.variable}`}>
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--cream)', fontFamily: 'var(--font-lato), sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
