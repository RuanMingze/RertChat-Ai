"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useCustomChat } from "@/hooks/use-custom-chat"
import { ChatMessage } from "./chat-message"
import { ChatInput, ChatInputRef } from "./chat-input"
import { ChatHeader } from "./chat-header"
import { ChatSidebar } from "./chat-sidebar"
import { WelcomeScreen } from "./welcome-screen"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Conversation,
  createConversation,
  getConversationTitle,
  Message,
} from "@/lib/chat-store"
import { cn } from "@/lib/utils"
import { useGlobalKeyboard } from "@/hooks/use-keyboard-navigation"

export function ChatContainer() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<ChatInputRef>(null)

  const { messages, isLoading, sendMessage, stop, clearMessages, setMessages } = useCustomChat({
    onFinish: (message) => {
      if (currentConversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages.slice(0, -1), message],
                  title: getConversationTitle([...conv.messages.slice(0, -1), message]),
                  updatedAt: new Date(),
                }
              : conv
          )
        )
      }
    },
  })

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = useCallback(
    (content: string) => {
      let convId = currentConversationId

      if (!convId) {
        const newConv = createConversation()
        setConversations((prev) => [newConv, ...prev])
        setCurrentConversationId(newConv.id)
        convId = newConv.id
      }

      sendMessage(content)

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: [
                  ...conv.messages,
                  { id: Date.now().toString(), role: "user" as const, content, createdAt: new Date() },
                ],
                updatedAt: new Date(),
              }
            : conv
        )
      )
    },
    [currentConversationId, sendMessage]
  )

  const handleNewConversation = useCallback(() => {
    const newConv = createConversation()
    setConversations((prev) => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
    clearMessages()
    setSidebarOpen(false)
  }, [clearMessages])

  const handleSelectConversation = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id)
      if (conversation) {
        setCurrentConversationId(id)
        setMessages(conversation.messages)
        setSidebarOpen(false)
      }
    },
    [conversations, setMessages]
  )

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (currentConversationId === id) {
        setCurrentConversationId(null)
        clearMessages()
      }
    },
    [currentConversationId, clearMessages]
  )

  const handleRenameConversation = useCallback(
    (id: string, newName: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: newName, updatedAt: new Date() } : c
        )
      )
    },
    []
  )

  const handleClear = useCallback(() => {
    clearMessages()
    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [], updatedAt: new Date() }
            : conv
        )
      )
    }
  }, [currentConversationId, clearMessages])

  const handleEscape = useCallback(() => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }, [sidebarOpen])

  const handleFocusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  useGlobalKeyboard({
    onToggleSidebar: handleToggleSidebar,
    onNewConversation: handleNewConversation,
    onFocusInput: handleFocusInput,
    onClear: handleClear,
    onStop: stop,
    onEscape: handleEscape,
    enabled: true,
  })

  const syncMessages = useCallback(
    (newMessages: Message[]) => {
      if (currentConversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: newMessages,
                  title: getConversationTitle(newMessages),
                  updatedAt: new Date(),
                }
              : conv
          )
        )
      }
    },
    [currentConversationId]
  )

  useEffect(() => {
    if (messages.length > 0) {
      syncMessages(messages)
    }
  }, [messages, syncMessages])

  return (
    <div className="flex h-dvh bg-background">
      <ChatSidebar
        conversations={conversations}
        currentId={currentConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        onRename={handleRenameConversation}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />

      <main
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarOpen ? "md:ml-72" : "ml-0"
        )}
      >
        <ChatHeader onClear={handleClear} hasMessages={messages.length > 0} />

        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="mx-auto max-w-3xl px-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <ChatInput
          ref={inputRef}
          onSend={handleSend}
          onStop={stop}
          isLoading={isLoading}
        />
      </main>
    </div>
  )
}
