import { randomUUID } from 'crypto';
import { Job, JobStep } from './types';

const jobs = new Map<string, Job>();

export const CLONE_STEPS = [
  'Website Analysis',
  'AI Planning',
  'Code Generation',
  'Build Validation',
  'Preview',
] as const;

export function createJob(type: Job['type'], extra: Partial<Job> = {}): Job {
  const job: Job = {
    id: randomUUID().slice(0, 8),
    type,
    stage: 'queued',
    steps: CLONE_STEPS.map((name) => ({ name, status: 'pending' })),
    logs: [],
    buildStatus: 'unknown',
    repairAttempts: 0,
    generatedComponents: [],
    startedAt: Date.now(),
    ...extra,
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function log(job: Job, message: string): void {
  job.logs.push(`[${new Date().toISOString().slice(11, 19)}] ${message.slice(0, 300)}`);
  if (job.logs.length > 250) job.logs.shift();
}

export function setStep(job: Job, index: number, status: JobStep['status'], detail?: string): void {
  const step = job.steps[index];
  if (step) {
    step.status = status;
    if (detail) step.detail = detail;
  }
}
