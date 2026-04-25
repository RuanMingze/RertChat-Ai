"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChatInput } from "@/components/chat/chat-input"
import {
  getAllConversations,
  saveConversation,
  deleteConversation as deleteConversationFromDB,
  getSettings,
  getUserProfile,
  renameConversation as renameConversationInDB,
  type Conversation,
  type Message,
  type Settings,
  type UserProfile,
} from "@/lib/chat-db"
import {
  Bot,
  User,
  ArrowUp,
  Square,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  Sparkles,
  Zap,
  Code,
  Copy,
  Check,
  Brain,
  Settings as SettingsIcon,
  Pencil,
  Key,
  LogOut,
} from "lucide-react"
import { ContextMenu, ContextMenuItem } from "@/components/ui/context-menu-custom"
import { RenameDialog } from "@/components/ui/rename-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Markdown 渲染组件
const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }, [])

  // 处理深度思考格式
  const processContent = useCallback((text: string) => {
    // 匹配新的深度思考格式
    const deepThinkingRegex = /^思考中：\s*([\s\S]*?)思考结束\n\s*回答内容：\s*([\s\S]*)$/
    const match = deepThinkingRegex.exec(text)
    
    if (match) {
      const [, thinkingContent, answerContent] = match
      return {
        hasDeepThinking: true,
        thinkingContent,
        answerContent
      }
    }
    
    return {
      hasDeepThinking: false,
      content: text
    }
  }, [])

  const processed = processContent(content)

  if (processed.hasDeepThinking) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex justify-between items-center p-2 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="text-muted-foreground font-medium">已完成思考</span>
            <span className={`transition-transform ${expanded ? 'rotate-180' : ''} text-muted-foreground`}>
              ▼
            </span>
          </button>
          {expanded && (
            <div className="mt-2 pl-4 border-l-2 border-border text-muted-foreground text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 text-sm">{children}</ul>,
                  li: ({ children }) => <li className="leading-relaxed text-sm">{children}</li>,
                }}
              >
                {processed.thinkingContent}
              </ReactMarkdown>
              <div className="mt-2 text-xs">
                <span>已完成</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(codeText)}
                          className="h-7 gap-1.5 px-2 text-xs"
                        >
                          {copiedCode === codeText ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              复制
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="overflow-x-auto p-4">
                        <code className="font-mono text-sm">{codeText}</code>
                      </pre>
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
            {processed.answerContent}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  return (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(codeText)}
                    className="h-7 gap-1.5 px-2 text-xs"
                  >
                    {copiedCode === codeText ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
                <pre className="overflow-x-auto p-4">
                  <code className="font-mono text-sm">{codeText}</code>
                </pre>
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
      {processed.content}
    </ReactMarkdown>
  )
})

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

// 构建带有上下文的消息
function buildMessagesWithContext(
  historyMessages: Message[],
  currentMessage: Message,
  contextRounds: number
): { role: string; content: string }[] {
  if (contextRounds <= 0 || historyMessages.length === 0) {
    return [{ role: currentMessage.role, content: currentMessage.content }]
  }

  // 每轮对话包含一个用户消息和一个助手回复
  const roundsToInclude = Math.min(contextRounds, Math.floor(historyMessages.length / 2))
  const startIndex = historyMessages.length - roundsToInclude * 2

  const contextMessages = historyMessages.slice(Math.max(0, startIndex)).map((m) => ({
    role: m.role,
    content: m.content,
  }))

  return [...contextMessages, { role: currentMessage.role, content: currentMessage.content }]
}

