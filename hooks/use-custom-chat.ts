/* eslint-disable no-unused-vars */
"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Message, createMessage, generateId } from "@/lib/chat-store"
import { getSettings, type Settings } from "@/lib/chat-db"

interface UseCustomChatOptions {
  api?: string
  onError?: (error: Error) => void
  onFinish?: (message: Message) => void
}

export function useCustomChat(options: UseCustomChatOptions = {}) {
  const { api = "/api/chat", onError, onFinish } = options
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [settings, setSettings] = useState<Settings>({
    id: 'default',
    aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
    theme: 'dark',
    autoRedirectToRecent: true,
    showLoadingScreen: true,
    notificationsEnabled: false,
    useTraditionalNavigation: true,
    soundEnabled: true,
    showAIWarning: true
  })
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getSettings()
        setSettings(loadedSettings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage = createMessage("user", content)
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setIsLoading(true)
      setError(null)

      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            model: settings.aiModel,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.error || `HTTP error! status: ${response.status}`)
        }

        if (true) {
          // 流式响应处理
          const reader = response.body?.getReader()
          if (!reader) throw new Error("No response body")

          const decoder = new TextDecoder()
          let fullContent = ""

          let reading = true
          while (reading) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith("data:")) continue
              
              const data = trimmed.slice(5).trim()
              if (data === "[DONE]") continue

              try {
                const json = JSON.parse(data)
                const delta = json.choices?.[0]?.delta?.content
                if (delta) {
                  fullContent += delta
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    const lastIndex = newMessages.length - 1
                    if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
                      newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        content: fullContent,
                      }
                    }
                    return newMessages
                  })
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }

          const finalMessage = { ...assistantMessage, content: fullContent }
          onFinish?.(finalMessage)
        } else {
          // 非流式响应处理
          const result = await response.json()
          const fullContent = result.choices?.[0]?.message?.content || result.response || result.text || ""
          
          if (!fullContent) {
            throw new Error("Empty response from server")
          }

          setMessages((prev) => {
            const newMessages = [...prev]
            const lastIndex = newMessages.length - 1
            if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: fullContent,
              }
            }
            return newMessages
          })

          const finalMessage = { ...assistantMessage, content }
          onFinish?.(finalMessage)
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return
        }
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        onError?.(error)
        
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastIndex = newMessages.length - 1
          if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant" && !newMessages[lastIndex].content) {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: "抱歉，发生了错误，请稍后重试。",
            }
          }
          return newMessages
        })
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [api, messages, isLoading, onError, onFinish, settings]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const setInitialMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stop,
    clearMessages,
    setMessages: setInitialMessages,
    isStreaming: true,
  }
}