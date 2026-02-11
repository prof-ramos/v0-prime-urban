import React from "react"
import type { Metadata, Viewport } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { WhatsAppFloat } from '@/components/whatsapp-float'
import './globals.css'

import { Inter, Playfair_Display, Libre_Baskerville as V0_Font_Libre_Baskerville } from 'next/font/google'

// Initialize fonts
const _libreBaskerville = V0_Font_Libre_Baskerville({ subsets: ['latin'], weight: ["400","700"] })

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: {
    default: 'PrimeUrban | Imóveis de Alto Padrão em Brasília',
    template: '%s | PrimeUrban Brasília'
  },
  description: 'Encontre apartamentos e casas de alto padrão em Brasília. Curadoria exclusiva de imóveis na Asa Sul, Asa Norte, Águas Claras, Sudoeste e mais.',
  keywords: ['imóveis Brasília', 'apartamentos Asa Sul', 'casas Asa Norte', 'imobiliária Brasília', 'imóveis alto padrão DF'],
  generator: 'Next.js',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'PrimeUrban Brasília',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1D2D3A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} ${playfair.variable} font-serif antialiased`}>
        {children}
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  )
}
