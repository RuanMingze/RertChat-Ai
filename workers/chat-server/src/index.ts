/**
 * RertChat AI Chat Server - Cloudflare Workers 版本
 * 
 * 安全特性：
 * - 使用 Cloudflare Secrets 管理敏感信息
 * - 支持自动轮换 Secret
 * - 不暴露任何密钥到客户端
 * 
 * 部署命令：
 * 1. wrangler login
 * 2. wrangler secret put CLOUDFLARE_API_TOKEN
 * 3. wrangler secret put CLOUDFLARE_ACCOUNT_ID
 * 4. wrangler deploy
 * 
 * 轮换 Secret：
 * wrangler secret put CLOUDFLARE_API_TOKEN
 */

export interface Env {
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  // 可选：内部 secret 验证
  INTERNAL_SECRET?: string
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // 处理 CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    // 只接受 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      // 验证 Authorization header
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('🔴 [Workers Chat] Missing Authorization header')
        return new Response(
          JSON.stringify({ error: '缺少 Authorization header' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      const token = authHeader.substring(7)
      
      // 如果设置了 INTERNAL_SECRET，则验证 token
      if (env.INTERNAL_SECRET && token !== env.INTERNAL_SECRET) {
        console.error('🔴 [Workers Chat] Invalid token')
        return new Response(
          JSON.stringify({ error: '无效的认证 token' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('🟢 [Workers Chat] Authorization verified')

      // 解析请求体
      const body = await request.json()
      const { messages, model = '@cf/qwen/qwen3-30b-a3b-fp8', stream = true } = body

      console.log('🔵 [Workers Chat] Received request:', {
        messages_count: messages?.length || 0,
        model,
        stream
      })

      // 调用 Cloudflare AI API
      const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`
      
      const fetchBody = JSON.stringify({
        messages,
        stream,
      })

      const response = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: fetchBody,
        }
      )

      console.log('🟢 [Workers Chat] Cloudflare API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔴 [Workers Chat] Cloudflare API error:', errorText)
        return new Response(
          JSON.stringify({ error: `Cloudflare API error: ${response.status}` }),
          { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // 返回流式响应
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (error) {
      console.error('🔴 [Workers Chat] Error:', error)
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  },
}
