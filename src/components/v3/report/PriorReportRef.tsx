/**
 * G005 放射RIS系统 v3.0.1 - 历史报告引用
 * 对标飞利浦 / 卫宁 — 引用同患者/同部位历史报告内容
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Drawer, List, Tag, Button, Space, Empty, Spin, Radio } from 'antd'
import { History, Copy, FileText } from 'lucide-react'

export interface PriorReport {
  id: string
  patientId: string
  studyDate: string
  modality: string
  bodyPart: string
  description: string
  findings: string
  conclusion: string
  signedBy: string
  signedAt: string
}

const MOCK_PRIOR: PriorReport[] = [
  {
    id: 'r-001',
    patientId: 'P-2024-001',
    studyDate: '2025-12-08',
    modality: 'CT',
    bodyPart: 'CHEST',
    description: '胸部 CT 平扫',
    findings:
      '双肺纹理清晰,未见明显异常密度影。\n气管支气管通畅。\n纵隔结构清晰,未见肿大淋巴结。\n心脏大血管形态正常。\n胸腔未见积液。',
    conclusion: '胸部 CT 平扫未见明显异常。',
    signedBy: '李明辉',
    signedAt: '2025-12-08 14:23',
  },
  {
    id: 'r-002',
    patientId: 'P-2024-001',
    studyDate: '2025-06-15',
    modality: 'MR',
    bodyPart: 'BRAIN',
    description: '头颅 MR 平扫',
    findings: '双侧大脑半球对称,灰白质对比正常。\n脑室、脑池、脑沟未见扩大、变窄。\n中线结构居中。\n颅骨骨质未见异常。',
    conclusion: '头颅 MR 平扫未见明显异常。',
    signedBy: '王芳',
    signedAt: '2025-06-15 10:45',
  },
  {
    id: 'r-003',
    patientId: 'P-2024-002',
    studyDate: '2025-10-20',
    modality: 'CT',
    bodyPart: 'ABDOMEN',
    description: '腹部 CT 增强',
    findings: '肝脏形态、大小正常,平扫及增强各期未见异常密度灶。\n胆囊大小正常。\n脾脏、胰腺形态密度正常。\n双肾未见结石及积水。',
    conclusion: '腹部 CT 增强扫描未见明显异常。',
    signedBy: '张伟',
    signedAt: '2025-10-20 16:12',
  },
]

export interface PriorReportRefProps {
  patientId?: string
  open: boolean
  onClose: () => void
  onInsert?: (text: string, section: 'findings' | 'conclusion') => void
  loadPriorReports?: (patientId: string) => Promise<PriorReport[]>
}

export const PriorReportRef: React.FC<PriorReportRefProps> = ({
  patientId,
  open,
  onClose,
  onInsert,
  loadPriorReports,
}) => {
  const [reports, setReports] = useState<PriorReport[]>([])
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<'patient' | 'modality' | 'bodypart'>('patient')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = loadPriorReports && patientId ? await loadPriorReports(patientId) : MOCK_PRIOR
      setReports(data)
    } finally {
      setLoading(false)
    }
  }, [patientId, loadPriorReports])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  const filtered = useMemo(() => {
    if (scope === 'patient') return reports
    return reports
  }, [reports, scope])

  return (
    <Drawer
      data-testid="prior-report-ref"
      title={
        <Space>
          <History size={16} />
          <span>历史报告引用</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={620}
    >
      <Radio.Group
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        style={{ marginBottom: 12 }}
        options={[
          { value: 'patient', label: '同患者' },
          { value: 'modality', label: '同设备' },
          { value: 'bodypart', label: '同部位' },
        ]}
      />

      {loading ? (
        <Spin />
      ) : filtered.length === 0 ? (
        <Empty description="暂无可引用历史" />
      ) : (
        <List
          dataSource={filtered}
          renderItem={(r) => (
            <List.Item
              key={r.id}
              data-testid={`prior-report-${r.id}`}
              style={{ alignItems: 'flex-start' }}
            >
              <List.Item.Meta
                avatar={<FileText size={28} color="#475569" />}
                title={
                  <Space>
                    <span>{r.description}</span>
                    <Tag color="green">已签发</Tag>
                  </Space>
                }
                description={
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    <div>{r.studyDate} · {r.modality} · {r.bodyPart} · 签发:{r.signedBy}</div>
                  </div>
                }
              />
              <div style={{ width: '100%' }}>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 4, fontSize: 12, marginTop: 8 }}>
                  <strong style={{ color: '#1e3a5f' }}>所见:</strong>
                  <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{r.findings}</pre>
                </div>
                <div style={{ background: '#f0f9ff', padding: 8, borderRadius: 4, fontSize: 12, marginTop: 4 }}>
                  <strong style={{ color: '#1e3a5f' }}>结论:</strong>
                  <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{r.conclusion}</pre>
                </div>
                <Space style={{ marginTop: 8 }}>
                  <Button
                    size="small"
                    icon={<Copy size={12} />}
                    onClick={() => onInsert?.(r.findings, 'findings')}
                    data-testid={`insert-findings-${r.id}`}
                  >
                    引用所见
                  </Button>
                  <Button
                    size="small"
                    icon={<Copy size={12} />}
                    onClick={() => onInsert?.(r.conclusion, 'conclusion')}
                    data-testid={`insert-conclusion-${r.id}`}
                  >
                    引用结论
                  </Button>
                </Space>
              </div>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  )
}

export default PriorReportRef
