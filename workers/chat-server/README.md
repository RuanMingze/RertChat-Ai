# RertChat Chat Server - Cloudflare Workers

安全、可扩展的聊天服务器，部署在 Cloudflare Workers 上。

## 🔒 安全特性

- ✅ **Secrets 管理**：所有敏感信息使用 Cloudflare Secrets 存储
- ✅ **自动轮换**：随时可以轮换 Secret，无需重新部署
- ✅ **零暴露风险**：密钥永远不会暴露到客户端或代码仓库
- ✅ **边缘计算**：全球 CDN 加速，低延迟

## 📦 部署步骤

### 1. 安装依赖

```bash
cd workers/chat-server
pnpm install
```

### 2. 登录 Cloudflare

```bash
pnpm wrangler login
```

### 3. 设置 Secrets

```bash
# 设置 Cloudflare API Token
pnpm wrangler secret put CLOUDFLARE_API_TOKEN

# 设置 Cloudflare Account ID
pnpm wrangler secret put CLOUDFLARE_ACCOUNT_ID

# （可选）设置内部验证 Secret
pnpm wrangler secret put INTERNAL_SECRET
```

### 4. 部署

```bash
pnpm deploy
```

部署成功后，你会得到一个 `*.workers.dev` 域名。

## 🔄 轮换 Secret

当需要轮换密钥时（建议定期轮换）：

```bash
# 重新设置 Secret，Workers 会自动使用新值
pnpm wrangler secret put CLOUDFLARE_API_TOKEN
```

**无需重新部署！** 新 Secret 会立即生效。

## 🌐 使用方式

### API 端点

```
POST https://rertchat-chat-server.<your-subdomain>.workers.dev/
```

### 请求示例

```bash
curl -X POST https://rertchat-chat-server.<your-subdomain>.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "model": "@cf/qwen/qwen3-30b-a3b-fp8",
    "stream": true
  }'
```

### 在 Next.js 中使用

更新 `.env.local`：

```bash
CHAT_SERVER_URL=https://rertchat-chat-server.<your-subdomain>.workers.dev
```

## 🛡️ 安全最佳实践

### 1. 定期轮换密钥

建议每 30-90 天轮换一次 Cloudflare API Token：

```bash
# 1. 登录 Cloudflare 控制台生成新 Token
# 2. 执行命令
pnpm wrangler secret put CLOUDFLARE_API_TOKEN
```

### 2. 限制访问（可选）

在 `src/index.ts` 中启用 Authorization 验证：

```typescript
const authHeader = request.headers.get('Authorization')
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return new Response('Unauthorized', { status: 401 })
}
```

### 3. 监控日志

```bash
# 实时查看日志
pnpm wrangler tail

# 查看生产环境日志
pnpm wrangler tail --env production
```

### 4. 自定义域名（重要：SSL 配置）

在 Cloudflare 控制台为 Workers 绑定自定义域名：

**步骤：**
1. 进入 Workers & Pages -> 选择你的 Worker -> Settings -> Triggers -> Custom Domains
2. 点击 "Add Custom Domain"
3. 输入你的域名（如：`api.chat.rertx.dpdns.org`）
4. **重要：确保域名已在 Cloudflare 添加并代理（橙色云朵）**
5. Cloudflare 会自动配置 SSL 证书

**SSL 错误解决方案：**

如果遇到 `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` 错误：

1. **检查 DNS 配置**：
   - 确保域名已添加到 Cloudflare
   - DNS 记录必须是 CNAME 指向 `rertchat-chat-server.<your-subdomain>.workers.dev`
   - **必须开启 Cloudflare 代理（橙色云朵）**

2. **检查 SSL/TLS 设置**：
   - 进入 Cloudflare 控制台 -> SSL/TLS
   - 加密模式选择 **"Full"** 或 **"Full (strict)"**
   - 不要选择 "Off" 或 "Flexible"

3. **清除 SSL 缓存**：
   - 在 Cloudflare 控制台 -> SSL/TLS -> Edge Certificates
   - 点击 "Disable Universal SSL" 然后重新启用
   - 等待 5-10 分钟让新证书生效

4. **等待证书生效**：
   - 新绑定的域名需要 5-15 分钟生成 SSL 证书
   - 使用 `https://api.chat.rertx.dpdns.org` 访问（必须是 HTTPS）

**测试连接：**
```bash
# 测试 Workers 是否响应
curl -X POST https://api.chat.rertx.dpdns.org/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-internal-secret" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

## 📊 监控与日志

### 查看实时日志

```bash
pnpm wrangler tail
```

### 查看部署信息

```bash
pnpm wrangler whoami
pnpm wrangler deploy --dry-run
```

## 🔧 开发

### 本地开发

```bash
pnpm dev
```

本地访问：`http://localhost:8787`

### 环境变量

本地开发时，在项目根目录创建 `.dev.vars`：

```bash
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

## 📝 文件结构

```
workers/chat-server/
├── src/
│   └── index.ts          # Workers 主程序
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript 配置
├── wrangler.toml         # Workers 配置
└── README.md            # 本文档
```

## 🚨 故障排除

### 部署失败

```bash
# 清理并重新部署
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm deploy
```

### Secret 未生效

```bash
# 验证 Secret 已设置
pnpm wrangler secret list

# 重新设置
pnpm wrangler secret put CLOUDFLARE_API_TOKEN
```

### CORS 错误

Workers 已配置 CORS，如果需要自定义，修改 `src/index.ts` 中的 CORS headers。

## 📄 License

MIT
