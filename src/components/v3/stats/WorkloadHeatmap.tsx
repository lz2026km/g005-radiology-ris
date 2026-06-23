import { useTranslation } from 'react-i18next'
import { Card, Tooltip as AntTooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

export interface WorkloadCell {
  doctor: string
  day: string
  hour: string
  count: number
}

interface WorkloadHeatmapProps {
  data: WorkloadCell[]
  title?: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`)

function getColor(count: number): string {
  if (count === 0) return '#f0f0f0'
  if (count < 5) return '#cce5ff'
  if (count < 10) return '#99ccff'
  if (count < 20) return '#66b3ff'
  if (count < 35) return '#3399ff'
  return '#0066cc'
}

export default function WorkloadHeatmap({ data, title }: WorkloadHeatmapProps) {
  const { t } = useTranslation()
  const cellMap = new Map<string, number>()
  for (const c of data) {
    cellMap.set(`${c.doctor}|${c.day}|${c.hour}`, c.count)
  }

  const doctors = [...new Set(data.map((c) => c.doctor))]
  const maxCount = Math.max(...data.map((c) => c.count), 1)

  return (
    <Card title={title ?? t('v3statsV2.workloadHeatmap')}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: 4, textAlign: 'right', width: 70 }}>{t('v3statsV2.doctor')}</th>
              {HOURS.map((h) => (
                <th key={h} style={{ padding: '4px 2px', minWidth: 32, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor}>
                <td style={{ padding: '4px 8px', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 500 }}>{doctor}</td>
                {HOURS.map((hour) => {
                  const value = DAYS.reduce((sum, day) => {
                    return sum + (cellMap.get(`${doctor}|${day}|${hour}`) ?? 0)
                  }, 0)
                  return (
                    <td key={`${doctor}|${hour}`} style={{ padding: 1 }}>
                      <AntTooltip title={`${doctor} ${hour}: ${value} ${t('v3statsV2.reportCount')}`}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            backgroundColor: getColor(value),
                            borderRadius: 3,
                            cursor: 'pointer',
                            border: value > 0 ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
                          }}
                        />
                      </AntTooltip>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}>
        <InfoCircleOutlined />
        <span>{t('v3statsV2.hour')}</span>
        <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
          {[0, 5, 10, 20, 35, 50].map((v) => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 12, height: 12, backgroundColor: getColor(v), borderRadius: 2 }} />
              <span>≤{v}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
