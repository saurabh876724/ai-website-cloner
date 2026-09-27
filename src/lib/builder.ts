import { spawn } from 'child_process';
import { chat, extractJson } from './ai';
import { GeneratedFile } from './types';

export interface CommandResult {
  code: number;
  output: string;
}

const MAX_OUTPUT = 120_000;

/**
 * `next dev` runs with NODE_ENV=development, and a `next build` spawned from that
 * process inherits it and then dies prerendering Next's own /_global-error page
 * ("Cannot read properties of null (reading 'useContext')"). Force a production env.
 */
function buildEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: 'production' };
  for (const key of Object.keys(env)) {
    if (key.startsWith('NEXT_') || key === 'TURBOPACK' || key.startsWith('__NEXT')) delete env[key];
  }
  return env;
}

export function runCommand(
  command: string,
  args: string[],
  cwd: string,
  env?: NodeJS.ProcessEnv
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const chunks: string[] = [];
    let size = 0;
    const child = spawn(command, args, { cwd, shell: true, env: env ?? { ...process.env } });

    const collect = (data: Buffer) => {
      if (size < MAX_OUTPUT) {
        chunks.push(data.toString());
        size += data.length;
      }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);

    child.on('error', (err) => resolve({ code: 1, output: `${chunks.join('')}\n${err.message}` }));
    child.on('close', (code) => resolve({ code: code ?? 1, output: chunks.join('') }));
  });
}

export async function installDependencies(cwd: string): Promise<CommandResult> {
  return runCommand('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], cwd);
}

export async function runBuild(cwd: string): Promise<CommandResult> {
  return runCommand('npm', ['run', 'build'], cwd, buildEnv());
}

export function tailErrors(output: string, chars = 4000): string {
  return output.slice(-chars);
}

/** Ask the AI to repair failing files; returns only the files it changed. */
export async function repairWithAI(
  files: GeneratedFile[],
  buildError: string
): Promise<GeneratedFile[]> {
  const fileContext = files
    .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 9000)}`)
    .join('\n\n');

  const output = await chat(
    'You are a Next.js/TypeScript build engineer. Fix build errors by returning corrected file contents as JSON. Return only valid JSON.',
    `A generated Next.js (App Router, TypeScript strict:false, Tailwind v4 via @tailwindcss/postcss) project fails to build.

BUILD ERROR OUTPUT:
${buildError}

CURRENT SOURCE FILES:
${fileContext}

Identify the root cause and return ONLY the files that need changes, with their FULL corrected content.
JSON shape: {"files":[{"path":"src/app/page.tsx","content":"..."}]}
Keep paths exactly as listed. No markdown fences.`,
    { temperature: 0.2, maxTokens: 8192 }
  );

  const parsed = extractJson<{ files: GeneratedFile[] }>(output);
  return (parsed.files || []).filter(
    (f) => f && typeof f.path === 'string' && typeof f.content === 'string'
  );
}
