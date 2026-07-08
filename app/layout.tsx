import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import LoadingPage from '@/components/loading/LoadingPage'
import { ConfirmDialogProvider } from '@/components/confirm-dialog'
import { I18nProvider } from '@/lib/i18n'
import { ClientLayout } from '@/components/ClientLayout'

export const metadata: Metadata = {
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
  children: ReactNode
}>) {
  return (
    <html suppressHydrationWarning className="dark">
      <body className="font-sans antialiased">
        <LoadingPage />
        <I18nProvider>
          <ConfirmDialogProvider>
            <ThemeProvider>
              <ClientLayout>{children}</ClientLayout>
            </ThemeProvider>
          </ConfirmDialogProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}