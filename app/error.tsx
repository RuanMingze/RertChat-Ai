'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-auto px-4 pb-4 bg-background">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-500/5 ring-1 ring-red-500/20">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>

      <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">
        出了点问题
      </h1>
      <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
        抱歉，应用程序遇到了错误。请尝试刷新页面或返回首页。
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={reset}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <RefreshCw className="h-5 w-5" />
          </div>
          <span className="text-sm text-foreground">重试</span>
        </button>

        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-sm text-foreground">返回首页</span>
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-muted-foreground">
          错误代码：{error.digest}
        </p>
      )}
    </div>
  )
}
