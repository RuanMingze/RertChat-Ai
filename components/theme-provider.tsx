"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useTheme as useNextTheme } from "next-themes"
import { getSettings, saveSettings, type Settings } from "@/lib/chat-db"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 从设置中加载主题
    getSettings()
      .then((settings: Settings) => {
        if (settings.theme !== nextTheme) {
          setNextTheme(settings.theme)
        }
      })
      .catch(() => {
        // 如果加载失败，使用默认主题
        setNextTheme("dark")
      })
      .finally(() => {
        setMounted(true)
      })
  }, [nextTheme, setNextTheme])

  const setTheme = async (newTheme: Theme) => {
    setNextTheme(newTheme)
    // 保存主题设置到 IndexedDB
    try {
      const settings = await getSettings()
      await saveSettings({ ...settings, theme: newTheme })
    } catch (error) {
      console.error("Failed to save theme:", error)
    }
  }

  // 使用 resolvedTheme 作为实际主题
  const currentTheme = (resolvedTheme || nextTheme) as Theme

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
