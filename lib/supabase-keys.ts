import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUB_KEY!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

// 创建两个客户端：一个用于普通操作，一个用于绕过 RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface ApiKey {
  id: string
  user_email: string
  keys: string
}

export async function getUserEmail(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email || null
  } catch {
    return null
  }
}

export async function getApiKeys(email: string): Promise<ApiKey[]> {
  try {
    if (!email) {
      throw new Error('未登录')
    }

    // 使用 admin 客户端绕过 RLS
    const { data, error } = await supabaseAdmin
      .from('keys')
      .select('*')
      .eq('user-email', email)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('获取 API Keys 失败:', error)
    throw error
  }
}

export async function createApiKey(email: string): Promise<ApiKey> {
  try {
    // 生成随机 key
    const key = `sk_${generateRandomKey(32)}`

    // 使用 admin 客户端绕过 RLS
    const { data, error } = await supabaseAdmin
      .from('keys')
      .insert([
        {
          'user-email': email,
          keys: key,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('创建 API Key 失败:', error)
    throw error
  }
}

export async function deleteApiKey(keyId: string, email: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('keys')
      .delete()
      .eq('id', keyId)
      .eq('user-email', email)

    if (error) throw error
  } catch (error) {
    console.error('删除 API Key 失败:', error)
    throw error
  }
}

export async function rotateApiKey(keyId: string, email: string): Promise<ApiKey> {
  try {
    // 生成新的随机 key
    const newKey = `sk_${generateRandomKey(32)}`

    const { data, error } = await supabase
      .from('keys')
      .update({ keys: newKey })
      .eq('id', keyId)
      .eq('user-email', email)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('轮转 API Key 失败:', error)
    throw error
  }
}

function generateRandomKey(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
