import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { LanguageHtml } from './LanguageHtml'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'JStore — Phone Repair & Accessories',
    template: '%s | JStore',
  },
  description:
    'Professional mobile phone repair service and shop for accessories & components. Fast, reliable, and affordable.',
  keywords: ['phone repair', 'mobile repair', 'phone accessories', 'screen repair', 'battery replacement'],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'JStore',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageHtml />
        {children}
        <Toaster position="bottom-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
