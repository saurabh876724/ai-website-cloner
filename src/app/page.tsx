'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Close,
  Cube,
  ExternalLink,
  Globe,
  Grid,
  Hammer,
  Layers,
  Refresh,
  Rocket,
  Sparkles,
  Spinner,
  Terminal,
  Wrench,
} from '@/components/ui/icons';

interface JobStep {
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

interface Job {
  id: string;
  type: 'clone' | 'modify';
  url?: string;
  projectId?: string;
  instruction?: string;
  stage: string;
  steps: JobStep[];
  logs: string[];
  buildStatus: 'unknown' | 'pass' | 'fail';
  repairAttempts: number;
  previewUrl?: string;
  generatedComponents: string[];
  error?: string;
  startedAt: number;
  finishedAt?: number;
  analysis?: {
    title: string;
    sections: Array<{ type: string; heading?: string }>;
    components: string[];
  };
}

const STAGE_LABEL: Record<string, string> = {
  queued: 'Queued',
  analyzing: 'Analyzing',
  planning: 'Planning',
  generating: 'Generating',
  validating: 'Validating',
  fixing: 'Fixing',
  ready: 'Ready',
  error: 'Error',
};

const STAGE_TONE: Record<string, string> = {
  ready: 'border-success-100 bg-success-50 text-success-700',
  error: 'border-danger-100 bg-danger-50 text-danger-700',
  queued: 'border-line bg-zinc-50 text-ink-muted',
};

const STEP_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'Website Analysis': Globe,
  'AI Planning': Brain,
  'AI Modification': Sparkles,
  'Code Generation': Cube,
  'Build Validation': Hammer,
  Preview: Rocket,
};

const SAMPLE_SITES = ['https://example.com', 'https://www.apple.com', 'https://vercel.com'];
const CHANGE_IDEAS = [
  'Make the navbar sticky',
  'Change the primary color to emerald',
  'Add a testimonials section',
];

function StageBadge({ stage }: { stage: string }) {
  const tone =
    STAGE_TONE[stage] ??
    (stage === 'fixing'
      ? 'border-warning-100 bg-warning-50 text-warning-700'
      : 'border-brand-100 bg-brand-50 text-brand-700');
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {stage !== 'ready' && stage !== 'error' && (
        <Spinner className="h-3 w-3 animate-spin motion-reduce:animate-none" />
      )}
      {STAGE_LABEL[stage] || stage}
    </span>
  );
}

function StepMarker({ step }: { step: JobStep }) {
  const Icon = STEP_ICONS[step.name] ?? Layers;

  if (step.status === 'running') {
    return (
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-brand-700 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
        <Spinner className="h-4 w-4 animate-spin motion-reduce:animate-none" />
      </span>
    );
  }
  if (step.status === 'done') {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-success-100 bg-success-50 text-success-700 transition-colors duration-200">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (step.status === 'error') {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-danger-100 bg-danger-50 text-danger-700">
        <Close className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-subtle">
      <Icon className="h-4 w-4" />
    </span>
  );
}

const STEP_STATUS_TEXT: Record<JobStep['status'], { label: string; className: string }> = {
  pending: { label: 'Queued', className: 'text-ink-subtle' },
  running: { label: 'In progress', className: 'text-brand-700' },
  done: { label: 'Complete', className: 'text-success-700' },
  error: { label: 'Failed', className: 'text-danger-700' },
};

