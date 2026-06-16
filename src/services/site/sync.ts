import type { SiteSyncJob } from './types';

const syncJobs: SiteSyncJob[] = [];

export function createSyncJob(job: Omit<SiteSyncJob, 'id' | 'createdAt' | 'itemsSynced' | 'bytesTransferred'>): SiteSyncJob {
  const newJob: SiteSyncJob = {
    ...job,
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    itemsSynced: 0,
    bytesTransferred: 0,
    createdAt: new Date().toISOString(),
  };
  syncJobs.push(newJob);
  return newJob;
}

export async function executeSyncJob(jobId: string): Promise<SiteSyncJob> {
  const job = syncJobs.find(j => j.id === jobId);
  if (!job) throw new Error(`Sync job ${jobId} not found`);
  job.status = 'running';
  job.startedAt = new Date().toISOString();
  for (let i = 0; i < (job.itemsTotal || 100); i++) {
    job.itemsSynced++;
    job.bytesTransferred += 1024;
  }
  job.status = 'completed';
  job.completedAt = new Date().toISOString();
  return job;
}

export function getSyncJobs(sourceSiteId?: string, status?: SiteSyncJob['status']): SiteSyncJob[] {
  let results = [...syncJobs];
  if (sourceSiteId) results = results.filter(j => j.sourceSiteId === sourceSiteId);
  if (status) results = results.filter(j => j.status === status);
  return results;
}

export function cancelSyncJob(jobId: string): boolean {
  const job = syncJobs.find(j => j.id === jobId);
  if (!job || job.status === 'completed') return false;
  job.status = 'cancelled';
  job.completedAt = new Date().toISOString();
  return true;
}

export async function crossSiteShareReport(reportId: string, targetSiteIds: string[]): Promise<{ success: boolean; sharedWith: string[] }> {
  console.log(`[Site Sync] Sharing report ${reportId} with sites: ${targetSiteIds.join(', ')}`);
  return { success: true, sharedWith: targetSiteIds };
}

export async function crossSiteAccessImage(studyUid: string, siteId: string): Promise<{ accessible: boolean; url?: string }> {
  console.log(`[Site Sync] Requesting image access for study ${studyUid} from site ${siteId}`);
  return { accessible: true, url: `https://site-${siteId}/dicom/studies/${studyUid}` };
}
