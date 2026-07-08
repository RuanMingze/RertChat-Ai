'use client'

import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DeepThinkingRendererProps {
  content: string
}

interface ParsedContent {
  thinkingContent: string
  answerContent: string
  hasThinking: boolean
  hasAnswer: boolean
}

function parseDeepThinkingContent(content: string): ParsedContent {
  const thinkingStartMarker = content.includes('思考中：') ? '思考中：' : (content.includes('Thinking：') ? 'Thinking：' : null)
  const thinkingEndMarker = content.includes('思考结束') ? '思考结束' : (content.includes('End of thinking') ? 'End of thinking' : null)
  const answerStartMarker = content.includes('最终回答：') ? '最终回答：' : (content.includes('Final answer：') ? 'Final answer：' : null)

  if (!thinkingStartMarker) {
    return {
      thinkingContent: '',
      answerContent: content,
      hasThinking: false,
      hasAnswer: true
    }
  }

  let thinkingContent = ''
  let answerContent = ''
  
  let remaining = content
  
  const startIdx = remaining.indexOf(thinkingStartMarker)
  if (startIdx >= 0) {
    if (startIdx > 0) {
      answerContent += remaining.substring(0, startIdx)
    }
    remaining = remaining.substring(startIdx + thinkingStartMarker.length)
  }

  const endIdx = thinkingEndMarker ? remaining.indexOf(thinkingEndMarker) : -1
  const answerIdx = answerStartMarker ? remaining.indexOf(answerStartMarker) : -1
  
  if (endIdx >= 0) {
    thinkingContent = remaining.substring(0, endIdx).trim()
    remaining = remaining.substring(endIdx + thinkingEndMarker!.length)
  } else if (answerIdx >= 0) {
    thinkingContent = remaining.substring(0, answerIdx).trim()
    remaining = remaining.substring(answerIdx)
  } else {
    thinkingContent = remaining.trim()
    remaining = ''
  }

  if (remaining) {
    const trimmed = remaining.trim()
    if (answerStartMarker && trimmed.startsWith(answerStartMarker)) {
      answerContent += trimmed.substring(answerStartMarker.length).trim()
    } else {
      answerContent += trimmed
    }
  }

  return {
    thinkingContent: thinkingContent.trim(),
    answerContent: answerContent.trim(),
    hasThinking: thinkingContent.trim().length > 0,
    hasAnswer: answerContent.trim().length > 0
  }
}

export function DeepThinkingRenderer({ content }: DeepThinkingRendererProps) {
  const [expanded, setExpanded] = useState(true)
  
  const parsed = useMemo(() => parseDeepThinkingContent(content), [content])

  return (
    <div className="space-y-3">
      {parsed.hasThinking && (
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-medium">思考过程</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </div>
          </button>
          {expanded && (
            <div className="px-4 py-3 bg-muted/20">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {parsed.thinkingContent}
              </div>
            </div>
          )}
        </div>
      )}
      
      {parsed.hasAnswer && (
        <div className="prose prose-sm prose-invert max-w-none break-words">
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
                  return (
                    <pre className="mb-3 overflow-x-auto rounded-lg bg-background border border-border p-3 text-xs">
                      <code className={className}>{children}</code>
                    </pre>
                  )
                }
                return <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{children}</code>
              },
              table: ({ children }) => (
                <div className="my-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-border bg-muted/50 px-3 py-1.5 text-left font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-3 py-1.5">
                  {children}
                </td>
              ),
            }}
          >
            {parsed.answerContent}
          </ReactMarkdown>
        </div>
      )}
      
      {!parsed.hasThinking && !parsed.hasAnswer && (
        <div className="prose prose-sm prose-invert max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
