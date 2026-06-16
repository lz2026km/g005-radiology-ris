export type TranscodeTarget = 'jpeg' | 'jpeg2000' | 'png' | 'webp' | 'dicom';
export type TranscodeStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TranscodeJob {
  id: string;
  sourcePath: string;
  targetFormat: TranscodeTarget;
  quality: number;
  status: TranscodeStatus;
  progress: number;
  outputPath?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const jobs: TranscodeJob[] = [];

export const transcodeEngine = {
  async createJob(sourcePath: string, targetFormat: TranscodeTarget, quality: number = 80): Promise<TranscodeJob> {
    const job: TranscodeJob = {
      id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sourcePath, targetFormat, quality,
      status: 'pending', progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    jobs.push(job);
    return job;
  },

  async executeJob(jobId: string): Promise<TranscodeJob> {
    const job = jobs.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    job.status = 'running';
    for (let i = 0; i <= 100; i += 10) {
      job.progress = i;
      await new Promise(r => setTimeout(r, 10));
    }
    job.status = 'completed';
    job.progress = 100;
    job.outputPath = `${job.sourcePath}.${job.targetFormat}`;
    job.updatedAt = new Date().toISOString();
    return job;
  },

  getJob(jobId: string): TranscodeJob | undefined {
    return jobs.find(j => j.id === jobId);
  },

  listJobs(status?: TranscodeStatus): TranscodeJob[] {
    return status ? jobs.filter(j => j.status === status) : [...jobs];
  },

  async batchTranscode(sourcePaths: string[], targetFormat: TranscodeTarget): Promise<TranscodeJob[]> {
    return Promise.all(sourcePaths.map(p => this.createJob(p, targetFormat).then(j => this.executeJob(j.id))));
  },
};
