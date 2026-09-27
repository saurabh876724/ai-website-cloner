# Demo Video Guide (5-10 minutes)

The whole point of the recording is to show a **real agent run**: one click, five live stages, a
genuine build, a working preview, then a natural-language edit. Do not stage fake results.

## Before you press record

1. Fresh boot: `npm install`, `npm run dev`, terminal visible alongside the browser.
2. Confirm Gemini quota in AI Studio so a 429 does not interrupt the run.
3. Pre-complete one clone (e.g. `https://www.apple.com`) so you already have a ready project to
   modify while a second clone runs.
4. Have two URLs queued: `https://example.com` (fast) and `https://www.apple.com` (rich).
5. Browser at 125-150% zoom, DevTools closed until the responsive segment.

## Script

### 1. Setup and framing (0:00 - 0:40)
Show the terminal with `npm run dev`, open http://localhost:3000. One sentence: this takes any
public URL, analyzes the UI, generates a real Next.js/React project, builds it locally, serves a
preview, and then edits it from plain English.

### 2. Start a run (0:40 - 1:20)
Paste a URL (or use a sample chip) and press **Analyze**. Point out that this is one request that
starts an async job — the browser polls `/api/jobs/[id]`, so long builds never time out. Watch the
status pill move from Idle to Running.

### 3. Live pipeline (1:20 - 4:00)
Narrate the five steps as they complete:

| Step | What to say | What the detail line shows |
|---|---|---|
| Website Analysis | headless Chrome makes one in-browser pass and returns a structured spec, never raw HTML | "N sections, N component types, N colors" |
| AI Planning | the model turns that spec into a component plan with palette and responsive strategy | "N components planned" |
| Code Generation | deterministic scaffold plus AI-written `src/app` and `src/components`, written outside the app directory | "N files written to generated-sites/<id>" |
| Build Validation | a real `npm install` and `next build`; on failure the error tail goes back to the model | build status and repair attempts |
| Preview | `next start` on its own port from 4100 | the preview URL |

While waiting, expand **Agent logs** and read a few lines aloud — retries, model switches, patched
files. Then point at the metric cards: build status, repair attempts `n of 2`, elapsed, project id.

### 4. Detected structure (4:00 - 4:30)
Show the component chips the planner actually produced for that site, and note that nothing about
the site is hardcoded.

### 5. Live preview and responsiveness (4:30 - 5:45)
Click **Open Preview** in a new tab. Scroll the cloned page, then open DevTools device toolbar and
walk 375 / 768 / 1200px, explaining that the generated components use Tailwind responsive
utilities. Also show http://localhost:3000/preview listing every generated site with its own port.

### 6. Natural-language modification (5:45 - 7:30)
Back on the ready project, type one instruction — "Make the navbar sticky" or "Change the primary
color to blue" — and press **Apply Change**. Explain that the modifier receives the current files
and returns only changed files, then the project is rebuilt and the preview restarted. Refresh the
preview tab to show the change landed.

### 7. Architecture and honesty (7:30 - 8:45)
Switch to the editor and show `src/lib`: `analyzer`, `planner`, `generator`, `builder`, `preview`,
`pipeline`, `ai`, `jobs`. Call out two decisions worth remembering: the scaffold is deterministic
so builds are predictable, and validation is a real build rather than the model grading itself.
Then state limitations plainly — approximate visual parity, hotlinked images, in-memory jobs, and
multi-file repair responses that can exceed the token cap.

### 8. Close (8:45 - 9:15)
Summarize: five-stage pipeline, real build validation with bounded AI repair, isolated previews,
provider-level retry with fallback models, no hardcoded sites. Repo link on screen.

## Handling problems on camera

- "Gemini is temporarily unavailable" means free-tier quota was exhausted across the model chain
  after 3 retries with 2s/4s/8s backoff. Say exactly that, wait, and re-run — it demonstrates the
  error handling rather than hiding it.
- If a build fails after 2 repair attempts, read the stderr tail from the logs and explain the
  repair loop; do not cut the clip.
- If you edit files under `src/lib` while recording, the dev server restarts and clears in-memory
  jobs — restart order matters, so do code edits before recording.

## Recording tips

1. OBS Studio or Loom, 1080p, microphone tested on a 30-second take first.
2. Keep the pipeline card and the Agent logs panel in frame at the same time.
3. Pause between steps so the viewer can read the detail lines.
4. Stay under 10 minutes; the reviewer's time is part of the evaluation.
5. Export, watch at 1.5x once to catch dead air, then upload and paste the link into the form.
