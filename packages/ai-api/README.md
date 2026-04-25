# RertChat AI API

RertChat AI API 客户端库，用于方便地调用 RertChat AI 聊天接口。

## 安装

```bash
npm install rertchat-ai-api
# 或
pnpm add rertchat-ai-api
# 或
yarn add rertchat-ai-api
```

## 快速开始

### 基础用法

```typescript
import { RertChatClient } from 'rertchat-ai-api'

// 创建客户端实例
const client = new RertChatClient({
  apiKey: 'sk_xxx' // 替换为你的 API Key
})

// 发送消息
const response = await client.chat({
  messages: [{ role: 'user', content: '你好' }]
})

console.log(response.text)
```

### 便捷方法

```typescript
import { createClient } from 'rertchat-ai-api'

const client = createClient('sk_xxx')

// 快速发送消息
const reply = await client.send('你好')
console.log(reply)
```

### 流式响应

```typescript
import { RertChatClient } from 'rertchat-ai-api'

const client = new RertChatClient({ apiKey: 'sk_xxx' })

// 使用流式响应
const stream = client.chatStream({
  messages: [{ role: 'user', content: '你好' }]
})

for await (const chunk of stream) {
  process.stdout.write(chunk.text)
}
```

### 多轮对话

```typescript
import { RertChatClient } from 'rertchat-ai-api'

const client = new RertChatClient({ apiKey: 'sk_xxx' })

const messages = [
  { role: 'user', content: '你好' },
  { role: 'assistant', content: '你好！有什么可以帮助你的吗？' },
  { role: 'user', content: '帮我写一首诗' }
]

const reply = await client.chatWithHistory(messages)
console.log(reply)
```

## API 文档

### RertChatClient

#### 构造函数参数

- `apiKey` (必需) - API Key
- `baseUrl` (可选) - API 基础 URL，默认为 `https://rertx.dpdns.org/api/v1`
- `defaultModel` (可选) - 默认模型，默认为 `@cf/qwen/qwen3-30b-a3b-fp8`
- `timeout` (可选) - 请求超时时间（毫秒），默认为 60000

#### 方法

##### `chat(request: ChatRequest): Promise<ChatResponse>`

发送聊天请求（非流式）

```typescript
const response = await client.chat({
  messages: [
    { role: 'user', content: '你好' }
  ],
  model: '@cf/qwen/qwen3-30b-a3b-fp8',
  stream: false
})

console.log(response.text)
```

##### `chatStream(request: ChatRequest): AsyncGenerator<StreamChunk>`

发送聊天请求（流式）

```typescript
const stream = client.chatStream({
  messages: [{ role: 'user', content: '你好' }]
})

for await (const chunk of stream) {
  console.log(chunk.text)
}
```

##### `send(message: string, model?: string): Promise<string>`

便捷方法，快速发送消息

```typescript
const reply = await client.send('你好')
```

##### `chatWithHistory(messages: ChatMessage[], model?: string): Promise<string>`

多轮对话便捷方法

```typescript
const messages = [
  { role: 'user', content: '你好' },
  { role: 'assistant', content: '你好！' },
  { role: 'user', content: '帮我写代码' }
]

const reply = await client.chatWithHistory(messages)
```

### 类型定义

#### ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
```

#### ChatRequest

```typescript
interface ChatRequest {
  messages: ChatMessage[]
  model?: string
  stream?: boolean
}
```

#### ChatResponse

```typescript
interface ChatResponse {
  message: ChatMessage
  text: string
}
```

#### StreamChunk

```typescript
interface StreamChunk {
  text: string
  done: boolean
}
```

## 环境变量

推荐将 API Key 存储在环境变量中：

```bash
# .env
RERTCHAT_API_KEY=sk_xxx
```

```typescript
const client = new RertChatClient({
  apiKey: process.env.RERTCHAT_API_KEY!
})
```

## 错误处理

```typescript
try {
  const response = await client.send('你好')
  console.log(response)
} catch (error) {
  if (error instanceof Error) {
    console.error('请求失败:', error.message)
  }
}
```

## 自定义 API 地址

```typescript
const client = new RertChatClient({
  apiKey: 'sk_xxx',
  baseUrl: 'https://your-custom-domain.com/api/v1'
})
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 清理构建产物
pnpm clean
```

## License

MIT
