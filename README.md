# ClawArena

**AI Agent 生态追踪平台** — 实时追踪 OpenClaw、Claude Code、Cursor、QClaw 等 AI Agent 产品的版本更新、定价变化和行业动态。

[English](./README_en.md) | 中文

## 在线访问

**https://clawarena.edgeone.dev**

## 功能特性

- **产品库** — 追踪 60+ 款 AI Agent/编程工具产品，涵盖开源、企业、消费级等类别
- **每日扫描** — 自动检测 GitHub 版本更新，通过 Gemini + Google Search 发现新产品和行业新闻
- **智能洞察** — AI 自动生成双语（中/英）每日行业分析报告
- **新闻聚合** — 从 TechCrunch、The Verge、Ars Technica、Hacker News 自动抓取 RSS 新闻
- **对比表格** — 全产品定价方案横向对比
- **中英双语** — 完整的中文/英文界面切换

## 技术架构

```
[GitHub Actions Cron] → [/api/cron/daily-update] → Gemini 搜索 + GitHub 扫描
                                                          ↓
[EdgeOne KV 存储] ← 写入产品/洞察/扫描日志/新闻缓存
       ↓
[Next.js 静态页面] ← 构建时从 KV 读取数据 → 部署到 EdgeOne Pages CDN
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 6 |
| 样式 | Tailwind CSS 4 |
| 部署 | EdgeOne Pages (腾讯云) |
| 数据存储 | EdgeOne KV (边缘键值存储) |
| AI 搜索 | Gemini API + Google Search Grounding |
| 定时任务 | GitHub Actions Cron |
| RSS 解析 | 自研 Edge 兼容解析器 (无第三方依赖) |

### 项目结构

```
src/
  app/                    # Next.js App Router 页面
    api/                  # API 路由 (CRUD + Cron)
      products/           # 产品增删改查
      insights/           # 洞察管理
      scan-log/           # 扫描日志
      cron/daily-update/  # 每日自动更新入口
      news/               # RSS 新闻 (KV 缓存)
      seed/               # 数据初始化
    products/[id]/        # 产品详情页 (SSG)
    news/                 # 新闻页
  components/             # React 组件
  data/                   # 静态种子数据 (初始化用)
  lib/                    # 核心库
    kv.ts                 # KV 存储访问层
    gemini.ts             # Gemini API (速率限制+重试)
    scanner.ts            # 产品扫描器 (GitHub + Gemini)
    rss.ts                # RSS 解析器
    auth.ts               # 鉴权
  types/                  # TypeScript 类型定义
  i18n/                   # 国际化 (中/英)
functions/
  edgekv/                 # EdgeOne Edge Function (KV 代理)
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

本地开发时 KV 不可用，自动回退到 `src/data/` 下的静态数据文件。

## 部署

### 1. EdgeOne Pages 部署

1. 在 [EdgeOne Pages](https://pages.edgeone.ai) 导入 GitHub 仓库
2. 框架选择 Next.js，自动检测构建配置

### 2. 配置 KV 存储

1. 创建 KV 命名空间
2. 绑定到项目，变量名设为 `CLAWARENA_KV`

### 3. 配置环境变量

| 变量 | 说明 |
|------|------|
| `ADMIN_API_KEY` | 管理接口鉴权密钥 |
| `CRON_SECRET` | 定时任务鉴权密钥 |
| `GEMINI_API_KEY` | Google Gemini API 密钥 |
| `GEMINI_BASE_URL` | (可选) Gemini API 代理地址 |

### 4. 初始化数据

```bash
curl -X POST https://your-domain/api/seed \
  -H "Authorization: Bearer YOUR_ADMIN_KEY"
```

或通过 Edge Function 批量导入：

```bash
curl -X POST https://your-domain/edgekv?action=seed \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d @seed-data.json
```

### 5. 配置 GitHub Actions

在仓库 Settings → Secrets → Actions 中添加 `CRON_SECRET`，定时任务会每天自动执行扫描和重建。

## API 接口

| 接口 | 方法 | 说明 | 鉴权 |
|------|------|------|------|
| `/api/products` | GET | 获取产品列表 | 无 |
| `/api/products` | POST | 新增/更新产品 | Bearer |
| `/api/products/[id]` | GET | 获取单个产品 | 无 |
| `/api/insights` | GET | 获取洞察列表 | 无 |
| `/api/insights` | POST | 新增洞察 | Bearer |
| `/api/scan-log` | GET | 获取扫描日志 | 无 |
| `/api/news` | GET | 获取 RSS 新闻 | 无 |
| `/api/cron/daily-update` | GET | 触发每日扫描 | Bearer |
| `/edgekv` | GET/POST/DELETE | KV 存储代理 | 写入需 Bearer |

## 每日自动更新流程

1. **GitHub Actions** 每天 UTC 08:00 触发
2. **调用 `/api/cron/daily-update`**：
   - 刷新 RSS 新闻缓存
   - 扫描 GitHub 仓库版本更新
   - Gemini + Google Search 搜索新产品和行业新闻
   - AI 生成双语每日洞察
   - 新产品自动入库，产品数量持续增长
3. **推送空提交** 触发 EdgeOne Pages 重新构建静态页面

## 贡献

欢迎通过 Pull Request 贡献代码！请 fork 本仓库后提交 PR。

## 许可证

MIT License
