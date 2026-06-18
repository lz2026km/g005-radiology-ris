/**
 * G005 放射RIS系统 v3.0.5.1 - AI 草稿 Panel(mock)
 * R3.WRITING 组 C:智能辅助(部分)
 * 30 升级点:AI 草稿生成 / 多模态输入 / 风格 / 历史参考 / 续写 / 合并 / 警告
 */
import React, { useState, useCallback } from 'react';
import { Card, Space, Button, Tag, Statistic, Divider, Alert, Switch, Select, Tooltip, message, Progress, Row, Col, Spin } from 'antd';
import {
  Sparkles, RefreshCw, Wand2, FileText, AlertCircle, History, BookOpen, Brain,
  Loader2, CheckCircle2, ChevronRight, Copy, Edit3, Image as ImageIcon, Star,
  Zap, Activity, Eye, Cpu,
} from 'lucide-react';
import { AI_DRAFT_REQUEST, AI_DRAFT_RESULT, SIMILAR_CASES_MOCK, PRIOR_REPORTS_MOCK } from '@data/reportWritingMock';
import { generateAiDraft, getAiDraftStatus } from '@services/writing/writingService';
import type { AiDraftRequest, AiDraftResult, AiDraftStage } from '@types/R3/R3.WRITING';

interface Props {
  reportId: string;
  clinicalInfo: string;
  modality: string;
  bodyPart: string;
  onAccept?: (result: AiDraftResult) => void;
  onRefine?: (result: AiDraftResult, feedback: string) => void;
  disabled?: boolean;
}

const STYLE_OPTIONS = [
  { value: 'concise', label: '简洁', icon: Zap, color: '#3b82f6' },
  { value: 'detailed', label: '详尽', icon: FileText, color: '#7c3aed' },
  { value: 'structured', label: '结构化', icon: ListOrdered, color: '#10b981' },
];

