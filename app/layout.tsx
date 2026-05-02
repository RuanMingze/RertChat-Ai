import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import LoadingPage from '@/components/loading/LoadingPage'
import { ConfirmDialogProvider } from '@/components/confirm-dialog'
import { I18nProvider } from '@/lib/i18n'
import { getTranslation, type Locale } from '@/lib/i18n'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'zh-CN'
  const title = getTranslation(locale, 'meta.title')
  const description = getTranslation(locale, 'meta.description')

  return {
    title,
    description,
    generator: 'Ruanm',
    icons: {
      icon: '/favicon.ico',
    },
    manifest: '/manifest.json',
  }
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <LoadingPage />
        <I18nProvider>
          <ConfirmDialogProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ConfirmDialogProvider>
        </I18nProvider>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('Service Worker registered:', registration);
                    })
                    .catch((error) => {
                      console.error('Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}