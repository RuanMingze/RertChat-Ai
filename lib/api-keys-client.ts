export interface ApiKey {
  id: string
  user_email: string
  keys: string
}

export async function getApiKeys(email: string): Promise<ApiKey[]> {
  try {
    console.log('[DEBUG CLIENT] 请求获取 keys, email:', email)
    const response = await fetch(`/api/keys?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('[DEBUG CLIENT] 响应状态:', response.status)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('[DEBUG CLIENT] 响应错误:', error)
      throw new Error(error.error || '获取失败')
    }

    const data = await response.json()
    console.log('[DEBUG CLIENT] 获取到的数据:', data)
    return data
  } catch (error) {
    console.error('[DEBUG CLIENT] 获取 API Keys 异常:', error)
    throw error
  }
}

export async function createApiKey(email: string): Promise<ApiKey> {
  try {
    console.log('[DEBUG CLIENT] 请求创建 key, email:', email)
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    console.log('[DEBUG CLIENT] 创建响应状态:', response.status)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('[DEBUG CLIENT] 创建响应错误:', error)
      throw new Error(error.error || '创建失败')
    }

    const data = await response.json()
    console.log('[DEBUG CLIENT] 创建返回数据:', data)
    return data
  } catch (error) {
    console.error('[DEBUG CLIENT] 创建 API Key 异常:', error)
    throw error
  }
}

export async function deleteApiKey(keyId: string, email: string): Promise<void> {
  try {
    const response = await fetch(
      `/api/keys?id=${encodeURIComponent(keyId)}&email=${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '删除失败')
    }
  } catch (error) {
    console.error('删除 API Key 失败:', error)
    throw error
  }
}

export async function rotateApiKey(keyId: string, email: string): Promise<ApiKey> {
  try {
    const response = await fetch('/api/keys', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyId, email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '轮转失败')
    }

    return await response.json()
  } catch (error) {
    console.error('轮转 API Key 失败:', error)
    throw error
  }
}
