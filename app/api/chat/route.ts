export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔵 [API Chat] Received POST request')
  
  try {
    const body = await request.json()
    const { messages, model = '@cf/qwen/qwen3-30b-a3b-fp8' } = body
    
    const workersUrl = process.env.CHAT_SERVER_URL || 'https://chatapi.rertx.dpdns.org'
    const internalSecret = process.env.INTERNAL_CHAT_SECRET
    
    console.log('🟢 [API Chat] Forwarding to Workers:', workersUrl)
    
    const fetchBody = JSON.stringify({
      messages,
      stream: true,
    })

    const response = await fetch(
      workersUrl,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${internalSecret}`,
          'Content-Type': 'application/json',
        },
        body: fetchBody,
      }
    )

    console.log('🟢 [API Chat] Workers response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 [API Chat] Workers API error:', errorText)
      console.error('🔴 [API Chat] Error response parsed:', JSON.parse(errorText).error || errorText)
      return NextResponse.json(
        { error: `Workers API error: ${response.status} - ${JSON.parse(errorText).error || errorText}` },
        { status: response.status }
      )
    }

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