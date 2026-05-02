"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, Terminal, BookOpen, Globe, Key, Activity, Code, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

interface CodeBlockProps {
  code: string
  language?: string
}

function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code className="text-foreground">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

interface EndpointProps {
  method: string
  path: string
  description: string
  headers?: { name: string; value: string; required?: boolean }[]
  body?: object
  response?: object
  note?: string
  t?: (key: string) => string
}

function Endpoint({ method, path, description, headers, body, response, note, t }: EndpointProps) {
  const methodColors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-500 border-green-500/20",
    POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  }
  const translate = t || ((key: string) => key)

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn("text-xs font-medium", methodColors[method])}>
            {method}
          </Badge>
          <code className="text-sm font-mono text-muted-foreground">{path}</code>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {headers && headers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{translate('docs.requestHeaders')}</h4>
            <div className="space-y-1">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <code className="text-primary bg-primary/10 px-2 py-0.5 rounded">{header.name}</code>
                  <span className="text-muted-foreground">:</span>
                  <code className="text-muted-foreground bg-muted px-2 py-0.5 rounded">{header.value}</code>
                  {header.required && <Badge variant="secondary" className="text-xs">{translate('docs.required')}</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {body && (
          <div>
            <h4 className="text-sm font-medium mb-2">{translate('docs.requestBody')}</h4>
            <CodeBlock code={JSON.stringify(body, null, 2)} language="json" />
          </div>
        )}

        {response && (
          <div>
            <h4 className="text-sm font-medium mb-2">{translate('docs.responseExample')}</h4>
            <CodeBlock code={JSON.stringify(response, null, 2)} language="json" />
          </div>
        )}

        {note && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>{translate('docs.note')}：</strong>{note}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('docs.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('docs.description')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {t('docs.overview')}
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <Terminal className="h-4 w-4" />
              {t('docs.chatApi')}
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <Activity className="h-4 w-4" />
              {t('docs.status')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('docs.quickStart')}</CardTitle>
                <CardDescription>{t('docs.quickStartDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">{t('docs.step1Title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('docs.step1Description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">{t('docs.step2Title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('docs.step2Description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">{t('docs.step3Title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('docs.step3Description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('docs.authentication')}</CardTitle>
                <CardDescription>{t('docs.authenticationDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('docs.authenticationDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('docs.baseUrl')}</CardTitle>
                <CardDescription>{t('docs.baseUrlDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t('docs.production')}</Badge>
                    <code className="text-sm">https://rertx.dpdns.org</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t('docs.development')}</Badge>
                    <code className="text-sm">http://apidev.rertx.dpdns.org</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('docs.errorResponse')}</CardTitle>
                <CardDescription>{t('docs.errorResponseDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={JSON.stringify({
                    error: "错误描述信息",
                    status: 400
                  }, null, 2)}
                  language="json"
                />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold text-green-500">200</div>
                    <div className="text-xs text-muted-foreground">{t('docs.success')}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold text-orange-500">400</div>
                    <div className="text-xs text-muted-foreground">{t('docs.badRequest')}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold text-red-500">401</div>
                    <div className="text-xs text-muted-foreground">{t('docs.unauthorized')}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold text-red-500">500</div>
                    <div className="text-xs text-muted-foreground">{t('docs.serverError')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('docs.chatApiTitle')}</h2>
            </div>

            <Endpoint
              method="POST"
              path="/api/v1/chat"
              description={t('docs.chatEndpointDescription')}
              headers={[
                { name: "Authorization", value: "Bearer YOUR_API_KEY", required: true },
                { name: "Content-Type", value: "application/json", required: true },
              ]}
              body={{
                messages: [
                  { role: "user", content: "你好，请介绍一下自己" }
                ],
                model: "@cf/qwen/qwen3-30b-a3b-fp8",
                stream: true
              }}
              response={{
                choices: [
                  {
                    delta: {
                      content: "你好！我是 RertChat AI..."
                    },
                    index: 0,
                    finish_reason: null
                  }
                ]
              }}
              note={t('docs.streamNote')}
              t={t}
            />

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">{t('docs.requestParameters')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">messages</code>
                    <div>
                      <div className="text-sm font-medium">{t('docs.messages')}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('docs.messagesDescription')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">model</code>
                    <div>
                      <div className="text-sm font-medium">{t('docs.model')}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('docs.modelDescription')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">stream</code>
                    <div>
                      <div className="text-sm font-medium">{t('docs.stream')}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('docs.streamDescription')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">{t('docs.streamResponse')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`data: {"choices":[{"delta":{"content":"你"},"index":0,"finish_reason":null}]}

data: {"choices":[{"delta":{"content":"好"},"index":0,"finish_reason":null}]}

data: {"choices":[{"delta":{"content":"！"},"index":0,"finish_reason":null}]}

data: [DONE]`}
                  language="json"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('docs.statusApiTitle')}</h2>
            </div>

            <Endpoint
              method="GET"
              path="/api/dev-status"
              description={t('docs.statusEndpointDescription')}
              response={{
                status: "working",
                message: "开发服务器运行中"
              }}
              note={t('docs.statusNote')}
              t={t}
            />

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">{t('docs.responseStatus')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">{t('docs.working')}</Badge>
                    <span className="text-sm">{t('docs.workingDescription')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500">{t('docs.resting')}</Badge>
                    <span className="text-sm">{t('docs.restingDescription')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t('docs.lastUpdated')}：2026-05-02
            </div>
            <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {t('docs.backToTop')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
