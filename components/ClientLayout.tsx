"use client"

import { useEffect, useState, type ReactNode } from 'react'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    setHasInitialized(true)
  }, [])

  if (!hasInitialized) {
    return null
  }

  return <>{children}</>
}
