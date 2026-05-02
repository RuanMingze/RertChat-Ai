"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"
import { Keyboard, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import type { ReactNode } from "react"

interface ShortcutItem {
  keys: ReactNode[]
  descriptionKey: string
  categoryKey: string
}

const shortcuts = [
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="k">K</Kbd>],
    descriptionKey: "keyboardShortcuts.focusInput",
    categoryKey: "keyboardShortcuts.navigation",
  },
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="b">B</Kbd>],
    descriptionKey: "keyboardShortcuts.toggleSidebar",
    categoryKey: "keyboardShortcuts.navigation",
  },
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="n">N</Kbd>],
    descriptionKey: "keyboardShortcuts.newConversation",
    categoryKey: "keyboardShortcuts.conversation",
  },
  {
    keys: [<Kbd key="ctrl">Ctrl</Kbd>, <Kbd key="l">L</Kbd>],
    descriptionKey: "keyboardShortcuts.clearConversation",
    categoryKey: "keyboardShortcuts.conversation",
  },
  {
    keys: [<Kbd key="/">/</Kbd>],
    descriptionKey: "keyboardShortcuts.focusInputWhenNot",
    categoryKey: "keyboardShortcuts.navigation",
  },
  {
    keys: [<Kbd key="Enter">Enter</Kbd>],
    descriptionKey: "keyboardShortcuts.sendMessage",
    categoryKey: "keyboardShortcuts.input",
  },
  {
    keys: [<Kbd key="Shift">Shift</Kbd>, <Kbd key="Enter">Enter</Kbd>],
    descriptionKey: "keyboardShortcuts.newLine",
    categoryKey: "keyboardShortcuts.input",
  },
  {
    keys: [<Kbd key="Escape">Esc</Kbd>],
    descriptionKey: "keyboardShortcuts.closeSidebar",
    categoryKey: "keyboardShortcuts.general",
  },
  {
    keys: [<Kbd key="Tab">Tab</Kbd>],
    descriptionKey: "keyboardShortcuts.switchSuggestion",
    categoryKey: "keyboardShortcuts.welcomePage",
  },
  {
    keys: [<Kbd key="ArrowUp">↑</Kbd>, <Kbd key="ArrowDown">↓</Kbd>, <Kbd key="ArrowLeft">←</Kbd>, <Kbd key="ArrowRight">→</Kbd>],
    descriptionKey: "keyboardShortcuts.navigateList",
    categoryKey: "keyboardShortcuts.list",
  },
  {
    keys: [<Kbd key="Enter">Enter</Kbd>],
    descriptionKey: "keyboardShortcuts.selectCurrent",
    categoryKey: "keyboardShortcuts.list",
  },
]

export default function KeyboardShortcutsPage() {
  const { t } = useI18n()

  const categories = [...new Set(shortcuts.map((s) => s.categoryKey))]

  const groupedShortcuts = categories.map((categoryKey) => ({
    categoryKey,
    items: shortcuts.filter((s) => s.categoryKey === categoryKey),
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">{t('keyboardShortcuts.back')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{t('keyboardShortcuts.title')}</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t('keyboardShortcuts.guide')}</CardTitle>
            <CardDescription>
              {t('keyboardShortcuts.guideDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {groupedShortcuts.map((group) => (
              <div key={group.categoryKey}>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t(group.categoryKey)}</h3>
                <div className="space-y-2">
                  {group.items.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">{t(shortcut.descriptionKey)}</span>
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