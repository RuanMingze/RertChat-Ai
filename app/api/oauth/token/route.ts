export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const OAUTH_TOKEN_URL = 'https://ruanftrix.cn/oauth/token'

export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    const clientId = process.env.OAUTH_CLIENT_ID
    const clientSecret = process.env.OAUTH_CLIENT_SECRET
    const expectedRedirectUri = process.env.OAUTH_REDIRECT_URI || redirect_uri

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'OAuth configuration error' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: expectedRedirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('OAuth token exchange failed:', error)
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: tokenResponse.status }
      )
    }

    const tokenData = await tokenResponse.json()
    return NextResponse.json(tokenData)
  } catch (error) {
    console.error('OAuth token exchange error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}