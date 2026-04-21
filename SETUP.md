# Get Parade Ready — A/B Test App · Setup Guide

## 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste the contents of `supabase-schema.sql`, and run it
3. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Video files

Host your two video files somewhere publicly accessible. Good options:
- **Vimeo** (unlisted) — direct `.mp4` link
- **Cloudflare R2 / AWS S3** — public bucket URL
- **public/videos/** folder — works locally but Vercel has a 50 MB file limit per deployment

Set the URLs as environment variables:
```
NEXT_PUBLIC_VIDEO_A_URL=https://your-cdn.com/version-a.mp4   # vocal crowd
NEXT_PUBLIC_VIDEO_B_URL=https://your-cdn.com/version-b.mp4   # instrumental
```

## 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_VIDEO_A_URL=https://...
NEXT_PUBLIC_VIDEO_B_URL=https://...
NEXT_PUBLIC_DASHBOARD_PASSWORD=YourSecretPassword
```

**Change `NEXT_PUBLIC_DASHBOARD_PASSWORD`** before sharing the app publicly.

## 4. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo in the Vercel dashboard. Add all five environment variables in **Project Settings → Environment Variables**.

---

## App routes

| Route | Description |
|---|---|
| `/` | Welcome screen (share this with participants) |
| `/test` | A/B test flow — auto-redirects here from welcome |
| `/dashboard` | Password-protected results dashboard |

---

## Dashboard default password

`ArsenalABTest2024`

Change it via the `NEXT_PUBLIC_DASHBOARD_PASSWORD` environment variable.

---

## Data model

All responses are stored in a single `sessions` table in Supabase. Each completed
test = one row. You can export all data from the dashboard (Download CSV button)
or directly from Supabase's Table Editor.

**Variable mapping:**
- `Version A` = full vocal crowd version of *North London Forever*
- `Version B` = instrumental-only version
- `order_shown` = which version the participant saw first (for order-bias analysis)
