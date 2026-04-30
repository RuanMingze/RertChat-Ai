"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, Terminal, BookOpen, Globe, Key, Activity, Code, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

function Endpoint({ method, path, description, headers, body, response, note }: EndpointProps) {
  const methodColors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-500 border-green-500/20",
    POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  }

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
            <h4 className="text-sm font-medium mb-2">请求头</h4>
            <div className="space-y-1">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <code className="text-primary bg-primary/10 px-2 py-0.5 rounded">{header.name}</code>
                  <span className="text-muted-foreground">:</span>
                  <code className="text-muted-foreground bg-muted px-2 py-0.5 rounded">{header.value}</code>
                  {header.required && <Badge variant="secondary" className="text-xs">必填</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {body && (
          <div>
            <h4 className="text-sm font-medium mb-2">请求体</h4>
            <CodeBlock code={JSON.stringify(body, null, 2)} language="json" />
          </div>
        )}

        {response && (
          <div>
            <h4 className="text-sm font-medium mb-2">响应示例</h4>
            <CodeBlock code={JSON.stringify(response, null, 2)} language="json" />
          </div>
        )}

        {note && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>注意：</strong>{note}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">API 文档</h1>
          </div>
          <p className="text-muted-foreground">
            RertChat 提供完整的 RESTful API，支持流式输出、多轮对话上下文
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview" className="gap-2">
              <BookOpen className="h-4 w-4" />
              概述
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <Terminal className="h-4 w-4" />
              聊天 API
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="h-4 w-4" />
              密钥管理
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <Activity className="h-4 w-4" />
              状态监控
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>快速开始</CardTitle>
                <CardDescription>使用 API 的基本步骤</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">获取 API Key</h4>
                    <p className="text-sm text-muted-foreground">
                      在设置页面或通过 API 创建您的个人 API Key
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">发送请求</h4>
                    <p className="text-sm text-muted-foreground">
                      使用 Bearer Token 认证，发送聊天请求
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">接收响应</h4>
                    <p className="text-sm text-muted-foreground">
                      支持流式（SSE）和非流式两种响应模式
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>认证方式</CardTitle>
                <CardDescription>API 认证说明</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  所有 API 请求都需要在 Header 中包含 Authorization 字段，使用 Bearer Token 方式认证。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>基础 URL</CardTitle>
                <CardDescription>API 端点地址</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">生产环境</Badge>
                    <code className="text-sm">https://rertx.dpdns.org</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">本地开发</Badge>
                    <code className="text-sm">http://localhost:3000</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>错误响应</CardTitle>
                <CardDescription>标准错误格式</CardDescription>
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
                    <div className="text-xs text-muted-foreground">成功</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold text-orange-500">400</div>
                    <div className="text-xs text-muted-foreground">请求错误</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold text-red-500">401</div>
                    <div className="text-xs text-muted-foreground">认证失败</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold text-red-500">500</div>
                    <div className="text-xs text-muted-foreground">服务器错误</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">聊天 API</h2>
            </div>

            <Endpoint
              method="POST"
              path="/api/chat"
              description="内部聊天接口，需要 INTERNAL_CHAT_SECRET 进行认证"
              headers={[
                { name: "Authorization", value: "Bearer INTERNAL_CHAT_SECRET", required: true },
                { name: "Content-Type", value: "application/json", required: true },
              ]}
              body={{
                messages: [
                  { role: "user", content: "你好" }
                ],
                model: "@cf/qwen/qwen3-30b-a3b-fp8",
                stream: true
              }}
              response={{
                data: "流式响应内容..."
              }}
              note="此接口仅供前端内部使用，不对外开放"
            />

            <Endpoint
              method="POST"
              path="/api/v1/chat"
              description="对外公开的聊天 API 接口，需要有效的 API Key 进行认证"
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
              note="支持流式输出（SSE）和非流式两种模式。通过设置 stream: true 开启流式输出"
            />

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">请求参数说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">messages</code>
                    <div>
                      <div className="text-sm font-medium">消息数组</div>
                      <div className="text-xs text-muted-foreground">
                        包含对话历史，每条消息有 role（user/assistant/system）和 content 字段
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">model</code>
                    <div>
                      <div className="text-sm font-medium">AI 模型</div>
                      <div className="text-xs text-muted-foreground">
                        默认为 @cf/qwen/qwen3-30b-a3b-fp8，支持其他 Cloudflare AI 模型
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">stream</code>
                    <div>
                      <div className="text-sm font-medium">流式输出</div>
                      <div className="text-xs text-muted-foreground">
                        true 开启流式输出（Server-Sent Events），false 返回完整响应
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">流式响应格式</CardTitle>
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

          <TabsContent value="keys" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">密钥管理 API</h2>
            </div>

            <Endpoint
              method="GET"
              path="/api/keys"
              description="获取当前用户的所有 API Keys"
              headers={[
                { name: "Content-Type", value: "application/json", required: true },
              ]}
              response={[
                {
                  id: "user@example.com-1",
                  user_email: "user@example.com",
                  keys: "sk_xxxxxxxxxxxxxx"
                }
              ]}
            />

            <Endpoint
              method="POST"
              path="/api/keys"
              description="为当前用户创建新的 API Key"
              headers={[
                { name: "Content-Type", value: "application/json", required: true },
              ]}
              body={{
                email: "user@example.com"
              }}
              response={{
                id: "user@example.com-2",
                user_email: "user@example.com",
                keys: "sk_yyyyyyyyyyyyyy"
              }}
              note="创建后请妥善保管，API Key 只会返回一次"
            />

            <Endpoint
              method="DELETE"
              path="/api/keys?id=user@example.com-1&email=user@example.com"
              description="删除指定的 API Key"
              headers={[
                { name: "Content-Type", value: "application/json", required: true },
              ]}
              response={{
                success: true
              }}
            />
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">状态监控 API</h2>
            </div>

            <Endpoint
              method="GET"
              path="/api/dev-status"
              description="检查开发服务器状态"
              response={{
                status: "working",
                message: "开发服务器运行中"
              }}
              note="用于前端显示开发服务器连接状态"
            />

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">响应状态说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">working</Badge>
                    <span className="text-sm">开发服务器正常运行</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500">resting</Badge>
                    <span className="text-sm">开发服务器已关闭或无法连接</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              最后更新：2026-04-30
            </div>
            <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              返回顶部
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
