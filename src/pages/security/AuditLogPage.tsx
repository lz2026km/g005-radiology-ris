import React from 'react'
import { Typography } from 'antd'
import { Shield } from 'lucide-react'
import SecurityAuditPage from '../../components/security/SecurityAuditPage'

const { Title } = Typography

export default function AuditLogPage() {
  return (
    <div style={{ padding: 24 }}>
      <SecurityAuditPage />
    </div>
  )
}
