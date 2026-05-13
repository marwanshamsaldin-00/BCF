# BCF Leave Manager — Vercel Deployment Guide

## Environment Variables (Required)
In Vercel dashboard → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://ydxauxxohuddfngrtyxg.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key) |

## Build Settings (Vercel Dashboard)
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## What Changed from Lovable Version
- Removed `@cloudflare/vite-plugin` and Cloudflare Workers SSR
- Removed `@lovable.dev/vite-tanstack-config`
- Converted to pure Vite SPA
- Added `vercel.json` for client-side routing (fixes 404 on refresh)
- Added `index.html` entry point
- Simplified Supabase client to client-only
