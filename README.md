# RertChat

RertChat 是一个基于 Cloudflare AI Gateway 的智能对话助手，支持流式输出、多轮对话上下文、PWA 离线访问等功能。

## 快速部署

### 第一步：克隆开源版本

```bash
git clone https://github.com/RuanMingze/RertChat.bly
cd RertChat.bly
```

### 第二步：初始化 Supabase 数据库

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 粘贴以下 SQL 并执行：

```sql
-- 数据表：存储用户密钥关联
-- 字段说明：
-- user-email：用户邮箱，文本类型，设为主键（唯一标识、非空）
-- keys：密钥内容，可变字符串，允许为空值
CREATE TABLE IF NOT EXISTS keys (
  "user-email" TEXT PRIMARY KEY NOT NULL,
  keys VARCHAR
);

-- 为 keys 表开启行级安全策略(RLS)
ALTER TABLE keys ENABLE ROW LEVEL SECURITY;

-- 插入策略：校验当前登录用户邮箱与记录邮箱一致
CREATE POLICY "允许用户基于 email 创建 keys"
ON keys
FOR INSERT
WITH CHECK (auth.email() = "user-email" OR true);

-- 查询策略：仅允许读取与当前环境邮箱匹配的自身数据
CREATE POLICY "允许用户读取自己的 keys"
ON keys
FOR SELECT
USING ("user-email" = current_setting('app.current_user_email', true));

-- 删除策略：仅允许删除与当前环境邮箱匹配的自身数据
CREATE POLICY "允许用户删除自己的 keys"
ON keys
FOR DELETE
USING ("user-email" = current_setting('app.current_user_email', true));

-- 更新策略：仅允许更新与当前环境邮箱匹配的自身数据
CREATE POLICY "允许用户更新自己的 keys"
ON keys
FOR UPDATE
USING ("user-email" = current_setting('app.current_user_email', true));
```

### 第三步：配置环境变量

复制 `.env.example` 文件为 `.env.local`：

```bash
# Windows
copy .env.example .env.local

# Linux/macOS
cp .env.example .env.local
```

按照 `.env.example` 中的详细说明填写以下配置：

| 配置项                            | 说明                    | 获取方式                                          |
| ------------------------------ | --------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | 站点公开访问地址              | 生产环境填写你的域名                                    |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase 项目地址         | Supabase Dashboard -> Settings -> API         |
| `NEXT_PUBLIC_SUPABASE_PUB_KEY` | Supabase 公开密钥         | Supabase Dashboard -> Settings -> API         |
| `SUPABASE_SECRET_KEY`          | Supabase 服务密钥         | Supabase Dashboard -> Settings -> API         |
| `CLOUDFLARE_USER_ID`           | Cloudflare Account ID | Cloudflare Dashboard -> Profile -> API Tokens |
| `CLOUDFLARE_AI_TOKEN`          | Cloudflare AI Token   | Cloudflare Dashboard -> AI -> AI Gateway      |
| `CLOUDFLARE_AI_GATEWAY_ID`     | AI Gateway ID         | Cloudflare Dashboard -> AI -> AI Gateway      |

详细步骤请参考 `.env.example` 文件中的完整说明。

### 第四步：安装依赖

```bash
pnpm install
```

### 第五步：部署

#### 方式一：部署到 Cloudflare Pages（推荐）

```bash
pnpm pages:build
pnpm deploy
```

#### 方式二：部署到 Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 导入项目
3. Vercel 会自动检测并配置

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 <http://localhost:3000>

## 技术栈

- **框架**：Next.js 16 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **存储**：IndexedDB（客户端本地存储）
- **后端**：Cloudflare Workers（API服务）
- **部署**：Vercel / Cloudflare Pages

## 功能特性

- **智能对话**：基于 Cloudflare AI Gateway 的智能对话功能
- **流式输出**：AI 回答逐字显示
- **多轮对话**：支持上下文记忆
- **PWA 支持**：可安装为桌面应用，支持离线访问
- **主题切换**：支持浅色/深色模式

## 支持的 AI 模型

默认支持以下模型：

- `@cf/qwen/qwen3-30b-a3b-fp8` (通义千问)
- `@cf/meta/llama-3-8b-instruct` (Llama 3)
- `@cf/google/gemma-2-27b-it` (Gemma 2)

查看更多模型：<https://developers.cloudflare.com/workers-ai/models/>

## 许可证

MIT License

## 建议与反馈

我们非常重视每一位用户的声音！无论是功能建议、bug 反馈还是体验优化，都欢迎大家积极提出：

- **功能建议**：希望添加什么新功能？
- **体验优化**：哪些地方可以做得更好？
- **Bug 反馈**：发现了任何问题？
- **社区贡献**：想参与项目开发？

### 如何提出建议

1. **GitHub Issues**：前往 [GitHub Issues](https://github.com/RuanMingze/RertChat-Ai/issues) 创建新 issue
2. **GitHub Discussions**：参与 [GitHub Discussions](https://github.com/RuanMingze/RertChat-Ai/discussions) 讨论
3. **Pull Request**：欢迎提交 PR 贡献代码！

### 感谢你的参与

每一个建议都可能让 RertChat 变得更好！我们期待与大家一起打造更出色的轻量级 AI 对话助手。

## 致谢

- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless 运行
- [Cloudflare AI](https://www.cloudflare.com/) - AI 模型支持

