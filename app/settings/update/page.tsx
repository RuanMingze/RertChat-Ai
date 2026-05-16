"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Loader, ChevronRight, Smartphone, HardDrive, Clock, Zap, Star, Info, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/client'
import { PageTitle } from '@/components/PageTitle'

interface UpdateInfo {
  available: boolean
  version: string
  lastChecked: string
  changelog: string[]
}

const STORAGE_KEY_INSTALLED_VERSION = 'rertchat_installed_version'

export default function UpdatePage() {
  const { t } = useI18n()
  const router = useRouter()
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    available: false,
    version: '',
    lastChecked: '',
    changelog: []
  })
  const [isChecking, setIsChecking] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string>('')
  const [currentVersion, setCurrentVersion] = useState('v2.0.0')
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)

  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then(data => {
        if (data.version) {
          setCurrentVersion(`v${data.version}`)
        }
      })
      .catch(() => {
        console.log('Could not fetch version')
      })
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsPWAInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    setIsPWAInstalled(window.matchMedia('(display-mode: standalone)').matches)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const parseChangelog = (content: string): string[] => {
    const changelogItems: string[] = []
    
    const versionMatch = content.match(/## \[v[\d.]+\]\s*\([\d-]+\)[\s\S]*?(?=\n## \[|$)/)
    
    if (versionMatch) {
      const versionContent = versionMatch[0]
      const lines = versionContent.split('\n')
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        if (!trimmedLine) continue
        if (trimmedLine.startsWith('##')) continue
        if (trimmedLine.startsWith('###')) continue
        
        const emojiMatch = trimmedLine.match(/^[-*]?\s*(\S)(.+)$/)
        if (emojiMatch) {
          const firstChar = emojiMatch[1]
          const firstCharCode = firstChar.codePointAt(0) || 0
          const isEmojiChar = firstCharCode > 127
          if (isEmojiChar) {
            const item = (`${firstChar}${emojiMatch[2]}`).trim()
            if (item && item.length > 0 && !item.match(/^\d{4}-\d{2}-\d{2}/)) {
              changelogItems.push(item)
            }
          }
        }
      }
    }
    
    return changelogItems.slice(0, 6)
  }

  const checkForUpdates = async () => {
    setIsChecking(true)
    setUpdateStatus(t('settings.updateChecking'))
    
    try {
      let swUpdateAvailable = false
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  swUpdateAvailable = true
                }
              })
            }
          })
        }
      }

      const githubUrl = 'https://api.github.com/repos/RuanMingze/RertChat-Ai/contents/CHANGELOG.md'
      const mirrorUrl = 'https://raw.githubusercontent.com/RuanMingze/RertChat-Ai/main/CHANGELOG.md'
      
      let changelogContent = ''
      let latestVersion = currentVersion
      
      try {
        const githubRes = await fetch(githubUrl)
        if (githubRes.ok) {
          const data = await githubRes.json()
          changelogContent = decodeURIComponent(escape(atob(data.content)))
        } else {
          throw new Error('GitHub API failed')
        }
      } catch {
        try {
          const mirrorRes = await fetch(mirrorUrl)
          if (mirrorRes.ok) {
            changelogContent = await mirrorRes.text()
          }
        } catch (error) {
          console.error('Failed to fetch changelog:', error)
        }
      }

      if (changelogContent) {
        const versionRegex = /## \[v([\d.]+)\]/
        const versionMatch = changelogContent.match(versionRegex)
        if (versionMatch) {
          latestVersion = `v${versionMatch[1]}`
        }
        
        const changelogItems = parseChangelog(changelogContent)
        
        const storedVersion = localStorage.getItem(STORAGE_KEY_INSTALLED_VERSION) || currentVersion
        const currentNum = parseFloat(storedVersion.replace('v', '').replace(/\./g, ''))
        const latestNum = parseFloat(latestVersion.replace('v', '').replace(/\./g, ''))
        
        if (latestNum > currentNum || swUpdateAvailable) {
          setUpdateInfo({
            available: true,
            version: latestVersion,
            lastChecked: new Date().toLocaleString(),
            changelog: changelogItems.length > 0 ? changelogItems : [
              '✨ 对话URL分享：6位数字ID，支持?chat=123456访问',
              '🌙 系统主题：自动跟随系统深色/浅色模式',
              '🎨 PWA主题色改为深色背景(#1e2022)',
              '💾 设置页面采用Discord风格保存提示',
              '🔧 导航设置增强，支持传统/URL模式切换',
              '🌍 完善20种语言翻译'
            ]
          })
          setUpdateStatus(t('settings.updateAvailable'))
        } else {
          setUpdateInfo(prev => ({
            ...prev,
            available: false,
            version: currentVersion,
            lastChecked: new Date().toLocaleString(),
            changelog: []
          }))
          setUpdateStatus(t('settings.updateUpToDate'))
        }
      } else {
        setUpdateInfo(prev => ({
          ...prev,
          available: false,
          version: currentVersion,
          lastChecked: new Date().toLocaleString(),
          changelog: []
        }))
        setUpdateStatus(t('settings.updateUpToDate'))
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      setUpdateStatus(t('settings.updateCheckFailed'))
      setUpdateInfo(prev => ({
        ...prev,
        available: false,
        version: currentVersion,
        lastChecked: new Date().toLocaleString(),
        changelog: []
      }))
    } finally {
      setIsChecking(false)
    }
  }

  const installUpdate = async () => {
    setIsUpdating(true)
    setUpdateStatus(t('settings.updateInstalling'))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      localStorage.setItem(STORAGE_KEY_INSTALLED_VERSION, updateInfo.version)
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }
      
      window.location.reload()
    } catch (error) {
      console.error('Failed to install update:', error)
      setUpdateStatus(t('settings.updateInstallFailed'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInstallPWA = async () => {
    if (installPrompt) {
      (installPrompt as any).prompt()
      const result = await (installPrompt as any).userChoice
      if (result.outcome === 'accepted') {
        setInstallPrompt(null)
        setIsPWAInstalled(true)
      }
    }
  }

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('Cache cleared')
    }
  }

  useEffect(() => {
    const storedVersion = localStorage.getItem(STORAGE_KEY_INSTALLED_VERSION)
    if (!storedVersion) {
      localStorage.setItem(STORAGE_KEY_INSTALLED_VERSION, currentVersion)
    }
  }, [currentVersion])

  useEffect(() => {
    checkForUpdates()
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }, [])

  return (
    <>
      <PageTitle titleKey="meta.update" />
      <div className="flex h-dvh bg-background">
        <main className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">{t('settings.updateSettings')}</h1>
            <span className="ml-auto text-sm text-muted-foreground">
              {t('settings.updateCurrentVersion')}: {currentVersion}
            </span>
          </div>

          <div className="max-w-2xl mx-auto w-full space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    updateInfo.available 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : updateStatus === t('settings.updateUpToDate')
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {isChecking || isUpdating ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : updateInfo.available ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : updateStatus === t('settings.updateUpToDate') ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <RefreshCw className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {updateInfo.available ? t('settings.updateAvailableTitle') : t('settings.updateStatus')}
                    </CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                      {updateStatus}
                      {updateInfo.lastChecked && (
                        <span className="text-xs">
                          {t('settings.updateLastChecked')}: {updateInfo.lastChecked}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={updateInfo.available ? installUpdate : checkForUpdates}
                    disabled={isChecking || isUpdating}
                    className={updateInfo.available ? 'bg-amber-500 hover:bg-amber-600' : ''}
                  >
                    {isChecking ? t('settings.updateChecking') : isUpdating ? t('settings.updateInstalling') : updateInfo.available ? t('settings.updateInstall') : t('settings.updateCheck')}
                  </Button>
                </div>
              </CardHeader>
              
              {updateInfo.available && updateInfo.changelog.length > 0 && (
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{t('settings.updateVersion')}: {updateInfo.version}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowChangelog(!showChangelog)}
                    >
                      {showChangelog ? t('settings.updateHideDetails') : t('settings.updateViewDetails')}
                    </Button>
                  </div>
                  
                  {showChangelog && (
                    <ul className="space-y-2 bg-muted/50 rounded-lg p-4">
                      {updateInfo.changelog.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              )}
            </Card>

            <Card>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={checkForUpdates}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t('settings.updateCheck')}</div>
                    <p className="text-xs text-muted-foreground">{t('settings.updateChecking')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={clearCache}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <HardDrive className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t('settings.clearCache') || '清除缓存'}</div>
                    <p className="text-xs text-muted-foreground">{t('settings.clearCacheDescription') || '清除应用缓存数据'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {installPrompt && !isPWAInstalled && (
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Smartphone className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{t('settings.installPWA') || '安装应用'}</div>
                      <p className="text-xs text-muted-foreground">{t('settings.installPWADescription') || '将应用安装到您的设备，获得更好的使用体验'}</p>
                    </div>
                  </div>
                  <Button onClick={handleInstallPWA}>
                    {t('settings.install') || '安装'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('settings.updateHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <button
                  className="w-full flex items-center justify-between py-3 px-4 hover:bg-accent/50 rounded-lg transition-colors"
                  onClick={() => window.open('https://github.com/RuanMingze/RertChat-Ai/blob/main/CHANGELOG.md', '_blank')}
                >
                  <div>
                    <div className="font-medium text-sm">{t('settings.viewFullHistory') || '查看完整更新历史'}</div>
                    <p className="text-xs text-muted-foreground">{t('settings.updateHistoryDescription')}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {t('settings.aboutApp') || '关于应用'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('settings.currentVersion') || '当前版本'}</span>
                  <span className="text-sm font-medium">{currentVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('settings.appName') || '应用名称'}</span>
                  <span className="text-sm font-medium">RertChat AI</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('settings.license') || '许可证'}</span>
                  <span className="text-sm font-medium">MIT</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => window.open('https://github.com/RuanMingze/RertChat-Ai', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('settings.sourceCode') || '源代码'}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => router.push('/about')}>
                    <Info className="h-4 w-4 mr-2" />
                    {t('about.title') || '关于'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}