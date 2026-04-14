/**
 * Scan Log — records what actually changed during each daily scan.
 * Insights are generated ONLY from these observed diffs, not fabricated.
 *
 * Each scan entry records:
 *  - newProducts: products discovered for the first time
 *  - updatedProducts: products where something verifiably changed
 *  - sources: URLs/queries that sourced each finding
 *
 * The scanner compares current products.ts against web search results
 * and only logs a change when it can cite a source.
 */

export interface PriceChange {
  productId: string;
  field: "pricingSummary" | "pricingTiers";
  before: string;
  after: string;
  source: string;
}

export interface VersionChange {
  productId: string;
  oldVersion?: string;
  newVersion: string;
  highlights: string[];
  source: string;
}

export interface NewProductFound {
  productId: string;
  name: string;
  source: string; // URL or search query that surfaced it
}

export interface NewsChange {
  productId: string;
  news: string;
  source: string;
}

export interface ScanEntry {
  date: string; // YYYY-MM-DD
  newProducts: NewProductFound[];
  versionChanges: VersionChange[];
  priceChanges: PriceChange[];
  newsChanges: NewsChange[];
  searchQueries: string[]; // what queries were run
}

/**
 * Append-only log. Each daily scan adds one entry.
 * Insights are derived from this data, not invented.
 */
