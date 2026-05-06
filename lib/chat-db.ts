// IndexedDB 数据库封装

const DB_NAME = 'ai-chat-db'
const DB_VERSION = 5
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
  isPinned: boolean
}

export interface Settings {
  id: string
  streamingEnabled: boolean
  aiModel: string
  theme: 'light' | 'dark' | 'system'
  autoRedirectToRecent: boolean
  showLoadingScreen: boolean
  notificationsEnabled: boolean
  soundEnabled: boolean
  showAIWarning: boolean
  useTraditionalNavigation: boolean
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

export async function renameConversation(id: string, newName: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const conversation = request.result as Conversation
      if (conversation) {
        const updatedConversation = {
          ...conversation,
          title: newName,
          updatedAt: Date.now(),
        }
        const updateRequest = store.put(updatedConversation)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      } else {
        reject(new Error(`Conversation ${id} not found`))
      }
    }
  })
}

export async function pinConversation(id: string, pinned: boolean): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const conversation = request.result as Conversation
      if (conversation) {
        const updatedConversation = {
          ...conversation,
          isPinned: pinned,
          updatedAt: pinned ? Date.now() : conversation.updatedAt,
        }
        const updateRequest = store.put(updatedConversation)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      } else {
        reject(new Error(`Conversation ${id} not found`))
      }
    }
  })
}

export async function deleteConversations(ids: string[]): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    for (const id of ids) {
      store.delete(id)
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
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
            autoRedirectToRecent: false,
            showLoadingScreen: true,
            notificationsEnabled: false,
            soundEnabled: false,
            showAIWarning: true,
            useTraditionalNavigation: false
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
              autoRedirectToRecent: false,
              showLoadingScreen: true,
              notificationsEnabled: false,
              soundEnabled: false,
              showAIWarning: true,
              useTraditionalNavigation: false
            }
            resolve({ ...defaultSettings, ...request.result } as Settings)
          } else {
            // 如果没有设置，创建默认值并保存
            const defaultSettings: Settings = {
              id: 'default',
              streamingEnabled: true,
              aiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
              theme: 'dark',
              autoRedirectToRecent: false,
              showLoadingScreen: true,
              notificationsEnabled: false,
              soundEnabled: false,
              showAIWarning: true,
              useTraditionalNavigation: false
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
          useTraditionalNavigation: false,
          autoRedirectToRecent: false,
          showLoadingScreen: true,
          notificationsEnabled: false,
          soundEnabled: false,
          showAIWarning: true
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
      useTraditionalNavigation: false,
      autoRedirectToRecent: false,
      showLoadingScreen: true,
      notificationsEnabled: false,
      soundEnabled: false,
      showAIWarning: true
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
    request.onsuccess = () => {
      // 同时保存到 localStorage，供加载页面使用
      try {
        localStorage.setItem('ai-chat-settings', JSON.stringify(settings))
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
      }
      resolve()
    }
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

export async function clearSettings(): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(SETTINGS_STORE_NAME)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    clearAllConversations(),
    clearSettings(),
    deleteUserProfile(),
  ])
}

export async function unregisterServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
}

export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  }
}

// 生成6位数唯一ID
export async function generateShortId(): Promise<string> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => {
      // 如果数据库操作失败，使用随机6位数
      resolve(generateRandomShortId())
    }

    request.onsuccess = () => {
      const conversations = request.result as Conversation[]
      const existingIds = new Set(conversations.map(c => c.id))
      
      // 生成唯一的6位数ID
      let newId: string
      let attempts = 0
      const maxAttempts = 1000
      
      do {
        newId = generateRandomShortId()
        attempts++
      } while (existingIds.has(newId) && attempts < maxAttempts)
      
      resolve(newId)
    }
  })
}

// 生成随机6位数ID
function generateRandomShortId(): string {
  const min = 100000
  const max = 999999
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}
