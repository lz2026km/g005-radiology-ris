import AppLayout from '@/layouts/AppLayout'
import { SIDEBAR_ITEMS } from '@/routes/sidebarConfig'
import ComplianceDashboard from '@/components/v3/compliance/ComplianceDashboard'

const user = { name: '演示用户', role: '主任' as const }

export default function ComplianceV3Page(): JSX.Element {
  return (
    <>
      <div style={{ padding: 24 }}>
        <ComplianceDashboard />
      </div>
    </>
  )
}
