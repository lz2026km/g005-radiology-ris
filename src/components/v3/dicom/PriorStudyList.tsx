/**
 * G005 放射RIS系统 v3.0.1 - 同患者历史检查列表
 * 对标飞利浦 IntelliSpace — 同患者历史影像对比
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Drawer, List, Tag, Button, Space, Empty, Spin, Tooltip } from 'antd'
import { Clock, Image as ImageIcon, Eye, X } from 'lucide-react'

export interface PriorStudy {
  id: string
  studyDate: string
  modality: string
  bodyPart: string
  description: string
  device: string
  seriesCount: number
  instanceCount: number
  reportSigned: boolean
}

export interface PriorStudyListProps {
  patientId?: string
  open: boolean
  onClose: () => void
  onSelect?: (study: PriorStudy) => void
  loadPriorStudies?: (patientId: string) => Promise<PriorStudy[]>
}

const MOCK_PRIOR_STUDIES: PriorStudy[] = [
  {
    id: 'p001',
    studyDate: '2026-04-12',
    modality: 'CT',
    bodyPart: 'CHEST',
    description: '胸部 CT 平扫',
    device: 'Siemens SOMATOM Definition',
    seriesCount: 4,
    instanceCount: 320,
    reportSigned: true,
  },
  {
    id: 'p002',
    studyDate: '2025-11-08',
    modality: 'MR',
    bodyPart: 'BRAIN',
    description: '头颅 MR 平扫',
    device: 'GE Signa HDxt 3.0T',
    seriesCount: 6,
    instanceCount: 480,
    reportSigned: true,
  },
  {
    id: 'p003',
    studyDate: '2025-06-15',
    modality: 'DR',
    bodyPart: 'CHEST',
    description: '胸部正侧位',
    device: 'Philips DigitalDiagnost',
    seriesCount: 2,
    instanceCount: 2,
    reportSigned: true,
  },
]

export const PriorStudyList: React.FC<PriorStudyListProps> = ({
  patientId,
  open,
  onClose,
  onSelect,
  loadPriorStudies,
}) => {
  const [studies, setStudies] = useState<PriorStudy[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!patientId) {
      setStudies(MOCK_PRIOR_STUDIES)
      return
    }
    setLoading(true)
    try {
      const data = loadPriorStudies ? await loadPriorStudies(patientId) : MOCK_PRIOR_STUDIES
      setStudies(data)
    } finally {
      setLoading(false)
    }
  }, [patientId, loadPriorStudies])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  return (
    <Drawer
      data-testid="prior-study-list"
      title={
        <Space>
          <Clock size={16} />
          <span>同患者历史检查</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={420}
      extra={
        <Button type="text" size="small" icon={<X size={14} />} onClick={onClose} />
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin />
        </div>
      ) : studies.length === 0 ? (
        <Empty description="暂无历史检查" />
      ) : (
        <List
          dataSource={studies}
          renderItem={(s) => (
            <List.Item
              data-testid={`prior-study-${s.id}`}
              actions={[
                <Tooltip key="view" title="查看">
                  <Button
                    type="link"
                    size="small"
                    icon={<Eye size={14} />}
                    onClick={() => onSelect?.(s)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={<ImageIcon size={28} color="#475569" />}
                title={
                  <Space>
                    <span>{s.description}</span>
                    {s.reportSigned && <Tag color="green" style={{ fontSize: 10 }}>已签发</Tag>}
                  </Space>
                }
                description={
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    <div>{s.studyDate} · {s.modality} · {s.bodyPart}</div>
                    <div>{s.device}</div>
                    <div>{s.seriesCount} 序列 / {s.instanceCount} 帧</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  )
}

export default PriorStudyList
