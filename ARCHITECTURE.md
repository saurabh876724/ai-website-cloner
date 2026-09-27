# Architecture

## System overview

```
                         AI Website Cloning Agent (Next.js app, port 3000)

  Browser UI  --POST /api/clone-->  job store (in-memory Map)  --poll-->  GET /api/jobs/[id]
  src/app/page.tsx                  src/lib/jobs.ts                        (stage, steps, logs)
        |
        | fire-and-forget async run
        v
  src/lib/pipeline.ts :: runCloneJob(url)

  [1] analyzer.ts   Puppeteer headless Chrome: goto + 2.5s hydrate wait, one page.evaluate
      |             pass -> structured WebsiteAnalysis (no raw HTML leaves the process)
      v
  [2] planner.ts    ai.chat() -> ImplementationPlan { components[], palette, layout strategy }
      |
      v
  [3] generator.ts  deterministic scaffold (package.json, tsconfig, next.config, postcss,
      |             globals) + ai.chat() -> app files (src/app + src/components)
      |             written to ../generated-sites/<project-id>/
      v
  [4] builder.ts    npm install -> next build (captured stdout/stderr/exit code)
      |                 |
      |                 +-- fail -> repairWithAI(errors + current files) -> rewrite -> rebuild
      |                          loop, max 2 repair attempts (pipeline.ts MAX_REPAIR_ATTEMPTS)
      v
  [5] preview.ts    next start on its own port (4100, 4101, ...), readiness poll
      |
      v
  modify: POST /api/modify { projectId, instruction }
          -> readProjectFiles -> ai.chat (changed files only) -> writeProject
          -> rebuild (+ repair loop) -> stopPreview -> startPreview
```

## Process and filesystem model

| Concern | Model |
|---|---|
| Cloner app | `next dev` on port 3000 (this repo) |
| Generated project storage | `../generated-sites/<project-id>/` — a **sibling** of the app directory, never inside it |
| Preview servers | one `next start` child process per project, ports from 4100 upward (`preview.ts` `nextPort`) |
| Job state | in-memory `Map` in `jobs.ts`; lost on app restart, while generated projects persist on disk |
| Long work | runs server-side as an async job; the browser polls, so no request timeouts |

Generated projects are kept outside the app directory deliberately: writing `package.json` /
`node_modules` / `.next` inside the Next.js project makes the dev watcher restart the server
mid-pipeline, which kills in-flight jobs.

## Data contracts (`src/lib/types.ts`)

- `WebsiteAnalysis` — `url`, `title`, `meta`, `colors[]`, `typography`, `sections[]`
  (`type`, `heading`, text samples, buttons, links), `navigation[]`, `images[]`, `layout`,
  `components[]`, `responsiveHints`, `domOutline` (compact, capped).
- `ImplementationPlan` — `components[]` (`name`, `purpose`, `props`, `sections`), palette and
  spacing decisions, responsive strategy.
- `GeneratedFile` — `{ path, content }`; the AI returns `{"files":[...]}` and the pipeline
  normalizes paths and drops Next.js special route files.
- `Job` — `id`, `type: 'clone' | 'modify'`, `stage`, `steps[]`, `logs[]`, `buildStatus`,
  `repairAttempts`, `projectId`, `previewUrl`, `analysis`, `plan`, `generatedComponents`.

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | `{url}` -> structured analysis JSON only (no generation) |
| `/api/clone` | POST | `{url}` -> starts the full 5-stage pipeline, returns `{jobId}` |
| `/api/jobs/[id]` | GET | job snapshot for the polling UI |
| `/api/modify` | POST | `{projectId, instruction}` -> modify + rebuild + preview restart, returns `{jobId}` |
| `/api/projects` | GET | generated projects on disk plus their running preview URLs |

## Module map

