export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  console.log('🔵 [API v1 Chat] Received POST request')
  console.log(' [API v1 Chat] Request URL:', request.url)
  
  try {
    // 1. 验证 API Key
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('🔴 [API v1 Chat] Missing or invalid Authorization header')
      return NextResponse.json(
        { error: '缺少或无效的 Authorization header，格式应为：Bearer sk_xxx' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7) // 移除 'Bearer ' 前缀
    console.log('🔵 [API v1 Chat] API Key prefix:', apiKey.substring(0, 10) + '...')

    // 2. 在数据库中验证 API Key
    const { data: allRecords, error: fetchError } = await supabaseAdmin
      .from('keys')
      .select('keys')

    if (fetchError) {
      console.error('🔴 [API v1 Chat] 查询数据库失败:', fetchError)
      return NextResponse.json(
        { error: '服务器内部错误' },
        { status: 500 }
      )
    }

    // 3. 解析所有用户的 keys，查找匹配的 key
    let foundUserEmail: string | null = null
    for (const record of allRecords || []) {
      if (!record.keys) continue

      const parts = record.keys.split(',').map((p: string) => p.trim())
      for (let i = 0; i < parts.length; i += 4) {
        if (i + 3 < parts.length && parts[i] === 'id' && parts[i + 2] === 'key') {
          const keyValue = parts[i + 3]
          if (keyValue === apiKey) {
            foundUserEmail = (record as any)['user-email'] as string
            break
          }
        }
      }
      if (foundUserEmail) break
    }

    if (!foundUserEmail) {
      console.error('🔴 [API v1 Chat] API Key 无效')
      return NextResponse.json(
        { error: '无效的 API Key' },
        { status: 401 }
      )
    }

    console.log('🟢 [API v1 Chat] API Key 验证成功，用户:', foundUserEmail)

    // 4. API Key 验证通过，处理聊天请求
    const body = await request.json()
    console.log('🔵 [API v1 Chat] Request body:', JSON.stringify(body, null, 2))
    
    const { messages, model = '@cf/qwen/qwen3-30b-a3b-fp8', stream = true } = body
    
    console.log('🔵 [API v1 Chat] Parsed messages:', messages)
    console.log('🔵 [API v1 Chat] Model:', model)
    console.log('🔵 [API v1 Chat] Stream:', stream)

    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID

    console.log('🔵 [API v1 Chat] Env vars loaded:')
    console.log('  - Token exists:', !!cloudflareApiToken)
    console.log('  - Token prefix:', cloudflareApiToken ? cloudflareApiToken.substring(0, 10) + '...' : 'N/A')
    console.log('  - Account ID:', cloudflareAccountId)

    if (!cloudflareApiToken || !cloudflareAccountId) {
      console.error('🔴 [API v1 Chat] Cloudflare API configuration missing')
      return NextResponse.json(
        { error: 'Cloudflare API configuration missing' },
        { status: 500 }
      )
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${model}`
    console.log('🟢 [API v1 Chat] Calling Cloudflare API:', apiUrl)
    
    const fetchBody = JSON.stringify({
      messages,
      stream,
    })
    console.log('🟢 [API v1 Chat] Fetch body:', fetchBody)

    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
        body: fetchBody,
      }
    )

    console.log('🟢 [API v1 Chat] Cloudflare response status:', response.status)
    console.log('🟢 [API v1 Chat] Cloudflare response headers:', Object.fromEntries(response.headers))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API v1 Chat] Cloudflare API error:', errorText)
      return NextResponse.json(
        { error: `Cloudflare API error: ${response.status}` },
        { status: response.status }
      )
    }

    console.log('🟢 [API v1 Chat] Returning streaming response')
    
    // 返回流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('🔴 [API v1 Chat] API route error:', error)
    console.error('🔴 [API v1 Chat] Error stack:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
