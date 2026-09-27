import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { GENERATED_ROOT } from '@/lib/generator';
import { listRunningPreviews } from '@/lib/preview';

export async function GET() {
  try {
    const entries = await fs.readdir(GENERATED_ROOT, { withFileTypes: true }).catch(() => []);
    const previews = listRunningPreviews();

    const projects = await Promise.all(
      entries
        .filter((e) => e.isDirectory())
        .map(async (e) => {
          const stat = await fs.stat(path.join(GENERATED_ROOT, e.name));
          const preview = previews.find((p) => p.projectId === e.name);
          return {
            id: e.name,
            createdAt: stat.mtime.toISOString(),
            previewUrl: preview?.url ?? null,
          };
        })
    );

    projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
