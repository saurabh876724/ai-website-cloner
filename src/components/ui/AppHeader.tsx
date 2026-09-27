import { LogoMark } from './icons';

const STATUS_TREATMENT: Record<string, { dot: string; text: string; label: string }> = {
  idle: { dot: 'bg-zinc-300', text: 'text-ink-muted', label: 'Idle' },
  running: { dot: 'bg-brand-500 animate-pulse', text: 'text-brand-700', label: 'Agent running' },
  ready: { dot: 'bg-success-600', text: 'text-success-700', label: 'Preview live' },
  error: { dot: 'bg-danger-600', text: 'text-danger-700', label: 'Run failed' },
};

export function AppHeader({ status = 'idle' }: { status?: keyof typeof STATUS_TREATMENT }) {
  const s = STATUS_TREATMENT[status] ?? STATUS_TREATMENT.idle;
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <LogoMark />
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-ink">
            AI Website Cloner
          </h1>
          <p className="truncate text-xs text-ink-subtle">
            Analyze a live site, generate a real Next.js build, keep editing it in plain English
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium sm:inline-flex">
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
            <span className={s.text}>{s.label}</span>
            <span className="sr-only" aria-live="polite">
              Agent status: {s.label}
            </span>
          </span>
          <a
            href="/preview"
            className="btn btn-ghost px-3 py-1.5 text-xs"
            aria-label="View all generated sites"
          >
            Generated sites
          </a>
        </div>
      </div>
    </header>
  );
}
