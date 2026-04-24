// IndexedDB 数据库封装

const DB_NAME = 'ai-chat-db'
const DB_VERSION = 4
const STORE_NAME = 'conversations'
const SETTINGS_STORE_NAME = 'settings'
const USER_STORE_NAME = 'user'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface Settings {
  id: string
  streamingEnabled: boolean
  aiModel: string
  theme: 'light' | 'dark'
  autoRedirectToRecent: boolean
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url: string
  has_beta_access: boolean
}

let dbInstance: IDBDatabase | null = null

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
        db.createObjectStore(USER_STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function getAllConversations(): Promise<Conversation[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const conversations = request.result as Conversation[]
      // 按更新时间降序排列
      conversations.sort((a, b) => b.updatedAt - a.updatedAt)
      resolve(conversations)
    }
  })
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(conversation)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function deleteConversation(id: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function clearAllConversations(): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getSettings(): Promise<Settings> {
  try {
    const db = await getDB()
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(SETTINGS_STORE_NAME, 'readwrite')
        const store = transaction.objectStore(SETTINGS_STORE_NAME)
        const request = store.get('default')

        request.onerror = () => {
          // 发生错误时返回默认值
          const defaultSettings: Settings = {
            id: 'default',
            streamingEnabled: true,
            aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
            theme: 'dark',
            autoRedirectToRecent: false
          }
          resolve(defaultSettings)
        }
        request.onsuccess = () => {
          if (request.result) {
            // 合并默认值，确保新字段存在
            const defaultSettings: Settings = {
              id: 'default',
              streamingEnabled: true,
              aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
              theme: 'dark',
              autoRedirectToRecent: false
            }
            resolve({ ...defaultSettings, ...request.result } as Settings)
          } else {
            // 如果没有设置，创建默认值并保存
            const defaultSettings: Settings = {
              id: 'default',
              streamingEnabled: true,
              aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
              theme: 'dark',
              autoRedirectToRecent: false
            }
            const saveRequest = store.put(defaultSettings)
            saveRequest.onerror = () => {
              // 保存失败时仍然返回默认值
              resolve(defaultSettings)
            }
            saveRequest.onsuccess = () => resolve(defaultSettings)
          }
        }
      } catch (error) {
        // 任何错误都返回默认值
        const defaultSettings: Settings = {
          id: 'default',
          streamingEnabled: true,
          aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
          theme: 'dark',
          autoRedirectToRecent: false
        }
        resolve(defaultSettings)
      }
    })
  } catch (error) {
    // 数据库连接失败时返回默认值
    return {
      id: 'default',
      streamingEnabled: true,
      aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
      theme: 'dark',
      autoRedirectToRecent: false
    }
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(SETTINGS_STORE_NAME)
    const request = store.put(settings)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(USER_STORE_NAME, 'readonly')
      const store = transaction.objectStore(USER_STORE_NAME)
      const request = store.get('current')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    } catch (error) {
      resolve(null)
    }
  })
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(USER_STORE_NAME)
    const request = store.put({ ...profile, id: 'current' })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function deleteUserProfile(): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(USER_STORE_NAME)
    const request = store.delete('current')

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