| File | Lines | Responsibility |
|---|---|---|
| `src/lib/analyzer.ts` | 276 | Puppeteer scrape in a single in-browser pass; URL validation, unreachable-site and timeout handling |
| `src/lib/planner.ts` | 66 | compact analysis -> implementation plan prompt |
| `src/lib/generator.ts` | 246 | scaffold files, AI app-code generation, path normalization, project write/read |
| `src/lib/ai.ts` | 227 | provider layer (Gemini default, OpenAI/Ollama alternatives), error classification, retry/backoff, fallback model chain, tolerant JSON extraction |
| `src/lib/builder.ts` | 91 | `npm install` / `next build` with captured output, sanitized build env, AI repair from build errors |
| `src/lib/preview.ts` | 77 | per-project `next start`, readiness polling, stop/restart, running-preview registry |
| `src/lib/pipeline.ts` | 198 | clone and modify orchestration, repair loop, step/status transitions, error surfacing |
| `src/lib/jobs.ts` | 46 | in-memory job store, `CLONE_STEPS`, `log`, `setStep` |
| `src/lib/types.ts` | 81 | shared interfaces |
| `src/app/page.tsx` | 731 | pipeline UI: URL form, live stepper, metrics, detected structure, preview CTA, agent console, modification panel |
| `src/app/preview/page.tsx` | 126 | generated-site index with per-project preview links |
| `src/components/ui/*` | 211 | design-system primitives: icons and app header |

## Key design decisions

1. **Structured spec instead of raw HTML.** The analyzer reduces a page to colors by frequency,
   section samples, navigation and a capped DOM outline, so prompts stay small and cost is
   bounded regardless of site size.
2. **Deterministic scaffold, AI-authored app code.** Build-critical config is generated by code;
   the model only writes `src/**`, which keeps `next build` predictable.
3. **Real validation, not self-reporting.** Validation runs an actual install and build and reads
   the exit code; failures are truncated (`tailErrors`) and fed back for up to 2 AI repair rounds.
4. **Isolated preview servers.** Each clone gets its own port, so the cloner and the clones never
   share a dev server or port.
5. **Provider-agnostic AI layer with quota-aware retries.** See below.
6. **Route-file filter.** The generator prompts forbid `error.tsx` / `global-error.tsx` /
   `loading.tsx` / `not-found.tsx` and drops them if emitted, because those AI-written route
   files break static prerendering of the generated site.

## Error handling

Transient vs fatal is decided from the HTTP status first, then message patterns
(`src/lib/ai.ts`):

| Condition | Behaviour |
|---|---|
| 408, 425, 429, 500, 502, 503, 504, 520, 529; `RESOURCE_EXHAUSTED`, `UNAVAILABLE`, `INTERNAL`, rate-limit/overload text; transport blips (`ECONNRESET`, `ETIMEDOUT`, TLS, fetch failure) | retry: 3 attempts on the primary model with 2s / 4s / 8s backoff, then the fallback model chain with 2s / 4s |
| 400, 401, 403, 404, 405, 409, 422; `UNAUTHENTICATED`, `PERMISSION_DENIED`, `INVALID_ARGUMENT`, invalid-API-key text | fail immediately, surface the real error, no retries |
| every model exhausted | `Gemini is temporarily unavailable. Please try again in a moment.` |

Free-tier quota is per model, so `GEMINI_MODEL_FALLBACK` (default
`gemini-3.6-flash,gemini-3.1-flash-lite`) is tried in order after the primary is exhausted.
A successful retry continues into the next pipeline stage automatically; nothing is swallowed.

Other failure paths: invalid/unreachable URLs fail at step 1 with the site's error; `npm install`
failure fails step 4; a build still failing after 2 repairs fails step 4 with the tail of stderr;
unparseable AI output fails the current step with a truncated message. The API key is only read
server-side from `.env.local`, sent via the `x-goog-api-key` header, and never logged.

## Technology stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.6 (App Router, Turbopack), React 19.2.8 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`, `@theme` tokens) |
| Scraping | Puppeteer 25 (headless Chrome) |
| AI | Google Gemini via `@google/generative-ai` 0.24.1; OpenAI SDK and Ollama as alternative providers |
| Validation | real `npm install` + `next build` in a child process |
| Jobs | in-memory store + HTTP polling |
