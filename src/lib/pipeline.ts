import path from 'path';
import { chat, extractJson } from './ai';
import { installDependencies, repairWithAI, runBuild, tailErrors } from './builder';
import {
  generateAppFiles,
  newProjectId,
  projectDir,
  readProjectFiles,
  scaffoldFiles,
  writeProject,
} from './generator';
import { log, setStep } from './jobs';
import { planImplementation } from './planner';
import { startPreview, stopPreview } from './preview';
import { GeneratedFile, Job } from './types';
import { analyzeWebsite } from './analyzer';

const MAX_REPAIR_ATTEMPTS = 2;

function fail(job: Job, stepIndex: number, message: string): void {
  setStep(job, stepIndex, 'error', message.slice(0, 200));
  job.stage = 'error';
  job.error = message;
  job.finishedAt = Date.now();
  log(job, `FAILED: ${message}`);
}

/** Build (and repair if needed). Returns true when the build passes. */
async function validateAndRepair(job: Job, stepIndex: number, needsInstall: boolean): Promise<boolean> {
  const dir = projectDir(job.projectId!);

  if (needsInstall) {
    log(job, 'npm install started');
    const install = await installDependencies(dir);
    if (install.code !== 0) {
      fail(job, stepIndex, `npm install failed: ${tailErrors(install.output, 500)}`);
      return false;
    }
    log(job, 'npm install finished');
  }

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    job.stage = attempt === 0 ? 'validating' : 'fixing';
    setStep(job, stepIndex, 'running', attempt === 0 ? 'running next build' : `repair attempt ${attempt}/${MAX_REPAIR_ATTEMPTS}`);
    log(job, `next build (attempt ${attempt + 1})`);

    const build = await runBuild(dir);
    if (build.code === 0) {
      job.buildStatus = 'pass';
      setStep(job, stepIndex, 'done', attempt === 0 ? 'build passed' : `build passed after ${attempt} repair(s)`);
      log(job, 'build passed');
      return true;
    }

    const errors = tailErrors(build.output);
    job.buildStatus = 'fail';
    log(job, `build failed: ${errors.split('\n').slice(-3).join(' | ').slice(0, 250)}`);

    if (attempt === MAX_REPAIR_ATTEMPTS) {
      fail(job, stepIndex, `Build still failing after ${MAX_REPAIR_ATTEMPTS} repair attempts: ${errors.slice(-400)}`);
      return false;
    }

    job.stage = 'fixing';
    job.repairAttempts = attempt + 1;
    setStep(job, stepIndex, 'running', `AI repairing (attempt ${attempt + 1}/${MAX_REPAIR_ATTEMPTS})`);
    log(job, 'sending build errors to AI for repair');

    try {
      const current = await readProjectFiles(job.projectId!);
      const fixes = await repairWithAI(current, errors);
      if (fixes.length === 0) {
        log(job, 'AI returned no fixes');
        continue;
      }
      await writeProject(job.projectId!, fixes);
      log(job, `AI patched ${fixes.length} file(s): ${fixes.map((f) => f.path).join(', ')}`);
    } catch (err) {
      log(job, `repair AI error: ${err instanceof Error ? err.message : err}`);
    }
  }
  return false;
}

