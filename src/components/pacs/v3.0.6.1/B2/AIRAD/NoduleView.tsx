/**
 * G005 放射RIS系统 v3.0.6.1 - 肺结节放大视图
 */
import React from 'react'
import { Tag, Descriptions } from 'antd'
import type { ChestFinding } from './DetectionList'

export interface NoduleViewProps {
  finding?: ChestFinding
  showOverlay?: boolean
}

export const NoduleView: React.FC<NoduleViewProps> = ({ finding, showOverlay = true }) => {
  if (!finding) return <div style={{ height: 200, background: '#0f172a', borderRadius: 4 }} />

  return (
    <div data-testid="nodule-view">
      <div
        style={{
          height: 240,
          background: '#0f172a',
          borderRadius: 4,
          position: 'relative',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #020617 70%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: Math.min(finding.size_mm * 4, 120),
            height: Math.min(finding.size_mm * 4, 120),
            borderRadius: finding.type === 'CALCIFICATION' ? '50%' : '40%',
            background: finding.type === 'MASS' ? 'rgba(220, 38, 38, 0.7)' : finding.type === 'CALCIFICATION' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(249, 115, 22, 0.6)',
            boxShadow: `0 0 20px ${finding.type === 'MASS' ? 'rgba(220, 38, 38, 0.8)' : 'rgba(249, 115, 22, 0.6)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {finding.size_mm} mm
        </div>
        {showOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '2px dashed #3b82f6',
              borderRadius: 4,
              pointerEvents: 'none',
            }}
          />
        )}
        <Tag color="blue" style={{ position: 'absolute', top: 8, left: 8 }}>{finding.location}</Tag>
        {finding.lungRads && <Tag color="purple" style={{ position: 'absolute', top: 8, right: 8 }}>Lung-RADS {finding.lungRads}</Tag>}
      </div>
      <Descriptions size="small" column={2} bordered style={{ marginTop: 8 }}>
        <Descriptions.Item label="类型">{finding.type}</Descriptions.Item>
        <Descriptions.Item label="位置">{finding.location}</Descriptions.Item>
        <Descriptions.Item label="大小">{finding.size_mm} mm</Descriptions.Item>
        <Descriptions.Item label="置信度">{(finding.confidence * 100).toFixed(0)}%</Descriptions.Item>
        <Descriptions.Item label="恶性概率" span={2}>{(finding.malignant * 100).toFixed(0)}%</Descriptions.Item>
        {finding.followUp && <Descriptions.Item label="随访建议" span={2}>{finding.followUp}</Descriptions.Item>}
      </Descriptions>
    </div>
  )
}

export default NoduleView