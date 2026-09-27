# Quick Start

## 1. Prerequisites

- Node.js 20+ (developed on 24.x) and npm
- A Google Gemini API key — free tier at https://aistudio.google.com/app/api-keys
- Chrome/Chromium for Puppeteer (downloaded automatically by `npm install`; if it is missing,
  run `npx puppeteer browsers install chrome`)

## 2. Install and configure

```bash
cd website-cloner
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```
USE_GEMINI=true
GEMINI_API_KEY=<your key>
GEMINI_MODEL=gemini-3.8-flash
GEMINI_MODEL_FALLBACK=gemini-3.6-flash,gemini-3.1-flash-lite
```

`.env.local` is git-ignored and read only on the server side. The key is sent in the
`x-goog-api-key` header and never appears in client code, API responses or job logs.

## 3. Run

```bash
npm run dev            # http://localhost:3000
```

If port 3000 is taken, Next.js moves to 3001 and prints which port it used.

## 4. First clone

1. Open http://localhost:3000 and paste a public URL. Good first runs:
   `https://example.com` (fast), `https://www.apple.com` (visually rich).
2. Press **Analyze**. One click starts the whole agent; the five steps update live as the job
   progresses: Website Analysis -> AI Planning -> Code Generation -> Build Validation -> Preview.
3. Watch the metrics row (build status, repair attempts `n of 2`, elapsed time, project id) and
   expand **Agent logs** for the running narrative, including retry/backoff lines and which files
   the AI patched.
4. When the stage badge reads **Ready**, use **Open Preview** — the clone runs as its own
   `next start` server on port 4100+.
5. Type a change in plain language ("Make the navbar sticky", "Add a testimonials section") and
   press **Apply Change**. That re-runs modify -> rebuild -> preview restart on the same project.
6. http://localhost:3000/preview lists every generated site and its live preview link.

Expect roughly 1-3 minutes per clone: a few Gemini calls plus a real `npm install` and
`next build` of the generated project (the first one is slower because it installs dependencies).

## 5. Where the output goes

Generated projects are written to `generated-sites/<project-id>/`, a **sibling** of the
`website-cloner` directory, and are not part of this repo (git-ignored). You can open one in an
editor, or run it directly:

```bash
cd ../generated-sites/<project-id>
npm run build && npm run start
```

## Troubleshooting

**"Gemini is temporarily unavailable. Please try again in a moment."**
Every model in the chain hit a transient failure (usually free-tier 429 quota). The pipeline
already retried 3x with 2s/4s/8s backoff and then walked the fallback models. Wait a minute and
press Re-run clone; if it persists, check quota in AI Studio or set `GEMINI_MODEL` to a model
your project still has budget on. Authentication/config errors (401/403/400) are never retried —
they surface their real message instead.

**Job vanished / "Job not found".**
Jobs live in memory. Restarting the dev server — including the automatic restart that happens
when you edit files under `src/lib` while `npm run dev` is running — clears job history. The
generated project on disk is unaffected; start a new clone or open it from `/preview`.

**Preview link does not respond.**
Preview servers are children of the cloner process, so stopping the dev server stops them too.
Re-run the clone (or `npm run start` inside that project folder) to get a live URL.

**Build Validation fails after 2 repair attempts.**
Expand Agent logs and copy the stderr tail. Then reproduce it directly in
`generated-sites/<project-id>` with `npm run build`. Common causes are an AI component importing
something the scaffold does not provide; a targeted modification instruction ("Fix X by doing Y")
usually resolves it on the next modify run.

**Puppeteer fails to launch.**
Chromium was not downloaded (`npm install` ran with `PUPPETEER_SKIP_DOWNLOAD`), or a firewall
blocked it. Reinstall the browser with `npx puppeteer browsers install chrome`.

**Analysis looks thin on a heavy SPA.**
The page gets `domcontentloaded` plus a 2.5s hydration window. Very slow client-rendered sites
can be partially captured; auth-protected pages cannot be analyzed at all.

## Next steps

1. Clone two or three different sites to confirm generalization (no site-specific code exists).
2. Exercise the modification panel on a ready project.
3. Record the demo video — see `DEMO_GUIDE.md`.
4. Push the repo and submit (see `SUBMISSION_CHECKLIST.md`).
