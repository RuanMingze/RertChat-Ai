"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getSettings, type Settings } from "@/lib/chat-db"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 从设置中加载主题
    getSettings()
      .then((settings: Settings) => {
        setThemeState(settings.theme)
      })
      .catch(() => {
        // 如果加载失败，使用默认主题
        setThemeState("dark")
      })
      .finally(() => {
        setMounted(true)
      })
  }, [])

  useEffect(() => {
    if (mounted) {
      // 更新 html 标签的 class
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // 防止闪烁，在加载完成前不渲染
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
