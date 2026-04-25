"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  children: React.ReactNode
}

export function ContextMenu({ x, y, onClose, children }: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ x, y })

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("scroll", handleScroll, true)

    // 检查是否超出屏幕边界
    const menuWidth = 200
    const menuHeight = 100
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    if (x + menuWidth > screenWidth) {
      setPosition((prev) => ({ ...prev, x: x - menuWidth }))
    }
    if (y + menuHeight > screenHeight) {
      setPosition((prev) => ({ ...prev, y: y - menuHeight }))
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("scroll", handleScroll, true)
    }
  }, [onClose, x, y])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ left: position.x, top: position.y }}
    >
      {children}
    </div>
  )
}

interface ContextMenuItemProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function ContextMenuItem({ onClick, children, className }: ContextMenuItemProps) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
