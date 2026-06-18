/**
 * G005 放射RIS系统 v3.0.6.1 - 剂量趋势图 (Recharts)
 */
import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts'
import type { DoseRecord } from './DoseTracker'

export interface DoseChartProps {
  records: DoseRecord[]
  period: 'day' | 'week' | 'month' | 'year'
}

export const DoseChart: React.FC<DoseChartProps> = ({ records }) => {
  const data = useMemo(() => {
    const map = new Map<string, { date: string; dose: number; count: number }>()
    records.forEach((r) => {
      const d = r.examAt.slice(0, 10)
      const e = map.get(d) ?? { date: d, dose: 0, count: 0 }
      e.dose = Math.round((e.dose + r.effectiveDose_mSv) * 100) / 100
      e.count += 1
      map.set(d, e)
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [records])

  return (
    <div data-testid="dose-chart" style={{ height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="dose" name="有效剂量 (mSv)" stroke="#dc2626" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="count" name="检查数" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DoseChart