import React from 'react'
import { Typography } from 'antd'
import { Shield } from 'lucide-react'
import MfaSetup from '../../components/security/MfaSetup'

const { Title } = Typography

export default function MfaSetupPage() {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}><Shield style={{ marginRight: 8 }} />MFA 多因素认证设置</Title>
      <MfaSetup userId="current-user" userName="当前用户" onComplete={() => {}} />
    </div>
  )
}
