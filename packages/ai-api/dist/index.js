/**
 * RertChat AI API Client
 *
 * 用于调用 RertChat AI 聊天接口的客户端库
 *
 * @packageDocumentation
 */
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
export class RertChatClient {
    /**
     * 创建客户端实例
     * @param config - 配置对象
     */
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('API Key is required');
        }
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://rertx.dpdns.org/api/v1';
        this.defaultModel = config.defaultModel || '@cf/qwen/qwen3-30b-a3b-fp8';
        this.timeout = config.timeout || 60000;
    }
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
    async chat(request) {
        const response = await this.makeRequest(request, false);
        const text = await response.text();
        return {
            message: { role: 'assistant', content: text },
            text
        };
    }
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
    async *chatStream(request) {
        const response = await this.makeRequest(request, true);
        if (!response.body) {
            throw new Error('Response body is null');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data: ')) {
                        const data = trimmedLine.slice(6);
                        if (data === '[DONE]') {
                            yield { text: '', done: true };
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices && parsed.choices[0]?.delta?.content) {
                                yield {
                                    text: parsed.choices[0].delta.content,
                                    done: false
                                };
                            }
                        }
                        catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
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
    async send(message, model) {
        const response = await this.chat({
            messages: [{ role: 'user', content: message }],
            model: model || this.defaultModel
        });
        return response.text;
    }
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
    async chatWithHistory(messages, model) {
        const response = await this.chat({
            messages,
            model: model || this.defaultModel
        });
        return response.text;
    }
    /**
     * 执行 HTTP 请求
     * @param request - 聊天请求参数
     * @param stream - 是否使用流式
     * @returns Fetch 响应对象
     */
    async makeRequest(request, stream) {
        const url = `${this.baseUrl}/chat`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
            const response = await fetchFn(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: request.messages,
                    model: request.model || this.defaultModel,
                    stream
                }),
                signal: controller.signal
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
            return response;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            throw error;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
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
export function createClient(apiKey, baseUrl) {
    return new RertChatClient({ apiKey, baseUrl });
}
// 导出默认客户端
export default RertChatClient;
//# sourceMappingURL=index.js.map