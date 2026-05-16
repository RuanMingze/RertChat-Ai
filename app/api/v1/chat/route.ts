export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const CHAT_SERVER_URL = process.env.CHAT_SERVER_URL || 'https://chatapi.rertx.dpdns.org'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '缺少或无效的 Authorization header，格式应为：Bearer sk_xxx' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)

    const body = await request.json()
    const internalSecret = process.env.INTERNAL_CHAT_SECRET || 'internal-chat-secret-key'

    const response = await fetch(
      CHAT_SERVER_URL,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${internalSecret}`,
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Workers API error: ${response.status}` },
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
