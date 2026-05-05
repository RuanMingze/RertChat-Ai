# 贡献指南

感谢你考虑为 RertChat 贡献代码！以下是帮助你开始的信息。

## 如何贡献

### 报告 Bug

如果你发现了 bug，请通过 [GitHub Issues](https://github.com/RuanMingze/RertChat-Ai/issues) 报告，包含以下信息：

- Bug 描述
- 复现步骤
- 预期行为和实际行为
- 环境信息（浏览器、操作系统等）
- 截图或日志（如有）

### 提出功能建议

我们欢迎所有功能建议！请通过以下方式：

1. **GitHub Issues** - 创建 Feature Request
2. **GitHub Discussions** - 在讨论区发起讨论

### 提交代码

#### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/RuanMingze/RertChat-Ai
cd RertChat-Ai

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

#### Pull Request 流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/YOUR_NAME-AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/YOUR_NAME-AmazingFeature`)
5. 创建 Pull Request

#### 代码规范

- 使用 TypeScript
- 遵循项目现有的代码风格
- 确保通过 ESLint 检查
- 为新功能添加适当的测试（如有）

### 项目结构

```
RertChat/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 主页
│   ├── settings/          # 设置页面
│   ├── keys/              # API Keys 管理页面
│   └── ...
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   └── chat/             # 聊天相关组件
├── lib/                   # 工具函数和库
│   ├── chat-db.ts        # IndexedDB 封装
│   ├── i18n/             # 国际化配置
│   └── ...
├── messages/              # 翻译文件
│   ├── zh-CN.json        # 中文翻译
│   └── en-US.json        # 英文翻译
└── public/               # 静态资源
```

## 行为准则

- 保持友好和尊重
- 包容不同的观点和经验
- 专注于为社区提供建设性的反馈
- 尊重维护者的决策

## 许可证

通过贡献代码，你同意将你的作品按 [MIT License](LICENSE) 发布。

## 问题？

如果你有任何问题，欢迎在 GitHub Discussions 中提问。

我们期待你的贡献！
