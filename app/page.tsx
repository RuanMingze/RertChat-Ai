"use client"

import { PageTitle } from "@/components/PageTitle"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react"
import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChatInput } from "@/components/chat/chat-input"
import { useI18n } from "@/lib/i18n"
import {
  getAllConversations,
  saveConversation,
  deleteConversation as deleteConversationFromDB,
  deleteConversations,
  getSettings,
  getUserProfile,
  renameConversation as renameConversationInDB,
  pinConversation,
  generateShortId,
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
  Download,
  Upload,
  Pin,
  SquarePen,
  CheckSquare,
  Trash,
} from "lucide-react"
import { ContextMenu, ContextMenuItem } from "@/components/ui/context-menu-custom"
import { RenameDialog } from "@/components/ui/rename-dialog"
import { notificationManager } from "@/lib/notification"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

class MarkdownErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-sm text-muted-foreground p-2">
          {this.props.fallback || "内容渲染失败"}
        </div>
      )
    }
    return this.props.children
  }
}

// Markdown 渲染组件
const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const { t } = useI18n()

  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }, [])

  const processContent = useCallback((text: string) => {
    // 匹配深度思考格式 (中文和英文)
    const deepThinkingRegex = /^(?:思考中：|Thinking：)\s*([\s\S]*?)(?:思考结束|End of thinking)\n\s*(?:回答内容：|Final answer：)\s*([\s\S]*)$/
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
            <span className="text-muted-foreground font-medium">{t('chat.thinkingComplete')}</span>
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
                <span>{t('common.success')}</span>
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
                              {t('chat.copied')}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              {t('chat.copy')}
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
                        {t('chat.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        {t('chat.copy')}
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
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
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
  deepThinkingMode: boolean,
  t: (key: string) => string
): Promise<Response> {
  // 计算最大可用轮数
  const maxRounds = Math.floor(historyMessages.length / 2)
  
  const contextLevels = [maxRounds, 2, 1, 0].filter((level, index, arr) => {
    if (index === 0) return true
    return level < arr[index - 1]
  })

  let lastError: Error | null = null

  for (const contextRounds of contextLevels) {
    try {
      const messages = buildMessagesWithContext(historyMessages, currentMessage, contextRounds)
      
      let systemMessages = []
      
      if (programmingMode) {
        systemMessages.push({
          role: "system",
          content: t('systemPrompts.programmingMode')
        })
      }
      
      if (deepThinkingMode) {
        systemMessages.push({
          role: "system",
          content: t('systemPrompts.deepThinkingMode')
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
  const { t } = useI18n()
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
    useTraditionalNavigation: true,
    showLoadingScreen: true,
    notificationsEnabled: true,
    soundEnabled: false,
    theme: 'dark',
    autoRedirectToRecent: true,
    showAIWarning: true
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

  // 批量选择状态
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 导出对话
  const handleExportConversation = useCallback(async (conversation: Conversation) => {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        conversations: [conversation]
      }
      
      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${conversation.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出对话失败:', error)
    }
  }, [])

  // 导出所有对话
  const handleExportAllConversations = useCallback(async () => {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        conversations: conversations
      }
      
      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `rertchat_export_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出所有对话失败:', error)
    }
  }, [conversations])

  // 导入对话
  const handleImportConversation = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (!importData.conversations || !Array.isArray(importData.conversations)) {
        console.error('无效的导入文件格式')
        return
      }

      // 为每个导入的对话生成6位数ID
      const importedConversations: Conversation[] = []
      for (const conv of importData.conversations) {
        const shortId = await generateShortId()
        importedConversations.push({
          ...conv,
          id: shortId,
          createdAt: conv.createdAt || Date.now(),
          updatedAt: Date.now()
        })
      }

      for (const conv of importedConversations) {
        await saveConversation(conv)
      }

      const allConversations = await getAllConversations()
      setConversations(allConversations)
      
      if (importedConversations.length > 0) {
        setCurrentConversationId(importedConversations[0].id)
        setMessages(importedConversations[0].messages)
      }
    } catch (error) {
      console.error('导入对话失败:', error)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  // 置顶/取消置顶对话
  const handleTogglePin = useCallback(async (id: string) => {
    const conversation = conversations.find(c => c.id === id)
    if (!conversation) return

    try {
      const newPinnedState = !conversation.isPinned
      await pinConversation(id, newPinnedState)
      setConversations(prev => {
        return prev.map(c => 
          c.id === id ? { ...c, isPinned: newPinnedState } : c
        )
      })
    } catch (error) {
      console.error('置顶对话失败:', error)
    }
  }, [conversations])

  // 切换选择模式
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev)
    if (isSelectionMode) {
      setSelectedConversations(new Set())
    }
  }, [isSelectionMode])

  // 切换选择单个对话
  const toggleSelectConversation = useCallback((id: string) => {
    setSelectedConversations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  // 全选对话
  const selectAllConversations = useCallback(() => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set())
    } else {
      setSelectedConversations(new Set(conversations.map(c => c.id)))
    }
  }, [conversations, selectedConversations.size])

  // 批量删除选中的对话
  const handleBatchDelete = useCallback(async () => {
    if (selectedConversations.size === 0) return

    try {
      const idsToDelete = Array.from(selectedConversations)
      await deleteConversations(idsToDelete)

      setConversations(prev => {
        const updated = prev.filter(c => !selectedConversations.has(c.id))
        return updated
      })

      if (currentConversationId && selectedConversations.has(currentConversationId)) {
        setCurrentConversationId(null)
        setMessages([])
      }

      setSelectedConversations(new Set())
      setIsSelectionMode(false)
    } catch (error) {
      console.error('批量删除对话失败:', error)
    }
  }, [selectedConversations, currentConversationId])

  // 从 URL 获取对话 ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    // 支持 chat 和 conversationId 两种参数
    const conversationId = urlParams.get('chat') || urlParams.get('conversationId')
    
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
          // 如果通过URL参数找不到对话，不自动选择
        } else if (loadedSettings.autoRedirectToRecent && convs.length > 0) {
          // 只有在 autoRedirectToRecent 为 true 时才自动选择最近的对话
          const sortedConvs = [...convs].sort((a, b) => b.updatedAt - a.updatedAt)
          targetConv = sortedConvs[0]
        }
        
        // 更新当前对话
        if (targetConv) {
          setCurrentConversationId(targetConv.id)
          setMessages(targetConv.messages)
          
          // 如果使用新的导航方式且没有URL参数，则更新URL
          if (!loadedSettings.useTraditionalNavigation && !conversationId && targetConv) {
            router.push(`/?chat=${targetConv.id}`)
          }
        }
        
        // 添加设置日志
        console.log('Settings loaded:', loadedSettings)
        console.log('Auto redirect to recent:', loadedSettings.autoRedirectToRecent)
        console.log('Use traditional navigation:', loadedSettings.useTraditionalNavigation)
        
        setDbReady(true)
      })
      .catch((err) => {
        console.error("Failed to load data:", err)
        setDbReady(true)
      })
  }, [router])

  // 使用useSearchParams监听URL参数变化（客户端导航时触发）
  const searchParams = useSearchParams()
  useEffect(() => {
    if (!dbReady) return
    
    const chatId = searchParams.get('chat')
    if (chatId && chatId !== currentConversationId) {
      const conv = conversations.find(c => c.id === chatId)
      if (conv) {
        setCurrentConversationId(conv.id)
        setMessages(conv.messages)
      }
    }
  }, [searchParams, dbReady, conversations, currentConversationId])

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
        // 使用6位数ID
        const shortId = await generateShortId()
        newConv = {
          id: shortId,
          title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
        }
        setConversations((prev) => [newConv!, ...prev])
        setCurrentConversationId(newConv.id)
        convId = newConv.id
        // 保存新对话到 IndexedDB
        saveConversation(newConv).catch(console.error)
        // 根据设置决定是否更新URL
        if (!settings.useTraditionalNavigation) {
          const url = new URL(window.location.href)
          url.searchParams.set('chat', shortId)
          window.history.pushState({ path: url.toString() }, '', url.toString())
        }
      }

      const userMessage: Message = { id: generateId(), role: "user", content }
      const assistantMessage: Message = { id: generateId(), role: "assistant", content: "" }

      const newMessages = [...messages, userMessage, assistantMessage]
      setMessages(newMessages)
      setInput("")
      setIsLoading(true)

      abortControllerRef.current = new AbortController()

      try {
        const response = await sendWithContextFallback(
          messages,
          userMessage,
          abortControllerRef.current.signal,
          settings.aiModel,
          settings.streamingEnabled,
          programmingMode,
          deepThinkingMode,
          t
        )

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        let fullContent = ""
        let buffer = ""

        let isReading = true
        while (isReading) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith("data:")) continue

            const data = trimmed.slice(5).trim()
            if (data === "[DONE]") {
              isReading = false
              continue
            }

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

        // 刷新解码器缓冲区，确保没有数据丢失
        buffer += decoder.decode()
        const remainingLines = buffer.split("\n")
        buffer = remainingLines.pop() || ""

        for (const line of remainingLines) {
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
          const conv = updated.find((c) => c.id === convId)
          if (conv) saveConversation(conv).catch(console.error)
          return updated
        })

        if (settings.notificationsEnabled && fullContent) {
          const currentConv = conversations.find((c) => c.id === convId)
          const notificationTitle = t('chat.notificationComplete')
          const notificationBody = t('chat.notificationBody', { title: currentConv?.title || t('chat.newChat') })
          notificationManager.notifyConversationComplete(notificationTitle, notificationBody).catch(console.error)
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        setMessages((prev) => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant" && !updated[lastIdx].content) {
            updated[lastIdx] = { ...updated[lastIdx], content: t('chat.requestError') }
          }
          return updated
        })
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [currentConversationId, messages, isLoading, settings.aiModel, settings.streamingEnabled, settings.notificationsEnabled, programmingMode, deepThinkingMode, conversations, t]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (isLoading) stop()
      else sendMessage(input)
    }
  }

  const handleNewConversation = async () => {
    // 使用6位数ID
    const shortId = await generateShortId()
    const newConv: Conversation = {
      id: shortId,
      title: t('chat.newChat'),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false
    }
    // 保存新对话到 IndexedDB
    await saveConversation(newConv)
    // 更新本地状态，确保URL变化后能找到新对话
    setConversations((prev) => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
    setMessages([])
    setSidebarOpen(false)
    // 根据设置决定是否更新URL
    if (!settings.useTraditionalNavigation) {
      router.push(`/?chat=${shortId}`)
    }
  }

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      // 根据设置决定是否更新URL
      if (settings.useTraditionalNavigation) {
        // 传统方式：直接切换状态，不更新URL
        setCurrentConversationId(conv.id)
        setMessages(conv.messages)
        setSidebarOpen(false)
      } else {
        // 新方式：更新URL，触发路由监听
        router.push(`/?chat=${id}`)
        setSidebarOpen(false)
      }
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
    { icon: Brain, text: t('suggestions.deepThinking.0') },
    { icon: Brain, text: t('suggestions.deepThinking.1') },
    { icon: Brain, text: t('suggestions.deepThinking.2') },
    { icon: Brain, text: t('suggestions.deepThinking.3') },
  ] : programmingMode ? [
    { icon: Code, text: t('suggestions.programmingMode.0') },
    { icon: Code, text: t('suggestions.programmingMode.1') },
    { icon: Code, text: t('suggestions.programmingMode.2') },
    { icon: Code, text: t('suggestions.programmingMode.3') },
  ] : [
    { icon: MessageSquare, text: t('suggestions.default.0') },
    { icon: Code, text: t('suggestions.default.1') },
    { icon: Sparkles, text: t('suggestions.default.2') },
    { icon: Zap, text: t('suggestions.default.3') },
  ]

  return (
    <>
      <PageTitle titleKey="meta.home" />
      <div className="flex h-dvh bg-background">
      {/* Sidebar Toggle */}
      {!sidebarOpen && (
        <div className="fixed left-4 top-4 z-50 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-10 w-10 rounded-xl bg-card shadow-sm hover:bg-secondary"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">{t('chat.conversationHistory')}</h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <Button
            onClick={handleNewConversation}
            className="w-full justify-start gap-2 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t('chat.newConversation')}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-4">
            {conversations.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-sidebar-foreground/50">{t('chat.noConversations')}</p>
            ) : (
              conversations
                .sort((a, b) => {
                  if (a.isPinned && !b.isPinned) return -1
                  if (!a.isPinned && b.isPinned) return 1
                  return b.updatedAt - a.updatedAt
                })
                .map((conv) => (
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
                    {isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelectConversation(conv.id)
                        }}
                        className="ml-2 shrink-0"
                      >
                        <div className={cn(
                          "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                          selectedConversations.has(conv.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/50"
                        )}>
                          {selectedConversations.has(conv.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </button>
                    )}
                    <button
                      onClick={() => isSelectionMode ? toggleSelectConversation(conv.id) : handleSelectConversation(conv.id)}
                      className="flex flex-1 items-center gap-3 px-3 py-3 text-left"
                    >
                      {conv.isPinned && (
                        <Pin className="h-3 w-3 shrink-0 text-primary" />
                      )}
                      <MessageSquare className={cn("h-4 w-4 shrink-0", conv.isPinned ? "text-primary" : "text-sidebar-foreground/70")} />
                      <span className="truncate text-sm text-sidebar-foreground">{conv.title}</span>
                    </button>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {isSelectionMode ? (
            <>
              <Button
                onClick={handleBatchDelete}
                disabled={selectedConversations.size === 0}
                variant="destructive"
                className="w-full justify-start gap-2 rounded-xl"
              >
                <Trash className="h-4 w-4" />
                {t('chat.deleteSelected')} ({selectedConversations.size})
              </Button>
              <Button
                onClick={toggleSelectionMode}
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {t('chat.cancelSelection')}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => window.location.href = "/settings"}
              className="w-full justify-start gap-2 rounded-xl hover:bg-sidebar-accent/50"
            >
              <SettingsIcon className="h-4 w-4" />
              {t('settings.title')}
            </Button>
          )}
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
            {t('chat.rename')}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              if (contextMenu.conversationId) {
                handleTogglePin(contextMenu.conversationId)
              }
              setContextMenu({ x: 0, y: 0, conversationId: null })
            }}
          >
            <Pin className="mr-2 h-4 w-4" />
            {conversations.find(c => c.id === contextMenu.conversationId)?.isPinned ? t('chat.unpin') : t('chat.pin')}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              const conversation = conversations.find(c => c.id === contextMenu.conversationId)
              if (conversation) {
                handleExportConversation(conversation)
              }
              setContextMenu({ x: 0, y: 0, conversationId: null })
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('chat.export')}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('chat.delete')}
          </ContextMenuItem>
        </ContextMenu>
      )}

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialog.isOpen}
        currentName={renameDialog.currentName}
        onConfirm={handleRenameConfirm}
        onCancel={handleRenameCancel}
        labels={{
          title: t('chat.rename'),
          placeholder: t('chat.enterNewName'),
          confirm: t('common.confirm'),
          cancel: t('common.cancel')
        }}
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
              {t('chat.conversationHistory')}
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="gap-2 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-4 w-4" />
                {t('chat.clearChat')}
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
                    onClick={() => window.open("https://ruanm.pages.dev/user", "_blank")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t('settings.userCenter')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/keys")}
                    className="cursor-pointer"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    {t('settings.manageApiKeys')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      const { clearAllData, unregisterServiceWorker, clearAllCaches } = await import('@/lib/chat-db')
                      await clearAllData()
                      await unregisterServiceWorker()
                      await clearAllCaches()
                      window.location.href = '/'
                    }}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('settings.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const authUrl = "https://ruanm.pages.dev/oauth/authorize?client_id=1sa77wzm5h4gcat8f3hq22jlii54gsyb&redirect_uri=https://rertx.dpdns.org/callback&response_type=code&scope=read write"
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
            <h1 className="mb-3 text-balance text-center text-3xl font-semibold text-foreground">{t('home.welcomeTitle')}</h1>
            <p className="mb-10 max-w-md text-balance text-center text-muted-foreground">
              {t('home.welcomeSubtitle')}
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
                  <div className={cn("group flex max-w-[625.60px] flex-col gap-1", message.role === "user" ? "items-end" : "items-start")}>
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
                            <MarkdownErrorBoundary fallback="内容渲染失败">
                              <MarkdownContent content={message.content} />
                            </MarkdownErrorBoundary>
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
    </>
  )
}
