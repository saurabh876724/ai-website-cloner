# Start Here

An AI agent that takes any public website URL, analyzes its UI, generates a real Next.js /
React / TypeScript / Tailwind implementation, builds and validates it locally, serves a live
preview, and then edits it from natural-language instructions.

## Three commands

```bash
npm install
cp .env.example .env.local     # paste your GEMINI_API_KEY
npm run dev                    # http://localhost:3000
```

Then paste a URL (for example `https://example.com`) and press **Analyze**. One click runs the
full five-stage pipeline and ends with a working **Open Preview** link.

## What to read, in order

| Document | Read it for |
|---|---|
| `README.md` | the one-screen overview: setup, pipeline diagram, API routes, design decisions, limitations |
| `ARCHITECTURE.md` | module map, data contracts, process/port model, error-handling rules |
| `QUICK_START.md` | first run, where generated output lands, troubleshooting |
| `PROJECT_SUMMARY.md` | what was built, what is verified end to end, known gaps |
| `DEMO_GUIDE.md` | the 5-10 minute recording script |
| `SUBMISSION_CHECKLIST.md` | deliverables and evaluation coverage |

## The pipeline in one line

```
URL -> [1] Puppeteer analysis -> [2] Gemini planner -> [3] scaffold + AI app code
    -> [4] real npm install / next build (up to 2 AI repair rounds)
    -> [5] next start preview on port 4100+ -> natural-language modify -> rebuild -> restart
```

Code lives in `src/lib/` (analyzer, planner, generator, builder, preview, ai, pipeline, jobs)
behind five API routes in `src/app/api/`, with the polling UI in `src/app/page.tsx`.

## If something goes wrong

- Read the **Agent logs** panel first — it records retries, model switches, build output tails and
  which files the AI patched.
- "Gemini is temporarily unavailable" means free-tier quota across the whole model chain; wait and
  re-run. Details in `QUICK_START.md`.
- Restarting the dev server clears in-memory jobs and stops preview servers; generated projects on
  disk stay intact.
