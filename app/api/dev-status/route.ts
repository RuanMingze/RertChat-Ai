import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch('https://apidev.rertx.dpdns.org/', {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 502) {
      return NextResponse.json({
        status: 'resting',
        message: '开发服务器已关闭'
      })
    }

    if (response.ok) {
      return NextResponse.json({
        status: 'working',
        message: '开发服务器运行中'
      })
    }

    return NextResponse.json({
      status: 'resting',
      message: '服务器返回异常状态'
    })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    return NextResponse.json({
      status: 'resting',
      message: isTimeout ? '连接超时' : '无法连接到开发服务器'
    })
  }
}
