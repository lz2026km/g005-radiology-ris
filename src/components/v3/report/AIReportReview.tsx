/**
 * G005 放射RIS系统 v3.0.2 - 报告 AI 二次复审
 * 对标:飞利浦 IntelliSpace / GE Centricity — 报告完成后 AI 复审
 *
 * 功能:
 *  - 检测遗漏:与 RADS 必填字段对比
 *  - 检测冲突:所见与结论不一致
 *  - 检测黑名单:禁用词扫描
 *  - 检测格式:ICD-10 格式、必填段长度
 *  - 给改进建议
 */
import React, { useState, useMemo, useCallback } from 'react'
import { Card, Tag, Space, Button, List, Alert, Spin, Tooltip } from 'antd'
import { Sparkles, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Lightbulb, FileCheck } from 'lucide-react'
import type { FieldSchema } from './StructuredFieldEditor'

export interface ReviewIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  category: 'omission' | 'conflict' | 'format' | 'blacklist' | 'length' | 'terminology'
  field: string
  message: string
  suggestion?: string
}

export interface AIReportReviewProps {
  findings: string
  conclusion: string
  suggestion?: string
  structured?: Record<string, unknown>
  /** 已配置的 RADS schema(用于必填校验) */
  radsSchema?: { fields: FieldSchema[] }
  /** 黑名单 */
  blacklist?: string[]
  /** 最小所见长度 */
  minFindingsLength?: number
  /** 最小结论长度 */
  minConclusionLength?: number
  /** 自动检测开关 */
  autoReview?: boolean
  onApply?: (issue: ReviewIssue) => void
}

const DEFAULT_BLACKLIST = ['待补充', 'TODO', 'xxx', '...', '?']
const SEVERITY_META = {
  error: { color: 'red', icon: <AlertCircle size={14} />, label: '错误' },
  warning: { color: 'orange', icon: <AlertTriangle size={14} />, label: '警告' },
  info: { color: 'blue', icon: <Lightbulb size={14} />, label: '建议' },
} as const

