"use client"

import { PageTitle } from "@/components/PageTitle"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Globe, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useI18n, locales, localeNames, Locale } from "@/lib/i18n"

export default function LanguageSelector() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { locale, setLocale, t } = useI18n()

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

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  const languageCountryCodes: Record<string, string> = {
    'zh-CN': 'cn',
    'zh-TW': 'tw',
    'en-US': 'us',
    'ja-JP': 'jp',
    'ko-KR': 'kr',
    'fr-FR': 'fr',
    'de-DE': 'de',
    'es-ES': 'es',
    'it-IT': 'it',
    'pt-BR': 'br',
    'ru-RU': 'ru',
    'ar-SA': 'sa',
    'hi-IN': 'in',
    'th-TH': 'th',
    'vi-VN': 'vn',
    'id-ID': 'id',
    'ms-MY': 'my',
    'tr-TR': 'tr',
    'pl-PL': 'pl',
    'nl-NL': 'nl'
  }

  const getFlagUrl = (loc: string) => {
    if (loc === 'zh-CN') {
      return '/china_flag.png'
    }
    const countryCode = languageCountryCodes[loc] || loc.split('-')[1]?.toLowerCase() || 'xx'
    return `https://flagcdn.com/${countryCode}.svg`
  }

  const getLanguageName = (loc: Locale) => {
    const names: Record<Locale, string> = {
      'zh-CN': '中文 (简体)',
      'zh-TW': '中文 (繁體)',
      'en-US': 'English',
      'ja-JP': '日本語',
      'ko-KR': '한국어',
      'fr-FR': 'Français',
      'de-DE': 'Deutsch',
      'es-ES': 'Español',
      'it-IT': 'Italiano',
      'pt-BR': 'Português (Brasil)',
      'ru-RU': 'Русский',
      'ar-SA': 'العربية',
      'hi-IN': 'हिन्दी',
      'th-TH': 'ไทย',
      'vi-VN': 'Tiếng Việt',
      'id-ID': 'Bahasa Indonesia',
      'ms-MY': 'Bahasa Melayu',
      'tr-TR': 'Türkçe',
      'pl-PL': 'Polski',
      'nl-NL': 'Nederlands'
    }
    return names[loc] || localeNames[loc]
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
            <h1 className="text-2xl font-semibold">{t('settings.language')}</h1>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('settings.language') || '语言设置'}
                </CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('common.search') || '搜索语言...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {filteredLocales.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {t('common.noResults') || '未找到匹配的语言'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredLocales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => handleLocaleChange(loc)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 border-2 transition-all duration-200 cursor-pointer rounded-xl",
                          "hover:scale-[1.02] hover:shadow-md",
                          locale === loc
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "flex h-9 w-12 items-center justify-center overflow-hidden mb-2 rounded-none",
                          locale === loc ? "ring-2 ring-primary" : ""
                        )}>
                          <img
                            src={getFlagUrl(loc)}
                            alt={getLanguageName(loc)}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="text-base font-medium text-center leading-tight">
                          {getLanguageName(loc)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {loc}
                        </div>
                        {locale === loc && (
                          <div className="absolute top-2 right-2">
                            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pb-4 text-center">
                <p className="text-xs text-muted-foreground px-4 leading-relaxed">
                  {t('settings.flagDisclaimer') || '中国国旗图案来源于中华人民共和国中央人民政府门户网站（www.gov.cn），仅用于标识语言区域，未作任何修改、变形或商业使用，使用完全合法。'}
                </p>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}