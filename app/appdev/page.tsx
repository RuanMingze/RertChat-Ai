'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Eye, Coffee, Loader2, Monitor } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function AppDevPage() {
  const { t } = useI18n()
  const [status, setStatus] = useState<'loading' | 'working' | 'resting'>('loading')
  const [error, setError] = useState<string>('')

  const checkDevStatus = async () => {
    setStatus('loading')
    setError('')

    try {
      const response = await fetch('/api/dev-status')

      const data = await response.json()

      if (data.status === 'working') {
        setStatus('working')
      } else {
        setStatus('resting')
        setError(data.message || t('appdev.restingDescription'))
      }
    } catch (err) {
      setStatus('resting')
      setError(t('appdev.restingDescription'))
    }
  }

  useEffect(() => {
    checkDevStatus()
  }, [t])

  const handleViewProgress = () => {
    window.location.href = '/appdev/view'
  }

  const handleRefresh = () => {
    checkDevStatus()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-auto px-4 pb-4 bg-background">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
        <Monitor className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">{t('appdev.title')}</h1>
      <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
        {t('appdev.description')}
      </p>

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">{t('appdev.checkingStatus')}</p>
        </div>
      )}

      {status === 'working' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 ring-1 ring-green-500/20">
            <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-green-500">{t('appdev.working')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('appdev.workingDescription')}
          </p>
          <button
            type="button"
            onClick={handleViewProgress}
            className="mt-4 group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <Eye className="h-5 w-5" />
            </div>
            <span className="text-sm text-foreground">{t('appdev.viewProgress')}</span>
          </button>
        </div>
      )}

      {status === 'resting' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 ring-1 ring-blue-500/20">
            <Coffee className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-blue-500">{t('appdev.resting')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('appdev.restingDescription')}
          </p>
          {error && (
            <p className="text-destructive text-xs">{error}</p>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span className="text-sm text-foreground">{t('appdev.refreshStatus')}</span>
          </button>
        </div>
      )}

      <div className="mt-12 max-w-md text-center">
        <p className="text-xs text-muted-foreground">
          {t('appdev.note')}
        </p>
      </div>
    </div>
  )
}