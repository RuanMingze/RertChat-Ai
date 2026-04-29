'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Eye, Coffee, Loader2, Monitor } from 'lucide-react'

export default function AppDevPage() {
  const [status, setStatus] = useState<'loading' | 'working' | 'resting'>('loading')
  const [showWelcome, setShowWelcome] = useState(true)
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
        setError(data.message || '开发服务器已关闭')
      }
    } catch (err) {
      setStatus('resting')
      setError('无法获取开发服务器状态')
    }
  }

  useEffect(() => {
    checkDevStatus()
  }, [])

  const handleViewProgress = () => {
    setShowWelcome(false)
  }

  const handleRefresh = () => {
    checkDevStatus()
  }

  if (!showWelcome) {
    return (
      <div className="fixed inset-0 bg-background">
        <iframe
          src="https://apidev.rertx.dpdns.org"
          className="w-full h-full border-0"
          title="开发进度追踪"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-auto px-4 pb-4 bg-background">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
        <Monitor className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">开发追踪</h1>
      <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
        查看开发者的工作进度
      </p>

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">正在检测开发服务器状态...</p>
        </div>
      )}

      {status === 'working' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 ring-1 ring-green-500/20">
            <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-green-500">开发者正在工作中</h2>
          <p className="text-muted-foreground text-sm">
            检测到开发服务器正在运行
          </p>
          <button
            type="button"
            onClick={handleViewProgress}
            className="mt-4 group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <Eye className="h-5 w-5" />
            </div>
            <span className="text-sm text-foreground">查看开发进度</span>
          </button>
        </div>
      )}

      {status === 'resting' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 ring-1 ring-blue-500/20">
            <Coffee className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-blue-500">开发者正在休息中</h2>
          <p className="text-muted-foreground text-sm">
            开发服务器暂时关闭，请稍后再来
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
            <span className="text-sm text-foreground">刷新状态</span>
          </button>
        </div>
      )}

      <div className="mt-12 max-w-md text-center">
        <p className="text-xs text-muted-foreground">
          如果看到其他页面，说明开发者不在开发此应用
        </p>
      </div>
    </div>
  )
}
