# Today's News — Daily Highlights

A clean **daily news highlights** service for Korea that summarizes **yesterday's most-viewed / most-commented** articles across major portals at **7:00 AM KST**.  
Built with **Next.js 15 (App Router)** and **MUI**, with **Light/Dark/Night** themes, server-side scraping, charset auto-detection (EUC‑KR/CP949), and an **engagement-based ranking** (views & comments). We acquire data using HTML crawling (or, a web crawling) method.

> Status: MVP ready • 2025-10-19

---

## ✨ Features

- **Daily Highlights at 07:00 KST**  
  - Aggregates top/engaged news from **Naver** & **Daum**.
  - **Engagement-ranking**: sorts by `score = views*2 + comments*3` (tunable).
  - **Summaries** from meta descriptions (extractive, Korean-biased heuristic).

- **Robust Fetching for KR news**  
  - **Charset auto-decoding** via `iconv-lite` (UTF-8, EUC‑KR/CP949).
  - Fallbacks: try yesterday, then **today**; optional **sample items** during dev.

- **3 Themes** (Light / Dark / Night) with a floating **Theme Toggle** (MUI).

- **Server API**  
  - `/api/highlights`: builds & returns the ranked list (SSR-friendly).
  - `/api/ingest`: cron-trigger endpoint secured by `CRON_SECRET`.

- **Production scheduling**  
  - `vercel.json` cron: `0 22 * * *` (UTC) → **07:00 KST**.

---

## 🧱 Tech Stack

- **Next.js 15 (App Router)**, **React 18**
- **MUI v6** for UI, custom **Light/Dark/Night** palettes
- **Cheerio** for HTML parsing
- **iconv-lite** + **content-type** for charset detection/decoding
- **TypeScript** with path alias `@/*`

---

## 🗂 Project Structure (key parts)

```
app/
  api/
    highlights/route.ts     # Build daily highlights (fetch, decode, summarize, rank)
    ingest/route.ts         # Cron trigger with ?secret=CRON_SECRET
  layout.tsx                # ThemeRegistry wrapper
  page.tsx                  # Lists highlight cards
components/
  ThemeRegistry.tsx         # MUI theme provider (Light/Dark/Night)
  ThemeToggle.tsx           # Floating mode toggle
  NewsCard.tsx              # Card UI with chips for rank/category/views/comments
lib/
  fetchText.ts              # Robust fetch (charset-aware)
  sources.ts                # Naver/Daum listings scraping
  engagement.ts             # Extract viewCount/commentCount from HTML/JSON-LD/meta
  summarize.ts              # Simple Korean extractive summarizer
public/
  favicon.ico
vercel.json                 # 07:00 KST cron (UTC 22:00)
types/
  content-type.d.ts         # Local types (package has no @types)
tsconfig.json               # baseUrl + `@/*` alias
```

---

## 🔌 API

### `GET /api/highlights`
Returns yesterday’s (or fallback to today’s) highlights.

```json
{{
  "date": "YYYYMMDD",
  "count": 30,
  "items": [
    {{
      "title": "…",
      "url": "https://…",
      "source": "NAVER | DAUM | Press name",
      "category": "…",
      "rank": 1,
      "summary": "…",
      "viewCount": 12345,
      "commentCount": 678,
      "score": 27501
    }}
  ]
}}
```

### `GET /api/ingest?secret=CRON_SECRET`
Validates the **secret** and triggers `/api/highlights`, returning the refreshed count.

---

## 🔧 Environment Variables

| Key | Required | Default | Description |
|---|---|---|---|
| `CRON_SECRET` | ✅ | — | Secret token to protect `/api/ingest`. Generate a random string. |
| `NEWS_SOURCE` |  | `both` | `naver` / `daum` / `both`. |
| `ENG_WEIGHT_VIEWS` |  | `2` | Weight of viewCount in ranking score. |
| `ENG_WEIGHT_COMMENTS` |  | `3` | Weight of commentCount in ranking score. |
| `ALLOW_SAMPLE` |  | `0` | When `1`, returns 3 sample items if all sources fail (useful in dev). |

Example `.env.local`:

```ini
NEWS_SOURCE=both
CRON_SECRET=your_random_secret_here
ENG_WEIGHT_VIEWS=2
ENG_WEIGHT_COMMENTS=3
ALLOW_SAMPLE=1
```

**Generate a secret**  
- PowerShell (Windows):
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object {{Get-Random -Maximum 256}}))
  ```

---

## ▶️ Local Development

```bash
pnpm i           # or npm i / yarn
pnpm dev         # dev server (port may auto-switch if 3000 is in use)
# or
pnpm build && pnpm start  # production mode
```

The App Router page uses **relative fetch** (`/api/highlights`) for stability across ports/proxies.

---

## 🚀 Deployment (Vercel)

1. Add **Environment Variables** in Vercel Project Settings:
   - `CRON_SECRET`, `NEWS_SOURCE`, `ENG_WEIGHT_*`, (optional) `ALLOW_SAMPLE`
2. Keep `vercel.json` cron (UTC 22:00 → **07:00 KST**). Cron should call:
   ```
   https://<your-domain>/api/ingest?secret=<CRON_SECRET>
   ```

---

## 🧪 Troubleshooting & Fix Log (from Q&A session)

- **Module alias error** — `@/components/ThemeRegistry` not found  
  → Added `baseUrl` + `paths` (`@/*`) in `tsconfig.json`, created `ThemeRegistry.tsx`.

- **Unexpected token '<' parsing JSON** on `/api/highlights`  
  → Made page fetch robust (relative path, `text()` + guarded JSON parse).

- **TypeScript error with `headers()`** (Next 15 type = `Promise<ReadonlyHeaders>`)  
  → Removed header access from page; relied on **relative URL** only.

- **Korean text mojibake (  )** from EUC‑KR pages  
  → Implemented `fetchText()` with `content-type` + `iconv-lite` to auto-detect & decode.

- **`content-type` has no types**  
  → Added local `types/content-type.d.ts`.

- **Engagement-based ordering required**  
  → Added `extractEngagement()` (JSON‑LD / meta / inline patterns) and score ranking.

- **Naver relative URLs & `href.startsWith ?` typo**  
  → Fixed to `href.startsWith('http')`, added helper `abs(base, href)` for Daum.

- **Empty list locally due to portal blocking (403/anti-bot)**  
  → Fallback to **today’s page**; optional **samples** via `ALLOW_SAMPLE=1`.

- **Cron & secrets**  
  → `/api/ingest` checks `CRON_SECRET`. Vercel schedules at **07:00 KST**.

---

## 📌 Roadmap

- Add proper article content fetch + abstractive summarization (server-side model/API)
- Per-category tabs (Politics/Economy/Sports/…)
- Source press logos & thumbnails
- Client-side filters (e.g., views-only / comments-only ranking)
- Persistence (KV/DB) + historical archives
- E2E & integration tests

---

## 📄 License

MIT (add your notice here).
