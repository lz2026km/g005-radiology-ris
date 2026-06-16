import type { CloudRenderJob, RenderQuality } from './cloudRenderService'

export type JobPriority = 'low' | 'normal' | 'high' | 'critical'

export interface JobQueueEntry {
  job: CloudRenderJob
  priority: JobPriority
  submittedAt: string
  estimatedCost: number
  retryCount: number
  maxRetries: number
}

export interface AutoScalingConfig {
  minNodes: number
  maxNodes: number
  targetUtilization: number
  scaleUpThreshold: number
  scaleDownThreshold: number
}

export interface CostEstimate {
  computeHours: number
  gpuHours: number
  storageGb: number
  totalCost: number
  currency: string
}

const jobQueue: JobQueueEntry[] = []
const PRIORITY_ORDER: Record<JobPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
}

export function enqueueJob(
  job: CloudRenderJob,
  priority: JobPriority = 'normal'
): JobQueueEntry {
  const entry: JobQueueEntry = {
    job,
    priority,
    submittedAt: new Date().toISOString(),
    estimatedCost: estimateJobCost(job).totalCost,
    retryCount: 0,
    maxRetries: 3,
  }
  jobQueue.push(entry)
  jobQueue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  return entry
}

export function dequeueNext(): JobQueueEntry | undefined {
  return jobQueue.shift()
}

export function peekQueue(): JobQueueEntry[] {
  return [...jobQueue]
}

export function getQueueLength(): number {
  return jobQueue.length
}

export function removeFromQueue(jobId: string): boolean {
  const idx = jobQueue.findIndex(e => e.job.id === jobId)
  if (idx >= 0) {
    jobQueue.splice(idx, 1)
    return true
  }
  return false
}

export function estimateJobCost(job: CloudRenderJob): CostEstimate {
  const qualityMultiplier: Record<RenderQuality, number> = {
    draft: 0.25,
    preview: 0.5,
    production: 1,
    ultra: 2,
  }
  const baseComputeHours = 0.5
  const baseGpuHours = 0.25
  const baseStorageGb = 0.5
  const mult = qualityMultiplier[job.quality] ?? 1

  return {
    computeHours: baseComputeHours * mult,
    gpuHours: baseGpuHours * mult,
    storageGb: baseStorageGb * mult,
    totalCost: (baseComputeHours * 0.1 + baseGpuHours * 0.5 + baseStorageGb * 0.02) * mult,
    currency: 'USD',
  }
}

export function retryJob(jobId: string): boolean {
  const entry = jobQueue.find(e => e.job.id === jobId)
  if (!entry) return false
  if (entry.retryCount >= entry.maxRetries) return false

  entry.retryCount++
  entry.job.status = 'queued'
  entry.job.progress = 0
  entry.job.errorMessage = undefined
  return true
}

export function getClusterStatus(): {
  activeJobs: number
  queueLength: number
  utilizationPercent: number
  recommendedNodes: number
} {
  const activeJobs = activeJobsCount()
  const utilizationPercent = activeJobs > 0 ? Math.min(100, (activeJobs / 10) * 100) : 0

  return {
    activeJobs,
    queueLength: jobQueue.length,
    utilizationPercent: Math.round(utilizationPercent),
    recommendedNodes: Math.max(1, Math.ceil(utilizationPercent / 50)),
  }
}

function activeJobsCount(): number {
  return jobQueue.filter(e => e.job.status === 'processing').length
}
