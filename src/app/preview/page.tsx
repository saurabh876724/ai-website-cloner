'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import { ExternalLink, Globe } from '@/components/ui/icons';
import { SiteFrameGlyph } from '@/components/ui/illustrations';

interface Project {
  id: string;
  createdAt: string;
  previewUrl: string | null;
}

export default function PreviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const running = projects.filter((p) => p.previewUrl).length;

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader status={running > 0 ? 'ready' : 'idle'} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
              Workspace
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">Generated sites</h2>
            <p className="mt-1 max-w-xl text-sm text-ink-muted">
              Every clone is a real Next.js project on disk in{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-ink-muted">
                generated-sites/
              </code>
              , each served on its own local port.
            </p>
          </div>
          <span className="chip">
            <Globe className="h-3 w-3" />
            {running} of {projects.length} serving
          </span>
        </div>

        {loading ? (
          <ul className="space-y-2.5" aria-busy="true" aria-label="Loading generated sites">
            {[0, 1, 2].map((i) => (
              <li key={i} className="card flex items-center gap-3 p-4">
                <span className="skeleton h-9 w-9 shrink-0 rounded-lg" />
                <span className="flex-1 space-y-2">
                  <span className="skeleton block h-3 w-1/3 rounded" />
                  <span className="skeleton block h-2.5 w-1/4 rounded" />
                </span>
                <span className="skeleton h-8 w-28 rounded-lg" />
              </li>
            ))}
          </ul>
        ) : projects.length === 0 ? (
          <div className="card bg-dot-grid p-10 text-center">
            <span className="mx-auto flex h-12 w-14 items-center justify-center">
              <SiteFrameGlyph className="h-12 w-14 opacity-70" />
            </span>
            <p className="mt-3 text-sm font-medium text-ink">No generated sites yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
              Clone a website from the home page and it will appear here with its own preview server.
            </p>
            <a href="/" className="btn btn-primary mt-4 px-4 py-2">
              Start a clone
            </a>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {projects.map((p) => (
              <li
                key={p.id}
                className="card flex flex-col gap-3 p-4 transition-shadow duration-200 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                    <SiteFrameGlyph className="h-8 w-9" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-ink" title={p.id}>
                      {p.id}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      created {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {p.previewUrl ? (
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success-100 bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-600" aria-hidden />
                      <span className="font-mono">{p.previewUrl.replace(/^https?:\/\//, '')}</span>
                    </span>
                    <a
                      href={p.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-run px-3.5 py-2 text-xs"
                      aria-label={`Open preview of ${p.id} in a new tab`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open preview
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-ink-subtle">server not running</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