function logTone(line: string): string {
  if (/FAILED|error|Error|failed/.test(line)) return 'text-red-300';
  if (/passed|✓|complete|ready|plan:|generated /.test(line)) return 'text-emerald-300';
  if (/started|attempt|retry|switching|install/.test(line)) return 'text-amber-200/90';
  return 'text-zinc-400';
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = 'text-ink',
  mono = false,
  title,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  tone?: string;
  mono?: boolean;
  title?: string;
}) {
  return (
    <div className="card flex items-start gap-2.5 p-3 transition-shadow duration-200 hover:shadow-lift">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-muted">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
        <p
          className={`mt-0.5 truncate text-sm font-semibold ${tone} ${mono ? 'font-mono text-[13px]' : ''}`}
          title={title ?? value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [modifyBusy, setModifyBusy] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollJob = useCallback(
    (id: string, onSettled?: () => void) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/jobs/${id}`);
          if (!res.ok) return;
          const data: Job = await res.json();
          setJob((prev) =>
            prev && prev.type === 'clone' && data.type === 'modify'
              ? {
                  ...data,
                  analysis: data.analysis || prev.analysis,
                  generatedComponents: data.generatedComponents.length
                    ? data.generatedComponents
                    : prev.generatedComponents,
                }
              : data
          );
          if (data.stage === 'ready' || data.stage === 'error') {
            stopPolling();
            onSettled?.();
          }
        } catch {
          // transient network hiccup; keep polling
        }
      }, 1500);
    },
    [stopPolling]
  );

  useEffect(() => stopPolling, [stopPolling]);

  const handleAnalyze = async () => {
    if (!url) return;
    setStarting(true);
    setError(null);
    setJob(null);
    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to start');
      setJobId(data.jobId);
      pollJob(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setStarting(false);
    }
  };

  const handleModify = async () => {
    if (!instruction.trim() || !job?.projectId) return;
    setModifyBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: job.projectId, instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to start modification');
      setInstruction('');
      pollJob(data.jobId, () => setModifyBusy(false));
      // Immediately reflect the new job shell
      const fresh = await fetch(`/api/jobs/${data.jobId}`).then((r) => r.json());
      setJob(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setModifyBusy(false);
    }
  };

  const elapsed = job
    ? Math.round(((job.finishedAt || Date.now()) - job.startedAt) / 1000)
    : 0;
  const busy = starting || (job && !job.finishedAt && job.stage !== 'error') || modifyBusy;

  const headerStatus = job
    ? job.stage === 'ready'
      ? 'ready'
      : job.stage === 'error'
        ? 'error'
        : 'running'
    : busy
      ? 'running'
      : 'idle';

  const buildTone =
    job?.buildStatus === 'pass'
      ? 'text-success-700'
      : job?.buildStatus === 'fail'
        ? 'text-danger-700'
        : 'text-ink-muted';

  const sections = job?.analysis?.sections.length ?? 0;
  const components = job?.generatedComponents ?? [];

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader status={headerStatus} />

      <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        {/* Target URL — primary action */}
        <section className="card p-5 sm:p-6" aria-labelledby="target-url-heading">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                Step 1
              </p>
              <h2 id="target-url-heading" className="mt-1 text-lg font-semibold tracking-tight text-ink">
                Point the agent at a public website
              </h2>
            </div>
            <span className="chip">
              <Globe className="h-3 w-3" />
              Public URLs only
            </span>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) handleAnalyze();
            }}
          >
            <div className="relative min-w-0 flex-1">
              <label htmlFor="site-url" className="sr-only">
                Website URL
              </label>
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle">
                <Globe className="h-4 w-4" />
              </span>
              <input
                id="site-url"
                type="url"
                inputMode="url"
                autoComplete="off"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={!!busy}
                className="field py-2.5 pl-10 pr-3.5 text-sm"
              />
            </div>
            <button
              type="submit"
              onClick={handleAnalyze}
              disabled={!!busy || !url}
              className="btn btn-primary px-5 py-2.5 sm:w-auto"
            >
              {starting ? (
                <>
                  <Spinner className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                  Starting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze site
                </>
              )}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-subtle">Try:</span>
            {SAMPLE_SITES.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setUrl(sample)}
                disabled={!!busy}
                className="chip transition-colors duration-150 hover:border-line-strong hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sample.replace(/^https?:\/\//, '')}
                <ArrowRight className="h-3 w-3 opacity-50" />
              </button>
            ))}
          </div>
        </section>

        {/* Start-up failure (before a job exists) */}
        {error && !job && (
          <div
            role="alert"
            className="card animate-fade-rise border-danger-100 bg-danger-50 p-4"
          >
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-danger-700">Could not start the run</p>
                <p className="mt-0.5 text-sm text-danger-700/80 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline */}
        {job && (
          <section className="card animate-fade-rise p-5 sm:p-6" aria-labelledby="pipeline-heading">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-ink-muted">
                  <Terminal className="h-4 w-4" />
                </span>
                <div>
                  <h2 id="pipeline-heading" className="text-base font-semibold tracking-tight text-ink">
                    {job.type === 'clone' ? 'Cloning pipeline' : 'Modification pipeline'}
                  </h2>
                  {job.url && (
                    <p className="truncate text-xs text-ink-subtle" title={job.url}>
                      {job.url}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.instruction && (
                  <span className="hidden max-w-[220px] truncate text-xs text-ink-subtle sm:inline">
                    “{job.instruction}”
                  </span>
                )}
                <StageBadge stage={job.stage} />
              </div>
            </div>

            <ol className="space-y-0">
              {job.steps.map((step, i) => {
                const status = STEP_STATUS_TEXT[step.status];
                const isLast = i === job.steps.length - 1;
                return (
                  <li key={`${step.name}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                    {!isLast && (
                      <span
                        aria-hidden
                        className={`absolute left-[18px] top-10 h-[calc(100%-2.5rem)] w-px ${
                          step.status === 'done' ? 'bg-success-100' : 'bg-line'
                        }`}
                      />
                    )}
                    <StepMarker step={step} />
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <p
                          className={`text-sm font-medium ${
                            step.status === 'pending' ? 'text-ink-subtle' : 'text-ink'
                          }`}
                        >
                          <span className="mr-1.5 font-mono text-[11px] text-ink-subtle">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {step.name}
                        </p>
                        <span className={`text-[11px] font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      {step.detail && (
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted break-words">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Run metrics */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                icon={Hammer}
                label="Build status"
                value={job.buildStatus === 'pass' ? 'Passing' : job.buildStatus === 'fail' ? 'Failing' : 'Pending'}
                tone={buildTone}
              />
              <Metric
                icon={Wrench}
                label="Repair attempts"
                value={`${job.repairAttempts} of 2`}
                tone={job.repairAttempts > 0 ? 'text-warning-700' : 'text-ink'}
              />
              <Metric icon={Clock} label="Elapsed" value={`${elapsed}s`} mono />
              <Metric
                icon={Cube}
                label="Project"
                value={job.projectId || '—'}
                mono
                tone={job.projectId ? 'text-ink' : 'text-ink-subtle'}
              />
            </div>

            {/* Detected structure */}
            {job.analysis && (
              <div className="mt-5 rounded-xl border border-line bg-canvas/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    <Grid className="h-3.5 w-3.5" />
                    Detected structure
                  </p>
                  <p className="text-xs text-ink-muted">
                    <span className="font-semibold text-ink">{job.analysis.title || 'Untitled'}</span>
                    {' · '}
                    {sections} section{sections === 1 ? '' : 's'}
                    {' · '}
                    {components.length} component{components.length === 1 ? '' : 's'}
                  </p>
                </div>
                {components.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {components.slice(0, 12).map((c) => (
                      <li
                        key={c}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink-muted transition-colors duration-150 hover:border-brand-100 hover:text-brand-700"
                      >
                        <Cube className="h-3 w-3 text-brand-500" />
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-ink-subtle">
                    Components will appear once generation starts.
                  </p>
                )}
              </div>
            )}

            {/* Error state */}
            {job.error && (
              <div role="alert" className="mt-5 rounded-xl border border-danger-100 bg-danger-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-danger-700">
                      {job.stage === 'error' ? 'Pipeline stopped' : 'Something went wrong'}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-danger-700/80 break-words">
                      {job.error}
                    </p>
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={!!busy}
                      className="btn btn-ghost mt-3 px-3 py-1.5 text-xs"
                    >
                      <Refresh className="h-3 w-3" />
                      Re-run clone
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview CTA */}
            {job.previewUrl && job.stage === 'ready' && (
              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-success-100 bg-success-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-success-700">Your clone is live locally</p>
                  <p className="mt-0.5 font-mono text-xs text-success-700/80">{job.previewUrl}</p>
                </div>
                <a
                  href={job.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-run px-4 py-2.5"
                  aria-label={`Open preview of ${job.projectId || 'generated site'} in a new tab`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open preview
                </a>
              </div>
            )}

            {/* Agent console */}
            <details
              className="group mt-5 overflow-hidden rounded-xl border border-console-line bg-console"
              open={job.stage === 'error'}
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-console-line px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/50">
                <Terminal className="h-3.5 w-3.5 text-zinc-500" />
                Agent logs
                <span className="rounded-full bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                  {job.logs.length}
                </span>
                <ChevronDown className="ml-auto h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="scroll-slim max-h-64 overflow-auto px-3.5 py-3">
                {job.logs.length === 0 ? (
                  <p className="font-mono text-xs text-zinc-500">Waiting for the first log line…</p>
                ) : (
                  <pre className="space-y-1 font-mono text-[11px] leading-relaxed">
                    {job.logs.map((line, i) => (
                      <span key={i} className={`block ${logTone(line)}`}>
                        {line}
                      </span>
                    ))}
                  </pre>
                )}
              </div>
            </details>
          </section>
        )}

        {/* Empty state explainer */}
        {!job && !busy && (
          <section className="card p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
              What happens next
            </p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Globe, title: 'Analyze', body: 'Headless browser extracts sections, nav, colors and typography.' },
                { icon: Brain, title: 'Plan', body: 'The agent decides components, hierarchy and styling approach.' },
                { icon: Cube, title: 'Generate', body: 'Real Next.js + Tailwind source files, no iframes or screenshots.' },
                { icon: Hammer, title: 'Build & fix', body: 'Installs, builds, and repairs errors before serving a preview.' },
              ].map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-xl border border-line bg-canvas/60 p-3.5 transition-colors duration-150 hover:border-line-strong"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-brand-600">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="mt-2.5 text-sm font-medium text-ink">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{body}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Modification panel */}
        {job?.projectId && job.stage === 'ready' && (
          <section className="card animate-fade-rise p-5 sm:p-6" aria-labelledby="modify-heading">
            <div className="mb-4 flex items-start gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 id="modify-heading" className="text-base font-semibold tracking-tight text-ink">
                  Refine with natural language
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Describe a change and the agent edits the generated source, then rebuilds it.
                </p>
              </div>
            </div>

            <label htmlFor="instruction" className="sr-only">
              Change instruction
            </label>
            <textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Make the hero darker and add a pricing section"
              className="field min-h-[96px] resize-y p-3.5 text-sm leading-relaxed"
            />

            <div className="mt-3 flex flex-wrap gap-1.5">
              {CHANGE_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setInstruction(idea)}
                  disabled={modifyBusy}
                  className="chip transition-colors duration-150 hover:border-brand-100 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {idea}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleModify}
                disabled={modifyBusy || !instruction.trim()}
                className="btn btn-primary px-4 py-2.5"
              >
                {modifyBusy ? (
                  <>
                    <Spinner className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                    Applying change…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Apply change
                  </>
                )}
              </button>
              {job.previewUrl && (
                <a
                  href={job.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost px-3.5 py-2.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Current preview
                </a>
              )}
            </div>
          </section>
        )}

        <footer className="pb-4 pt-2 text-center text-xs text-ink-subtle">
          Runs entirely on your machine · Generated projects live in{' '}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-ink-muted">
            generated-sites/
          </code>{' '}
          ·{' '}
          <a href="/preview" className="text-brand-600 underline-offset-4 hover:underline">
            Browse all sites
          </a>
        </footer>
      </main>
    </div>
  );
}
