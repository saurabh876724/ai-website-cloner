import fs from 'fs/promises';
import path from 'path';
import { chat, extractJson } from './ai';
import { GeneratedFile, ImplementationPlan, WebsiteAnalysis } from './types';

// Sibling of the app directory on purpose: writing generated projects (package.json,
// node_modules, .next) inside the Next.js project makes the dev watcher restart the
// server mid-pipeline, killing in-flight jobs.
export const GENERATED_ROOT = path.resolve(process.cwd(), '..', 'generated-sites');

export function newProjectId(): string {
  return `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function projectDir(projectId: string): string {
  return path.join(GENERATED_ROOT, projectId);
}

/** Deterministic config scaffold — never left to the AI so builds stay predictable. */
export function scaffoldFiles(plan: ImplementationPlan): GeneratedFile[] {
  const palette = plan.styling?.palette || {};
  return [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: 'generated-site',
          version: '0.1.0',
          private: true,
          scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
          dependencies: { next: '16.3.6', react: '19.2.8', 'react-dom': '19.2.8' },
          devDependencies: {
            '@tailwindcss/postcss': '^4',
            '@types/node': '^20',
            '@types/react': '^19',
            '@types/react-dom': '^19',
            tailwindcss: '^4',
            typescript: '^5',
          },
        },
        null,
        2
      ),
    },
    {
      path: 'next.config.mjs',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
};
export default nextConfig;
`,
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2017',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: false,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
            paths: { '@/*': ['./src/*'] },
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules'],
        },
        null,
        2
      ),
    },
    {
      path: 'postcss.config.mjs',
      content: `export default { plugins: { '@tailwindcss/postcss': {} } };\n`,
    },
    {
      path: '.gitignore',
      content: `node_modules\n.next\nout\n`,
    },
    {
      path: 'src/app/globals.css',
      content: `@import "tailwindcss";

:root {
  --color-primary: ${palette.primary || '#2563eb'};
  --color-background: ${palette.background || '#ffffff'};
  --color-text: ${palette.text || '#111827'};
  --color-accent: ${palette.accent || palette.primary || '#2563eb'};
}
`,
    },
  ];
}

function normalizePath(p: string): string {
  let clean = p.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!clean.startsWith('src/')) {
    if (/^(app|components|lib)\//.test(clean)) clean = `src/${clean}`;
    else if (!clean.includes('/')) clean = `src/app/${clean}`;
  }
  return clean;
}

function defaultLayout(title: string): string {
  return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: ${JSON.stringify(title)} };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
}

