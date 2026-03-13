"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  getAllConversations,
  deleteConversation as deleteConversationFromDB,
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
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [useRegex, setUseRegex] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
  const handleDeleteConversation = (id: string) => {
    if (confirm("确定要删除这个对话吗？")) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      deleteConversationFromDB(id).catch(console.error)
    }
  }

  // 导出对话为文本文件
  const exportConversation = (conv: Conversation) => {
    let content = `对话标题: ${conv.title}\n`
    content += `创建时间: ${formatDate(conv.createdAt)}\n`
    content += `更新时间: ${formatDate(conv.updatedAt)}\n\n`
    content += `=== 对话内容 ===\n\n`

    conv.messages.forEach((msg, index) => {
      const role = msg.role === "user" ? "我" : "AI"
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
    let content = `=== 全部对话导出 ===\n`
    content += `导出时间: ${formatDate(Date.now())}\n`
    content += `对话数量: ${conversations.length}\n\n`

    conversations.forEach((conv, convIndex) => {
      content += `=== 对话 ${convIndex + 1}: ${conv.title} ===\n`
      content += `创建时间: ${formatDate(conv.createdAt)}\n`
      content += `更新时间: ${formatDate(conv.updatedAt)}\n\n`

      conv.messages.forEach((msg, msgIndex) => {
        const role = msg.role === "user" ? "我" : "AI"
        content += `${role}: ${msg.content}\n\n`
      })

      content += `\n${"=".repeat(50)}\n\n`
    })

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `全部对话_${formatDate(Date.now()).replace(/[^a-zA-Z0-9]/g, "_")}.txt`
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-9 w-9 rounded-xl hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">全部对话</h1>
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b border-border bg-card/30 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={useRegex ? "使用正则表达式搜索对话..." : "搜索对话标题或内容..."}
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
              使用正则表达式
            </Label>
          </div>
          {conversations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={exportAllConversations}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              导出全部对话
            </Button>
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
                {searchQuery ? "没有找到匹配的对话" : "暂无对话历史"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "尝试调整搜索条件" 
                  : "开始与 AI 助手的对话吧"
                }
              </p>
              <Button onClick={() => router.push("/")}>
                新建对话
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <button
                    onClick={() => handleSelectConversation(conv.id)}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {conv.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(conv.updatedAt)}
                        </span>
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
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {conv.messages.length > 0 
                        ? conv.messages[conv.messages.length - 1].content.slice(0, 100) + 
                          (conv.messages[conv.messages.length - 1].content.length > 100 ? "..." : "")
                        : "无消息"
                      }
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground">
        共 {conversations.length} 个对话
        {searchQuery && ` (筛选出 ${filteredConversations.length} 个)`}
      </footer>
    </div>
  )
}
