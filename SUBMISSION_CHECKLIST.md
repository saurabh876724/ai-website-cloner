# Submission Checklist

## Repository state

| Item | Status |
|---|---|
| Remote | https://github.com/saurabh876724/ai-website-cloner |
| Branch | `main`, tracking `origin/main` |
| Last pushed commit | `ec0a118` — "Add AI website-cloning agent: 5-stage pipeline with build validation" |
| Visibility | public |
| Secrets | `.env.local` is git-ignored; only `.env.example` with a placeholder is committed. No `AIza...` pattern exists in any tracked file, and the key is never logged or sent to the client |
| Excluded from git | `node_modules/`, `.next/`, `*.tsbuildinfo`, `generated-sites/` |
| Production build | `npm run build` passes: compiles, TypeScript clean, `/`, `/preview` and `/_not-found` prerendered, 5 dynamic API routes |

## Deliverables

- [x] Complete, runnable codebase (Next.js 16 App Router, TypeScript strict, Tailwind v4)
- [x] README: setup, pipeline diagram, API routes, design decisions, limitations
- [x] Architecture document: module map, data contracts, process/port model, error rules
- [x] Quick-start and troubleshooting guide
- [x] Agent pipeline: analysis -> planning -> generation -> build validation -> preview
- [x] Natural-language modification of generated sites with rebuild and preview restart
- [x] Real build validation with up to 2 AI repair rounds
- [x] Live local preview per generated site (port 4100+)
- [x] Quota-aware retry with exponential backoff and a fallback model chain
- [x] Demo recording script (`DEMO_GUIDE.md`)
- [ ] **Demo video, 5-10 minutes** — script ready; recording is still yours to do
- [ ] **Submit the repo link and the video** through the application form

## Requirement coverage

| Requirement | Where it lives |
|---|---|
| Accept a public URL | URL form in `src/app/page.tsx`, validation in `src/lib/analyzer.ts` |
| Analyze layout, sections, colors, typography | `src/lib/analyzer.ts` — one in-browser pass returning a structured spec |
| Generate React/Next.js code (not an iframe) | `src/lib/planner.ts` + `src/lib/generator.ts` |
| Reusable, typed components | generated `src/components/*`, planned by the AI planner |
| Handle build/runtime errors | `src/lib/builder.ts` + repair loop in `src/lib/pipeline.ts` |
| Working preview | `src/lib/preview.ts`, `/preview` page, "Open Preview" CTA |
| AI-based modification | `/api/modify`, modification panel |
| Generalize across websites | heuristics and prompts only; zero hardcoded domains |
| TypeScript and clean architecture | typed modules and routes throughout |
| Runs locally, no hosting required | `npm run dev` only; the Gemini key is the sole external dependency |

## Evaluation areas

| Area | Weight | Evidence |
|---|---|---|
| Frontend recreation quality | 25% | structured spec (colors, typography, sections, layout, responsive hints) -> component plan -> Tailwind output; verified on apple.com and example.com |
| AI agent implementation | 20% | five-stage job pipeline with live steps/logs, repair loop, modify flow |
| Generalization | 20% | no per-site templates; the same code path handles any public URL |
| Code quality and architecture | 15% | modular `src/lib`, typed API routes, clean production build |
| Natural-language modification | 10% | changed-files-only modification, rebuild, preview restart |
| Error handling | 5% | status-classified retries, honest failure messages, step-level errors |
| Cost awareness | 5% | compact spec instead of raw HTML, file-scoped edits, bounded retries |

## Before recording the video

1. Start fresh (`npm install`, `npm run dev`) so the terminal shows a clean boot.
2. Check Gemini quota in AI Studio first — a mid-recording 429 across the whole model chain shows
   a real error on screen.
3. Pre-run one clone so a ready project already exists; record a second run live, then apply one
   modification against the first project.
4. Keep the Agent logs panel open — it is the strongest evidence that the pipeline is genuine.

## Discussion prep

Be ready to explain:

1. Why a headless-browser pass plus a structured spec rather than feeding raw HTML to the model.
2. Why the scaffold is deterministic and only `src/**` is AI-authored.
3. How malformed AI output is handled: tolerant JSON extraction, path normalization, filtering of
   Next.js special route files, and a typed failure when nothing parses.
4. How build validation works for real, what the repair loop feeds back, and why it is capped at 2.
5. How transient vs fatal provider errors are distinguished, and why free-tier quota is per model.
6. Scaling: what you would externalize (job queue, object storage for generated sites, worker
   pool, per-tenant rate limiting) to serve many concurrent users.
7. What you would add next: file-scoped repair, persisted jobs, screenshot-diff fidelity scoring,
   SSE instead of polling.

## Known limitations (state them yourself)

- Client-heavy pages get a 2.5s hydration window; very slow SPAs may be partially captured.
- Auth-protected pages cannot be analyzed.
- Images are hotlinked from the source, not re-hosted.
- Visual parity is approximate; complex interactions need manual refinement.
- Repair responses spanning several files can exceed the token cap and fail to parse.
- Job state is in-memory: restarting the app clears history and stops preview servers.
- Cost per clone is one analysis plus roughly 2-4 Gemini calls; on the free tier the binding
  constraint is per-model quota, not money.

## If something breaks

- Check `QUICK_START.md` troubleshooting first (provider quota, port conflicts, lost jobs, build
  failures, Puppeteer's Chromium download).
- Confirm `GEMINI_API_KEY` is set in `.env.local`, never exported to the browser.
- Node.js 20+ (developed on 24.x).
