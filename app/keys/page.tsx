"use client"

import { PageTitle } from "@/components/PageTitle"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserProfile } from "@/lib/chat-db"
import { getApiKeys, createApiKey, deleteApiKey, rotateApiKey, type ApiKey } from "@/lib/api-keys-client"
import { Plus, Trash2, RotateCcw, Check, Key, AlertCircle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

export default function KeysPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRotating, setIsRotating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [justCreatedIds, setJustCreatedIds] = useState<Set<string>>(new Set())
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const copyToClipboard = useCallback(async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(keyId)
      // 2 秒后隐藏复制按钮
      setTimeout(() => {
        setCopiedId(null)
        setJustCreatedIds((prev) => {
          const next = new Set(prev)
          next.delete(keyId)
          return next
        })
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [])

  const loadKeys = useCallback(async (email: string) => {
    try {
      console.log('[DEBUG PAGE] 开始加载 keys, email:', email)
      setIsLoading(true)
      setError(null)
      const userKeys = await getApiKeys(email)
      console.log('[DEBUG PAGE] 加载到的 keys:', userKeys)
      setKeys(userKeys)
      // 刷新后清空所有可复制状态
      setJustCreatedIds(new Set())
      setCopiedId(null)
    } catch (err) {
      console.error('加载 Keys 失败:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [copyToClipboard])

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      // 从 IndexedDB 获取用户信息
      const profile = await getUserProfile()
      
      if (!profile) {
        // 未登录，重定向到 OAuth 登录页，登录后跳转到 keys 页面
        const authUrl = "https://ruanm.pages.dev/oauth/authorize?client_id=1sa77wzm5h4gcat8f3hq22jlii54gsyb&redirect_uri=https://rertx.dpdns.org/callback&response_type=code&scope=read write"
        window.location.href = authUrl
        return
      }

      console.log('[DEBUG PAGE] 获取到用户 profile:', profile)
      setUserEmail(profile.email)
      // 设置 userEmail 后立即加载 keys
      await loadKeys(profile.email)
    }

    checkAuth()
  }, [router, loadKeys])

  const handleCreateKey = useCallback(async () => {
    if (!userEmail) return

    try {
      setIsCreating(true)
      setError(null)
      const newKey = await createApiKey(userEmail)
      setKeys((prev) => [newKey, ...prev])
      // 标记为刚创建，可以复制
      setJustCreatedIds((prev) => new Set(prev).add(newKey.id))
      // 自动复制
      await copyToClipboard(newKey.keys, newKey.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setIsCreating(false)
    }
  }, [userEmail, copyToClipboard])

  const handleDeleteKey = useCallback(async (keyId: string) => {
    if (!userEmail) return

    try {
      setIsDeleting(keyId)
      setError(null)
      await deleteApiKey(keyId, userEmail)
      setKeys((prev) => prev.filter((k) => k.id !== keyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setIsDeleting(null)
    }
  }, [userEmail])

  const handleRotateKey = useCallback(async (keyId: string) => {
    if (!userEmail) return

    try {
      setIsRotating(keyId)
      setError(null)
      const updatedKey = await rotateApiKey(keyId, userEmail)
      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? updatedKey : k))
      )
      // 标记为刚轮转，可以复制
      setJustCreatedIds((prev) => new Set(prev).add(keyId))
      // 轮转后自动复制新 key
      await copyToClipboard(updatedKey.keys, keyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '轮转失败')
    } finally {
      setIsRotating(null)
    }
  }, [userEmail, copyToClipboard])

  const handleBack = () => {
    router.push('/')
  }

  // 刚创建的 key 显示完整，刷新后显示掩码
  const displayKey = (key: ApiKey, canShowFull: boolean = false) => {
    if (canShowFull) {
      return key.keys
    }
    // 显示前 8 位和后 4 位，中间用 * 代替
    const prefix = key.keys.substring(0, 8)
    const suffix = key.keys.substring(key.keys.length - 4)
    return `${prefix}${'*'.repeat(20)}${suffix}`
  }

  return (
    <>
      <PageTitle titleKey="meta.keys" />
      <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold">{t('keys.title')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userEmail && (
              <span className="hidden text-xs text-muted-foreground sm:inline-block">
                {userEmail}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">{t('keys.management')}</h1>
            <p className="text-muted-foreground">
              {t('keys.description')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Create Key Button */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{t('keys.createNewKey')}</CardTitle>
              <CardDescription>
                {t('keys.createKeyDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateKey}
                disabled={isCreating || !userEmail}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? t('keys.creating') : t('keys.createApiKey')}
              </Button>
            </CardContent>
          </Card>

          {/* Keys List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : keys.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Key className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">{t('keys.noKeys')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('keys.noKeysHint')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {keys.map((key, index) => {
                const canCopy = justCreatedIds.has(key.id)
                const isRotatingNow = isRotating === key.id
                const isDeletingNow = isDeleting === key.id

                return (
                  <Card key={`${key.id}-${index}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                              {canCopy ? (
                                <span className="flex items-center gap-2 text-green-600">
                                  <Check className="h-4 w-4" />
                                  {t('keys.newlyCreated')}
                                </span>
                              ) : (
                                t('keys.title')
                              )}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRotateKey(key.id)}
                            disabled={isRotatingNow || isDeletingNow}
                            title={t('keys.rotateTitle')}
                          >
                            <RotateCcw className={cn("h-4 w-4", isRotatingNow && "animate-spin")} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                            disabled={isDeletingNow}
                            title={t('keys.deleteTitle')}
                          >
                            <Trash2 className={cn("h-4 w-4", isDeletingNow && "animate-pulse")} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={displayKey(key, canCopy)}
                            readOnly
                            className={cn(
                              "font-mono text-sm",
                              canCopy && "border-green-500 bg-green-50 text-green-700"
                            )}
                          />
                          {canCopy && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                        </div>
                        {canCopy && (
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => copyToClipboard(key.keys, key.id)}
                            disabled={isRotatingNow || isDeletingNow}
                            className="shrink-0 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {canCopy ? (
                        <p className="mt-2 text-xs text-green-600">
                          <Check className="inline h-3 w-3 mr-1" />
                          {t('keys.copied')}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <AlertCircle className="inline h-3 w-3 mr-1" />
                          {t('keys.masked')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Usage Guide */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">{t('keys.usageGuide')}</CardTitle>
              <CardDescription>{t('keys.usageGuideDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">1. {t('keys.externalApi')}</Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('keys.externalApiDescription')}
                </p>
                <pre className="mt-2 rounded-lg bg-muted p-4 text-xs overflow-x-auto">
                  <code>{`fetch('https://rertx.dpdns.org/api/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello' }
    ]
  })
})`}</code>
                </pre>
              </div>
              <div>
                <Label className="text-sm font-medium">3. {t('keys.curlExample')}</Label>
                <pre className="mt-2 rounded-lg bg-muted p-4 text-xs overflow-x-auto">
                  <code>{`curl -X POST https://rertx.dpdns.org/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "model": "@cf/qwen/qwen3-30b-a3b-fp8",
    "stream": true
  }'`}</code>
                </pre>
              </div>
              <div>
                <Label className="text-sm font-medium">4. {t('keys.pythonExample')}</Label>
                <pre className="mt-2 rounded-lg bg-muted p-4 text-xs overflow-x-auto">
                  <code>{`import requests

API_KEY = "YOUR_API_KEY"
API_URL = "https://rertx.dpdns.org/api/v1/chat"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "messages": [
        {"role": "user", "content": "Hello"}
    ],
    "stream": True
}

response = requests.post(API_URL, headers=headers, json=data)
print(response.text)`}</code>
                </pre>
              </div>
              <div>
                <Label className="text-sm font-medium">5. {t('keys.nodeExample')}</Label>
                <pre className="mt-2 rounded-lg bg-muted p-4 text-xs overflow-x-auto">
                  <code>{`const fetch = require('node-fetch');

const API_KEY = 'YOUR_API_KEY';
const API_URL = 'https://rertx.dpdns.org/api/v1/chat';

async function chat() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      stream: true
    })
  });
  
  const data = await response.text();
  console.log(data);
}

chat();`}</code>
                </pre>
              </div>
              <div>
                <Label className="text-sm font-medium">6. {t('keys.securityTips')}</Label>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t('keys.securityTip1')}</li>
                  <li>{t('keys.securityTip2')}</li>
                  <li>{t('keys.securityTip3')}</li>
                  <li>{t('keys.securityTip4')}</li>
                  <li>{t('keys.securityTip5')}</li>
                  <li>{t('keys.securityTip6')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  )
}
