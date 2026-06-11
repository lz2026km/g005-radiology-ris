import React, { useCallback, useState } from 'react'
import { Card, Space, Tag, Button, Alert, Spin, List, Tooltip } from 'antd'
import { Sparkles, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Lightbulb, FileCheck } from 'lucide-react'
import { createReviewEngine, createScoringEngine } from '../../../services/ai'
import type { ReviewIssue as AiReviewIssue, QualityScoringOutput } from '../../../services/ai'
import { useTranslation } from 'react-i18next'

export interface AiReviewIntegratedProps {
  reportText: string
  findings: string
  conclusion: string
  suggestion?: string
  radsCategory?: string
  hasCritical?: boolean
  onApplySuggestion?: (issue: AiReviewIssue) => void
}

const SEVERITY_META = {
  error: { color: 'red', icon: <AlertCircle size={14} />, label: '错误' },
  warning: { color: 'orange', icon: <AlertTriangle size={14} />, label: '警告' },
  info: { color: 'blue', icon: <Lightbulb size={14} />, label: '建议' },
} as const

export const AiReviewIntegrated: React.FC<AiReviewIntegratedProps> = ({
  reportText,
  findings,
  conclusion,
  radsCategory,
  hasCritical,
  onApplySuggestion,
}) => {
  const { t } = useTranslation('v3ai')
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState<AiReviewIssue[]>([])
  const [quality, setQuality] = useState<QualityScoringOutput | null>(null)

  const runReview = useCallback(async () => {
    setLoading(true)
    try {
      const reviewEngine = createReviewEngine()
      const scoringEngine = createScoringEngine()
      const [reviewResult, scoreResult] = await Promise.all([
        reviewEngine.review({ reportText, findings, conclusion }),
        scoringEngine.score({ reportText, findings, conclusion, radsCategory, hasCritical }),
      ])
      setIssues(reviewResult.issues)
      setQuality(scoreResult)
    } finally {
      setLoading(false)
    }
  }, [reportText, findings, conclusion, radsCategory, hasCritical])

  return (
    <Card
      data-testid="ai-review-integrated"
      size="small"
      title={
        <Space>
          <Sparkles size={16} color="#722ed1" />
          <span>{t('review')}</span>
          {quality && (
            <Tag color={quality.totalScore >= 80 ? 'green' : quality.totalScore >= 60 ? 'orange' : 'red'}>
              {quality.totalScore}分
            </Tag>
          )}
        </Space>
      }
      extra={
        <Button size="small" icon={<RefreshCw size={12} />} onClick={() => void runReview()} loading={loading}>
          {t('reviewReport')}
        </Button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <Spin tip={t('streaming')} />
        </div>
      ) : issues.length === 0 && quality === null ? (
        <Button type="primary" size="small" onClick={() => void runReview()} data-testid="ai-review-start">
          {t('reviewReport')}
        </Button>
      ) : issues.length === 0 ? (
        <Alert type="success" showIcon icon={<FileCheck size={16} />} message="未发现明显问题" />
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
                  issue.suggestion && onApplySuggestion
                    ? [
                        <Tooltip key="apply" title="应用建议">
                          <Button size="small" type="link" onClick={() => onApplySuggestion(issue)}>
                            应用
                          </Button>
                        </Tooltip>,
                      ]
                    : undefined
                }
              >
                <List.Item.Meta
                  avatar={
                    <Tag color={meta.color} icon={meta.icon}>
                      {meta.label}
                    </Tag>
                  }
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
