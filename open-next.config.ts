import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // 配置 Cloudflare Workers AI 绑定
  bindings: {
    // 环境变量会在 wrangler.toml 中配置
  },
  
  // 启用边缘运行时
  edgeMiddleware: true,
  
  // 配置 ISR（增量静态再生成）
  isr: {
    enabled: true,
  },
});
