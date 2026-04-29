import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import LoadingPage from '@/components/loading/LoadingPage'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'RertChat - AI助手',
  description: '基于 Cloudflare 的智能对话助手',
  generator: 'Ruanm',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LoadingPage />
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
