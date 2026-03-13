"use client"

import { Bot, Sparkles, Zap, MessageSquare, Code } from "lucide-react"

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
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <suggestion.icon className="h-5 w-5" />
            </div>
            <span className="text-sm text-foreground">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
