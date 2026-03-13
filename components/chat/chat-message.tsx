"use client"

import { cn } from "@/lib/utils"
import { Message } from "@/lib/chat-store"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-4 py-6", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-full",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && !message.content && (
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-current delay-150" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-current delay-300" />
              </span>
            )}
            {isStreaming && message.content && (
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
