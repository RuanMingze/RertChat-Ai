"use client"

import { useState, useEffect, useRef } from "react"
import type { KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RenameDialogProps {
  isOpen: boolean
  currentName: string
  onConfirm: (newName: string) => void
  onCancel: () => void
  labels?: {
    title?: string
    placeholder?: string
    confirm?: string
    cancel?: string
  }
}

export function RenameDialog({ 
  isOpen, 
  currentName, 
  onConfirm, 
  onCancel,
  labels = {
    title: "重命名对话",
    placeholder: "请输入新的对话名称",
    confirm: "确定",
    cancel: "取消"
  }
}: RenameDialogProps) {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirm()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-foreground">{labels.title}</h3>
        
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={labels.placeholder}
          className="mb-4"
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="min-w-[80px]"
          >
            {labels.cancel}
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="min-w-[80px]"
          >
            {labels.confirm}
          </Button>
        </div>
      </div>
    </>
  )
}
