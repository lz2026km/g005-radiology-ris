import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PwaInstallPrompt } from '../../components/v3/mobile/PwaInstallPrompt'
import { MobileWorklist } from '../../components/v3/mobile/MobileWorklist'
import { MobileCriticalResponse } from '../../components/v3/mobile/MobileCriticalResponse'
import { getPushService } from '../../services/pwa/pushService'

// matchMedia is already stubbed in setup.ts

describe('PwaInstallPrompt', () => {
  it('renders install prompt when beforeinstallprompt fires', async () => {
    render(<PwaInstallPrompt />)
    expect(screen.queryByTestId('pwa-install-prompt')).not.toBeInTheDocument()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument()
    })
  })

  it('dismisses prompt on close', async () => {
    render(<PwaInstallPrompt />)
    window.dispatchEvent(new Event('beforeinstallprompt'))
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('pwa-install-dismiss'))
    await waitFor(() => {
      expect(screen.queryByTestId('pwa-install-prompt')).not.toBeInTheDocument()
    })
  })
})

describe('MobileWorklist offline', () => {
  it('shows offline badge when offline prop is true', () => {
    render(<MobileWorklist items={[]} offline />)
    expect(screen.getByTestId('mob-offline-badge')).toBeInTheDocument()
  })

  it('renders with items', () => {
    const items = [
      { id: '1', patientName: '张三', patientId: 'P001', modality: 'CT', bodyPart: '胸部', studyDate: '2026-06-11', studyTime: '09:00', state: 'PENDING' as const, priority: 'URGENT' as const },
    ]
    render(<MobileWorklist items={items} />)
    expect(screen.getByTestId('mobile-worklist')).toBeInTheDocument()
    expect(screen.getByTestId('mob-item-1')).toBeInTheDocument()
  })
})

describe('MobileCriticalResponse offline', () => {
  it('shows offline badge when offline prop is true', () => {
    render(<MobileCriticalResponse items={[]} currentUser="doctor1" offline />)
    expect(screen.getByTestId('mob-cv-offline-badge')).toBeInTheDocument()
  })

  it('renders with critical items', () => {
    const items = [{
      id: 'cv1', patientName: '李四', patientId: 'P002', age: 45, gender: 'M' as const,
      modality: 'CT', bodyPart: '头部', finding: '急性脑出血', category: 'LIFE_THREATENING' as const,
      triggeredAt: '2026-06-11 09:00', triggeredBy: 'doctor1', state: 'PENDING' as const,
      recipientName: '王医生', recipientDept: '神经外科',
    }]
    render(<MobileCriticalResponse items={items} currentUser="doctor1" />)
    expect(screen.getByTestId('mobile-critical-response')).toBeInTheDocument()
    expect(screen.getByTestId('mob-cv-cv1')).toBeInTheDocument()
  })
})

describe('pushService', () => {
  it('returns mock push service', () => {
    const svc = getPushService()
    expect(svc.supported).toBeDefined()
  })
})
