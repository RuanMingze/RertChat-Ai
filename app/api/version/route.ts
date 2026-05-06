import { NextResponse } from 'next/server'
import packageJson from '@/package.json'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ version: packageJson.version })
}