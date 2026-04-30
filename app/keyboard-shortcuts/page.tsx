"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"
import { Keyboard, ArrowLeft } from "lucide-react"
import Link from "next/link"

const shortcuts = [
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="k">K</Kbd>],
    description: "聚焦输入框",
    category: "导航",
  },
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="b">B</Kbd>],
    description: "切换侧边栏",
    category: "导航",
  },
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="n">N</Kbd>],
    description: "新建对话",
    category: "对话",
  },
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="l">L</Kbd>],
    description: "清空当前对话",
    category: "对话",
  },
  {
    keys: [<Kbd key="/">/</Kbd>],
    description: "聚焦输入框（当未聚焦时）",
    category: "导航",
  },
  {
    keys: [<Kbd key="Enter">Enter</Kbd>],
    description: "发送消息 / 停止生成",
    category: "输入",
  },
  {
    keys: [<Kbd key="Shift">Shift</Kbd>, <Kbd key="Enter">Enter</Kbd>],
    description: "换行",
    category: "输入",
  },
  {
    keys: [<Kbd key="Escape">Esc</Kbd>],
    description: "关闭侧边栏 / 取消导航",
    category: "通用",
  },
  {
    keys: [<Kbd key="Tab">Tab</Kbd>],
    description: "切换建议项（欢迎页）",
    category: "欢迎页",
  },
  {
    keys: [<Kbd key="ArrowUp">↑</Kbd>, <Kbd key="ArrowDown">↓</Kbd>, <Kbd key="ArrowLeft">←</Kbd>, <Kbd key="ArrowRight">→</Kbd>],
    description: "在列表中导航",
    category: "列表",
  },
  {
    keys: [<Kbd key="Enter">Enter</Kbd>],
    description: "选择当前项目",
    category: "列表",
  },
]

const categories = [...new Set(shortcuts.map((s) => s.category))]

const groupedShortcuts = categories.map((category) => ({
  category,
  items: shortcuts.filter((s) => s.category === category),
}))

export default function KeyboardShortcutsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">返回</span>
          </Link>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">键盘快捷键</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>快捷键指南</CardTitle>
            <CardDescription>
              以下是应用中可用的键盘快捷键，助您无鼠标操作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {groupedShortcuts.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-foreground mb-3">{group.category}</h3>
                <div className="space-y-2">
                  {group.items.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">{shortcut.keys}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
