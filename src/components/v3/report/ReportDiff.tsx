/**
 * G005 放射RIS系统 v3.0.1 - 报告红绿 diff 痕迹对比
 * 对标飞利浦 / 卫宁 — 双栏差异可视化
 */
import React, { useMemo } from 'react'
import { Empty, Tag, Space, Switch } from 'antd'
import { GitCompare, Plus, Minus, Equal } from 'lucide-react'

export type DiffOp = 'add' | 'remove' | 'equal'

export interface DiffSegment {
  op: DiffOp
  text: string
}

export interface ReportDiffProps {
  oldText: string
  newText: string
  showEqual?: boolean
}

const tokenize = (text: string): string[] => {
  return text.split(/(\s+|[，。、；:!?\n])/g).filter((t) => t.length > 0)
}

const diffToken = (oldTokens: string[], newTokens: string[]): DiffSegment[] => {
  const m = oldTokens.length
  const n = newTokens.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldTokens[i] === newTokens[j]) {
        dp[i]![j] = (dp[i + 1]?.[j + 1] ?? 0) + 1
      } else {
        dp[i]![j] = Math.max(dp[i + 1]?.[j] ?? 0, dp[i]?.[j + 1] ?? 0)
      }
    }
  }
  const result: DiffSegment[] = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (oldTokens[i] === newTokens[j]) {
      result.push({ op: 'equal', text: oldTokens[i]! })
      i++
      j++
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      result.push({ op: 'remove', text: oldTokens[i]! })
      i++
    } else {
      result.push({ op: 'add', text: newTokens[j]! })
      j++
    }
  }
  while (i < m) {
    result.push({ op: 'remove', text: oldTokens[i]! })
    i++
  }
  while (j < n) {
    result.push({ op: 'add', text: newTokens[j]! })
    j++
  }
  return result
}

const colorForOp: Record<DiffOp, string> = {
  add: '#dcfce7',
  remove: '#fee2e2',
  equal: 'transparent',
}

const textColorForOp: Record<DiffOp, string> = {
  add: '#15803d',
  remove: '#b91c1c',
  equal: '#64748b',
}

export const ReportDiff: React.FC<ReportDiffProps> = ({ oldText, newText, showEqual = true }) => {
  const [showEq, setShowEq] = React.useState(showEqual)

  const segments = useMemo(() => {
    return diffToken(tokenize(oldText), tokenize(newText))
  }, [oldText, newText])

  const stats = useMemo(() => {
    let add = 0
    let remove = 0
    let equal = 0
    for (const s of segments) {
      if (s.op === 'add') add++
      else if (s.op === 'remove') remove++
      else equal++
    }
    return { add, remove, equal }
  }, [segments])

  const visible = useMemo(
    () => (showEq ? segments : segments.filter((s) => s.op !== 'equal')),
    [segments, showEq]
  )

  if (!oldText && !newText) {
    return <Empty description="无内容可对比" />
  }

  return (
    <div data-testid="report-diff">
      <Space style={{ marginBottom: 8 }}>
        <Tag color="green" icon={<Plus size={10} />}>
          新增 {stats.add}
        </Tag>
        <Tag color="red" icon={<Minus size={10} />}>
          删除 {stats.remove}
        </Tag>
        <Tag color="default" icon={<Equal size={10} />}>
          相同 {stats.equal}
        </Tag>
        <Switch
          size="small"
          checked={showEq}
          onChange={setShowEq}
          checkedChildren="显示相同"
          unCheckedChildren="仅差异"
        />
      </Space>
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: 12,
          fontSize: 13,
          lineHeight: 1.8,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {visible.map((s, i) => (
          <span
            key={i}
            data-testid={`diff-${s.op}`}
            style={{
              background: colorForOp[s.op],
              color: textColorForOp[s.op],
              padding: s.op === 'equal' ? 0 : '0 2px',
              borderRadius: 2,
            }}
          >
            {s.text}
          </span>
        ))}
        {visible.length === 0 && (
          <span style={{ color: '#94a3b8' }}>
            <GitCompare size={12} /> 无差异
          </span>
        )}
      </div>
    </div>
  )
}

export default ReportDiff
