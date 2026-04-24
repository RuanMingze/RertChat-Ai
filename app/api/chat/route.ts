export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔵 [API Chat] Received POST request')
  console.log(' [API Chat] Request URL:', request.url)
  console.log('🔵 [API Chat] Request headers:', Object.fromEntries(request.headers))
  
  try {
    const body = await request.json()
    console.log('🔵 [API Chat] Request body:', JSON.stringify(body, null, 2))
    
    const { messages, model = '@cf/qwen/qwen3-30b-a3b-fp8', stream = true } = body
    
    console.log('🔵 [API Chat] Parsed messages:', messages)
    console.log('🔵 [API Chat] Model:', model)
    console.log('🔵 [API Chat] Stream:', stream)

    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID

    console.log('🔵 [API Chat] Env vars loaded:')
    console.log('  - Token exists:', !!cloudflareApiToken)
    console.log('  - Token prefix:', cloudflareApiToken ? cloudflareApiToken.substring(0, 10) + '...' : 'N/A')
    console.log('  - Account ID:', cloudflareAccountId)

    if (!cloudflareApiToken || !cloudflareAccountId) {
      console.error('🔴 [API Chat] Cloudflare API configuration missing')
      return NextResponse.json(
        { error: 'Cloudflare API configuration missing' },
        { status: 500 }
      )
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${model}`
    console.log('🟢 [API Chat] Calling Cloudflare API:', apiUrl)
    
    const fetchBody = JSON.stringify({
      messages,
      stream,
    })
    console.log('🟢 [API Chat] Fetch body:', fetchBody)

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

    console.log('🟢 [API Chat] Cloudflare response status:', response.status)
    console.log('🟢 [API Chat] Cloudflare response headers:', Object.fromEntries(response.headers))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Chat] Cloudflare API error:', errorText)
      return NextResponse.json(
        { error: `Cloudflare API error: ${response.status}` },
        { status: response.status }
      )
    }

    console.log('🟢 [API Chat] Returning streaming response')
    
    // 返回流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('🔴 [API Chat] API route error:', error)
    console.error('🔴 [API Chat] Error stack:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
