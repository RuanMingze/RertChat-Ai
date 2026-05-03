'use client'

import { PageTitle } from "@/components/PageTitle"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function AppDevViewPage() {
  const { t } = useI18n()

  return (
    <>
      <PageTitle titleKey="meta.appdev" />
      <div className="fixed inset-0 bg-background">
      <Link
        href="/appdev"
        className="absolute left-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-background/80 px-3 py-2 text-sm backdrop-blur hover:bg-background transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t('keyboardShortcuts.back')}</span>
      </Link>
      <iframe
        src="https://apidev.rertx.dpdns.org"
        className="w-full h-full border-0"
        title={t('appdev.title')}
      />
    </div>
    </>
  )
}