export async function runCloneJob(job: Job, url: string): Promise<void> {
  try {
    // Step 1 — Analysis
    job.stage = 'analyzing';
    setStep(job, 0, 'running', url);
    log(job, `analyzing ${url}`);
    const analysis = await analyzeWebsite(url);
    job.analysis = analysis;
    setStep(job, 0, 'done', `${analysis.sections.length} sections, ${analysis.components.length} component types, ${analysis.colors.length} colors`);
    log(job, `analysis complete: "${analysis.title}"`);

    // Step 2 — Planning
    job.stage = 'planning';
    setStep(job, 1, 'running');
    log(job, 'AI planner started');
    const plan = await planImplementation(analysis);
    job.plan = plan;
    setStep(job, 1, 'done', `${plan.components.length} components planned`);
    log(job, `plan: ${plan.components.map((c) => c.name).join(', ')}`);

    // Step 3 — Generation
    job.stage = 'generating';
    setStep(job, 2, 'running');
    log(job, 'AI code generation started');
    const projectId = newProjectId();
    job.projectId = projectId;
    const appFiles = await generateAppFiles(plan, analysis);
    const scaffold = scaffoldFiles(plan);
    const aiPaths = new Set(appFiles.map((f) => f.path));
    const allFiles = [...appFiles, ...scaffold.filter((s) => !aiPaths.has(s.path))];
    const globals = allFiles.find((f) => f.path === 'src/app/globals.css');
    if (globals && !globals.content.includes('@import "tailwindcss"')) {
      globals.content = `@import "tailwindcss";\n${globals.content}`;
    }
    await writeProject(projectId, allFiles);
    job.generatedComponents = plan.components.map((c) => c.name);
    setStep(job, 2, 'done', `${allFiles.length} files written to generated-sites/${projectId}`);
    log(job, `generated ${allFiles.length} files`);

    // Step 4 — Build validation (+ AI repair loop)
    const ok = await validateAndRepair(job, 3, true);
    if (!ok) return;

    // Step 5 — Preview
    setStep(job, 4, 'running', 'starting preview server');
    log(job, 'starting preview server');
    const preview = await startPreview(projectId);
    job.previewPort = preview.port;
    job.previewUrl = preview.url;
    setStep(job, 4, 'done', preview.url);
    job.stage = 'ready';
    job.finishedAt = Date.now();
    log(job, `ready at ${preview.url}`);
  } catch (err) {
    const runningIndex = job.steps.findIndex((s) => s.status === 'running');
    fail(job, runningIndex === -1 ? 0 : runningIndex, err instanceof Error ? err.message : String(err));
  }
}

export async function runModifyJob(job: Job, projectId: string, instruction: string): Promise<void> {
  try {
    // Step 1 — AI modification
    job.stage = 'generating';
    setStep(job, 0, 'running', instruction);
    log(job, `modification requested: ${instruction}`);

    const files = await readProjectFiles(projectId);
    const context = files.map((f) => `--- ${f.path} ---\n${f.content.slice(0, 9000)}`).join('\n\n');

    const output = await chat(
      'You are a Next.js/TypeScript engineer modifying an existing generated project. Return only valid JSON with the changed files.',
      `Modify this Next.js (App Router, TypeScript, Tailwind v4) project per the user instruction.

INSTRUCTION: ${instruction}

CURRENT FILES:
${context}

Rules:
- Change ONLY what the instruction requires; keep everything else intact.
- Do not add new npm dependencies.
- Return ONLY the modified files with FULL content, paths exactly as listed.
- JSON shape: {"files":[{"path":"src/app/page.tsx","content":"..."}]} — no markdown fences.`,
      { temperature: 0.3, maxTokens: 8192 }
    );

    const parsed = extractJson<{ files: GeneratedFile[] }>(output);
    const changed = (parsed.files || []).filter(
      (f) => f && typeof f.path === 'string' && typeof f.content === 'string'
    );
    if (changed.length === 0) throw new Error('AI modifier returned no file changes');
    await writeProject(projectId, changed);
    setStep(job, 0, 'done', `${changed.length} file(s) updated: ${changed.map((f) => path.basename(f.path)).join(', ')}`);
    log(job, `modified ${changed.length} file(s)`);

    // Step 2 — Rebuild (+ repair loop)
    const ok = await validateAndRepair(job, 1, false);
    if (!ok) return;

    // Step 3 — Restart preview
    setStep(job, 2, 'running', 'restarting preview server');
    stopPreview(projectId);
    const preview = await startPreview(projectId);
    job.previewPort = preview.port;
    job.previewUrl = preview.url;
    setStep(job, 2, 'done', preview.url);
    job.stage = 'ready';
    job.finishedAt = Date.now();
    log(job, `modification live at ${preview.url}`);
  } catch (err) {
    const runningIndex = job.steps.findIndex((s) => s.status === 'running');
    fail(job, runningIndex === -1 ? 0 : runningIndex, err instanceof Error ? err.message : String(err));
  }
}