export const scanLog: ScanEntry[] = [
  {
    date: "2026-03-26",
    newProducts: [
      { productId: "trae", name: "Trae", source: "https://github.com/bytedance/trae-agent — GitHub; web search 'Trae AI agent ByteDance 2026'" },
      { productId: "openai-codex-cli", name: "Codex CLI", source: "https://github.com/openai/codex — GitHub; web search 'OpenAI Codex CLI agent 2026'" },
      { productId: "openai-operator", name: "Operator / CUA", source: "https://openai.com/index/introducing-operator/ — web search 'OpenAI Operator CUA agent 2026'" },
      { productId: "suna", name: "Suna", source: "https://github.com/kortix-ai/suna — GitHub trending; web search 'Suna Kortix AI agent'" },
      { productId: "convergence-proxy", name: "Proxy", source: "https://venturebeat.com — 'Convergence Proxy beating OpenAI Operator'" },
      { productId: "dify", name: "Dify", source: "https://www.businesswire.com — 'Dify Raises $30M'; GitHub 80K+ stars" },
      { productId: "genspark", name: "Genspark", source: "https://siliconangle.com — 'Genspark launches Claw AI assistant'" },
      { productId: "dia", name: "Dia", source: "web search 'Dia browser AI agent' — The Browser Company" },
      { productId: "fellou", name: "Fellou", source: "web search 'Fellou browser agent' — transparent workflow editing" },
      { productId: "browser-use", name: "Browser Use", source: "https://github.com/browser-use/browser-use — GitHub 55K+ stars" },
      { productId: "stagehand", name: "Stagehand", source: "https://github.com/browserbase/stagehand — v3 rewrite Feb 2026" },
      { productId: "skyvern", name: "Skyvern", source: "https://www.skyvern.com — 85.85% WebVoyager; web search results" },
      { productId: "ai-dot-com", name: "ai.com", source: "https://www.prnewswire.com — Super Bowl LX ad launch Feb 2026" },
      { productId: "augment-code", name: "Augment Code", source: "web search 'Augment Code SWE-Bench Pro' — #1 on benchmark" },
      { productId: "google-jules", name: "Jules", source: "web search 'Google Jules agent 2026' — Gemini 2.5 powered" },
      { productId: "servicenow-workforce", name: "ServiceNow AI Workforce", source: "https://newsroom.servicenow.com — Autonomous Workforce launch" },
      { productId: "hermes-agent", name: "Hermes Agent", source: "https://aitoolly.com — NousResearch Hermes Agent launch Mar 25" },
      { productId: "betteryeah", name: "BetterYeah", source: "https://www.scmp.com — Alibaba leads $14M funding round" },
      { productId: "multiion", name: "MultiOn", source: "web search 'MultiOn API web automation' — developer API focus" },
    ],
    versionChanges: [
      {
        productId: "openclaw",
        oldVersion: "2026.3.7",
        newVersion: "2026.3.23-2",
        highlights: ["Plugin SDK stabilized", "Legacy Chrome extension removed", "ClawHub-first installs", "Security hardening"],
        source: "https://github.com/openclaw/openclaw/releases; https://compareclaw.com/blog/post/openclaw-2026-3-23-release-notes",
      },
      {
        productId: "qclaw",
        oldVersion: "v0.1",
        newVersion: "v0.3 公测版",
        highlights: ["Full public beta (no invite code)", "Multi-platform remote control", "Scheduled tasks", "Inspiration Plaza"],
        source: "https://qclaw.qq.com/news/; https://cloud.tencent.com/developer/article/2643511",
      },
      {
        productId: "claude-code",
        oldVersion: "2.1.63",
        newVersion: "2.1.76",
        highlights: ["Voice mode", "1M context window", "/loop recurring tasks", "64K output tokens"],
        source: "https://code.claude.com/docs/en/changelog; https://github.com/anthropics/claude-code/releases",
      },
      {
        productId: "cursor",
        newVersion: "v2.6",
        highlights: ["Automations (always-on agents)", "JetBrains support via ACP", "30+ partner plugins", "MCP Apps"],
        source: "https://cursor.com/changelog; https://techcrunch.com/2026/03/05/cursor-is-rolling-out-a-new-system-for-agentic-coding/",
      },
    ],
    priceChanges: [],
    newsChanges: [
      {
        productId: "cursor",
        news: "Launched Automations; $2B+ ARR",
        source: "https://www.cnbc.com/2026/02/24/cursor-announces-major-update-as-ai-coding-agent-battle-heats-up.html",
      },
      {
        productId: "dify",
        news: "Raised $30M Series Pre-A at $180M valuation",
        source: "https://www.businesswire.com/news/home/20260309511426/en/",
      },
    ],
    searchQueries: [
      "new AI agent product launch 2026 computer use autonomous",
      "AI agent platform 2026 new release 'computer use' OR 'personal AI'",
      "AI coding agent tool 2026 new launch Augment Poolside Sourcegraph",
      "中国 AI agent 产品 2026 新发布 智能体 电脑操作",
      "AI agent new startup 2026 Suna Dia Convergence browser agent",
      "AI agent product list 2026 Fellou Convergence Trae MultiOn",
      "Trae AI agent ByteDance 2026",
      "OpenAI Operator CUA agent 2026 Convergence Proxy",
      "Dify AI agent platform 2026 BetterYeah Coze Genspark",
      "OpenAI Codex CLI agent 2026 Google Jules Augment Code",
      "browser use agent open source 2026 Stagehand Skyvern Steel",
      "QClaw 更新日志 changelog 版本 2026",
      "OpenClaw changelog release notes March 2026",
      "Claude Code changelog update March 2026",
      "Cursor update changelog March 2026",
    ],
  },
  {
    date: "2026-04-03",
    newProducts: [
      { productId: "rivonclaw", name: "RivonClaw", source: "https://github.com/gaoyangz77/rivonclaw — found via web search 'RivonClaw AI agent' from GitHub trending" },
      { productId: "clawwork", name: "ClawWork", source: "https://github.com/HKUDS/ClawWork — found via web search 'ClawWork HKUDS AI agent OpenClaw coworker'" },
      { productId: "accio-work", name: "Accio Work", source: "https://www.ithome.com/0/931/999.htm — user flagged missing, verified via '阿里 Accio AI agent 产品 2026'" },
      { productId: "qoderwork", name: "QoderWork", source: "https://ai-bot.cn/qoderwork/ — found via '实测20款OpenClaw产品' roundup on Zhihu" },
      { productId: "astronclaw", name: "AstronClaw", source: "https://www.ithome.com/0/928/507.htm — found via '科大讯飞 AstronClaw' search" },
      { productId: "lobsterai", name: "LobsterAI", source: "https://www.infoq.cn/article/fuib2PTStVR1lfgjZUMc — found via '网易有道LobsterAI' search" },
      { productId: "toclaw", name: "ToClaw", source: "https://toclaw.todesk.com/ — found via '百虾大战 龙虾 全名单' search" },
      { productId: "360-security-claw", name: "360 Security Claw", source: "https://claw.360.cn/ — found via '百虾大战 全名单' search" },
      { productId: "salesforce-agentforce", name: "Salesforce Agentforce", source: "https://www.salesforce.com/agentforce — found via Phase 2 Big Tech scan 'Salesforce Agentforce 2026'" },
      { productId: "microsoft-copilot-studio", name: "Microsoft Copilot Studio", source: "https://learn.microsoft.com/en-us/power-platform/release-plan/2026wave1/microsoft-copilot-studio/ — found via 'Microsoft Copilot agent 2026'" },
      { productId: "joyagent", name: "JoyAgent-JDGenie", source: "https://github.com/jd-opensource/joyagent-jdgenie — found via '京东 智能体 agent' search" },
    ],
    versionChanges: [
      {
        productId: "openclaw",
        oldVersion: "2026.3.23-2",
        newVersion: "2026.4.1",
        highlights: ["/tasks chat-native background task board", "Bundled SearXNG provider plugin for web_search", "MiniMax plugin auto-enabled for API-key auth"],
        source: "https://newreleases.io/project/github/openclaw/openclaw/release/v2026.4.1; https://github.com/openclaw/openclaw/releases",
      },
      {
        productId: "claude-code",
        oldVersion: "2.1.76",
        newVersion: "2.1.91",
        highlights: ["/powerup interactive lessons", "MCP _meta maxResultSizeChars up to 500K", "Fixed transcript chain breaks on --resume", "disableSkillShellExecution setting"],
        source: "https://releasebot.io/updates/anthropic/claude-code; https://github.com/anthropics/claude-code/releases",
      },
      {
        productId: "cursor",
        oldVersion: "v2.6",
        newVersion: "Cursor 3",
        highlights: ["Agents Window — multi-agent orchestration UI", "Design Mode — annotate/target UI elements in browser", "Multi-repo parallel agents (local, worktrees, cloud, SSH)"],
        source: "https://cursor.com/blog/cursor-3; https://startupnews.fyi/2026/04/02/cursor-launches-a-new-ai-agent-experience-to-take-on-claude-code-and-codex/",
      },
    ],
    priceChanges: [],
    newsChanges: [
      {
        productId: "cursor",
        news: "Cursor 3 launched — Agents Window for multi-agent orchestration + Design Mode",
        source: "https://cursor.com/blog/cursor-3",
      },
      {
        productId: "claude-code",
        news: "v2.1.91 with /powerup lessons and MCP persistence up to 500K",
        source: "https://releasebot.io/updates/anthropic/claude-code",
      },
      {
        productId: "windsurf",
        news: "Added GPT-5.2-Codex support with four reasoning effort levels; Agent Skills for Cascade",
        source: "https://windsurf.com/changelog",
      },
      {
        productId: "openclaw",
        news: "v2026.4.1 — /tasks background task board, SearXNG web_search plugin",
        source: "https://github.com/openclaw/openclaw/releases",
      },
    ],
    searchQueries: [
      "AI agent new product launch April 2026",
      "AI agent 产品 发布 2026年4月 新品上线",
      "Cursor 3 Glass launch features pricing April 2 2026",
      "QClaw changelog update March April 2026 版本更新",
      "Claude Code update April 2026 changelog new features",
      "OpenAI Codex CLI update April 2026 Windsurf update Devin update",
      "EasyClaw update 2026 HappyCapy update Manus update April changelog",
      "OpenClaw latest release version April 2026",
      "RivonClaw AI agent new site:github.com OR site:producthunt.com 2026",
      "ClawWork HKUDS AI agent OpenClaw coworker",
      "AI agent computer use new launch March April 2026",
      "华为 智能体 agent 新产品 2026",
      "京东 美团 快手 智能体 agent 产品 2026",
      "Salesforce Agentforce 2026 new features launch",
      "Microsoft Copilot agent new product 2026 Copilot Studio agents",
      "智能体 产品 发布 上线 2026 新品",
      "AI agent 电商 客服 营销 自动化 新产品 2026",
      "百虾大战 龙虾 产品 全名单 盘点 2026",
      "实测20款OpenClaw产品 腾讯阿里字节华为百度小米 全名单",
      "科大讯飞 AstronClaw 360安全龙虾 网易有道 LobsterAI 商汤 SenseClaw 2026",
      "QoderWork 阿里通义 桌面Agent 价格 ToDesk ToClaw 360 WindClaw 小米MiClaw",
      "网易有道LobsterAI pricing 价格 2026 Kimi龙虾 KimiClaw",
      "AstronClaw 讯飞 价格 16.8 ToClaw ToDesk价格 360安全龙虾",
    ],
  },
  {
    date: "2026-04-07",
    newProducts: [
      {
        productId: "google-antigravity",
        name: "Google Antigravity",
        source: "https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/ — found via web search 'Google Antigravity AI IDE coding agent 2026'; confirmed via https://antigravity.google/pricing",
      },
      {
        productId: "tencent-clawpro",
        name: "Tencent ClawPro",
        source: "https://thenextweb.com/news/tencent-clawpro-openclaw-enterprise-ai-agents — found via web search 'Tencent ClawPro enterprise AI agent platform OpenClaw 2026'; confirmed via https://cloud.tencent.com/act/pro/openclaw (IT之家 April 2, 2026 report)",
      },
    ],
    versionChanges: [
      {
        productId: "claude-code",
        oldVersion: "2.1.91",
        newVersion: "Apr 4 update",
        highlights: [
          "forceRemoteSettingsRefresh policy setting",
          "Interactive Bedrock setup wizard from login screen",
          "Per-model and cache-hit breakdown in /cost for subscription users",
          "/release-notes now an interactive version picker",
        ],
        source: "https://releasebot.io/updates/anthropic/claude-code; https://code.claude.com/docs/en/changelog",
      },
      {
        productId: "openclaw",
        oldVersion: "2026.3.23-2",
        newVersion: "2026.4.1",
        highlights: [
          "/tasks chat-native background task board",
          "Bundled SearXNG provider plugin for web_search",
          "REM preview memory tooling (rem-harness, promote-explain)",
          "AWS Bedrock Guardrails integration",
          "Loopback MCP bridge for background Claude CLI runs",
        ],
        source: "https://releasebot.io/updates/openclaw; https://blink.new/blog/openclaw-2026-4-1-whats-new-update-guide; https://github.com/openclaw/openclaw/releases",
      },
    ],
    priceChanges: [],
    newsChanges: [
      {
        productId: "genspark",
        news: "Expanded Series B to $385M at $1.6B valuation; $200M+ ARR milestone; launched Genspark Claw — AI employee with cloud computer, WhatsApp/Telegram/Slack integration",
        source: "https://aitoolly.com/ai-news/article/2026-04-04-ai-agent-startup-genspark-secures-385-million; https://www.thesaasnews.com/news/genspark-extends-series-b-to-385m-at-1-6b-valuation",
      },
      {
        productId: "manus",
        news: "Integrated into Meta Ads Manager for autonomous campaign analysis; desktop app launched Mar 18, 2026",
        source: "https://searchengineland.com/meta-adds-manus-ai-tools-into-ads-manager-469410; https://www.cnbc.com/2026/03/18/metas-manus-launches-desktop-app",
      },
    ],
    searchQueries: [
      "new AI agent product launch April 2026",
      "OpenClaw openclaw update April 2026 changelog release",
      "Claude Code update April 2026 new version changelog",
      "Cursor IDE update April 2026 new version features",
      "AI agent 智能体 新产品 发布 2026年4月",
      "Google Gemini AI agent new product launch April 2026",
      "Windsurf coding agent update April 2026 new features",
      "腾讯混元3.0 智能体 Agent 发布 April 2026",
      "NVIDIA AI agent platform enterprise April 2026 NIM",
      "Google Antigravity AI IDE coding agent 2026",
      "QClaw EasyClaw update April 2026 new features",
      "new AI agent startup funding launch April 2026 product hunt",
      "Tencent ClawPro enterprise AI agent platform OpenClaw 2026",
      "Google Antigravity IDE launch date pricing features 2026",
      "Genspark Series B $385 million April 2026 new features",
      "Manus AI update April 2026 Meta integration features",
      "OpenAI agent update April 2026 operator new features",
      "字节跳动 Coze 2026年4月 更新 新功能",
      "ChatGPT agent mode April 2026 launch date details",
      "腾讯 ClawPro 企业版 发布日期 价格 功能",
    ],
  },
];
