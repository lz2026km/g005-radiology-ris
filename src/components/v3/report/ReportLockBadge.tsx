/**
 * G005 放射RIS系统 v3.0.1 - 报告电子签名锁定徽章
 * 对标飞利浦 / GE / 卫宁 — 显示签名状态 + 签名人 + 时间
 */
import React from 'react'
import { Tag, Tooltip, Space } from 'antd'
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react'

export interface ReportLockBadgeProps {
  signed: boolean
  signedBy?: string
  signedAt?: string
  certId?: string
  expiresAt?: string
  size?: 'small' | 'default'
}

export const ReportLockBadge: React.FC<ReportLockBadgeProps> = ({
  signed,
  signedBy,
  signedAt,
  certId,
  expiresAt,
  size = 'default',
}) => {
  if (!signed) {
    return (
      <Tag
        icon={<ShieldAlert size={size === 'small' ? 10 : 12} />}
        color="default"
        data-testid="lock-badge-pending"
        style={{ fontSize: size === 'small' ? 10 : 12 }}
      >
        未签名
      </Tag>
    )
  }

  return (
    <Tooltip
      title={
        <div style={{ fontSize: 12 }}>
          <div>签发人:{signedBy ?? '-'}</div>
          <div>签发时间:{signedAt ?? '-'}</div>
          {certId && <div>证书 ID:{certId}</div>}
          {expiresAt && <div>证书到期:{expiresAt}</div>}
        </div>
      }
    >
      <Tag
        icon={<ShieldCheck size={size === 'small' ? 10 : 12} />}
        color="success"
        data-testid="lock-badge-signed"
        style={{ fontSize: size === 'small' ? 10 : 12, fontWeight: 600 }}
      >
        <Space size={4}>
          <span>已电子签名</span>
          {signedAt && (
            <span style={{ opacity: 0.75 }}>
              <Clock size={size === 'small' ? 8 : 10} style={{ verticalAlign: 'middle' }} />
              {signedAt}
            </span>
          )}
        </Space>
      </Tag>
    </Tooltip>
  )
}

export default ReportLockBadge
