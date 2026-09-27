# Project Summary

What was built, what is verified, and what is knowingly imperfect.

## Scope delivered

A working AI agent, not a demo scaffold: given a public URL it analyzes the site, plans a
component architecture, generates a real Next.js project, **installs and builds it for real**,
repairs build failures with the AI, serves it on its own port, and then applies natural-language
edits to the same project with a rebuild and preview restart.

| Requirement | Status | Where |
|---|---|---|
| URL input and site analysis | done | `src/lib/analyzer.ts`, `/api/analyze` |
| AI-generated React/Next.js code (not an iframe or copy) | done | `src/lib/planner.ts`, `src/lib/generator.ts` |
| Generated code is valid and buildable | done | `src/lib/builder.ts`, repair loop in `src/lib/pipeline.ts` |
| Working local preview | done | `src/lib/preview.ts`, `/preview` page |
| Natural-language modification | done | `/api/modify`, modification panel in `src/app/page.tsx` |
| Generalization (no site-specific hacks) | done | heuristics + prompts only; zero hardcoded domains |
| Error handling and transparency | done | status-classified retries, agent logs, step failures |
| Cost awareness | done | compact structured spec instead of raw HTML, changed-files-only modification |

## Code inventory

About 2,570 lines of TypeScript: 8 modules in `src/lib/` (analyzer 276, ai 227, generator 246,
pipeline 198, types 81, preview 77, planner 66, builder 91, jobs 46), 5 typed API routes
(166 lines total), the pipeline UI (731), the generated-site index (126) and design-system
components (211). No database, no external service beyond the AI provider and the target site.

## Verified end to end

- **apple.com full run** — analysis reported 11 sections / 7 component types / 12 colors; the
  pipeline completed all five stages, the AI repair cycle patched `Hero.tsx`, the rebuild passed,
  and the preview served HTTP 200 with genuine Apple content at `http://localhost:4100`.
- **example.com full run** — reached `Ready` in 262s with 0 repair attempts, 12 agent log lines,
  project `site-muk9jyr6-s1d0y`, preview reachable at `http://localhost:4105`.
- **Cloner app production build** — `npm run build` compiles, TypeScript passes, `/`, `/preview`
  and `/_not-found` prerender as static, the 5 API routes stay dynamic, no warnings.
- **UI verification suite** — 27 automated Puppeteer assertions against a live job: no horizontal
  overflow at 1440/834/390 widths, real metrics rendered, all five steps present, log lines
  tone-coded, preview CTA reachable, modification panel gated correctly, zero console errors.
- **Error classifier** — import-based checks confirmed 429/5xx/transport blips retry with backoff
  while 401/403/400 fail immediately with their own message.

## Bugs found and fixed during development

These are the interesting ones; each was diagnosed from real output rather than guessed.

1. **Generated builds died prerendering `/_global-error`** ("Cannot read properties of null
   (reading 'useContext')"). Two independent causes: the model emitted its own Next.js error
   boundary, and `next build` inherited `NODE_ENV=development` from the parent `next dev`
   process. Fixed by banning and filtering special route files in `generator.ts`, and by a
   sanitized `buildEnv()` in `builder.ts`. Proven by reproducing the failure with
   `NODE_ENV=development npm run build` (exit 1) versus `production` (exit 0).
2. **In-flight jobs were killed by the dev watcher** because generated projects lived inside the
   app directory. Output root moved to the sibling `generated-sites/`.
3. **Retry logic keyed on error text** retried auth failures and skipped network blips. Replaced
   with HTTP-status-first classification plus separate non-retryable reason patterns.
4. **A retired fallback model returned 404** and was correctly treated as fatal; the default
   chain was re-probed and set to `gemini-3.6-flash,gemini-3.1-flash-lite`.
5. **Free-tier quota is per model**, so a single fallback was not enough — the config is now an
   ordered chain that the pipeline walks before reporting unavailability.

## Known limitations, stated plainly

- **Repair responses can be too large.** The repair prompt returns whole files; a multi-file fix
  can exceed `maxTokens: 8192` and come back unparsable ("No JSON found in model output"). The
  planned fix is one-file-at-a-time repair.
- **Modify jobs reuse the clone step template**, so steps 4 and 5 stay pending in the UI even
  though modify only needs three.
- **Job state is in-memory** — restarting the app clears history and stops preview children. No
  queue, no persistence, single instance.
- **Visual fidelity is approximate**, images are hotlinked from the source, and auth-gated or
  extremely slow client-rendered pages are not captured well.
- `cheerio` is declared in `package.json` but unused since the analyzer does everything in one
  in-browser pass; it can be dropped.

## Suggested next iterations

1. File-scoped repair (single file per AI call) to remove the truncation failure mode.
2. Persist jobs and generated-project metadata so history survives restarts.
3. Screenshot-diff scoring between the source page and the clone to measure recreation quality.
4. Streaming (SSE) instead of 1.5s polling for step updates.
