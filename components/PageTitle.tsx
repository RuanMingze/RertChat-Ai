"use client"

import { useEffect, useRef, useState, type EffectCallback } from 'react'
import { useI18n } from '@/lib/i18n'

interface PageTitleProps {
  titleKey?: string
  title?: string
}

export function PageTitle({ titleKey, title }: PageTitleProps) {
  const { t } = useI18n()
  const isInitialized = useRef(false)
  const hasSetTitle = useRef(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return

    const finalTitle = titleKey ? t(titleKey) : title

    if (!finalTitle) return
    if (finalTitle === titleKey) return
    if (hasSetTitle.current) return
    if (isInitialized.current && document.title === finalTitle) return

    isInitialized.current = true
    hasSetTitle.current = true
    document.title = finalTitle
  }, [titleKey, title, t, isReady])

  return null
}
