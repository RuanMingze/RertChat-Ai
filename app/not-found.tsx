'use client'

import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-auto px-4 pb-4 bg-background">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
        <FileQuestion className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">
        {t('notFound.title')}
      </h1>
      <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
        {t('notFound.description')}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-sm text-foreground">{t('notFound.goHome')}</span>
        </Link>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="text-sm text-foreground">{t('notFound.goBack')}</span>
        </button>
      </div>
    </div>
  )
}
