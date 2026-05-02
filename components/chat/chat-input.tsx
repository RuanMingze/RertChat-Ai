/* eslint-disable no-undef */
"use client"
import { SpeechRecognition } from "@/types/speech-recognition"

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Square, Mic, Code, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

export interface ChatInputRef {
  focus: () => void
}

interface ChatInputProps {
  onSend: (message: string) => void
  onStop: () => void
  isLoading: boolean
  disabled?: boolean
  programmingMode?: boolean
  onToggleProgrammingMode?: () => void
  deepThinkingMode?: boolean
  onToggleDeepThinkingMode?: () => void
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
  programmingMode = false,
  onToggleProgrammingMode,
  deepThinkingMode = false,
  onToggleDeepThinkingMode,
}, ref) {
  const { t, locale } = useI18n()
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [showAIWarning, setShowAIWarning] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus()
    },
  }), [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [input])

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('ai-chat-settings')
      if (storedSettings) {
        const settings = JSON.parse(storedSettings)
        setShowAIWarning(settings.showAIWarning !== false)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition() as SpeechRecognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = locale

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1]
        if (result && result.isFinal) {
          setInput((prev) => prev + result[0].transcript)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("语音识别错误:", event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleSubmit = () => {
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (isLoading) {
        onStop()
      } else {
        handleSubmit()
      }
    }
  }

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      console.error("Browser does not support speech recognition")
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (error) {
        console.error("启动语音识别失败:", error)
      }
    }
  }

  return (
    <div className="bg-background p-4" data-testid="chat-input-container">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex gap-2">
          {onToggleProgrammingMode && (
            <Button
              variant={programmingMode ? "default" : "ghost"}
              size="sm"
              onClick={onToggleProgrammingMode}
              className="gap-2 border border-border"
            >
              <Code className="h-4 w-4" />
              {t('modes.programmingMode')}
            </Button>
          )}
          {onToggleDeepThinkingMode && (
            <Button
              variant={deepThinkingMode ? "default" : "ghost"}
              size="sm"
              onClick={onToggleDeepThinkingMode}
              className="gap-2 border border-border"
            >
              <Brain className="h-4 w-4" />
              {t('modes.deepThinkingMode')}
            </Button>
          )}
        </div>
        <div className="relative rounded-2xl border border-border bg-card p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring" data-testid="input-wrapper">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.typeMessage')}
            disabled={disabled}
            rows={2}
            className={cn(
              "max-h-[200px] min-h-[80px] w-full resize-none border-0 bg-transparent px-3 py-3 pr-20",
              "text-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-0"
            )}
            data-testid="textarea"
          />
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1" data-testid="buttons-container">
            <Button
              onClick={handleVoiceInput}
              disabled={disabled}
              size="icon"
              variant="ghost"
              type="button"
              className={cn(
                "h-10 w-10 shrink-0 rounded-lg transition-all",
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
              data-testid="voice-button"
            >
              <Mic className="h-6 w-6" />
            </Button>
            <Button
              onClick={isLoading ? onStop : handleSubmit}
              disabled={!isLoading && (!input.trim() || disabled)}
              size="icon"
              type="button"
              className={cn(
                "h-9 w-9 shrink-0 rounded-xl transition-all",
                isLoading
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
              )}
              data-testid="send-button"
            >
              {isLoading ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        {showAIWarning && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t('chat.aiWarning')}
          </p>
        )}
      </div>
    </div>
  )
})
