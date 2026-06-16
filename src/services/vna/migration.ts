import type { DicomStudy, DicomSeries, DicomInstance } from './types';

export interface MigrationJob {
  id: string;
  sourceStorageTier: string;
  targetStorageTier: string;
  studyUids: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

const migrations: MigrationJob[] = [];

export function createMigration(source: string, target: string, studyUids: string[]): MigrationJob {
  const job: MigrationJob = {
    id: `mig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceStorageTier: source,
    targetStorageTier: target,
    studyUids,
    status: 'pending',
    totalItems: studyUids.length,
    processedItems: 0,
    createdAt: new Date().toISOString(),
  };
  migrations.push(job);
  return job;
}

export async function executeMigration(jobId: string): Promise<MigrationJob> {
  const job = migrations.find(m => m.id === jobId);
  if (!job) throw new Error(`Migration job ${jobId} not found`);
  job.status = 'running';
  for (const studyUid of job.studyUids) {
    try {
      const { vnaStore } = await import('./store');
      const study = await vnaStore.getStudy(studyUid);
      if (study) {
        study.storageTier = job.targetStorageTier;
        job.processedItems++;
      }
    } catch (err) {
      job.error = `Failed to migrate ${studyUid}: ${(err as Error).message}`;
      job.status = 'failed';
      return job;
    }
  }
  job.status = 'completed';
  job.completedAt = new Date().toISOString();
  return job;
}

export function getMigrationJobs(status?: MigrationJob['status']): MigrationJob[] {
  return status ? migrations.filter(m => m.status === status) : [...migrations];
}

export function cancelMigration(jobId: string): boolean {
  const job = migrations.find(m => m.id === jobId);
  if (!job || job.status === 'completed') return false;
  job.status = 'failed';
  job.error = 'Cancelled by user';
  return true;
}
