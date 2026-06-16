export type RenderQuality = 'draft' | 'preview' | 'production' | 'ultra'

export interface CloudRenderJob {
  id: string
  studyInstanceUid: string
  modality: string
  quality: RenderQuality
  transferFunction: string
  rotationAngles: { x: number; y: number; z: number }
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: string
  completedAt?: string
  resultUrl?: string
  errorMessage?: string
}

export interface StreamingRenderFrame {
  jobId: string
  frameNumber: number
  totalFrames: number
  dataUrl: string
  quality: RenderQuality
}

type ProgressCallback = (progress: number) => void
type CompleteCallback = (result: CloudRenderJob) => void

const activeJobs = new Map<string, CloudRenderJob>()

export function submitRenderJob(
  studyInstanceUid: string,
  modality: string,
  quality: RenderQuality = 'preview',
  transferFunction: string = 'default',
  rotationAngles: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): CloudRenderJob {
  const job: CloudRenderJob = {
    id: `cloud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    studyInstanceUid,
    modality,
    quality,
    transferFunction,
    rotationAngles,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
  }
  activeJobs.set(job.id, job)
  return job
}

export function getJob(jobId: string): CloudRenderJob | undefined {
  return activeJobs.get(jobId)
}

export function listJobs(): CloudRenderJob[] {
  return Array.from(activeJobs.values())
}

export function listJobsByStudy(studyInstanceUid: string): CloudRenderJob[] {
  return Array.from(activeJobs.values()).filter(j => j.studyInstanceUid === studyInstanceUid)
}

export function cancelJob(jobId: string): boolean {
  const job = activeJobs.get(jobId)
  if (job && (job.status === 'queued' || job.status === 'processing')) {
    job.status = 'failed'
    job.errorMessage = 'Cancelled by user'
    return true
  }
  return false
}

export function simulateJobProgress(
  jobId: string,
  onProgress?: ProgressCallback,
  onComplete?: CompleteCallback
): void {
  const job = activeJobs.get(jobId)
  if (!job) return

  job.status = 'processing'
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 15
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      job.status = 'completed'
      job.progress = 100
      job.completedAt = new Date().toISOString()
      job.resultUrl = `https://render.g005.cloud/jobs/${jobId}/result.dcm`
      onComplete?.(job)
    }
    job.progress = Math.min(100, Math.round(progress))
    onProgress?.(job.progress)
  }, 500)
}

export function getStreamingUrl(jobId: string): string | null {
  const job = activeJobs.get(jobId)
  return job?.resultUrl ?? null
}
