import { NextRequest, NextResponse } from 'next/server';
import { projectExists } from '@/lib/generator';
import { createJob } from '@/lib/jobs';
import { runModifyJob } from '@/lib/pipeline';
import { getPreview } from '@/lib/preview';

export async function POST(request: NextRequest) {
  try {
    const { projectId, instruction } = await request.json();

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }
    if (!instruction || typeof instruction !== 'string' || instruction.trim().length < 3) {
      return NextResponse.json({ error: 'instruction is required' }, { status: 400 });
    }
    if (!(await projectExists(projectId))) {
      return NextResponse.json({ error: `Project ${projectId} not found` }, { status: 404 });
    }

    const preview = getPreview(projectId);
    const job = createJob('modify', {
      projectId,
      instruction: instruction.trim(),
      previewUrl: preview?.url,
      previewPort: preview?.port,
      steps: [
        { name: 'AI Modification', status: 'pending' },
        { name: 'Build Validation', status: 'pending' },
        { name: 'Preview', status: 'pending' },
      ],
    });

    void runModifyJob(job, projectId, instruction.trim());

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start modification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
