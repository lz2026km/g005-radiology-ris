import { CheckCircle, Circle, Clock, AlertTriangle, SkipForward, XCircle, ArrowRight, Activity } from 'lucide-react'
import type { ClinicalPathwayDef, ClinicalPathwayStep, PathwayInstance, PathwayInstanceStep, PathwayStepStatus } from '../../types/cds'

interface PathwayChartProps {
  definition: ClinicalPathwayDef
  instance?: PathwayInstance
  onStepClick?: (step: ClinicalPathwayStep) => void
}

const STATUS_ICONS: Record<PathwayStepStatus, typeof Circle> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle,
  skipped: SkipForward,
  blocked: XCircle,
  overdue: AlertTriangle,
}

const STATUS_COLORS: Record<PathwayStepStatus, string> = {
  pending: '#30363d',
  in_progress: '#58a6ff',
  completed: '#22c55e',
  skipped: '#6e7681',
  blocked: '#f85149',
  overdue: '#d29922',
}

export default function PathwayChart({ definition, instance, onStepClick }: PathwayChartProps) {
  const steps = definition.steps
  const instanceSteps = instance?.steps ?? []

  const getStepStatus = (step: ClinicalPathwayStep): PathwayStepStatus => {
    const inst = instanceSteps.find((s) => s.stepId === step.id)
    return inst?.status ?? 'pending'
  }

  const getStepProgress = (): number => {
    if (!instance) return 0
    const completed = instanceSteps.filter((s) => s.status === 'completed').length
    return Math.round((completed / steps.length) * 100)
  }

  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f6fc', marginBottom: 2 }}>{definition.name}</div>
          <div style={{ fontSize: 12, color: '#6e7681' }}>{definition.condition} · {definition.estimatedDurationDays}天 · {steps.length}步</div>
        </div>
        {instance && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: getStepProgress() === 100 ? '#22c55e' : '#58a6ff' }}>{getStepProgress()}%</div>
            <div style={{ fontSize: 12, color: '#6e7681' }}>完成进度</div>
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        {steps.map((step, idx) => {
          const status = getStepStatus(step)
          const Icon = STATUS_ICONS[status]
          const color = STATUS_COLORS[status]
          const isLast = idx === steps.length - 1
          const instanceStep = instanceSteps.find((s) => s.stepId === step.id)
          return (
            <div key={step.id} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: isLast ? 0 : 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                <Icon size={20} color={color} />
                {!isLast && <div style={{ width: 2, flex: 1, background: '#30363d', marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 12, cursor: onStepClick ? 'pointer' : 'default' }}
                onClick={() => onStepClick?.(step)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{step.name}</span>
                  <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 4, background: color + '20', color }}>{status}</span>
                  {step.isMilestone && <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 4, background: '#58a6ff20', color: '#58a6ff' }}>里程碑</span>}
                </div>
                <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 2 }}>{step.description}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6e7681' }}>
                  <span>默认 {step.defaultTimingDays}天</span>
                  {step.modality && <span>{step.modality}</span>}
                  {step.bodyPart && <span>{step.bodyPart}</span>}
                  {instanceStep?.completedAt && <span>完成: {new Date(instanceStep.completedAt).toLocaleDateString('zh-CN')}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