export const AIReportReview: React.FC<AIReportReviewProps> = ({
  findings,
  conclusion,
  suggestion = '',
  structured = {},
  radsSchema,
  blacklist = DEFAULT_BLACKLIST,
  minFindingsLength = 20,
  minConclusionLength = 10,
  autoReview = true,
  onApply,
}) => {
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState<ReviewIssue[]>([])

  const review = useCallback(async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600)) // 模拟 API 调用
    const result: ReviewIssue[] = []

    // 1. 长度检测
    if (findings.length < minFindingsLength) {
      result.push({
        id: 'len-findings',
        severity: 'warning',
        category: 'length',
        field: 'findings',
        message: `所见描述过短(${findings.length} 字符,建议 ≥ ${minFindingsLength})`,
        suggestion: '补充更详细的影像所见',
      })
    }
    if (conclusion.length < minConclusionLength) {
      result.push({
        id: 'len-conclusion',
        severity: 'warning',
        category: 'length',
        field: 'conclusion',
        message: `结论过短(${conclusion.length} 字符,建议 ≥ ${minConclusionLength})`,
        suggestion: '明确给出诊断意见或阴性发现',
      })
    }
    if (suggestion && suggestion.length > 0 && suggestion.length < 5) {
      result.push({
        id: 'len-suggestion',
        severity: 'info',
        category: 'length',
        field: 'suggestion',
        message: '建议可补充更具体',
      })
    }

    // 2. 黑名单检测
    for (const word of blacklist) {
      if (findings.includes(word)) {
        result.push({
          id: `blk-findings-${word}`,
          severity: 'error',
          category: 'blacklist',
          field: 'findings',
          message: `所见包含禁用词:"${word}"`,
          suggestion: '删除或替换为具体描述',
        })
      }
      if (conclusion.includes(word)) {
        result.push({
          id: `blk-conclusion-${word}`,
          severity: 'error',
          category: 'blacklist',
          field: 'conclusion',
          message: `结论包含禁用词:"${word}"`,
        })
      }
    }

    // 3. RADS 必填字段检测
    if (radsSchema) {
      for (const f of radsSchema.fields) {
        if (f.required) {
          const v = structured[f.key]
          if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
            result.push({
              id: `rads-${f.key}`,
              severity: 'error',
              category: 'omission',
              field: f.key,
              message: `RADS 必填字段缺失:${f.label}`,
              suggestion: '在结构化字段中补充该项',
            })
          }
        }
      }
    }

    // 4. 所见-结论一致性检查
    const isNegative = (text: string) => /未见|未发现|无明显|阴性|正常|清晰|对称/.test(text)
    const isPositive = (text: string) => /占位|肿块|结节|异常|增厚|狭窄|出血|梗死|占位|占位/.test(text)
    if (findings && conclusion) {
      if (isNegative(findings) && !isNegative(conclusion) && isPositive(conclusion)) {
        result.push({
          id: 'conflict-negpos',
          severity: 'error',
          category: 'conflict',
          field: 'conclusion',
          message: '所见描述为阴性但结论为阳性 — 可能存在矛盾',
          suggestion: '检查所见与结论是否一致',
        })
      }
      if (isPositive(findings) && isNegative(conclusion)) {
        result.push({
          id: 'conflict-posneg',
          severity: 'warning',
          category: 'conflict',
          field: 'conclusion',
          message: '所见描述发现阳性征象但结论为阴性 — 请确认',
        })
      }
    }

    // 5. ICD-10 格式(若提供)
    const icd10 = structured['icd10'] as string | undefined
    if (icd10 && !/^[A-Z]\d{2}(\.\d{1,3})?$/.test(icd10)) {
      result.push({
        id: 'icd10-format',
        severity: 'error',
        category: 'format',
        field: 'icd10',
        message: `ICD-10 编码格式不正确:"${icd10}"(应为字母+数字如 J18.901)`,
      })
    }

    // 6. 通用建议
    if (!findings.includes('建议') && !conclusion.includes('建议') && !suggestion) {
      result.push({
        id: 'info-no-suggestion',
        severity: 'info',
        category: 'omission',
        field: 'suggestion',
        message: '建议添加随访/治疗建议',
        suggestion: '如:建议 3-6 个月后复查',
      })
    }

    setIssues(result)
    setLoading(false)
  }, [findings, conclusion, suggestion, structured, radsSchema, blacklist, minFindingsLength, minConclusionLength])

  React.useEffect(() => {
    if (autoReview) {
      void review()
    }
  }, [autoReview, review])

  const stats = useMemo(() => {
    return {
      error: issues.filter((i) => i.severity === 'error').length,
      warning: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    }
  }, [issues])

  return (
    <Card
      data-testid="ai-report-review"
      size="small"
      title={
        <Space>
          <Sparkles size={16} color="#722ed1" />
          <span>AI 报告复审</span>
          {stats.error === 0 && stats.warning === 0 && issues.length > 0 ? (
            <Tag icon={<CheckCircle size={10} />} color="green">
              通过
            </Tag>
          ) : issues.length > 0 ? (
            <Space size={4}>
              {stats.error > 0 && <Tag color="red">{stats.error} 错</Tag>}
              {stats.warning > 0 && <Tag color="orange">{stats.warning} 警</Tag>}
              {stats.info > 0 && <Tag color="blue">{stats.info} 议</Tag>}
            </Space>
          ) : null}
        </Space>
      }
      extra={
        <Button
          size="small"
          icon={<RefreshCw size={12} />}
          onClick={() => void review()}
          loading={loading}
          data-testid="ai-review-refresh"
        >
          重新复审
        </Button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <Spin tip="AI 正在分析报告..." />
        </div>
      ) : issues.length === 0 ? (
        <Alert
          type="success"
          showIcon
          icon={<FileCheck size={16} />}
          message="未发现明显问题"
          description="报告结构完整,所见与结论一致"
        />
      ) : (
        <List
          size="small"
          dataSource={issues}
          renderItem={(issue) => {
            const meta = SEVERITY_META[issue.severity]
            return (
              <List.Item
                key={issue.id}
                data-testid={`ai-issue-${issue.id}`}
                actions={
                  issue.suggestion && onApply ? [
                    <Tooltip key="apply" title="应用建议">
                      <Button
                        size="small"
                        type="link"
                        onClick={() => onApply(issue)}
                        data-testid={`ai-apply-${issue.id}`}
                      >
                        应用
                      </Button>
                    </Tooltip>,
                  ] : undefined
                }
              >
                <List.Item.Meta
                  avatar={<Tag color={meta.color} icon={meta.icon}>{meta.label}</Tag>}
                  title={
                    <Space>
                      <Tag>{issue.field}</Tag>
                      <span style={{ fontSize: 13 }}>{issue.message}</span>
                    </Space>
                  }
                  description={issue.suggestion}
                />
              </List.Item>
            )
          }}
        />
      )}
    </Card>
  )
}

export default AIReportReview
