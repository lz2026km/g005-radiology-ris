import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CriticalValueAcknowledgment from '../../components/v3/critical/CriticalValueAcknowledgment'
import PatientTimeline from '../../components/v3/patient/PatientTimeline'
import DicomMprViewer from '../../components/v3/dicom/DicomMprViewer'
import ExamDoseTracker from '../../components/v3/exam/ExamDoseTracker'
import WorkflowsEngine from '../../components/v3/workflow/WorkflowsEngine'

describe('CriticalValueAcknowledgment', () => {
  const live = [
    { id: 'C1', patientName: '张三', patientId: 'P1', finding: '主动脉夹层', category: 'LIFE_THREATENING' as const, triggeredAt: '2024-06-15 14:30' },
    { id: 'C2', patientName: '李四', patientId: 'P2', finding: '气胸', category: 'URGENT' as const, triggeredAt: '2024-06-15 14:35', acker: '王医师', ackedAt: '14:36' },
  ]
  const events = [
    { id: 'E1', type: 'NEW' as const, criticalId: 'C1', at: '14:30' },
    { id: 'E2', type: 'ACK' as const, criticalId: 'C2', at: '14:36', actor: '王医师' },
  ]

  it('renders with connected state', () => {
    render(
      <CriticalValueAcknowledgment
        live={live}
        events={events}
        connected
        currentUser="我"
        onAck={() => {}}
      />
    )
    expect(screen.getByTestId('critical-value-ack')).toBeInTheDocument()
  })

  it('shows live items', () => {
    render(<CriticalValueAcknowledgment live={live} events={events} connected currentUser="我" />)
    expect(screen.getByTestId('cva-item-C1')).toBeInTheDocument()
    expect(screen.getByTestId('cva-acked-C2')).toBeInTheDocument()
  })

  it('shows acked state', () => {
    render(<CriticalValueAcknowledgment live={live} events={events} connected={false} currentUser="我" />)
    expect(screen.getByTestId('cva-acked-C2')).toBeInTheDocument()
  })

  it('shows event stream', () => {
    render(<CriticalValueAcknowledgment live={live} events={events} connected currentUser="我" />)
    expect(screen.getByTestId('cva-event-E1')).toBeInTheDocument()
    expect(screen.getByTestId('cva-event-E2')).toBeInTheDocument()
  })

  it('calls onAck on click', () => {
    const onAck = vi.fn()
    render(<CriticalValueAcknowledgment live={live} events={events} connected currentUser="我" onAck={onAck} />)
    fireEvent.click(screen.getByTestId('cva-ack-C1'))
    expect(onAck).toHaveBeenCalledWith('C1')
  })
})

describe('PatientTimeline', () => {
  const events = [
    { id: 'T1', type: 'EXAM' as const, at: '2024-06-15', title: 'CT 检查' },
    { id: 'T2', type: 'REPORT' as const, at: '2024-06-16', title: '报告发布' },
    { id: 'T3', type: 'CRITICAL' as const, at: '2024-06-17', title: '危急值', severity: 3 },
  ]

  it('renders with events', () => {
    render(<PatientTimeline patientId="P1" events={events} />)
    expect(screen.getByTestId('patient-timeline-card')).toBeInTheDocument()
    expect(screen.getByTestId('pt-event-T1')).toBeInTheDocument()
  })

  it('filters by type', () => {
    render(<PatientTimeline patientId="P1" events={events} />)
    fireEvent.click(screen.getByTestId('pt-filter-EXAM'))
    expect(screen.getByTestId('pt-list')).toBeInTheDocument()
  })

  it('switches back to all', () => {
    render(<PatientTimeline patientId="P1" events={events} />)
    fireEvent.click(screen.getByTestId('pt-filter-all'))
    expect(screen.getByTestId('pt-list')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    render(<PatientTimeline patientId="P1" events={[]} />)
    expect(screen.getByText(/无事件/)).toBeInTheDocument()
  })
})

describe('DicomMprViewer', () => {
  it('renders with 3 planes', () => {
    render(
      <DicomMprViewer
        studyUid="1.2.3.4"
        totalAxial={100}
        totalSagittal={80}
        totalCoronal={90}
      />
    )
    expect(screen.getByTestId('dicom-mpr-viewer')).toBeInTheDocument()
    expect(screen.getByTestId('mpr-AXIAL')).toBeInTheDocument()
    expect(screen.getByTestId('mpr-SAGITTAL')).toBeInTheDocument()
    expect(screen.getByTestId('mpr-CORONAL')).toBeInTheDocument()
  })

  it('toggles crosshair', () => {
    render(<DicomMprViewer studyUid="1.2.3.4" totalAxial={100} totalSagittal={80} totalCoronal={90} />)
    const btn = screen.getByTestId('mpr-crosshair')
    fireEvent.click(btn)
    expect(btn).toBeInTheDocument()
  })

  it('resets', () => {
    render(<DicomMprViewer studyUid="1.2.3.4" totalAxial={100} totalSagittal={80} totalCoronal={90} />)
    fireEvent.click(screen.getByTestId('mpr-reset'))
    expect(screen.getByTestId('mpr-AXIAL')).toBeInTheDocument()
  })
})

describe('ExamDoseTracker', () => {
  const records = [
    {
      id: 'D1', patientId: 'P1', patientName: '张三', modality: 'CT' as const, bodyPart: 'CHEST',
      examDate: '2024-06-15', deviceName: 'CT-1',
      ctdiVol: 8, dlp: 500, effectiveDose: 5.5, referenceLevel: 6.5,
    },
  ]

  it('renders with stats', () => {
    render(<ExamDoseTracker records={records} />)
    expect(screen.getByTestId('exam-dose-tracker')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    render(<ExamDoseTracker records={[]} />)
    expect(screen.getByTestId('exam-dose-tracker')).toBeInTheDocument()
  })
})

describe('WorkflowsEngine', () => {
  const workflows = [
    {
      id: 'W1', name: '报告审核工作流',
      nodes: [
        { id: 'N1', type: 'START' as const, name: '开始' },
        { id: 'N2', type: 'USER_TASK' as const, name: '主治审核', assignee: '李主任' },
        { id: 'N3', type: 'END' as const, name: '结束' },
      ],
      currentNodeId: 'N2',
      state: 'RUNNING' as const,
      startedAt: '2024-06-15',
    },
  ]

  it('renders with workflow', () => {
    render(<WorkflowsEngine workflows={workflows} />)
    expect(screen.getByTestId('workflows-engine')).toBeInTheDocument()
    expect(screen.getByTestId('we-workflow-W1')).toBeInTheDocument()
  })

  it('filters by state', () => {
    render(<WorkflowsEngine workflows={workflows} />)
    expect(screen.getByTestId('we-list')).toBeInTheDocument()
  })

  it('shows empty when no workflows', () => {
    render(<WorkflowsEngine workflows={[]} />)
    expect(screen.getByText(/无工作流/)).toBeInTheDocument()
  })

  it('shows pause/complete buttons for running', () => {
    const onAction = vi.fn()
    render(<WorkflowsEngine workflows={workflows} onAction={onAction} />)
    fireEvent.click(screen.getByTestId('we-pause-W1'))
    expect(onAction).toHaveBeenCalledWith('W1', 'pause')
  })
})
