# ClawArena

**AI Agent Ecosystem Tracker** — Real-time tracking of version updates, pricing changes, and industry news for OpenClaw, Claude Code, Cursor, QClaw, and the entire AI agent ecosystem.

[中文](./README.md) | English

## Live Site

**https://clawarena.pupulab.com**

## Features

- **Product Database** — Track 60+ AI agent and coding tool products across open-source, enterprise, and consumer categories
- **Daily Scanning** — Automated GitHub release detection + Gemini-powered web search for new products and industry news
- **AI-Powered Insights** — Auto-generated bilingual (EN/ZH) daily analysis reports
- **News Aggregation** — RSS feeds from TechCrunch, The Verge, Ars Technica, and Hacker News
- **Comparison Table** — Side-by-side pricing plan comparison across all products
- **Bilingual UI** — Full English/Chinese interface toggle

## Architecture

```
[GitHub Actions Cron] → [/api/cron/daily-update] → Gemini Search + GitHub Scan
                                                          ↓
[EdgeOne KV Storage] ← Write products/insights/scan-log/news cache
       ↓
[Next.js Static Pages] ← Read from KV at build time → Deploy to EdgeOne Pages CDN
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Hosting | EdgeOne Pages (Tencent Cloud) |
| Storage | EdgeOne KV (Edge Key-Value Store) |
| AI Search | Gemini API + Google Search Grounding |
| Scheduling | GitHub Actions Cron |
| RSS Parsing | Custom edge-compatible parser (zero dependencies) |

### Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/                  # API routes (CRUD + Cron)
      products/           # Product CRUD
      insights/           # Insights management
      scan-log/           # Scan log
      cron/daily-update/  # Daily auto-update endpoint
      news/               # RSS news (KV cached)
      seed/               # Data seeding
    products/[id]/        # Product detail pages (SSG)
    news/                 # News page
  components/             # React components
  data/                   # Static seed data (for initialization)
  lib/                    # Core libraries
    kv.ts                 # KV storage access layer
    gemini.ts             # Gemini API (rate limiting + retry)
    scanner.ts            # Product scanner (GitHub + Gemini)
    rss.ts                # RSS parser
    auth.ts               # Authentication
  types/                  # TypeScript type definitions
  i18n/                   # Internationalization (EN/ZH)
functions/
  edgekv/                 # EdgeOne Edge Function (KV proxy)
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build
npm run build
```

KV storage is unavailable in local development. The app automatically falls back to static data files in `src/data/`.

## Deployment

### 1. EdgeOne Pages

1. Import the GitHub repository on [EdgeOne Pages](https://pages.edgeone.ai)
2. Framework auto-detected as Next.js

### 2. Configure KV Storage

1. Create a KV namespace
2. Bind to the project with variable name `CLAWARENA_KV`

### 3. Environment Variables

| Variable | Description |
|----------|------------|
| `ADMIN_API_KEY` | Admin API authentication key |
| `CRON_SECRET` | Cron job authentication key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_BASE_URL` | (Optional) Gemini API proxy URL |

### 4. Seed Data

```bash
curl -X POST https://your-domain/api/seed \
  -H "Authorization: Bearer YOUR_ADMIN_KEY"
```

Or bulk import via Edge Function:

```bash
curl -X POST https://your-domain/edgekv?action=seed \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d @seed-data.json
```

### 5. GitHub Actions

Add `CRON_SECRET` to repository Settings → Secrets → Actions. The daily cron job will automatically scan and rebuild.

## API Reference

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/products` | GET | List all products | None |
| `/api/products` | POST | Create/update product | Bearer |
| `/api/products/[id]` | GET | Get single product | None |
| `/api/insights` | GET | List insights | None |
| `/api/insights` | POST | Create insight | Bearer |
| `/api/scan-log` | GET | List scan entries | None |
| `/api/news` | GET | Get RSS news | None |
| `/api/cron/daily-update` | GET | Trigger daily scan | Bearer |
| `/edgekv` | GET/POST/DELETE | KV storage proxy | Write requires Bearer |

## Daily Update Flow

1. **GitHub Actions** triggers at UTC 08:00 daily
2. **Calls `/api/cron/daily-update`**:
   - Refresh RSS news cache
   - Scan GitHub repos for version updates
   - Gemini + Google Search for new products and industry news
   - AI generates bilingual daily insights
   - New products auto-added to database
3. **Pushes empty commit** to trigger EdgeOne Pages static rebuild

## Contributing

Contributions via Pull Request are welcome! Please fork this repository and submit a PR.

## License

MIT License
