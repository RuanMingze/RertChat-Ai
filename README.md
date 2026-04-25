# RertChat

基于 Qwen 的智能对话助手，支持流式输出、多轮对话上下文、PWA离线访问等功能。

## 功能特性

- **智能对话**：基于 Cloudflare AI Gateway 的智能对话功能
- **流式输出**：AI回答逐字显示，提供更流畅的体验
- **多轮对话**：支持上下文记忆，可配置上下文轮数
- **对话管理**：支持创建、删除、搜索对话历史
- **主题切换**：支持浅色/深色模式切换
- **PWA支持**：可安装为桌面应用，支持离线访问
- **自定义模型**：支持自定义AI模型（通过Cloudflare AI Gateway）

## 技术栈

- **框架**：Next.js 16 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **存储**：IndexedDB（客户端本地存储）
- **PWA**：Service Worker + Web Manifest

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

## PWA安装

### 桌面端（Chrome/Edge）

1. 访问应用网址
2. 点击地址栏右侧的"安装"图标
3. 或在菜单中选择"安装 RertChat"

### 移动端（Android/iOS）

1. 使用浏览器访问应用
2. 点击"添加到主屏幕"
3. 应用将像原生应用一样运行

## 配置说明

### 默认设置

- **AI模型**：@cf/qwen/qwen3-30b-a3b-fp8
- **流式输出**：开启
- **主题**：深色模式
- **自动跳转**：开启（打开页面时自动跳转到最近对话）

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
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # 组件目录
│   ├── ui/               # shadcn/ui 组件
│   ├── chat/             # 聊天相关组件
│   └── theme-provider.tsx # 主题提供者
├── lib/                   # 工具库
│   ├── chat-db.ts        # IndexedDB 封装
│   └── utils.ts          # 工具函数
├── public/               # 静态资源
│   ├── manifest.json     # PWA 配置
│   └── favicon*.png     # 应用图标
└── package.json
```

## 浏览器支持

- Chrome 90+
- Edge 90+
- Firefox 90+
- Safari 14+

## 许可证

MIT License

## 致谢

- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [Cloudflare AI Gateway](https://www.cloudflare.com/ai-gateway/) - AI模型支持
