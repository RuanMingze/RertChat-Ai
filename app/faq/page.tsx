"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Search, HelpCircle, MessageSquare, Key, Bell, Database, Shield, RefreshCw, Github, Mail, ExternalLink, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface FAQItemProps {
  question: string
  answer: React.ReactNode
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left hover:bg-muted/50 transition-colors px-2 -mx-2 rounded-lg"
      >
        <span className="font-medium text-foreground">{question}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

const faqCategories = [
  {
    id: "keyboard-shortcuts",
    title: "键盘快捷键",
    icon: Keyboard,
    faqs: [
      {
        question: "有哪些可用的键盘快捷键？",
        answer: (
          <div>
            访问 <Link href="/keyboard-shortcuts" className="mx-1 text-primary hover:underline">快捷键指南</Link> 页面查看完整的快捷键列表和说明。
          </div>
        ),
      },
    ],
  },
  {
    id: "getting-started",
    title: "快速开始",
    icon: HelpCircle,
    faqs: [
      {
        question: "如何开始一个新对话？",
        answer: (
          <div>
            点击侧边栏左上角的
            <code className="mx-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">+ 新建对话</code>
            按钮即可开始新对话。您也可以在对话列表页面点击
            <code className="mx-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">新建对话</code>
            按钮。
          </div>
        ),
      },
      {
        question: "如何导入之前的对话？",
        answer: (
          <div>
            前往
            <Link href="/conversations" className="mx-1 text-primary hover:underline">对话列表</Link>
            页面，点击
            <code className="mx-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">导入</code>
            按钮，选择导出的 JSON 文件即可。注意：导入的文件必须是之前通过
            <code className="mx-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">导出</code>
            功能导出的格式。
          </div>
        ),
      },
      {
        question: "如何导出我的对话？",
        answer: (
          <div>
            在
            <Link href="/conversations" className="mx-1 text-primary hover:underline">对话列表</Link>
            页面，您可以：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>点击单个对话右侧的导出按钮导出单个对话</li>
              <li>点击右上角的"导出全部"按钮导出所有对话</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: "api-keys",
    title: "API 密钥",
    icon: Key,
    faqs: [
      {
        question: "API 密钥如何管理？",
        answer: (
          <div>
            RertChat 使用 Cloudflare Pages 的环境变量和机密存储管理 API 密钥，确保密钥安全。
          </div>
        ),
      },
    ],
  },
  {
    id: "notifications",
    title: "通知设置",
    icon: Bell,
    faqs: [
      {
        question: "如何开启桌面通知？",
        answer: (
          <div>
            前往
            <Link href="/settings" className="mx-1 text-primary hover:underline">设置</Link>
            页面，在"通知设置"部分开启"桌面通知"选项。首次开启时浏览器会请求通知权限，请点击"允许"。
          </div>
        ),
      },
      {
        question: "为什么收不到通知？",
        answer: (
          <div>
            请检查以下几点：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>浏览器通知权限是否已授权</li>
              <li>浏览器是否在后台运行</li>
              <li>系统通知设置是否正确</li>
              <li>网站通知开关是否已开启</li>
            </ul>
          </div>
        ),
      },
      {
        question: "通知声音如何关闭？",
        answer: (
          <div>
            在
            <Link href="/settings" className="mx-1 text-primary hover:underline">设置</Link>
            页面，关闭"通知声音"选项即可关闭通知提示音。
          </div>
        ),
      },
    ],
  },
  {
    id: "data-storage",
    title: "数据存储",
    icon: Database,
    faqs: [
      {
        question: "我的对话数据存储在哪里？",
        answer: (
          <div>
            您的对话数据存储在浏览器的 IndexedDB 中，这是浏览器本地的存储空间。数据不会被上传到服务器，完全保存在您的设备上。
          </div>
        ),
      },
      {
        question: "清除浏览器数据会丢失对话吗？",
        answer: (
          <div>
            是的，如果您清除浏览器的缓存、Cookie 或站点数据，对话数据将会丢失。建议定期导出对话作为备份。
          </div>
        ),
      },
      {
        question: "如何在不同设备间同步对话？",
        answer: (
          <div>
            目前应用使用本地存储，暂不支持跨设备同步。您可以通过导出对话功能将对话导出为 JSON 文件，然后在其他设备上导入。
          </div>
        ),
      },
    ],
  },
  {
    id: "privacy",
    title: "隐私与安全",
    icon: Shield,
    faqs: [
      {
        question: "我的对话内容会被保存吗？",
        answer: (
          <div>
            对话内容仅保存在您浏览器的本地存储中（IndexedDB），不会上传到任何服务器。AI 服务提供商可能会保留对话内容用于改进模型，请参阅各服务提供商 的隐私政策。
          </div>
        ),
      },
      {
        question: "API 密钥安全吗？",
        answer: (
          <div>
            API 密钥存储在浏览器本地，仅用于调用 AI 服务。我们建议：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>不要在公共场所输入或展示您的密钥</li>
              <li>定期更换密钥</li>
              <li>不要将密钥提交到公开的代码仓库</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "故障排除",
    icon: RefreshCw,
    faqs: [
      {
        question: "发送消息失败怎么办？",
        answer: (
          <div>
            如果发送消息失败，请检查：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>网络连接是否正常</li>
              <li>浏览器控制台是否有错误信息</li>
            </ul>
          </div>
        ),
      },
      {
        question: "页面显示异常如何解决？",
        answer: (
          <div>
            请尝试以下步骤：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>刷新页面</li>
              <li>清除浏览器缓存</li>
              <li>使用隐身模式打开</li>
              <li>更新浏览器到最新版本</li>
            </ul>
          </div>
        ),
      },
      {
        question: "如何反馈问题或建议？",
        answer: (
          <div>
            您可以通过以下方式反馈：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>在 GitHub 仓库提交 Issue</li>
              <li>通过邮箱联系我们</li>
            </ul>
          </div>
        ),
      },
    ],
  },
]

export default function FAQPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("keyboard-shortcuts")

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof faq.answer === "string" && (faq.answer as string).toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter((category) => category.faqs.length > 0 || !searchQuery)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-9 w-9 rounded-xl hover:bg-secondary"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">常见问题</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card/30 md:block">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-4 space-y-1">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeCategory === category.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <category.icon className="h-4 w-4" />
                  {category.title}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl p-6">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索问题..."
                className="pl-10"
              />
            </div>

            {/* Mobile Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 md:hidden">
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="shrink-0"
                >
                  <category.icon className="h-4 w-4 mr-1" />
                  {category.title}
                </Button>
              ))}
            </div>

            {/* FAQ Categories */}
            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className={cn(activeCategory !== category.id && "hidden", "md:block")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category.faqs.length > 0 ? (
                      category.faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        没有找到相关问题
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到相关问题</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    请尝试其他搜索关键词
                  </p>
                </div>
              )}

              <Card className="mt-8">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    联系我们
                  </CardTitle>
                  <CardDescription className="mt-1">
                    如有其他问题，欢迎通过以下方式联系我们
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <a
                      href="https://discord.gg/MNvQFkmwCE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Discord</p>
                        <p className="text-xs text-muted-foreground truncate">加入讨论</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a
                      href="mailto:support@ruanmgjx.dpdns.org"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">邮箱</p>
                        <p className="text-xs text-muted-foreground truncate">support@ruanmgjx.dpdns.org</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a
                      href="https://github.com/RuanMingze/RertChat-AI/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Github className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">GitHub</p>
                        <p className="text-xs text-muted-foreground truncate">提交 Issue</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
