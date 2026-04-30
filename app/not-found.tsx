'use client'

import { FileQuestion, Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-auto px-4 pb-4 bg-background">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
        <FileQuestion className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">
        页面未找到
      </h1>
      <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
        抱歉，您访问的页面不存在或已被移除。请检查 URL 是否正确，或返回首页。
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-sm text-foreground">返回首页</span>
        </Link>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Search className="h-5 w-5" />
          </div>
          <span className="text-sm text-foreground">返回上页</span>
        </button>
      </div>
    </div>
  )
}
