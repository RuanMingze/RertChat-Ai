'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AppDevViewPage() {
  return (
    <div className="fixed inset-0 bg-background">
      <iframe
        src="https://apidev.rertx.dpdns.org"
        className="w-full h-full border-0"
        title="开发进度追踪"
      />
    </div>
  )
}
