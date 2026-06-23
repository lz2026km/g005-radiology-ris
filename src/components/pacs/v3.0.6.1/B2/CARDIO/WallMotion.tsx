/**
 * G005 放射RIS系统 v3.0.6.1 - 室壁运动分析 (AHA 17 节段模型)
 */
import React from 'react'
import { Card, Tag, Space } from 'antd'
import type { CardiacAnalysisData } from './CardiacAnalysis'

export interface WallMotionProps {
  data: CardiacAnalysisData
}

const SEGMENTS = [
  { code: '1', label: '前壁基底', x: 50, y: 20 },
  { code: '2', label: '前壁中段', x: 50, y: 40 },
  { code: '3', label: '前壁心尖', x: 50, y: 60 },
  { code: '4', label: '室间隔基底', x: 35, y: 25 },
  { code: '5', label: '室间隔中段', x: 35, y: 45 },
  { code: '6', label: '室间隔心尖', x: 40, y: 60 },
  { code: '7', label: '下壁基底', x: 50, y: 80 },
  { code: '8', label: '下壁中段', x: 50, y: 65 },
  { code: '9', label: '下壁心尖', x: 60, y: 60 },
  { code: '10', label: '侧壁基底', x: 70, y: 25 },
  { code: '11', label: '侧壁中段', x: 70, y: 45 },
  { code: '12', label: '侧壁心尖', x: 65, y: 60 },
]

export const WallMotion: React.FC<WallMotionProps> = ({ data }) => {
  // 标记异常节段 (前 2 个为例)
  const abnormalIdx = new Set([1, 5])
  return (
    <div data-testid="wall-motion">
      <Card size="small" title="室壁运动牛眼图 (AHA 17 节段)">
        <div
          style={{
            position: 'relative',
            height: 280,
            width: 280,
            margin: '0 auto',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1e293b 30%, #0f172a 100%)',
            border: '2px solid #475569',
          }}
        >
          {SEGMENTS.map((s, i) => (
            <div
              key={s.code}
              style={{
                position: 'absolute',
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 32,
                height: 24,
                background: abnormalIdx.has(i) ? '#dc2626' : '#16a34a',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              data-testid={`wm-seg-${s.code}`}
            >
              {s.code}
            </div>
          ))}
        </div>
        <Space style={{ marginTop: 12 }}>
          <Tag color="green">运动正常 ({12 - data.wallMotionAbnormalities})</Tag>
          <Tag color="red">运动异常 ({data.wallMotionAbnormalities})</Tag>
        </Space>
      </Card>
    </div>
  )
}

export default WallMotion