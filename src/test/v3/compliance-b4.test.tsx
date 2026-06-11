import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ComplianceDashboard from '@/components/v3/compliance/ComplianceDashboard'

describe('B4 Compliance Dashboard', () => {
  it('renders without crashing', () => {
    const { container } = render(<ComplianceDashboard />)
    expect(container.querySelector('.ant-spin')).toBeTruthy()
  })
})
