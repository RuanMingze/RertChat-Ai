/**
 * RertChat AI API Client
 *
 * 用于调用 RertChat AI 聊天接口的客户端库
 *
 * @packageDocumentation
 */
/**
 * 聊天消息接口
 */
export interface ChatMessage {
    /** 消息角色：'user' 或 'assistant' */
    role: 'user' | 'assistant';
    /** 消息内容 */
    content: string;
}
/**
 * 聊天请求参数
 */
export interface ChatRequest {
    /** 消息历史数组 */
    messages: ChatMessage[];
    /** 模型名称，默认为 '@cf/qwen/qwen3-30b-a3b-fp8' */
    model?: string;
    /** 是否使用流式响应，默认为 true */
    stream?: boolean;
}
/**
 * 聊天响应接口（非流式）
 */
export interface ChatResponse {
    /** 响应消息 */
    message: ChatMessage;
    /** 完整响应文本 */
    text: string;
}
/**
 * 流式响应块接口
 */
export interface StreamChunk {
    /** 当前块的文本内容 */
    text: string;
    /** 是否为最后一个块 */
    done: boolean;
}
/**
 * API 客户端配置
 */
export interface ClientConfig {
    /** API Key（必需） */
    apiKey: string;
    /** API 基础 URL，默认为 'https://rertx.dpdns.org/api/v1' */
    baseUrl?: string;
    /** 默认模型，默认为 '@cf/qwen/qwen3-30b-a3b-fp8' */
    defaultModel?: string;
    /** 请求超时时间（毫秒），默认为 60000 */
    timeout?: number;
}
/**
 * RertChat AI API 客户端
 *
 * @example
 * ```typescript
 * // 基础用法
 * const client = new RertChatClient({ apiKey: 'sk_xxx' })
 *
 * // 发送消息
 * const response = await client.chat({
 *   messages: [{ role: 'user', content: '你好' }]
 * })
 * console.log(response.text)
 * ```
 *
 * @example
 * ```typescript
 * // 流式响应
 * const stream = client.chatStream({
 *   messages: [{ role: 'user', content: '你好' }]
 * })
 *
 * for await (const chunk of stream) {
 *   process.stdout.write(chunk.text)
 * }
 * ```
 */
export declare class RertChatClient {
    private apiKey;
    private baseUrl;
    private defaultModel;
    private timeout;
    /**
     * 创建客户端实例
     * @param config - 配置对象
     */
    constructor(config: ClientConfig);
    /**
     * 发送聊天请求（非流式）
     *
     * @param request - 聊天请求参数
     * @returns 聊天响应
     *
     * @example
     * ```typescript
     * const response = await client.chat({
     *   messages: [
     *     { role: 'user', content: '你好' }
     *   ]
     * })
     * console.log(response.text)
     * ```
     */
    chat(request: ChatRequest): Promise<ChatResponse>;
    /**
     * 发送聊天请求（流式）
     *
     * @param request - 聊天请求参数
     * @returns 异步迭代器，用于接收流式响应
     *
     * @example
     * ```typescript
     * const stream = client.chatStream({
     *   messages: [{ role: 'user', content: '你好' }]
     * })
     *
     * for await (const chunk of stream) {
     *   console.log(chunk.text)
     * }
     * ```
     */
    chatStream(request: ChatRequest): AsyncGenerator<StreamChunk>;
    /**
     * 发送消息（便捷方法）
     *
     * @param message - 用户消息内容
     * @param model - 模型名称（可选）
     * @returns 助手响应文本
     *
     * @example
     * ```typescript
     * const reply = await client.send('你好')
     * console.log(reply)
     * ```
     */
    send(message: string, model?: string): Promise<string>;
    /**
     * 多轮对话（便捷方法）
     *
     * @param messages - 消息历史
     * @param model - 模型名称（可选）
     * @returns 助手响应文本
     *
     * @example
     * ```typescript
     * const messages = [
     *   { role: 'user', content: '你好' },
     *   { role: 'assistant', content: '你好！有什么可以帮助你的吗？' },
     *   { role: 'user', content: '帮我写一首诗' }
     * ]
     * const reply = await client.chatWithHistory(messages)
     * ```
     */
    chatWithHistory(messages: ChatMessage[], model?: string): Promise<string>;
    /**
     * 执行 HTTP 请求
     * @param request - 聊天请求参数
     * @param stream - 是否使用流式
     * @returns Fetch 响应对象
     */
    private makeRequest;
}
/**
 * 创建客户端的便捷函数
 *
 * @param apiKey - API Key
 * @param baseUrl - API 基础 URL（可选）
 * @returns RertChatClient 实例
 *
 * @example
 * ```typescript
 * const client = createClient('sk_xxx')
 * const response = await client.send('你好')
 * ```
 */
export declare function createClient(apiKey: string, baseUrl?: string): RertChatClient;
export default RertChatClient;
//# sourceMappingURL=index.d.ts.map