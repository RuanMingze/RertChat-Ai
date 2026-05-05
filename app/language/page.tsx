"use client"

import { useState, useMemo } from "react"
import { PageTitle } from "@/components/PageTitle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Globe, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useI18n, locales, localeNames, Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export default function LanguagePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { locale, setLocale } = useI18n()

  const filteredLocales = useMemo(() => {
    if (!searchQuery.trim()) {
      return locales
    }
    const query = searchQuery.toLowerCase()
    return locales.filter(loc => {
      const name = localeNames[loc]?.toLowerCase() || ''
      const code = loc.toLowerCase()
      return name.includes(query) || code.includes(query)
    })
  }, [searchQuery])

  const handleLanguageChange = (loc: Locale) => {
    setLocale(loc)
    router.push('/settings')
  }

  return (
    <>
      <PageTitle titleKey="settings.language" />
      <div className="flex h-dvh bg-background">
        <main className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">语言设置</h1>
          </div>

          <div className="max-w-2xl mx-auto w-full space-y-6">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索语言..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 语言列表 */}
            <div className="space-y-2">
              {filteredLocales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>未找到匹配的语言</p>
                </div>
              ) : (
                filteredLocales.map((loc) => (
                  <div
                    key={loc}
                    onClick={() => handleLanguageChange(loc as Locale)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors cursor-pointer",
                      locale === loc ? "bg-accent" : ""
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-colors",
                        locale === loc
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      )}>
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-lg font-medium">{localeNames[loc]}</div>
                        <p className="text-sm text-muted-foreground">{loc}</p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2",
                        locale === loc
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )}
                    />
                  </div>
                ))
              )}
            </div>

            {/* 语言统计 */}
            <div className="text-center text-sm text-muted-foreground">
              共 {filteredLocales.length} 种语言可选
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
