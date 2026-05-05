"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw, Bot } from "lucide-react"

interface ChatHeaderProps {
  onClear: () => void
  hasMessages: boolean
}

export function ChatHeader({ onClear, hasMessages }: ChatHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">RertChat</h1>
          <p className="hidden md:block text-xs text-muted-foreground truncate">@cf/qwen/qwen3-30b-a3b-fp8</p>
        </div>
      </div>
      {hasMessages && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">清空对话</span>
        </Button>
      )}
    </header>
  )
}
