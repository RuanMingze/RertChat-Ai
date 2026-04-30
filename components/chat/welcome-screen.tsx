"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Sparkles, Zap, MessageSquare, Code } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void
}

const suggestions = [
  { icon: MessageSquare, text: "请简要介绍一下你自己" },
  { icon: Code, text: "帮我写一个 Python 快速排序算法" },
  { icon: Sparkles, text: "给我讲一个有趣的故事" },
  { icon: Zap, text: "解释一下什么是人工智能" },
]

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isNavigating, setIsNavigating] = useState(false)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (isInputFocused) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setIsNavigating(true)
          setActiveIndex((prev) => {
            const next = prev + 1
            if (next >= suggestions.length) return 0
            return next
          })
          break

        case "ArrowUp":
          e.preventDefault()
          setIsNavigating(true)
          setActiveIndex((prev) => {
            const next = prev - 1
            if (next < 0) return suggestions.length - 1
            return next
          })
          break

        case "Tab":
          e.preventDefault()
          setIsNavigating(true)
          setActiveIndex((prev) => {
            const next = e.shiftKey ? prev - 1 : prev + 1
            if (next >= suggestions.length) return 0
            if (next < 0) return suggestions.length - 1
            return next
          })
          break

        case "Enter":
        case " ":
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            e.preventDefault()
            onSuggestionClick(suggestions[activeIndex].text)
            setActiveIndex(-1)
            setIsNavigating(false)
          }
          break

        case "Escape":
          setActiveIndex(-1)
          setIsNavigating(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex, onSuggestionClick])

  useEffect(() => {
    if (activeIndex >= 0 && buttonRefs.current[activeIndex]) {
      buttonRefs.current[activeIndex]?.focus()
    }
  }, [activeIndex])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-20">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
        <Bot className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">
        你好，我是 AI 助手
      </h1>
      <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
        我可以帮你回答问题、写代码、创作内容，或者只是聊聊天
      </p>
      {isNavigating && (
        <p className="mb-4 text-sm text-muted-foreground">
          使用 <span className="font-medium text-foreground">Tab</span> 或{' '}
          <span className="font-medium text-foreground">方向键</span> 导航，{' '}
          <span className="font-medium text-foreground">Enter</span> 选择
        </p>
      )}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            ref={(el) => { buttonRefs.current[index] = el }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              "group flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all",
              activeIndex === index
                ? "border-primary/50 bg-card/80 shadow-sm ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
            )}
            tabIndex={activeIndex === -1 ? 0 : -1}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                activeIndex === index
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}
            >
              <suggestion.icon className="h-5 w-5" />
            </div>
            <span className="text-sm text-foreground">{suggestion.text}</span>
          </button>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        或者直接在下方的输入框中输入你的问题
      </p>
    </div>
  )
}