export const AIDraftPanel: React.FC<Props> = ({
  reportId, clinicalInfo, modality, bodyPart, onAccept, onRefine, disabled = false,
}) => {
  const [stage, setStage] = useState<AiDraftStage>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AiDraftResult | null>(null);
  const [includeImages, setIncludeImages] = useState(true);
  const [includePrior, setIncludePrior] = useState(true);
  const [style, setStyle] = useState<'concise' | 'detailed' | 'structured'>('structured');
  const [showRefine, setShowRefine] = useState(false);
  const [refineText, setRefineText] = useState('');

  const handleGenerate = useCallback(async () => {
    if (disabled || !clinicalInfo.trim()) {
      message.warning('请先填写临床信息');
      return;
    }
    setStage('analyzing');
    setProgress(20);
    await new Promise((r) => setTimeout(r, 500));
    setStage('drafting');
    setProgress(60);
    const req: AiDraftRequest = {
      reportId, modality, bodyPart, clinicalInfo,
      templates: includePrior ? ['tpl-chest-ct-v2'] : [],
      includeImages, style, language: 'zh-CN',
    };
    try {
      const dr = await generateAiDraft(req);
      setProgress(100);
      setStage('ready');
      setResult(dr);
      message.success('AI 草稿已生成');
    } catch {
      setStage('error');
      message.error('AI 草稿生成失败');
    }
  }, [reportId, clinicalInfo, modality, bodyPart, includeImages, includePrior, style, disabled]);

  const handleAccept = useCallback(() => {
    if (!result) return;
    onAccept?.(result);
    message.success('已应用 AI 草稿到编辑器');
  }, [result, onAccept]);

  const handleRefine = useCallback(async () => {
    if (!result || !refineText.trim()) {
      message.warning('请输入修改意见');
      return;
    }
    setStage('analyzing');
    setProgress(40);
    await new Promise((r) => setTimeout(r, 800));
    setResult({ ...result, findings: result.findings + '\n\n[根据反馈调整] ' + refineText });
    setStage('ready');
    setProgress(100);
    setShowRefine(false);
    setRefineText('');
    message.success('已根据反馈重写');
  }, [result, refineText]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  }, []);

  const stageColor = ({ idle: '#94a3b8', analyzing: '#3b82f6', drafting: '#7c3aed', ready: '#10b981', merging: '#0891b2', error: '#dc2626' } as const)[stage];
  const stageLabel = ({ idle: '就绪', analyzing: '分析中', drafting: '撰写中', ready: '已完成', merging: '合并中', error: '失败' } as const)[stage];

  return (
    <Card
      size="small"
      className="shadow-sm border-purple-200"
      title={
        <div className="flex items-center justify-between">
          <Space>
            <Sparkles className="w-4 h-4" style={{ color: '#7c3aed' }} />
            <span className="font-semibold">AI 智能草稿</span>
            <Tag color="purple">MedAI v3.2.1</Tag>
            <Tag color={stage === 'ready' ? 'green' : stage === 'error' ? 'red' : 'blue'}>{stageLabel}</Tag>
          </Space>
          {result && (
            <Tag color="blue" icon={<Cpu className="w-3 h-3" />}>
              置信度 {(result.confidence * 100).toFixed(0)}%
            </Tag>
          )}
        </div>
      }
      extra={
        <Space>
          {!result && (
            <Button type="primary" icon={<Wand2 className="w-4 h-4" />} onClick={handleGenerate} disabled={disabled || stage === 'analyzing' || stage === 'drafting'} loading={stage === 'analyzing' || stage === 'drafting'}>
              生成草稿
            </Button>
          )}
          {result && (
            <Button icon={<RefreshCw className="w-4 h-4" />} onClick={handleGenerate} loading={stage !== 'idle'}>
              重新生成
            </Button>
          )}
        </Space>
      }
    >
      {!result && (
        <>
          <div className="space-y-3 p-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">风格</span>
              <Select
                size="small"
                value={style}
                onChange={setStyle}
                style={{ width: 130 }}
                options={STYLE_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">包含图像分析</span>
              <Switch size="small" checked={includeImages} onChange={setIncludeImages} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">引用历史报告</span>
              <Switch size="small" checked={includePrior} onChange={setIncludePrior} />
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
              <div>📋 <span className="font-medium">临床信息:</span> {clinicalInfo}</div>
              <div>🩻 <span className="font-medium">检查:</span> {modality} - {bodyPart}</div>
            </div>
          </div>

          {(stage === 'analyzing' || stage === 'drafting') && (
            <div className="pt-3 space-y-2">
              <Progress percent={progress} strokeColor={{ from: '#7c3aed', to: '#3b82f6' }} />
              <div className="text-xs text-slate-500 text-center">
                {stage === 'analyzing' ? '正在分析临床信息与影像...' : '正在撰写报告内容...'}
              </div>
            </div>
          )}

          {PRIOR_REPORTS_MOCK.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <h5 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <History className="w-3 h-3" />参考历史报告 ({PRIOR_REPORTS_MOCK.length})
              </h5>
              <div className="space-y-1">
                {PRIOR_REPORTS_MOCK.map((r) => (
                  <div key={r.id} className="text-xs p-1.5 bg-slate-50 rounded">
                    <Tag color="cyan">{r.reportId}</Tag>
                    {new Date(r.studyDate).toLocaleDateString()} · {r.impression}
                  </div>
                ))}
              </div>
            </div>
          )}

          {SIMILAR_CASES_MOCK.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <h5 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <Brain className="w-3 h-3" />相似病例 ({SIMILAR_CASES_MOCK.length})
              </h5>
              <div className="space-y-1">
                {SIMILAR_CASES_MOCK.map((c) => (
                  <div key={c.id} className="text-xs p-1.5 bg-slate-50 rounded flex items-center justify-between">
                    <span><Tag color="orange">{c.reportId}</Tag>{c.impression}</span>
                    <Tag color="purple">{(c.similarityScore * 100).toFixed(0)}%</Tag>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {result && (
        <div className="space-y-3">
          <Alert
            type="warning"
            showIcon
            icon={<AlertCircle className="w-4 h-4" />}
            message="AI 草稿仅供临床参考,最终诊断须由执业医师确认"
            description={result.warnings.join('; ')}
          />

          <Row gutter={8}>
            <Col span={8}><Statistic title="字数" value={result.findings.length + result.impression.length} prefix={<FileText className="w-3 h-3" />} /></Col>
            <Col span={8}><Statistic title="Token" value={result.tokens.input + result.tokens.output} prefix={<Cpu className="w-3 h-3" />} /></Col>
            <Col span={8}><Statistic title="费用" value={result.tokens.cost} prefix={<Activity className="w-3 h-3" />} precision={3} suffix="¥" /></Col>
          </Row>

          <Card size="small" title={<span className="text-sm font-semibold">影像所见</span>} extra={<Button size="small" type="text" icon={<Copy className="w-3 h-3" />} onClick={() => copyToClipboard(result.findings)}>复制</Button>}>
            <div className="text-sm whitespace-pre-wrap text-slate-700 max-h-48 overflow-y-auto">{result.findings}</div>
          </Card>

          <Card size="small" title={<span className="text-sm font-semibold">诊断意见</span>} extra={<Button size="small" type="text" icon={<Copy className="w-3 h-3" />} onClick={() => copyToClipboard(result.impression)}>复制</Button>}>
            <div className="text-sm whitespace-pre-wrap text-slate-700 max-h-32 overflow-y-auto">{result.impression}</div>
          </Card>

          <Card size="small" title={<span className="text-sm font-semibold">建议</span>}>
            <div className="text-sm text-slate-700">{result.recommendation}</div>
          </Card>

          {showRefine ? (
            <div className="space-y-2 p-2 bg-blue-50 rounded">
              <div className="text-xs font-semibold text-blue-700">🔧 修改意见(将基于此重写)</div>
              <textarea
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                placeholder="例:补充说明胸膜牵拉征;删除'不除外...'"
                className="w-full text-sm p-2 border border-blue-200 rounded"
                rows={3}
              />
              <Space>
                <Button size="small" type="primary" onClick={handleRefine}>应用</Button>
                <Button size="small" onClick={() => setShowRefine(false)}>取消</Button>
              </Space>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="primary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleAccept}>应用到编辑器</Button>
              <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => setShowRefine(true)}>反馈调整</Button>
              <Button icon={<Eye className="w-4 h-4" />}>对比原片</Button>
            </div>
          )}

          <div className="text-xs text-slate-400 text-center">
            基于 {result.basedOnReports.length} 份历史报告 · 模型 {result.modelVersion} · {new Date(result.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIDraftPanel;
