"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Sun, Moon, ExternalLink, MessageCircle, LogOut, User, Bell, Volume2, AlertTriangle, Globe, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSettings, saveSettings, getUserProfile, deleteUserProfile, clearAllData, unregisterServiceWorker, clearAllCaches, type Settings, type UserProfile } from "@/lib/chat-db"
import { useConfirm } from "@/components/confirm-dialog"
import { cn } from "@/lib/utils"
import { useI18n, locales, localeNames, Locale } from "@/lib/i18n"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    id: 'default',
    streamingEnabled: true,
    aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
    theme: 'dark',
    autoRedirectToRecent: true,
    showLoadingScreen: true,
    notificationsEnabled: false,
    soundEnabled: true,
    showAIWarning: true
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const confirm = useConfirm()
  const { locale, setLocale, t } = useI18n()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings()
      setSettings(loadedSettings)
      // 同步应用主题到 DOM
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(loadedSettings.theme)
      
      // 加载用户资料
      const profile = await getUserProfile()
      setUserProfile(profile)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme: newTheme }))
    // 直接操作 DOM 切换主题
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(newTheme)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveSettings(settings)
      // 保存成功后返回主页
      router.push('/')
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogin = () => {
    const authUrl = "https://ruanm.pages.dev/oauth/authorize?client_id=1sa77wzm5h4gcat8f3hq22jlii54gsyb&redirect_uri=https://rertx.dpdns.org/callback&response_type=code&scope=read write"
    window.location.href = authUrl
  }

  const handleLogout = async () => {
    try {
      await clearAllData()
      await unregisterServiceWorker()
      await clearAllCaches()
      setUserProfile(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="flex h-dvh bg-background">
      <main className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
          <div className="ml-auto">
            {userProfile ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t('settings.logout')}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleLogin}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                {t('settings.login')}
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full space-y-6">
          {/* AI 助手设置 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.aiSettings')}</CardTitle>
              <CardDescription>{t('settings.aiSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 流式输出 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="streaming" className="text-base">{t('settings.streaming')}</Label>
                  <Switch
                    id="streaming"
                    checked={settings.streamingEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      streamingEnabled: checked
                    }))}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.streamingDescription')}
                </p>
              </div>

              {/* AI 模型 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-model" className="text-base">{t('settings.aiModel')}</Label>
                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {t('settings.findModel')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Input
                  id="ai-model"
                  value={settings.aiModel}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    aiModel: e.target.value
                  }))}
                  placeholder={t('settings.modelPlaceholder')}
                />
                <p className="text-sm text-muted-foreground">
                  {t('settings.defaultModel')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 外观设置 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearanceSettings')}</CardTitle>
              <CardDescription>{t('settings.appearanceSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => handleThemeChange('light')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors",
                    settings.theme === 'light'
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}>
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-medium">{t('settings.lightMode')}</div>
                    <p className="text-sm text-muted-foreground">{t('settings.lightModeDescription')}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2",
                    settings.theme === 'light'
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}
                />
              </div>

              <div
                onClick={() => handleThemeChange('dark')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors",
                    settings.theme === 'dark'
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}>
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-medium">{t('settings.darkMode')}</div>
                    <p className="text-sm text-muted-foreground">{t('settings.darkModeDescription')}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2",
                    settings.theme === 'dark'
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 语言设置 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.language') || '语言设置'}</CardTitle>
              <CardDescription>{t('settings.languageDescription') || '选择界面显示语言'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {locales.map((loc) => (
                <div
                  key={loc}
                  onClick={() => setLocale(loc as Locale)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors",
                      locale === loc
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-medium">{localeNames[loc]}</div>
                      <p className="text-sm text-muted-foreground">
                        {loc === 'zh-CN' ? t('settings.zhInterface') : t('settings.enInterface')}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      locale === loc
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 行为设置 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.behaviorSettings')}</CardTitle>
              <CardDescription>{t('settings.behaviorSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="auto-redirect" className="text-base">{t('settings.autoRedirect')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.autoRedirectDescription')}</p>
                    </div>
                  </div>
                  <Switch
                    id="auto-redirect"
                    checked={settings.autoRedirectToRecent}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      autoRedirectToRecent: checked
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="loading-screen" className="text-base">{t('settings.showLoadingScreen')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.showLoadingScreenDescription')}</p>
                    </div>
                  </div>
                  <Switch
                    id="loading-screen"
                    checked={settings.showLoadingScreen}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      showLoadingScreen: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notificationSettings')}</CardTitle>
              <CardDescription>{t('settings.notificationSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="notifications" className="text-base">{t('settings.desktopNotification')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.desktopNotificationDescription')}</p>
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notificationsEnabled}
                    onCheckedChange={async (checked) => {
                      if (checked) {
                        const { notificationManager } = await import('@/lib/notification')
                        const granted = await notificationManager.requestPermission()
                        if (!granted) {
                          return
                        }
                      }
                      setSettings(prev => ({
                        ...prev,
                        notificationsEnabled: checked
                      }))
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="sound" className="text-base">{t('settings.sound')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.soundDescription')}</p>
                    </div>
                  </div>
                  <Switch
                    id="sound"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      soundEnabled: checked
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="ai-warning" className="text-base">{t('settings.showAIWarning')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.showAIWarningDescription')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {settings.showAIWarning ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const confirmed = await confirm(
                            t('settings.turnOffAIWarning'),
                            t('settings.turnOffAIWarningMessage')
                          )
                          if (confirmed) {
                            setSettings(prev => ({
                              ...prev,
                              showAIWarning: false
                            }))
                          }
                        }}
                      >
                        {t('settings.close')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            showAIWarning: true
                          }))
                        }}
                      >
                        {t('settings.enable')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} size="lg">
                {isSaving ? t('settings.saving') : t('common.save')}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('about.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/about">
                  <Info className="mr-2 h-4 w-4" />
                  {t('about.subtitle')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
