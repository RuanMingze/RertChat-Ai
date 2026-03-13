export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function createMessage(role: "user" | "assistant", content: string): Message {
  return {
    id: generateId(),
    role,
    content,
    createdAt: new Date(),
  }
}

export function createConversation(title: string = "新对话"): Conversation {
  return {
    id: generateId(),
    title,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function getConversationTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((m) => m.role === "user")
  if (firstUserMessage) {
    return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
  }
  return "新对话"
}
