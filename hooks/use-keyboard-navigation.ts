"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface KeyboardNavigationItem {
  id: string
  label: string
  disabled?: boolean
}

export interface UseKeyboardNavigationOptions {
  items: KeyboardNavigationItem[]
  onSelect?: (item: KeyboardNavigationItem) => void
  onCancel?: () => void
  enabled?: boolean
  loop?: boolean
  vertical?: boolean
}

export interface UseKeyboardNavigationReturn {
  activeIndex: number
  setActiveIndex: (index: number) => void
  handleKeyDown: (e: KeyboardEvent) => void
  reset: () => void
  isNavigating: boolean
}

export function useKeyboardNavigation({
  items,
  onSelect,
  onCancel,
  enabled = true,
  loop = true,
  vertical = true,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isNavigating, setIsNavigating] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  const reset = useCallback(() => {
    setActiveIndex(-1)
    setIsNavigating(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      const enabledItems = items.filter((item) => !item.disabled)
      if (enabledItems.length === 0) return

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault()
          setIsNavigating(true)
          setActiveIndex((prev) => {
            let next = vertical ? prev + 1 : prev + 1
            if (loop) {
              next = next >= enabledItems.length ? 0 : next
            } else {
              next = Math.min(next, enabledItems.length - 1)
            }
            return items.findIndex((item) => item.id === enabledItems[next].id)
          })
          break

        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault()
          setIsNavigating(true)
          setActiveIndex((prev) => {
            let next = vertical ? prev - 1 : prev - 1
            if (loop) {
              next = next < 0 ? enabledItems.length - 1 : next
            } else {
              next = Math.max(next, 0)
            }
            return items.findIndex((item) => item.id === enabledItems[next].id)
          })
          break

        case "Enter":
        case " ":
          e.preventDefault()
          if (activeIndex >= 0 && activeIndex < items.length) {
            const item = items[activeIndex]
            if (!item.disabled && onSelect) {
              onSelect(item)
              reset()
            }
          }
          break

        case "Escape":
          e.preventDefault()
          if (onCancel) {
            onCancel()
          }
          reset()
          break

        case "Home":
          e.preventDefault()
          setIsNavigating(true)
          setActiveIndex(0)
          break

        case "End":
          e.preventDefault()
          setIsNavigating(true)
          setActiveIndex(items.length - 1)
          break
      }
    },
    [enabled, items, activeIndex, onSelect, onCancel, reset, loop, vertical]
  )

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    reset,
    isNavigating,
  }
}

export interface UseGlobalKeyboardOptions {
  onToggleSidebar?: () => void
  onNewConversation?: () => void
  onFocusInput?: () => void
  onClear?: () => void
  onStop?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useGlobalKeyboard({
  onToggleSidebar,
  onNewConversation,
  onFocusInput,
  onClear,
  onStop,
  onEscape,
  enabled = true,
}: UseGlobalKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      const isMod = e.ctrlKey || e.metaKey
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (isMod && e.key === "b") {
        e.preventDefault()
        if (onToggleSidebar) onToggleSidebar()
        return
      }

      if (isMod && e.key === "n") {
        e.preventDefault()
        if (onNewConversation) onNewConversation()
        return
      }

      if (isMod && e.key === "k") {
        e.preventDefault()
        if (onFocusInput) onFocusInput()
        return
      }

      if (isMod && e.key === "l") {
        e.preventDefault()
        if (onClear) onClear()
        return
      }

      if (e.key === "Escape") {
        e.preventDefault()
        if (isInputFocused) {
          if (onEscape) onEscape()
        } else if (onEscape) {
          onEscape()
        }
        return
      }

      if (!isInputFocused && e.key === "/" && !e.shiftKey && !e.altKey && !isMod) {
        e.preventDefault()
        if (onFocusInput) onFocusInput()
        return
      }
    },
    [enabled, onToggleSidebar, onNewConversation, onFocusInput, onClear, onStop, onEscape]
  )

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
