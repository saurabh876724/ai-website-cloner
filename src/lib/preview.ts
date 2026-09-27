import { ChildProcess, spawn } from 'child_process';
import { projectDir } from './generator';

interface PreviewHandle {
  process: ChildProcess;
  port: number;
}

const previews = new Map<string, PreviewHandle>();
let nextPort = 4100;

export function getPreview(projectId: string): { port: number; url: string } | null {
  const handle = previews.get(projectId);
  if (!handle) return null;
  return { port: handle.port, url: `http://localhost:${handle.port}` };
}

export function stopPreview(projectId: string): void {
  const handle = previews.get(projectId);
  if (handle) {
    try {
      if (process.platform === 'win32' && handle.process.pid) {
        // npm spawns a child server process; kill the whole tree or the port stays bound
        spawn('taskkill', ['/pid', String(handle.process.pid), '/t', '/f'], { shell: true });
      } else {
        handle.process.kill();
      }
    } catch {
      // already dead
    }
    previews.delete(projectId);
  }
}

export async function startPreview(projectId: string): Promise<{ port: number; url: string }> {
  stopPreview(projectId);

  const port = nextPort++;
  const cwd = projectDir(projectId);
  const child = spawn('npm', ['run', 'start', '--', '-p', String(port)], {
    cwd,
    shell: true,
    stdio: 'ignore',
    detached: false,
  });
  previews.set(projectId, { process: child, port });

  child.on('close', () => {
    const current = previews.get(projectId);
    if (current?.process === child) previews.delete(projectId);
  });

  await waitForServer(port, 40_000);
  return { port, url: `http://localhost:${port}` };
}

async function waitForServer(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}`, { method: 'GET' });
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Preview server on port ${port} did not become ready in time`);
}

export function listRunningPreviews(): Array<{ projectId: string; port: number; url: string }> {
  return [...previews.entries()].map(([projectId, h]) => ({
    projectId,
    port: h.port,
    url: `http://localhost:${h.port}`,
  }));
}
