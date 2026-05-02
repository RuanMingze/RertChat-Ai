"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Search, HelpCircle, MessageSquare, Key, Bell, Database, Shield, RefreshCw, Github, Mail, ExternalLink, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"

interface FAQItemProps {
  question: string
  answer: string
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
    titleKey: "faq.keyboardShortcuts",
    icon: Keyboard,
    faqs: [
      {
        questionKey: "faq.questions.availableShortcuts",
        answerKey: "faq.answers.availableShortcuts",
      },
    ],
  },
  {
    id: "getting-started",
    titleKey: "faq.quickStart",
    icon: HelpCircle,
    faqs: [
      {
        questionKey: "faq.questions.startNewConversation",
        answerKey: "faq.answers.startNewConversation",
      },
      {
        questionKey: "faq.questions.importConversation",
        answerKey: "faq.answers.importConversation",
      },
      {
        questionKey: "faq.questions.exportConversation",
        answerKey: "faq.answers.exportConversation",
      },
    ],
  },
  {
    id: "api-keys",
    titleKey: "faq.apiKeys",
    icon: Key,
    faqs: [
      {
        questionKey: "faq.questions.apiKeyManagement",
        answerKey: "faq.answers.apiKeyManagement",
      },
    ],
  },
  {
    id: "notifications",
    titleKey: "faq.notificationSettings",
    icon: Bell,
    faqs: [
      {
        questionKey: "faq.questions.enableDesktopNotification",
        answerKey: "faq.answers.enableDesktopNotification",
      },
      {
        questionKey: "faq.questions.noNotificationReceived",
        answerKey: "faq.answers.noNotificationReceived",
      },
      {
        questionKey: "faq.questions.turnOffNotificationSound",
        answerKey: "faq.answers.turnOffNotificationSound",
      },
    ],
  },
  {
    id: "data-storage",
    titleKey: "faq.dataStorage",
    icon: Database,
    faqs: [
      {
        questionKey: "faq.questions.dataStorageLocation",
        answerKey: "faq.answers.dataStorageLocation",
      },
      {
        questionKey: "faq.questions.clearBrowserData",
        answerKey: "faq.answers.clearBrowserData",
      },
      {
        questionKey: "faq.questions.syncAcrossDevices",
        answerKey: "faq.answers.syncAcrossDevices",
      },
    ],
  },
  {
    id: "privacy",
    titleKey: "faq.privacy",
    icon: Shield,
    faqs: [
      {
        questionKey: "faq.questions.conversationSaved",
        answerKey: "faq.answers.conversationSaved",
      },
      {
        questionKey: "faq.questions.apiKeySecurity",
        answerKey: "faq.answers.apiKeySecurity",
      },
    ],
  },
  {
    id: "troubleshooting",
    titleKey: "faq.troubleshooting",
    icon: RefreshCw,
    faqs: [
      {
        questionKey: "faq.questions.messageSendFailed",
        answerKey: "faq.answers.messageSendFailed",
      },
      {
        questionKey: "faq.questions.pageDisplayIssue",
        answerKey: "faq.answers.pageDisplayIssue",
      },
      {
        questionKey: "faq.questions.feedback",
        answerKey: "faq.answers.feedback",
      },
    ],
  },
]

export default function FAQPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("keyboard-shortcuts")
  const { t } = useI18n()

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        t(faq.questionKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(faq.answerKey).toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-lg font-semibold text-foreground">{t('faq.title')}</h1>
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
                  {t(category.titleKey)}
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
                placeholder={t('faq.searchPlaceholder')}
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
                  {t(category.titleKey)}
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
                      {t(category.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category.faqs.length > 0 ? (
                      category.faqs.map((faq, index) => (
                        <FAQItem key={index} question={t(faq.questionKey)} answer={t(faq.answerKey)} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        {t('faq.noResults')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('faq.noResults')}</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {t('faq.tryDifferentKeywords')}
                  </p>
                </div>
              )}

              <Card className="mt-8">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {t('faq.contactUs')}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {t('faq.contactUsDescription')}
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
                        <p className="text-xs text-muted-foreground truncate">{t('faq.joinDiscussion')}</p>
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
                      href="https://github.com/RuanMingze/RertChat-Ai/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Github className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">GitHub</p>
                        <p className="text-xs text-muted-foreground truncate">{t('faq.submitIssue')}</p>
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
