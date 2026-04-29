# Cloudflare Workers 自定义域名 SSL 故障排除指南

## 问题：ERR_SSL_VERSION_OR_CIPHER_MISMATCH

即使开启了橙色云朵，仍然可能出现此错误。以下是最常见的解决方案：

## 🔍 诊断步骤

### 1. 验证 Workers 域名绑定

**最重要：必须在 Workers 控制台绑定自定义域名！**

仅仅在 DNS 中配置 CNAME 是不够的，你必须在 Workers 中绑定域名：

1. 打开 Cloudflare 控制台
2. 进入 **Workers & Pages**
3. 选择你的 Worker：`rertchat-chat-server`
4. 点击 **Settings** -> **Triggers**
5. 滚动到 **Custom Domains** 部分
6. 点击 **Add Custom Domain**
7. 输入：`api.chat.rertx.dpdns.org`
8. 点击 **Add Domain**

**⚠️ 只有完成这一步，Cloudflare 才会为你的域名生成 SSL 证书！**

### 2. 检查 DNS 记录类型

确保 DNS 记录配置正确：

```
类型：CNAME
名称：api.chat
目标：rertchat-chat-server.<your-worker-subdomain>.workers.dev
代理状态：已代理（橙色云朵）
```

**不要使用 A 记录！必须使用 CNAME！**

### 3. 检查 SSL/TLS 加密模式

进入 Cloudflare 控制台 -> SSL/TLS -> Overview：

**✅ 正确的设置：**
- **Full** - 推荐
- **Full (strict)** - 也可以

**❌ 错误的设置：**
- Off - 会导致 SSL 错误
- Flexible - 可能导致重定向问题

### 4. 验证 SSL 证书状态

进入 SSL/TLS -> Edge Certificates：

- 查看 "Universal SSL" 状态
- 应该显示 "Active"
- 如果显示 "Initializing"，需要等待 5-15 分钟

## 🛠️ 解决方案

### 方案 1：重新绑定域名（最有效）

如果已经绑定了域名但还是有问题：

1. Workers -> Settings -> Triggers -> Custom Domains
2. 找到 `api.chat.rertx.dpdns.org`
3. 点击 **Remove** 删除
4. 等待 1 分钟
5. 重新点击 **Add Custom Domain**
6. 输入 `api.chat.rertx.dpdns.org`
7. 点击 **Add Domain**
8. **等待 10 分钟**让 SSL 证书生成

### 方案 2：重置 Universal SSL

1. SSL/TLS -> Edge Certificates
2. 找到 "Universal SSL"
3. 点击 **Disable**
4. 等待 2 分钟
5. 点击 **Enable**
6. **等待 10-15 分钟**让新证书生成

### 方案 3：清除浏览器 SSL 缓存

**Chrome/Edge:**
1. 地址栏输入：`chrome://net-internals/#ssl`
2. 点击 "Clear SSL state"

**或者使用无痕模式测试**

### 方案 4：检查 DNS 传播

```bash
# 检查 CNAME 记录
nslookup -type=CNAME api.chat.rertx.dpdns.org

# 或使用 dig
dig api.chat.rertx.dpdns.org

# 应该看到 CNAME 指向 workers.dev
```

### 方案 5：使用 curl 测试

```bash
# 测试 HTTPS 连接（忽略证书验证）
curl -k https://api.chat.rertx.dpdns.org/

# 如果返回 405 Method Not Allowed，说明连接成功（因为需要 POST）
# 如果 SSL 错误，说明证书还没生效
```

## ⏰ 等待时间

SSL 证书生成需要时间：

- **首次绑定**：5-15 分钟
- **重新绑定**：5-10 分钟
- **重置 SSL**：10-15 分钟

**如果刚配置完，请耐心等待 15 分钟再测试！**

## 📋 完整检查清单

- [ ] DNS 记录是 CNAME（不是 A 记录）
- [ ] DNS 记录开启了橙色云朵
- [ ] Workers 中绑定了自定义域名（不只是 DNS 配置）
- [ ] SSL/TLS 模式是 Full 或 Full (strict)
- [ ] Universal SSL 状态是 Active
- [ ] 等待了至少 15 分钟
- [ ] 清除了浏览器缓存

## 🎯 最可能的原因

根据经验，90% 的 SSL 错误是因为：

1. **没有在 Workers 中绑定自定义域名**（只在 DNS 配置了 CNAME）
2. **SSL 证书还在生成中**（需要等待）
3. **SSL/TLS 模式设置错误**（设为了 Off 或 Flexible）

## 💡 快速验证

访问：`https://rertchat-chat-server.<your-subdomain>.workers.dev`

- 如果这个可以访问，说明 Workers 部署成功
- 然后只需要正确绑定自定义域名即可
- 如果这个也不能访问，说明 Workers 部署有问题

## 🆘 还是不行？

联系 Cloudflare 支持，提供以下信息：

1. Worker 名称：`rertchat-chat-server`
2. 自定义域名：`api.chat.rertx.dpdns.org`
3. 错误代码：`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`
4. 你已经尝试的步骤