export async function generateAppFiles(
  plan: ImplementationPlan,
  analysis: WebsiteAnalysis
): Promise<GeneratedFile[]> {
  const componentList = plan.components.map((c) => `- ${c.name}: ${c.purpose}`).join('\n');
  const structure = plan.pageStructure.map((s) => `- <${s.component} /> (${s.section}: ${s.purpose})`).join('\n');

  const prompt = `Generate the source files for a NEW Next.js App Router + TypeScript + Tailwind CSS implementation of a website with these characteristics:

TITLE: ${analysis.title}
NAVIGATION LABELS: ${analysis.navigation.map((n) => n.label).join(' | ') || 'none'}
SECTION ORDER & CONTENT SAMPLES:
${analysis.sections.map((s) => `- [${s.type}] ${s.heading ? `"${s.heading}" ` : ''}${s.text.slice(0, 180)}`).join('\n')}
KEY HEADINGS: ${analysis.headings.slice(0, 10).map((h) => `H${h.level}: ${h.text}`).join(' | ')}
BUTTONS: ${analysis.buttons.slice(0, 8).join(' | ')}
SAMPLE PARAGRAPHS: ${analysis.paragraphs.slice(0, 4).map((p) => p.slice(0, 140)).join(' /// ')}
IMAGE URLS AVAILABLE: ${analysis.images.slice(0, 8).map((i) => i.src).join('\n')}
PALETTE: ${JSON.stringify(plan.styling.palette)}
FONTS: ${plan.styling.fonts.join(', ')}
SPACING: ${plan.styling.spacing}
RESPONSIVE: ${plan.responsive}
VISUAL NOTES: ${plan.visualNotes.join('; ')}

PLANNED COMPONENTS:
${componentList}

PAGE STRUCTURE (in order):
${structure}

HIERARCHY: ${plan.hierarchy}

Generate EXACTLY these files (plus one .tsx per planned component):
- src/app/layout.tsx (imports './globals.css', sets metadata title)
- src/app/page.tsx (composes the components in order; must import them from '@/components/...')
- src/components/<Name>.tsx for every planned component

Rules:
- Tailwind utility classes only; use arbitrary color values like bg-[#0ea5e9] from the palette.
- Reproduce the original text content (headings, paragraphs, button labels, nav labels) as closely as the analysis provides.
- Use the provided image URLs in <img src="..."> where they fit; otherwise https://placehold.co/600x400.
- Responsive: mobile-first, md:/lg: breakpoints.
- No external UI libraries, no new dependencies, no 'use client' unless interactivity requires it.
- Do NOT generate error.tsx, global-error.tsx, loading.tsx or not-found.tsx — only the files listed above.
- TypeScript must compile with strict:false.
- Return ONLY JSON: {"files":[{"path":"src/app/page.tsx","content":"..."}]} with no markdown fences.`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const output = await chat(
      'You are an expert frontend engineer generating complete, compilable Next.js source files. Return only valid JSON.',
      prompt,
      { temperature: 0.35, maxTokens: 8192 }
    );

    try {
      const parsed = extractJson<{ files: GeneratedFile[] }>(output);
      const files = (parsed.files || [])
        .filter((f) => f && typeof f.path === 'string' && typeof f.content === 'string')
        .map((f) => ({ path: normalizePath(f.path), content: f.content }))
        // Next.js special route files (error boundaries, loading, not-found) commonly
        // break static prerendering with 'useContext of null' and are never required
        // for a visual clone — drop them if the model emits them anyway.
        .filter((f) => !/(^|\/)(global-error|error|loading|not-found)\.tsx?$/.test(f.path));

      if (!files.some((f) => f.path === 'src/app/page.tsx')) {
        if (attempt === 1) continue;
        throw new Error('AI generator did not produce src/app/page.tsx');
      }
      if (!files.some((f) => f.path === 'src/app/layout.tsx')) {
        files.push({ path: 'src/app/layout.tsx', content: defaultLayout(analysis.title) });
      }
      return files;
    } catch (err) {
      if (attempt === 2) throw err instanceof Error ? err : new Error('Generation failed');
    }
  }
  throw new Error('Generation failed after retries');
}

export async function writeProject(projectId: string, files: GeneratedFile[]): Promise<void> {
  const dir = projectDir(projectId);
  for (const file of files) {
    const safeRel = path.normalize(file.path).replace(/^(\.\.[/\\])+/, '');
    const abs = path.join(dir, safeRel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, file.content, 'utf8');
  }
}

export async function readProjectFiles(projectId: string): Promise<GeneratedFile[]> {
  const dir = projectDir(projectId);
  const srcDir = path.join(dir, 'src');
  const out: GeneratedFile[] = [];

  async function walk(abs: string, rel: string) {
    const entries = await fs.readdir(abs, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(abs, entry.name);
      const relPath = `${rel}${entry.name}`;
      if (entry.isDirectory()) await walk(absPath, `${relPath}/`);
      else if (/\.(tsx?|css|jsx?)$/.test(entry.name)) {
        out.push({ path: relPath, content: await fs.readFile(absPath, 'utf8') });
      }
    }
  }

  await walk(srcDir, 'src/');
  return out;
}

export async function projectExists(projectId: string): Promise<boolean> {
  try {
    await fs.access(path.join(projectDir(projectId), 'package.json'));
    return true;
  } catch {
    return false;
  }
}
