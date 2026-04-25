"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface RenameDialogProps {
  isOpen: boolean
  currentName: string
  onConfirm: (newName: string) => void
  onCancel: () => void
}

export function RenameDialog({ isOpen, currentName, onConfirm, onCancel }: RenameDialogProps) {
  const [name, setName] = useState(currentName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  useEffect(() => {
    setName(currentName)
  }, [currentName])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-foreground">重命名对话</h3>
        
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入新的对话名称"
          className="mb-4"
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="min-w-[80px]"
          >
            取消
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="min-w-[80px]"
          >
            确定
          </Button>
        </div>
      </div>
    </>
  )
}