// 发送请求的核心函数
async function sendRequestWithRetry(
  messages: { role: string; content: string }[],
  signal: AbortSignal,
  model: string,
  streaming: boolean
): Promise<Response> {
  // 使用内部 secret token 验证
  const internalSecret = process.env.NEXT_PUBLIC_INTERNAL_CHAT_SECRET || 'internal-chat-secret-key'
  
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${internalSecret}`
    },
    body: JSON.stringify({
      messages,
      model: model,
      stream: streaming,
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response
}

// 带降级的上下文请求
async function sendWithContextFallback(
  historyMessages: Message[],
  currentMessage: Message,
  signal: AbortSignal,
  model: string,
  streaming: boolean,
  programmingMode: boolean,
  deepThinkingMode: boolean
): Promise<Response> {
  // 计算最大可用轮数
  const maxRounds = Math.floor(historyMessages.length / 2)
  
  // 降级策略：全部 -> 2轮 -> 1轮 -> 0轮
  const contextLevels = [maxRounds, 2, 1, 0].filter((level, index, arr) => {
    // 去重并保持递减顺序
    if (index === 0) return true
    return level < arr[index - 1]
  })

  let lastError: Error | null = null

  for (const contextRounds of contextLevels) {
    try {
      const messages = buildMessagesWithContext(historyMessages, currentMessage, contextRounds)
      
      // 构建系统提示词
      let systemMessages = []
      
      // 添加编程模式系统提示
      if (programmingMode) {
        systemMessages.push({
          role: "system",
          content: "你现在是一位经验丰富、专业严谨、实战能力极强的资深编程工程师。你的职责是：1. 精准理解用户的编程需求，直接给出可运行、高质量、规范的代码。2. 代码结构清晰、注释合理、逻辑严谨，符合行业最佳实践。3. 优先提供完整解决方案，而不是只给思路或片段。4. 遇到问题时主动分析、排查、给出优化建议。5. 语言简洁专业，不废话，直接输出有效代码与解释。请以资深程序员的身份，帮我完成接下来所有编程任务。"
        })
      }
      
      // 添加深度思考模式系统提示
      if (deepThinkingMode) {
        systemMessages.push({
          role: "system",
          content: "你现在要深度思考我提出的问题，遵循以下原则：\n\n【核心思考要求】\n1. **场景化理解**：分析用户问题中的关键名词（如'洗车店'、'加油站'、'停车场'等），理解其隐含的行为场景\n   - 例如：'洗车店' = 开车去洗车，不是人去那里看一眼就回来\n   - 例如：'加油站' = 开车去加油，不是步行去参观\n2. **目的性原则**：用户去一个地方就是为了在那里做该做的事，这是默认前提\n   - 去洗车店 = 要洗车（车是服务对象，必须开车去）\n   - 去加油站 = 要加油（车是服务对象，必须开车去）\n   - 去餐厅 = 要吃饭（人是服务对象，可以步行或开车）\n   - 去超市 = 要购物（人是服务对象，可以步行或开车）\n3. **常识判断**：分析关键信息是否符合常理和现实逻辑\n4. **准确理解用户意图**：不要断章取义，要理解完整场景和默认前提\n5. **识别隐含前提**：很多问题有默认场景，不需要用户明说\n\n【思考步骤】\n1. 提取问题中的关键名词和动词\n2. 分析这个地方的功能：用户去那里是为了做什么？（默认就是要做该做的事）\n3. 分析服务对象是谁：是人还是车？（决定用什么交通工具）\n4. 基于场景常识给出合理建议\n\n【输出格式】\n思考中：\n1. 关键词分析：[提取关键名词，分析这个地方的功能和默认行为]\n2. 服务对象判断：[用户去那里是为了什么？服务对象是人还是车？]\n3. 场景理解：[用户的真实意图和完整场景是什么]\n4. 常识判断：[基于目的性原则，分析是否符合现实逻辑]\n思考结束\n最终回答：[基于思考给出最符合场景常识的建议]"
        })
      }
      
      const finalMessages = systemMessages.length > 0 ? [...systemMessages, ...messages] : messages
      
      const response = await sendRequestWithRetry(finalMessages, signal, model, streaming)
      return response
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err
      }
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(`Context level ${contextRounds} failed, trying next level...`)
    }
  }

  throw lastError || new Error("All context levels failed")
}

export default function Home() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dbReady, setDbReady] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    id: 'default',
    streamingEnabled: true,
    aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
    theme: 'dark',
    autoRedirectToRecent: true
  })
  const [programmingMode, setProgrammingMode] = useState(false)
  const [deepThinkingMode, setDeepThinkingMode] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  
  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    conversationId: string | null
  }>({ x: 0, y: 0, conversationId: null })
  
  // 重命名对话框状态
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean
    conversationId: string | null
    currentName: string
  }>({ isOpen: false, conversationId: null, currentName: "" })
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 从 URL 获取对话 ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get('conversationId')
    
    // 并行加载设置和对话数据
    Promise.all([
      getSettings(),
      getAllConversations(),
      getUserProfile()
    ])
      .then(([loadedSettings, convs, profile]) => {
        // 更新设置
        setSettings(loadedSettings)
        
        // 更新用户资料
        setUserProfile(profile)
        
        // 更新对话列表
        setConversations(convs)
        
        // 选择对话
        let targetConv: Conversation | undefined
        if (conversationId) {
          targetConv = convs.find(c => c.id === conversationId)
        } else if (loadedSettings.autoRedirectToRecent && convs.length > 0) {
          // 只有在 autoRedirectToRecent 为 true 时才自动选择最近的对话
          const sortedConvs = [...convs].sort((a, b) => b.updatedAt - a.updatedAt)
          targetConv = sortedConvs[0]
        }
        
        // 更新当前对话
        if (targetConv) {
          setCurrentConversationId(targetConv.id)
          setMessages(targetConv.messages)
        }
        
        // 添加设置日志
        console.log('Settings loaded:', loadedSettings)
        console.log('Auto redirect to recent:', loadedSettings.autoRedirectToRecent)
        
        setDbReady(true)
      })
      .catch((err) => {
        console.error("Failed to load data:", err)
        setDbReady(true)
      })
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      let convId = currentConversationId
      let newConv: Conversation | null = null
      if (!convId) {
        newConv = {
          id: generateId(),
          title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        setConversations((prev) => [newConv!, ...prev])
        setCurrentConversationId(newConv.id)
        convId = newConv.id
        // 保存新对话到 IndexedDB
        saveConversation(newConv).catch(console.error)
      }

      const userMessage: Message = { id: generateId(), role: "user", content }
      const assistantMessage: Message = { id: generateId(), role: "assistant", content: "" }

      const newMessages = [...messages, userMessage, assistantMessage]
      setMessages(newMessages)
      setInput("")
      setIsLoading(true)

      abortControllerRef.current = new AbortController()

      try {
        // 使用带降级的上下文请求
        const response = await sendWithContextFallback(
          messages,
          userMessage,
          abortControllerRef.current.signal,
          settings.aiModel,
          settings.streamingEnabled,
          programmingMode,
          deepThinkingMode
        )

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        let fullContent = ""
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith("data:")) continue

            const data = trimmed.slice(5).trim()
            if (data === "[DONE]") continue

            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content
              if (delta) {
                fullContent += delta
                setMessages((prev) => {
                  const updated = [...prev]
                  const lastIdx = updated.length - 1
                  if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                    updated[lastIdx] = { ...updated[lastIdx], content: fullContent }
                  }
                  return updated
                })
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }

        // 处理剩余的 buffer
        if (buffer.trim()) {
          const trimmed = buffer.trim()
          if (trimmed.startsWith("data:")) {
            const data = trimmed.slice(5).trim()
            if (data !== "[DONE]") {
              try {
                const json = JSON.parse(data)
                const delta = json.choices?.[0]?.delta?.content
                if (delta) {
                  fullContent += delta
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastIdx = updated.length - 1
                    if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                      updated[lastIdx] = { ...updated[lastIdx], content: fullContent }
                    }
                    return updated
                  })
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // 更新对话并保存到 IndexedDB
        const updatedMessages = [...messages, userMessage, { ...assistantMessage, content: fullContent }]
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === convId
              ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
              : c
          )
          // 保存到 IndexedDB
          const conv = updated.find((c) => c.id === convId)
          if (conv) saveConversation(conv).catch(console.error)
          return updated
        })
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        setMessages((prev) => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant" && !updated[lastIdx].content) {
            updated[lastIdx] = { ...updated[lastIdx], content: "抱歉，发生了错误，请稍后重试。" }
          }
          return updated
        })
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [currentConversationId, messages, isLoading, settings.aiModel, settings.streamingEnabled, programmingMode, deepThinkingMode]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (isLoading) stop()
      else sendMessage(input)
    }
  }

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: "新对话",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations((prev) => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
    setMessages([])
    setSidebarOpen(false)
    saveConversation(newConv).catch(console.error)
  }

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setCurrentConversationId(id)
      setMessages(conv.messages)
      setSidebarOpen(false)
    }
  }

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setMessages([])
    }
    deleteConversationFromDB(id).catch(console.error)
  }

  const handleRenameConversation = (id: string, newName: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: newName, updatedAt: Date.now() } : c
      )
    )
    renameConversationInDB(id, newName).catch(console.error)
  }

  const handleContextMenu = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      conversationId: conversation.id,
    })
  }

  const handleRenameClick = () => {
    const conversation = conversations.find((c) => c.id === contextMenu.conversationId)
    if (conversation) {
      setRenameDialog({
        isOpen: true,
        conversationId: conversation.id,
        currentName: conversation.title,
      })
      setContextMenu({ x: 0, y: 0, conversationId: null })
    }
  }

  const handleDeleteClick = () => {
    if (contextMenu.conversationId) {
      handleDeleteConversation(contextMenu.conversationId)
      setContextMenu({ x: 0, y: 0, conversationId: null })
    }
  }

  const handleRenameConfirm = (newName: string) => {
    if (renameDialog.conversationId) {
      handleRenameConversation(renameDialog.conversationId, newName)
    }
    setRenameDialog({ isOpen: false, conversationId: null, currentName: "" })
  }

  const handleRenameCancel = () => {
    setRenameDialog({ isOpen: false, conversationId: null, currentName: "" })
  }

  const handleClear = () => {
    setMessages([])
    if (currentConversationId) {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === currentConversationId ? { ...c, messages: [], updatedAt: Date.now() } : c
        )
        const conv = updated.find((c) => c.id === currentConversationId)
        if (conv) saveConversation(conv).catch(console.error)
        return updated
      })
    }
  }

  const suggestions = deepThinkingMode ? [
    { icon: Brain, text: "为什么 0 不能作为除数" },
    { icon: Brain, text: "如何理解量子计算的基本原理" },
    { icon: Brain, text: "解释一下相对论的时间 dilation 效应" },
    { icon: Brain, text: "什么是人工智能中的神经网络" },
  ] : programmingMode ? [
    { icon: Code, text: "帮我写一个 Python 快速排序算法" },
    { icon: Code, text: "用 React 实现一个待办事项列表" },
    { icon: Code, text: "解释一下 JavaScript 的闭包概念" },
    { icon: Code, text: "如何优化 React 应用的性能" },
  ] : [
    { icon: MessageSquare, text: "请简要介绍一下你自己" },
    { icon: Code, text: "帮我写一个 Python 快速排序算法" },
    { icon: Sparkles, text: "给我讲一个有趣的故事" },
    { icon: Zap, text: "解释一下什么是人工智能" },
  ]

  return (
    <div className="flex h-dvh bg-background">
      {/* Sidebar Toggle */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-50 h-10 w-10 rounded-xl bg-card shadow-sm hover:bg-secondary"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">对话历史</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-3">
          <Button
            onClick={handleNewConversation}
            className="w-full justify-start gap-2 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建对话
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-4">
            {conversations.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-sidebar-foreground/50">暂无对话历史</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-colors",
                    currentConversationId === conv.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                  onContextMenu={(e) => handleContextMenu(e, conv)}
                >
                  <button
                    onClick={() => handleSelectConversation(conv.id)}
                    className="flex flex-1 items-center gap-3 px-3 py-3 text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-sidebar-foreground/70" />
                    <span className="truncate text-sm text-sidebar-foreground">{conv.title}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-sidebar-border">
          <Button
            onClick={() => window.location.href = "/settings"}
            className="w-full justify-start gap-2 rounded-xl hover:bg-sidebar-accent/50"
          >
            <SettingsIcon className="h-4 w-4" />
            设置
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Context Menu */}
      {contextMenu.conversationId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu({ x: 0, y: 0, conversationId: null })}
        >
          <ContextMenuItem onClick={handleRenameClick}>
            <Pencil className="mr-2 h-4 w-4" />
            重命名
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </ContextMenuItem>
        </ContextMenu>
      )}

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialog.isOpen}
        currentName={renameDialog.currentName}
        onConfirm={handleRenameConfirm}
        onCancel={handleRenameCancel}
      />

      {/* Main Content */}
      <main className={cn("relative flex flex-1 flex-col overflow-hidden transition-all duration-300", sidebarOpen ? "md:ml-72" : "ml-0")}>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm">
          <div className={cn("flex items-center gap-3 transition-all", !sidebarOpen && "ml-12")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">RertChat-AI</h1>
              <p className="text-xs text-muted-foreground">{settings.aiModel.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = "/conversations"}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              全部对话
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="gap-2 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-4 w-4" />
                清空对话
              </Button>
            )}
            {userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-0"
                  >
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.name}
                      className="h-7 w-7 rounded-full"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userProfile.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => window.open("https://ruanmgjx.dpdns.org/user", "_blank")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    用户中心
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/keys")}
                    className="cursor-pointer"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    API Keys 管理
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.removeItem("user_profile")
                      window.location.reload()
                    }}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const authUrl = "https://ruanmgjx.dpdns.org/oauth/authorize?client_id=1sa77wzm5h4gcat8f3hq22jlii54gsyb&redirect_uri=https://rertx.dpdns.org/callback&response_type=code&scope=read write"
                  window.location.href = authUrl
                }}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Messages or Welcome */}
        {messages.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 pb-4">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">你好，我是 AI 助手</h1>
            <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
              我可以帮你回答问题、写代码、创作内容，或者只是聊聊天
            </p>
            <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-foreground">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="min-h-0 flex-1" ref={scrollRef}>
            <div className="mx-auto max-w-3xl px-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn("flex gap-4 py-6", message.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={cn("group flex max-w-[85%] flex-col gap-1", message.role === "user" ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground border border-border"
                      )}
                    >
                      {message.role === "user" ? (
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none break-words">
                          {message.content ? (
                            <MarkdownContent content={message.content} />
                          ) : isLoading && index === messages.length - 1 ? (
                            <span className="inline-flex gap-1">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                              <span className="h-2 w-2 animate-pulse rounded-full bg-primary delay-150" />
                              <span className="h-2 w-2 animate-pulse rounded-full bg-primary delay-300" />
                            </span>
                          ) : null}
                          {isLoading && index === messages.length - 1 && message.content && (
                            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-primary" />
                          )}
                        </div>
                      )}
                    </div>
                    {message.role === "assistant" && message.content && !isLoading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(message.content)}
                        className="h-7 gap-1.5 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                        复制
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Input - Fixed at bottom */}
        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <ChatInput
              onSend={(content) => sendMessage(content)}
              onStop={stop}
              isLoading={isLoading}
              programmingMode={programmingMode}
              onToggleProgrammingMode={() => setProgrammingMode(!programmingMode)}
              deepThinkingMode={deepThinkingMode}
              onToggleDeepThinkingMode={() => setDeepThinkingMode(!deepThinkingMode)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
