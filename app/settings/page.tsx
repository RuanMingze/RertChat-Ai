"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Sun, Moon, ExternalLink, MessageCircle, LogOut, User, Bell, Volume2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSettings, saveSettings, getUserProfile, deleteUserProfile, type Settings, type UserProfile } from "@/lib/chat-db"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    id: 'default',
    streamingEnabled: true,
    aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
    theme: 'dark',
    autoRedirectToRecent: true,
    showLoadingScreen: true,
    notificationsEnabled: false,
    soundEnabled: true
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

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
    } finally {
      setIsLoading(false)
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
    const authUrl = "https://ruanm.pages.dev/oauth/authorize?client_id=lyjasfguplvmjijbhvbsgvdyg0il05bq&redirect_uri=https://ai.ruanm.pages.dev/callback&response_type=code&scope=read write"
    window.location.href = authUrl
  }

  const handleLogout = async () => {
    try {
      await deleteUserProfile()
      setUserProfile(null)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">加载设置中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh bg-background">
      <main className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">设置</h1>
          <div className="ml-auto">
            {userProfile ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleLogin}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                登录
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full space-y-6">
          {/* AI 助手设置 */}
          <Card>
            <CardHeader>
              <CardTitle>AI 助手设置</CardTitle>
              <CardDescription>配置 AI 助手的行为和模型</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 流式输出 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="streaming" className="text-base">流式输出</Label>
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
                  开启后，AI 会逐字输出回答，提供更流畅的体验
                </p>
              </div>

              {/* AI 模型 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-model" className="text-base">AI 模型</Label>
                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    查找模型
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
                  placeholder="输入 AI 模型名称，例如 @cf/qwen/qwen3-30b-a3b-fp8"
                />
                <p className="text-sm text-muted-foreground">
                  默认使用 @cf/qwen/qwen3-30b-a3b-fp8
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 外观设置 */}
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
              <CardDescription>自定义界面主题</CardDescription>
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
                    <div className="text-base font-medium">浅色模式</div>
                    <p className="text-sm text-muted-foreground">明亮的界面主题</p>
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
                    <div className="text-base font-medium">深色模式</div>
                    <p className="text-sm text-muted-foreground">暗色的界面主题</p>
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

          {/* 行为设置 */}
          <Card>
            <CardHeader>
              <CardTitle>行为设置</CardTitle>
              <CardDescription>配置应用的行为</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="auto-redirect" className="text-base">自动跳转到最近对话</Label>
                      <p className="text-sm text-muted-foreground">打开页面时自动跳转到最近的一轮对话</p>
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
                      <Label htmlFor="loading-screen" className="text-base">显示加载页面</Label>
                      <p className="text-sm text-muted-foreground">打开页面时显示加载动画</p>
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
              <CardTitle>通知设置</CardTitle>
              <CardDescription>配置应用通知和声音</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="notifications" className="text-base">桌面通知</Label>
                      <p className="text-sm text-muted-foreground">AI 回复完成时发送桌面通知</p>
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
                      <Label htmlFor="sound" className="text-base">消息提示音</Label>
                      <p className="text-sm text-muted-foreground">收到新消息时播放提示音</p>
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
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} size="lg">
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
