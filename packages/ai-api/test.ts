/**
 * RertChat AI API 测试脚本
 * 
 * 使用测试 API Key: sk_xI9WWpDrMTkLfBTbOcAIDSYft9McMUvF
 */

import { RertChatClient, createClient } from './src/index'

async function testBasicChat() {
  console.log('=== 测试 1: 基础聊天 ===\n')
  
  const client = new RertChatClient({
    apiKey: 'sk_xI9WWpDrMTkLfBTbOcAIDSYft9McMUvF'
  })
  
  try {
    const response = await client.send('你好，请介绍一下自己')
    console.log('响应:', response)
    console.log('\n✅ 基础聊天测试通过\n')
  } catch (error) {
    console.error('❌ 基础聊天测试失败:', error)
  }
}

async function testChatWithMessages() {
  console.log('=== 测试 2: 使用 messages 参数 ===\n')
  
  const client = createClient('sk_xI9WWpDrMTkLfBTbOcAIDSYft9McMUvF')
  
  try {
    const response = await client.chat({
      messages: [
        { role: 'user', content: '你好' },
        { role: 'assistant', content: '你好！有什么可以帮助你的吗？' },
        { role: 'user', content: '今天天气怎么样？' }
      ]
    })
    
    console.log('响应文本:', response.text)
    console.log('\n✅ Messages 参数测试通过\n')
  } catch (error) {
    console.error('❌ Messages 参数测试失败:', error)
  }
}

async function testStreaming() {
  console.log('=== 测试 3: 流式响应 ===\n')
  
  const client = new RertChatClient({
    apiKey: 'sk_xI9WWpDrMTkLfBTbOcAIDSYft9McMUvF'
  })
  
  try {
    const stream = client.chatStream({
      messages: [{ role: 'user', content: '请写一首关于春天的短诗' }]
    })
    
    console.log('流式响应内容:\n')
    for await (const chunk of stream) {
      if (chunk.text) {
        process.stdout.write(chunk.text)
      }
      if (chunk.done) {
        console.log('\n')
      }
    }
    
    console.log('\n✅ 流式响应测试通过\n')
  } catch (error) {
    console.error('❌ 流式响应测试失败:', error)
  }
}

async function testChatWithHistory() {
  console.log('=== 测试 4: 多轮对话 ===\n')
  
  const client = createClient('sk_xI9WWpDrMTkLfBTbOcAIDSYft9McMUvF')
  
  try {
    const messages = [
      { role: 'user', content: '我想学习编程' },
      { role: 'assistant', content: '很好！你想学习哪种编程语言呢？' },
      { role: 'user', content: 'Python' }
    ]
    
    const response = await client.chatWithHistory(messages)
    console.log('响应:', response)
    console.log('\n✅ 多轮对话测试通过\n')
  } catch (error) {
    console.error('❌ 多轮对话测试失败:', error)
  }
}

async function testCustomModel() {
  console.log('=== 测试 5: 自定义模型 ===\n')
  
  const client = new RertChatClient({
    apiKey: 'sk_xI9WWpDrMTkLfBTbOcAIDSYft9McMUvF',
    defaultModel: '@cf/qwen/qwen3-30b-a3b-fp8'
  })
  
  try {
    const response = await client.send('Hello! How are you?', '@cf/qwen/qwen3-30b-a3b-fp8')
    console.log('响应:', response)
    console.log('\n✅ 自定义模型测试通过\n')
  } catch (error) {
    console.error('❌ 自定义模型测试失败:', error)
  }
}

async function testErrorHandling() {
  console.log('=== 测试 6: 错误处理 ===\n')
  
  const client = new RertChatClient({
    apiKey: 'sk_invalid_key_test'
  })
  
  try {
    await client.send('测试错误处理')
    console.log('❌ 错误处理测试失败：应该抛出错误\n')
  } catch (error) {
    console.log('✅ 正确捕获到错误')
    console.log('错误信息:', error instanceof Error ? error.message : error)
    console.log('\n✅ 错误处理测试通过\n')
  }
}

async function runAllTests() {
  console.log('\n========================================')
  console.log('  RertChat AI API 完整测试')
  console.log('========================================\n')
  
  await testBasicChat()
  await testChatWithMessages()
  await testStreaming()
  await testChatWithHistory()
  await testCustomModel()
  await testErrorHandling()
  
  console.log('========================================')
  console.log('  所有测试完成！')
  console.log('========================================\n')
}

// 运行测试
runAllTests().catch(console.error)
