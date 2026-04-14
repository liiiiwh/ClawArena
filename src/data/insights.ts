/**
 * Daily Insights — generated from scan-log.ts diffs, NOT fabricated.
 *
 * Each insight must be traceable to actual observations:
 * - New products discovered (with source URLs)
 * - Version changes detected (with changelog sources)
 * - Price changes observed (with before/after)
 * - News verified from primary sources
 *
 * Rule: Never state something we didn't actually observe or verify.
 * Trends should be inferences clearly labeled as such, based on the data.
 */

export interface Insight {
  id: string;
  date: string;
  title: { en: string; zh: string };
  summary: { en: string; zh: string };
  observations: {
    fact: { en: string; zh: string };
    source: string; // URL or scan-log reference
    type: "new-product" | "version-update" | "price-change" | "news" | "trend-inference";
  }[];
  hotProducts: string[];
  tags: string[];
}

export const insights: Insight[] = [
  {
    id: "2026-03-26",
    date: "Mar 26, 2026",
    title: {
      en: "First Full Scan: 19 New Products Cataloged",
      zh: "首次全量扫描：新增收录19款产品",
    },
    summary: {
      en: "Initial scan discovered 19 previously uncatalogued products and verified version updates for 4 core products. Key finding: the browser agent category is unexpectedly crowded with 6+ active products competing on WebVoyager benchmarks.",
      zh: "首次扫描发现19款此前未收录的产品，并核实了4个核心产品的版本更新。关键发现：浏览器Agent赛道出乎意料地拥挤，6+款产品正在WebVoyager基准上竞争。",
    },
    observations: [
      {
        fact: {
          en: "Discovered 6 browser agent products in a single scan: Convergence Proxy (88% WebVoyager), Fellou, Browser Use (89.1%), Stagehand v3, Skyvern 2.0 (85.85%), Dia",
          zh: "单次扫描发现6款浏览器Agent产品：Convergence Proxy（WebVoyager 88%）、Fellou、Browser Use（89.1%）、Stagehand v3、Skyvern 2.0（85.85%）、Dia",
        },
        source: "Web search: 'browser use agent open source 2026'; GitHub trending; VentureBeat",
        type: "new-product",
      },
      {
        fact: {
          en: "QClaw shipped 4 versions in 20 days (v0.1 Mar 1 → v0.3 Mar 20): from invite-only to full public beta, adding WeChat Mini Program, multi-platform remote control, scheduled tasks",
          zh: "QClaw在20天内发布4个版本（v0.1 3月1日→v0.3 3月20日）：从邀请码内测到全量公测，新增微信小程序、多平台远控、定时任务",
        },
        source: "https://qclaw.qq.com/news/; https://cloud.tencent.com/developer/article/2643511",
        type: "version-update",
      },
      {
        fact: {
          en: "OpenClaw released 4 versions in March (3.7 → 3.23-2), most significant change: complete removal of Legacy Chrome extension relay, Plugin SDK stabilized with ClawHub-first installs",
          zh: "OpenClaw在3月发布4个版本（3.7→3.23-2），最重要变化：彻底移除Legacy Chrome扩展中继，Plugin SDK稳定化并采用ClawHub优先安装",
        },
        source: "https://github.com/openclaw/openclaw/releases; https://compareclaw.com/blog/post/openclaw-2026-3-23-release-notes",
        type: "version-update",
      },
      {
        fact: {
          en: "Claude Code went from 2.1.63 to 2.1.76 in March: added voice mode, 1M token context (5x increase), /loop for recurring tasks, 64K output tokens",
          zh: "Claude Code在3月从2.1.63更新到2.1.76：新增语音模式、1M上下文窗口（5倍提升）、/loop定时任务、64K输出token",
        },
        source: "https://code.claude.com/docs/en/changelog; https://github.com/anthropics/claude-code/releases",
        type: "version-update",
      },
      {
        fact: {
          en: "Cursor launched Automations (always-on agents triggered by events), JetBrains support via ACP, 30+ new plugins — verified $2B+ ARR from CNBC reporting",
          zh: "Cursor发布Automations（事件触发的常驻Agent）、通过ACP支持JetBrains、30+新插件——CNBC报道确认$2B+ ARR",
        },
        source: "https://cursor.com/changelog; https://www.cnbc.com/2026/02/24/cursor-announces-major-update",
        type: "version-update",
      },
      {
        fact: {
          en: "[Inference] 3 of 4 major coding agents (Claude Code, Cursor, Trae) all added 'recurring/automated task' features in March — suggests user demand for agents that work in the background without manual triggers",
          zh: "[推断] 4大编程Agent中有3个（Claude Code、Cursor、Trae）在3月都新增了「定时/自动任务」功能——暗示用户对无需手动触发、后台运行的Agent有强烈需求",
        },
        source: "Cross-referencing: Claude Code /loop, Cursor Automations, Trae Builder — all March 2026 releases",
        type: "trend-inference",
      },
      {
        fact: {
          en: "[Inference] Browser agent benchmark scores are converging: Browser Use 89.1%, Convergence 88%, Skyvern 85.85% — within a ~3% band, suggesting the technology is commoditizing fast",
          zh: "[推断] 浏览器Agent基准分数正在趋同：Browser Use 89.1%、Convergence 88%、Skyvern 85.85%——在约3%的区间内，暗示该技术正在快速商品化",
        },
        source: "WebVoyager benchmark scores from respective product pages and VentureBeat reporting",
        type: "trend-inference",
      },
    ],
    hotProducts: ["qclaw", "openclaw", "claude-code", "cursor", "convergence-proxy", "browser-use", "skyvern"],
    tags: ["first-scan", "browser-agents", "coding-agents", "version-updates"],
  },
  {
    id: "2026-04-03",
    date: "Apr 3, 2026",
    title: {
      en: "Cursor 3 Launches Multi-Agent Orchestration; Coding Wars Enter New Phase",
      zh: "Cursor 3 发布多Agent编排；编程工具大战进入新阶段",
    },
    summary: {
      en: "Major shift: Cursor 3 launched with Agents Window and Design Mode, directly challenging Claude Code and Codex in the multi-agent space. Meanwhile OpenClaw v2026.4.1 and Claude Code v2.1.91 also shipped updates. Two new open-source products found: RivonClaw (easy-mode OpenClaw wrapper) and ClawWork (economic agent benchmark from HKU). The coding agent battle is now explicitly about agent orchestration, not just code completion.",
      zh: "重大转变：Cursor 3 发布 Agents Window 和 Design Mode，直接挑战 Claude Code 和 Codex 的多Agent能力。同时 OpenClaw v2026.4.1 和 Claude Code v2.1.91 也发布更新。新发现两个开源产品：RivonClaw（易用版OpenClaw包装器）和 ClawWork（港大的经济Agent基准测试）。编程工具大战现已明确转向Agent编排能力，而非单纯的代码补全。",
    },
    observations: [
      {
        fact: {
          en: "Cursor 3 launched Apr 2 with Agents Window (code name 'Glass') — a new interface for running many agents in parallel across repos and environments (local, worktrees, cloud, SSH), plus Design Mode for visual UI annotation",
          zh: "Cursor 3 于4月2日发布，带来 Agents Window（代号 'Glass'）——全新界面支持跨仓库、多环境（本地、worktree、云端、SSH）并行运行多个Agent，以及 Design Mode 可视化UI标注",
        },
        source: "https://cursor.com/blog/cursor-3; https://startupnews.fyi/2026/04/02/cursor-launches-a-new-ai-agent-experience-to-take-on-claude-code-and-codex/",
        type: "version-update",
      },
      {
        fact: {
          en: "Claude Code updated to v2.1.91 (Apr 2): added /powerup interactive lessons, MCP tool result persistence up to 500K chars, fixed --resume transcript chain breaks",
          zh: "Claude Code 更新至 v2.1.91（4月2日）：新增 /powerup 交互式教学、MCP 工具结果持久化上限提升至 500K 字符、修复 --resume 会话链断裂问题",
        },
        source: "https://releasebot.io/updates/anthropic/claude-code; https://github.com/anthropics/claude-code/releases",
        type: "version-update",
      },
      {
        fact: {
          en: "OpenClaw released v2026.4.1: adds /tasks as chat-native background task board, bundled SearXNG plugin for web_search, MiniMax plugin auto-enabled",
          zh: "OpenClaw 发布 v2026.4.1：新增 /tasks 聊天原生后台任务面板、内置 SearXNG web_search 插件、MiniMax 插件自动启用",
        },
        source: "https://newreleases.io/project/github/openclaw/openclaw/release/v2026.4.1; https://github.com/openclaw/openclaw/releases",
        type: "version-update",
      },
      {
        fact: {
          en: "Windsurf added GPT-5.2-Codex model support with four reasoning effort levels, plus Agent Skills for Cascade",
          zh: "Windsurf 新增 GPT-5.2-Codex 模型支持（四档推理强度），以及 Cascade 的 Agent Skills 功能",
        },
        source: "https://windsurf.com/changelog",
        type: "news",
      },
      {
        fact: {
          en: "New discovery: RivonClaw — easy-mode OpenClaw desktop wrapper with natural-language rules, 20+ LLM providers, agent learns preferences over time",
          zh: "新发现：RivonClaw——易用版 OpenClaw 桌面包装器，支持自然语言规则、20+ LLM 提供商，Agent 可随时间学习用户偏好",
        },
        source: "https://github.com/gaoyangz77/rivonclaw",
        type: "new-product",
      },
      {
        fact: {
          en: "New discovery: ClawWork (HKU Data Science) — transforms OpenClaw agents into economically self-sustaining AI coworkers across 44+ industry sectors, top models earn $1,500+/hr equivalent",
          zh: "新发现：ClawWork（港大数据科学实验室）——将 OpenClaw Agent 转化为可经济自持的 AI 同事，覆盖 44+ 行业，顶级模型达 $1,500+/小时等效薪资",
        },
        source: "https://github.com/HKUDS/ClawWork; https://x.com/huang_chao4969/status/2023282092042580015",
        type: "new-product",
      },
      {
        fact: {
          en: "[Inference] All three major coding agents (Cursor, Claude Code, Codex) shipped updates within 48hrs of each other (Apr 1-2). Cursor 3's explicit framing as 'response to Claude Code and Codex' confirms these three are now in direct head-to-head competition for the agentic coding market. The battle has shifted from 'AI autocomplete' to 'agent orchestration' — who can run the most agents in parallel, most reliably.",
          zh: "[推断] 三大编程Agent（Cursor、Claude Code、Codex）在48小时内密集发版（4月1-2日）。Cursor 3 明确以「回应 Claude Code 和 Codex」定位，确认三者已进入正面竞争。战场已从「AI 自动补全」转向「Agent 编排」——谁能最稳定地并行运行最多 Agent。",
        },
        source: "Cross-referencing: Cursor 3 blog 'response to Claude Code and Codex'; Claude Code 2.1.91 release same week; Codex CLI updates via OpenAI changelog",
        type: "trend-inference",
      },
      {
        fact: {
          en: "[Inference] OpenClaw's /tasks and Cursor's Agents Window both add native 'background task management' — confirming the March trend of demand for agents that work autonomously. The ecosystem is converging on a UX pattern where users manage a queue of agent tasks, not single conversations.",
          zh: "[推断] OpenClaw 的 /tasks 和 Cursor 的 Agents Window 都新增原生「后台任务管理」——进一步证实3月观测到的趋势：用户需要自主运行的Agent。生态正在趋同于一种 UX 模式：用户管理的是 Agent 任务队列，而非单一对话。",
        },
        source: "Cross-referencing: OpenClaw v2026.4.1 /tasks feature; Cursor 3 Agents Window; Claude Code /loop (March)",
        type: "trend-inference",
      },
    ],
    hotProducts: ["cursor", "claude-code", "openclaw", "windsurf", "rivonclaw", "clawwork"],
    tags: ["cursor-3", "multi-agent", "coding-wars", "new-products", "agent-orchestration"],
  },
  {
    id: "2026-04-07",
    date: "Apr 7, 2026",
    title: {
      en: "Google Antigravity & Tencent ClawPro Enter the Arena; Genspark Hits $385M",
      zh: "Google Antigravity 与腾讯 ClawPro 入局；Genspark 融资达 3.85 亿美元",
    },
    summary: {
      en: "Two major products were missed in prior scans and are now catalogued: Google Antigravity (agent-first IDE, free preview, Nov 2025) and Tencent ClawPro (enterprise OpenClaw management, April 2, 2026). Meanwhile Claude Code shipped an April 4 update and Genspark expanded its Series B to $385M at $1.6B valuation with $200M+ ARR, confirming that the AI agent market is rapidly stratifying into IDE-layer tools, infrastructure management platforms, and funded consumer agents.",
      zh: "本次扫描补录了两个之前遗漏的重要产品：Google Antigravity（以Agent为核心的IDE，免费预览，2025年11月发布）和腾讯ClawPro（企业版OpenClaw管理平台，2026年4月2日发布）。与此同时，Claude Code发布了4月4日更新，Genspark B轮融资扩大至3.85亿美元、估值16亿美元、ARR超2亿美元。AI Agent市场正在快速分层为IDE工具、基础设施管理平台和有资本支持的消费级产品三大赛道。",
    },
    observations: [
      {
        fact: {
          en: "Google Antigravity (announced Nov 18, 2025 alongside Gemini 3) was missing from the database — an agent-first IDE with Manager Surface for parallel multi-agent orchestration, supporting Gemini 3.1 Pro, Claude Sonnet/Opus 4.6, and GPT-OSS-120B. AgentKit 2.0 (Mar 2026) added 16 specialized agents and 40+ domain skills. Free for individuals in public preview.",
          zh: "数据库遗漏了 Google Antigravity（2025年11月18日随 Gemini 3 发布）——这是一款以Agent为核心的IDE，具有Manager Surface可并行多Agent编排，支持 Gemini 3.1 Pro、Claude Sonnet/Opus 4.6 和 GPT-OSS-120B。AgentKit 2.0（2026年3月）新增16个专属Agent和40+领域技能。个人用户公测期间免费。",
        },
        source: "https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/; https://antigravity.google/pricing",
        type: "new-product",
      },
      {
        fact: {
          en: "Tencent Cloud launched ClawPro (enterprise OpenClaw platform) in public beta on April 2, 2026 — enables company-wide AI agent deployment in 10 minutes, adopted by 200+ orgs in finance/government/manufacturing during internal beta. Pricing starts from ¥100/mo. Tencent now has three distinct OpenClaw products: QClaw (consumer), WorkBuddy (office), ClawPro (enterprise).",
          zh: "腾讯云于2026年4月2日正式开启ClawPro公测（企业版OpenClaw平台）——最快10分钟完成全员AI Agent部署，内测期间已有200+家金融、政府、制造业机构采用。起价¥100/月。腾讯目前已有三款差异化OpenClaw产品：QClaw（消费端）、WorkBuddy（办公场景）、ClawPro（企业管控）。",
        },
        source: "https://thenextweb.com/news/tencent-clawpro-openclaw-enterprise-ai-agents; https://www.donews.com/news/detail/1/6496525.html",
        type: "new-product",
      },
      {
        fact: {
          en: "Claude Code shipped another update on April 4: forceRemoteSettingsRefresh policy, interactive Bedrock setup wizard, per-model /cost breakdown, and /release-notes interactive version picker — days after the v2.1.91 release on April 2.",
          zh: "Claude Code 于4月4日再次更新：新增 forceRemoteSettingsRefresh 策略、交互式 Bedrock 配置向导、/cost 的按模型分项统计，以及可交互的 /release-notes 版本选择器——距 4月2日 v2.1.91 发布仅两天。",
        },
        source: "https://releasebot.io/updates/anthropic/claude-code; https://code.claude.com/docs/en/changelog",
        type: "version-update",
      },
      {
        fact: {
          en: "Genspark expanded its Series B to $385M at $1.6B valuation (April 4) and crossed $200M ARR. Simultaneously launched Genspark Claw — an AI employee running in Genspark Cloud Computer, accessible via WhatsApp/Telegram/Teams/Slack.",
          zh: "Genspark 于4月4日将B轮融资扩大至3.85亿美元、估值16亿美元，ARR突破2亿美元。同步发布 Genspark Claw——在 Genspark Cloud Computer 上运行的AI员工，支持通过 WhatsApp/Telegram/Teams/Slack 分配任务。",
        },
        source: "https://aitoolly.com/ai-news/article/2026-04-04-ai-agent-startup-genspark-secures-385-million; https://www.thesaasnews.com/news/genspark-extends-series-b-to-385m-at-1-6b-valuation",
        type: "news",
      },
      {
        fact: {
          en: "Manus (acquired by Meta Dec 2025) integrated into Meta Ads Manager for autonomous campaign analysis and launched a desktop app (Mar 18, 2026) — the product is now embedded in Meta's advertising stack while continuing to operate as a standalone service.",
          zh: "Manus（2025年12月被Meta收购）已集成至Meta Ads Manager，用于自主广告分析，并于2026年3月18日发布桌面应用——该产品在保持独立运营的同时，正逐步嵌入Meta广告体系。",
        },
        source: "https://searchengineland.com/meta-adds-manus-ai-tools-into-ads-manager-469410; https://www.cnbc.com/2026/03/18/metas-manus-launches-desktop-app",
        type: "news",
      },
      {
        fact: {
          en: "[Inference] Google (Antigravity), Microsoft (Copilot Studio), and Tencent (ClawPro) have all now launched dedicated enterprise AI agent management platforms. This confirms a structural shift: the platform layer is commoditizing (OpenClaw is free), so Big Tech is competing on management, security, compliance, and integration — not the underlying agent runtime.",
          zh: "[推断] Google（Antigravity）、微软（Copilot Studio）和腾讯（ClawPro）均已推出企业AI Agent管控平台。这确认了一个结构性转变：平台层正在商品化（OpenClaw免费），大厂的竞争重心转向管理、安全合规和生态集成，而非底层Agent运行时本身。",
        },
        source: "Cross-referencing: Tencent ClawPro launch (Apr 2); Microsoft Copilot Studio Wave 3 (Apr 2026); Google Antigravity enterprise tier; Salesforce Agentforce $2/conversation pricing model",
        type: "trend-inference",
      },
      {
        fact: {
          en: "[Inference] Genspark ($200M ARR), Manus (Meta acquisition), and HappyCapy ($1M ARR in 20 days) all achieved rapid commercial traction by wrapping existing agent infrastructure (OpenClaw, LLM APIs) with consumer-friendly UX. The revenue is going to the UX and distribution layer, not the infrastructure layer.",
          zh: "[推断] Genspark（ARR 2亿美元）、Manus（被Meta收购）和 HappyCapy（20天破百万美元ARR）均通过在现有Agent基础设施（OpenClaw、LLM API）上构建消费级易用体验，实现了快速商业化。收入正流向UX与分发层，而非基础设施层。",
        },
        source: "Cross-referencing: Genspark $385M funding at $200M ARR (Apr 2026); HappyCapy $1M ARR in 20 days (Feb 2026); Manus Meta acquisition (Dec 2025)",
        type: "trend-inference",
      },
    ],
    hotProducts: ["google-antigravity", "tencent-clawpro", "claude-code", "genspark", "manus"],
    tags: ["new-products", "enterprise-platform", "funding", "google", "tencent", "meta"],
  },
];
