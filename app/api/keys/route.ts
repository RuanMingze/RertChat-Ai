import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

// 使用 service role 密钥创建管理员客户端，绕过 RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

interface ApiKey {
  id: string
  user_email: string
  keys: string
}

// GET /api/keys - 获取用户的所有 API Keys
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: '缺少 email 参数' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('keys')
      .select('*')
      .eq('user-email', email)

    if (error) {
      console.error('获取 API Keys 失败:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // 将逗号分隔的 keys 转换为数组
    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    // 解析 keys 字段格式：id,1,key,12345678,id,2,key,87654321
    const allKeys: ApiKey[] = []
    console.log('[DEBUG GET] 原始数据:', JSON.stringify(data, null, 2))
    
    data.forEach((record) => {
      console.log('[DEBUG GET] 处理记录:', {
        'user-email': record['user-email'],
        keys: record.keys,
        keys_length: record.keys?.length || 0
      })
      
      if (record.keys) {
        const parts = record.keys.split(',').map((p: string) => p.trim())
        console.log('[DEBUG GET] 分割后的 parts:', parts)
        console.log('[DEBUG GET] parts 数量:', parts.length)
        
        // 每 4 个元素一组：id, 数字，key, 值
        for (let i = 0; i < parts.length; i += 4) {
          if (i + 3 < parts.length && parts[i] === 'id' && parts[i + 2] === 'key') {
            const keyId = parts[i + 1]
            const keyValue = parts[i + 3]
            console.log('[DEBUG GET] 解析到 key:', {
              index: i,
              keyId,
              keyValue,
              full_id: `${record['user-email']}-${keyId}`
            })
            allKeys.push({
              id: `${record['user-email']}-${keyId}`,
              user_email: record['user-email'],
              keys: keyValue,
            })
          } else {
            console.log('[DEBUG GET] 跳过无效的组:', {
              index: i,
              part0: parts[i],
              part2: parts[i + 2],
              has_part3: i + 3 < parts.length
            })
          }
        }
      }
    })

    console.log('[DEBUG GET] 最终返回的 keys:', allKeys)
    return NextResponse.json(allKeys)
  } catch (error) {
    console.error('获取 API Keys 异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// POST /api/keys - 创建新的 API Key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: '缺少 email 参数' },
        { status: 400 }
      )
    }

    // 生成随机 key
    const key = `sk_${generateRandomKey(32)}`

    // 先检查用户是否已有记录
    const { data: existingRecord, error: fetchError } = await supabaseAdmin
      .from('keys')
      .select('keys')
      .eq('user-email', email)
      .single()

    console.log('[DEBUG POST] 查询现有记录:', {
      existingRecord,
      fetchError
    })

    let newKeys: string
    let keyId: string

    if (existingRecord && existingRecord.keys) {
      // 如果已有记录，解析现有 keys 获取最大 ID
      const parts = existingRecord.keys.split(',').map((p: string) => p.trim())
      console.log('[DEBUG POST] 现有记录的 parts:', parts)
      let maxId = 0
      
      // 解析现有 keys 找到最大 ID
      for (let i = 0; i < parts.length; i += 4) {
        if (i + 3 < parts.length && parts[i] === 'id' && parts[i + 2] === 'key') {
          const currentId = parseInt(parts[i + 1], 10)
          console.log('[DEBUG POST] 解析现有 ID:', currentId)
          if (!isNaN(currentId) && currentId > maxId) {
            maxId = currentId
          }
        }
      }
      
      // 新 ID 为最大 ID + 1
      keyId = (maxId + 1).toString()
      newKeys = `${existingRecord.keys},id,${keyId},key,${key}`
      console.log('[DEBUG POST] 追加新 key:', {
        maxId,
        newKeyId: keyId,
        newKeys
      })
    } else {
      // 如果是第一条记录，创建新记录
      keyId = '1'
      newKeys = `id,${keyId},key,${key}`
      console.log('[DEBUG POST] 创建第一个 key:', {
        keyId,
        newKeys
      })
    }

    console.log('[DEBUG POST] 准备 upsert:', {
      'user-email': email,
      keys: newKeys
    })

    const { data, error } = await supabaseAdmin
      .from('keys')
      .upsert({
        'user-email': email,
        keys: newKeys,
      })
      .select()
      .single()

    console.log('[DEBUG POST] upsert 结果:', {
      data,
      error
    })

    if (error) {
      console.error('创建 API Key 失败:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // 返回正确的 Key 对象格式
    const result = {
      id: `${email}-${keyId}`,
      user_email: email,
      keys: key,
    }
    console.log('[DEBUG POST] 返回结果:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('创建 API Key 异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/keys - 删除 API Key
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyId = searchParams.get('id')
    const email = searchParams.get('email')

    if (!keyId || !email) {
      return NextResponse.json(
        { error: '缺少 id 或 email 参数' },
        { status: 400 }
      )
    }

    // 从 keyId 中提取数字 ID（格式：email-1）
    const idParts = keyId.split('-')
    const targetKeyId = idParts[idParts.length - 1]

    // 获取当前记录
    const { data: record } = await supabaseAdmin
      .from('keys')
      .select('keys')
      .eq('user-email', email)
      .single()

    if (!record || !record.keys) {
      return NextResponse.json(
        { error: '未找到记录' },
        { status: 404 }
      )
    }

    // 解析 keys 字段并删除指定的 key
    const parts = record.keys.split(',').map((p: string) => p.trim())
    const newParts: string[] = []
    let found = false

    for (let i = 0; i < parts.length; i += 4) {
      if (i + 3 < parts.length && parts[i] === 'id' && parts[i + 2] === 'key') {
        const currentId = parts[i + 1]
        if (currentId === targetKeyId) {
          // 找到匹配的 ID，跳过这 4 个元素（删除）
          found = true
        } else {
          // 保持原有数据
          newParts.push(parts[i], parts[i + 1], parts[i + 2], parts[i + 3])
        }
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: '未找到指定的 Key ID' },
        { status: 404 }
      )
    }

    const newKeys = newParts.join(',')

    // 更新记录
    const { error } = await supabaseAdmin
      .from('keys')
      .update({ keys: newKeys })
      .eq('user-email', email)

    if (error) {
      console.error('删除 API Key 失败:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除 API Key 异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// PUT /api/keys - 轮转 API Key
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyId, email } = body

    if (!keyId || !email) {
      return NextResponse.json(
        { error: '缺少 keyId 或 email 参数' },
        { status: 400 }
      )
    }

    // 从 keyId 中提取数字 ID（格式：email-1）
    const idParts = keyId.split('-')
    const targetKeyId = idParts[idParts.length - 1]

    // 获取当前记录
    const { data: record } = await supabaseAdmin
      .from('keys')
      .select('keys')
      .eq('user-email', email)
      .single()

    if (!record || !record.keys) {
      return NextResponse.json(
        { error: '未找到记录' },
        { status: 404 }
      )
    }

    // 生成新的随机 key
    const newKey = `sk_${generateRandomKey(32)}`

    // 解析 keys 字段并替换指定的 key
    const parts = record.keys.split(',').map((p: string) => p.trim())
    const newParts: string[] = []
    let found = false

    for (let i = 0; i < parts.length; i += 4) {
      if (i + 3 < parts.length && parts[i] === 'id' && parts[i + 2] === 'key') {
        const currentId = parts[i + 1]
        if (currentId === targetKeyId) {
          // 找到匹配的 ID，替换 key 值
          newParts.push('id', currentId, 'key', newKey)
          found = true
        } else {
          // 保持原有数据
          newParts.push(parts[i], parts[i + 1], parts[i + 2], parts[i + 3])
        }
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: '未找到指定的 Key ID' },
        { status: 404 }
      )
    }

    const newKeys = newParts.join(',')

    const { data, error } = await supabaseAdmin
      .from('keys')
      .update({ keys: newKeys })
      .eq('user-email', email)
      .select()
      .single()

    if (error) {
      console.error('轮转 API Key 失败:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // 返回轮转后的 key
    return NextResponse.json({
      id: keyId,
      user_email: email,
      keys: newKey,
    })
  } catch (error) {
    console.error('轮转 API Key 异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
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
