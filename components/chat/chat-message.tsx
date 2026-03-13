"use client"

import { cn } from "@/lib/utils"
import { Message } from "@/lib/chat-store"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="mb-4 mt-6 text-xl font-bold first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 mt-5 text-lg font-semibold first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="my-3 border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-4 border-border" />,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                    {children}
                  </a>
                ),
                code: ({ className, children }) => {
                  const match = /language-(\w+)/.exec(className || "")
                  const isCodeBlock = match || (typeof children === "string" && children.includes("\n"))
                  
                  if (isCodeBlock) {
                    const codeText = String(children).replace(/\n$/, "")
                    return (
                      <div className="group relative my-3 overflow-hidden rounded-lg border border-border bg-background">
                        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
                          <span className="text-xs text-muted-foreground">{match?.[1] || "code"}</span>
                          <pre className="overflow-x-auto p-4">
                            <code className="font-mono text-sm">{codeText}</code>
                          </pre>
                        </div>
                      </div>
                    )
                  }
                  
                  return (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                      {children}
                    </code>
                  )
                },
                table: ({ children }) => (
                  <div className="my-3 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                th: ({ children }) => <th className="border-b border-border px-4 py-2 text-left font-semibold">{children}</th>,
                td: ({ children }) => <td className="border-b border-border px-4 py-2">{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
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
