# RertChat - AI助手

基于 Cloudflare AI Gateway 的智能对话助手，支持流式输出、多轮对话上下文、PWA离线访问等功能。

## 功能特性

- **智能对话**：基于 Cloudflare Workers 的智能对话功能
- **流式输出**：AI回答逐字显示，提供更流畅的体验
- **多轮对话**：支持上下文记忆，可配置上下文轮数
- **对话管理**：支持创建、删除、搜索对话历史
- **主题切换**：支持浅色/深色模式切换
- **PWA支持**：可安装为桌面应用，支持离线访问
- **自定义模型**：支持自定义AI模型（通过Cloudflare Workers）
- **加载页面**：应用启动时显示加载动画（可配置开关）
- **开发追踪**：可实时查看开发者工作进度
- **API支持**：提供 RESTful API 供第三方调用

## 技术栈

- **框架**：Next.js 16 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **存储**：IndexedDB（客户端本地存储）
- **后端**：Cloudflare Workers（API服务）
- **部署**：Vercel / Cloudflare Pages

## 快速开始

### 环境要求

- Node.js 18+
- pnpm（包管理器）

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 部署说明

### Vercel 部署（推荐）

1. 将项目推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `API_KEY`：API 访问密钥
   - `CHAT_SERVER_URL`：Workers 聊天服务器地址
   - `INTERNAL_CHAT_SECRET`：内部认证密钥
4. 部署完成

### Cloudflare Pages 部署

```bash
pnpm pages:build
pnpm deploy
```

### Cloudflare Workers 部署

```bash
cd workers/chat-server
pnpm wrangler deploy
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `API_KEY` | API 访问密钥 | 是 |
| `CHAT_SERVER_URL` | Workers 聊天服务器地址 | 是 |
| `INTERNAL_CHAT_SECRET` | 内部认证密钥 | 是 |

### 默认设置

- **AI模型**：@cf/qwen/qwen3-30b-a3b-fp8
- **流式输出**：开启
- **主题**：深色模式
- **自动跳转**：开启（打开页面时自动跳转到最近对话）
- **加载页面**：开启

### 自定义模型

1. 进入设置页面
2. 在"AI模型"输入框中输入模型名称
3. 点击"查找模型"链接查看可用模型列表
4. 保存设置

## 项目结构

```
rertchat/
├── app/                    # Next.js 应用目录
│   ├── page.tsx           # 主页面（对话界面）
│   ├── settings/          # 设置页面
│   ├── conversations/     # 对话列表页面
│   ├── appdev/            # 开发追踪页面
│   ├── api/               # API 路由
│   │   ├── chat/          # 聊天 API
│   │   ├── v1/chat/       # 对外 API
│   │   └── dev-status/    # 开发服务器状态检测
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # 组件目录
│   ├── ui/               # shadcn/ui 组件
│   ├── chat/             # 聊天相关组件
│   ├── loading/          # 加载页面组件
│   └── theme-provider.tsx # 主题提供者
├── lib/                   # 工具库
│   ├── chat-db.ts        # IndexedDB 封装
│   └── utils.ts          # 工具函数
├── workers/              # Cloudflare Workers
│   └── chat-server/      # 聊天服务器
├── public/               # 静态资源
│   ├── manifest.json     # PWA 配置
│   └── favicon*.png     # 应用图标
├── vercel.json           # Vercel 配置
└── package.json
```

## API 文档

### 内置聊天 API

```bash
POST /api/chat
Authorization: Bearer <INTERNAL_CHAT_SECRET>
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "stream": true
}
```

### 对外 API (v1)

```bash
POST /api/v1/chat
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "stream": true
}
```

### 开发服务器状态

```bash
GET /api/dev-status
```

响应：
- `working`：开发服务器运行中
- `resting`：开发服务器已关闭

## PWA安装

### 桌面端（Chrome/Edge）

1. 访问应用网址
2. 点击地址栏右侧的"安装"图标
3. 或在菜单中选择"安装 RertChat"

### 移动端（Android/iOS）

1. 使用浏览器访问应用
2. 点击"添加到主屏幕"
3. 应用将像原生应用一样运行

## 浏览器支持

- Chrome 90+
- Edge 90+
- Firefox 90+
- Safari 14+

## 许可证

MIT License

## 致谢

- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless 运行
- [Cloudflare AI](https://www.cloudflare.com/) - AI 模型支持
