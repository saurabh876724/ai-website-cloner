import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/lib/jobs';
import { runCloneJob } from '@/lib/pipeline';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 });
    }

    const job = createJob('clone', { url });
    // Fire and forget; client polls /api/jobs/[id]
    void runCloneJob(job, url);

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start clone job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
