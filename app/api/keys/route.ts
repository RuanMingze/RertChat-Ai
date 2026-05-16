import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const WORKERS_API_URL = process.env.NEXT_PUBLIC_KEYS_API_URL || 'https://api.rertx.dpdns.org'
const WORKERS_API_KEY = process.env.WORKERS_API_KEY

// GET /api/keys - 获取用户的所有 API Keys
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: '缺少 email 参数' },
        { status: 400 }
      )
    }

    const response = await fetch(`${WORKERS_API_URL}/keys?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKERS_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || '获取失败' },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('获取 API Keys 异常:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// POST /api/keys - 创建新的 API Key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: '缺少 email 参数' },
        { status: 400 }
      )
    }

    const response = await fetch(`${WORKERS_API_URL}/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKERS_API_KEY}`,
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || '创建失败' },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('创建 API Key 异常:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/keys - 删除 API Key
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyId = searchParams.get('id')
    const email = searchParams.get('email')

    if (!keyId || !email) {
      return NextResponse.json(
        { error: '缺少 id 或 email 参数' },
        { status: 400 }
      )
    }

    const response = await fetch(`${WORKERS_API_URL}/keys?id=${encodeURIComponent(keyId)}&email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKERS_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || '删除失败' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除 API Key 异常:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// PUT /api/keys - 轮转 API Key
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyId, email } = body

    if (!keyId || !email) {
      return NextResponse.json(
        { error: '缺少参数' },
        { status: 400 }
      )
    }

    const response = await fetch(`${WORKERS_API_URL}/keys`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKERS_API_KEY}`,
      },
      body: JSON.stringify({ keyId, email }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || '轮转失败' },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('轮转 API Key 异常:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
