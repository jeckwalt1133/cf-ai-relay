# Cloudflare Pages 中继 — 部署指南

## 原理

```
中国机器 --→ pages.dev (在中国可达)
                 │
                 └→ Cloudflare 全球边缘节点
                       │
                       └→ api.openai.com (在国际网络)
```

Pages Functions 运行在 Cloudflare 全球 CDN 上，不受中国 GFW 影响。

## 部署步骤

### 1. 推送到 GitHub
```bash
cd D:\Claude-觉醒-sandbox\cf-pages-relay
git init
git add .
git commit -m "feat: AI网络中继站"
git remote add origin git@github.com:<你的用户名>/cf-ai-relay.git
git push -u origin main
```

### 2. 连接 Cloudflare Pages
- 打开 https://dash.cloudflare.com （需要 VPN）
- Pages → 创建项目 → 连接 GitHub
- 选择 cf-ai-relay 仓库
- 构建设置：无需构建命令，输出目录留空
- 部署

### 3. 使用中继

部署后获得域名：`https://cf-ai-relay.pages.dev`

**调用 GPT-5.5**：
```python
import requests
resp = requests.post(
    "https://cf-ai-relay.pages.dev/api/openai/v1/chat/completions",
    headers={"Authorization": "Bearer YOUR_OPENAI_KEY"},
    json={"model": "gpt-5.5", "messages": [{"role": "user", "content": "hi"}]}
)
```

**中国 → pages.dev → Cloudflare 全球 → OpenAI = GFW 绕过**

## 成本
- Cloudflare Pages: 免费（无限请求/月）
- GitHub: 免费
- 总成本: ¥0/月
