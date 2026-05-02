"use client"

import { useState, useEffect, useCallback, useMemo, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  getAllConversations,
  saveConversation,
  deleteConversation as deleteConversationFromDB,
  deleteConversations,
  type Conversation,
} from "@/lib/chat-db"
import {
  Search,
  MessageSquare,
  Trash2,
  ChevronLeft,
  Clock,
  Filter,
  X,
  Download,
  FileText,
  Upload,
  CheckSquare,
  Square,
  Trash,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/components/confirm-dialog"
import { useI18n } from "@/lib/i18n"

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [useRegex, setUseRegex] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const router = useRouter()
  const confirm = useConfirm()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useI18n()

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

  // 导入对话
  const handleImportConversation = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (!importData.conversations || !Array.isArray(importData.conversations)) {
        console.error(t('conversations.invalidImportFormat'))
        return
      }

      const importedConversations = importData.conversations.map((conv: Conversation) => ({
        ...conv,
        id: crypto.randomUUID(),
        createdAt: conv.createdAt || Date.now(),
        updatedAt: Date.now()
      }))

      for (const conv of importedConversations) {
        await saveConversation(conv)
      }

      const allConversations = await getAllConversations()
      const sortedConvs = [...allConversations].sort((a, b) => b.updatedAt - a.updatedAt)
      setConversations(sortedConvs)
    } catch (error) {
      console.error(t('conversations.importFailed'), error)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  // 加载对话历史
  useEffect(() => {
    getAllConversations()
      .then((convs) => {
        // 按 updatedAt 降序排序
        const sortedConvs = [...convs].sort((a, b) => b.updatedAt - a.updatedAt)
        setConversations(sortedConvs)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err)
        setIsLoading(false)
      })
  }, [])

  // 搜索功能 - 使用 useMemo 优化性能
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations
    }

    const query = searchQuery.trim()
    return conversations.filter((conv) => {
      // 搜索标题
      if (conv.title.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      // 搜索消息内容
      const hasMatchingMessage = conv.messages.some((msg) => {
        if (useRegex) {
          try {
            const regex = new RegExp(query, "i")
            return regex.test(msg.content)
          } catch {
            // 如果正则表达式无效，回退到普通搜索
            return msg.content.toLowerCase().includes(query.toLowerCase())
          }
        } else {
          return msg.content.toLowerCase().includes(query.toLowerCase())
        }
      })

      return hasMatchingMessage
    })
  }, [searchQuery, useRegex, conversations])

  // 处理对话点击
  const handleSelectConversation = (id: string) => {
    // 导航回首页并传递对话 ID
    router.push(`/?conversationId=${id}`)
  }

  // 处理删除对话
  const handleDeleteConversation = async (id: string) => {
    const confirmed = await confirm(t('conversations.deleteConversation'), t('conversations.deleteConfirm'))
    if (confirmed) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      deleteConversationFromDB(id).catch(console.error)
    }
  }

  // 全选对话
  const selectAllConversations = useCallback(() => {
    if (selectedConversations.size === filteredConversations.length) {
      setSelectedConversations(new Set())
    } else {
      setSelectedConversations(new Set(filteredConversations.map(c => c.id)))
    }
  }, [filteredConversations, selectedConversations])

  // 批量删除选中的对话
  const handleBatchDelete = useCallback(async () => {
    if (selectedConversations.size === 0) return

    const confirmed = await confirm(
      t('conversations.batchDeleteTitle'),
      t('conversations.batchDeleteConfirm', { count: selectedConversations.size })
    )
    if (confirmed) {
      try {
        const idsToDelete = Array.from(selectedConversations)
        await deleteConversations(idsToDelete)

        setConversations(prev => {
          const updated = prev.filter(c => !selectedConversations.has(c.id))
          return updated
        })

        setSelectedConversations(new Set())
        setIsSelectionMode(false)
      } catch (error) {
        console.error(t('conversations.batchDeleteFailed'), error)
      }
    }
  }, [selectedConversations, confirm, t])

  // 导出对话为文本文件
  const exportConversation = (conv: Conversation) => {
    let content = `${t('conversations.exportTitle', { title: conv.title })}\n`
    content += `${t('conversations.exportCreated', { time: formatDate(conv.createdAt) })}\n`
    content += `${t('conversations.exportUpdated', { time: formatDate(conv.updatedAt) })}\n\n`
    content += `=== ${t('conversations.exportContent')} ===\n\n`

    conv.messages.forEach((msg, index) => {
      const role = msg.role === "user" ? t('chat.newChat') : "AI"
      content += `${role}: ${msg.content}\n\n`
    })

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${conv.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 导出所有对话
  const exportAllConversations = () => {
    let content = `=== ${t('conversations.exportAllTitle')} ===\n`
    content += `${t('conversations.exportTime')}: ${formatDate(Date.now())}\n`
    content += `${t('conversations.exportCount')}: ${conversations.length}\n\n`

    conversations.forEach((conv, convIndex) => {
      content += `=== ${t('conversations.title')} ${convIndex + 1}: ${conv.title} ===\n`
      content += `${t('conversations.exportCreated', { time: formatDate(conv.createdAt) })}\n`
      content += `${t('conversations.exportUpdated', { time: formatDate(conv.updatedAt) })}\n\n`

      conv.messages.forEach((msg, msgIndex) => {
        const role = msg.role === "user" ? t('chat.newChat') : "AI"
        content += `${role}: ${msg.content}\n\n`
      })

      content += `\n${"=".repeat(50)}\n\n`
    })

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${t('conversations.title')}_${formatDate(Date.now()).replace(/[^a-zA-Z0-9]/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 格式化时间
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {isSelectionMode ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSelectionMode}
              className="h-9 w-9 rounded-xl hover:bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-9 w-9 rounded-xl hover:bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {isSelectionMode ? (
            <span className="text-sm text-foreground">{t('conversations.selectedCount', { count: selectedConversations.size })}</span>
          ) : (
            <h1 className="text-lg font-semibold text-foreground">{t('conversations.title')}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllConversations}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                {selectedConversations.size === filteredConversations.length ? t('conversations.deselectAll') : t('conversations.selectAll')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                disabled={selectedConversations.size === 0}
                className="gap-2"
              >
                <Trash className="h-4 w-4" />
                {t('conversations.batchDelete')}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSelectionMode}
                className="h-9 w-9 rounded-xl hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            conversations.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSelectionMode}
                className="h-9 w-9 rounded-xl hover:bg-secondary"
                title="批量选择"
              >
                <Square className="h-5 w-5" />
              </Button>
            )
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b border-border bg-card/30 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={useRegex ? t('conversations.regexSearchPlaceholder') : t('conversations.searchPlaceholder')}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-xl hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="use-regex"
              checked={useRegex}
              onCheckedChange={(checked) => setUseRegex(checked === true)}
            />
            <Label htmlFor="use-regex" className="text-sm">
              {t('conversations.useRegex')}
            </Label>
          </div>
          {conversations.length > 0 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportConversation}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
                {t('conversations.import')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportAllConversations}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
                {t('conversations.exportAll')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? t('conversations.noSearchResults') : t('conversations.noConversations')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? t('conversations.noSearchResultsHint')
                  : t('conversations.startConversation')
                }
              </p>
              <Button onClick={() => router.push("/")}>
                {t('conversations.newConversation')}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm",
                    selectedConversations.has(conv.id) && "border-primary bg-primary/5"
                  )}
                >
                  {isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSelectConversation(conv.id)
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <div className={cn(
                        "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                        selectedConversations.has(conv.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/50"
                      )}>
                        {selectedConversations.has(conv.id) && (
                          <CheckSquare className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </button>
                  )}
                  <div
                    onClick={() => isSelectionMode ? toggleSelectConversation(conv.id) : handleSelectConversation(conv.id)}
                    className={cn("flex flex-col gap-2 cursor-pointer", isSelectionMode && "pl-6")}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {conv.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(conv.updatedAt)}
                        </span>
                        {!isSelectionMode && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                exportConversation(conv)
                              }}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteConversation(conv.id)
                              }}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {conv.messages.length > 0 
                        ? conv.messages[conv.messages.length - 1].content.replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 100) + 
                          (conv.messages[conv.messages.length - 1].content.length > 100 ? "..." : "")
                        : t('conversations.noMessages')
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground">
        {t('conversations.totalConversations', { count: conversations.length })}
        {searchQuery && ` (${t('conversations.filteredCount', { count: filteredConversations.length })})`}
      </footer>
    </div>
  )
}
