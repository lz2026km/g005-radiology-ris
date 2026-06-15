// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 v1.0.1 - 报告书写 v2.0
// Phase R1：富文本 + 结构化字段 + 测量 + 术语联想 + 关键字纠错
// 三栏布局：左（影像/历史）/ 中（富文本+结构化字段 Tab）/ 右（模板/术语/AI 辅助）
// 快捷键：Ctrl+B/I/U（格式） / Ctrl+S（保存） / Ctrl+Enter（提交） / Ctrl+M（测量）
// 自动保存：30s
// ============================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Save, Send, FileText, ChevronLeft, History, Sparkles, BookOpen, Wand2,
  Clock, User, Image as ImageIcon, Tag, X, Mic, AlertOctagon, Settings,
  ListChecks, LayoutGrid, Eye, Download, Maximize2, Minimize2, RefreshCw,
  Ruler, Stethoscope, Brain, FileCheck, MessageSquare, Zap, Star,
  CheckCircle2, AlertTriangle, Info, Search, ChevronRight, Lightbulb,
  EyeOff, Edit3, ClipboardList, Activity, PenTool, Award, Shield,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TipTapEditor from '../components/editor/TipTapEditor';
import {
  StructuredFieldForm,
  MeasurementWidget,
  TermSuggestionPanel,
} from '../components/editor';
import {
  STRUCTURED_FIELD_TEMPLATES,
  findTemplate,
  type StructuredFieldTemplate,
} from '../data/structuredFieldTemplates';
import { extendedReportMock } from '../data/reportSubsystemMock';
import { useReportDraft as useReportDraftV2 } from '../hooks/useReportDraftV2';
import { StatusBadge } from '../components/report';
import ReportQualityScore from '../components/v3/report/ReportQualityScore';
import PhraseBank from '../components/v3/report/PhraseBank';
import type { RadiologyReport, Measurement, StructuredField } from '../types';

// ============================================================
// 工具：格式化时间
// ============================================================
function formatTime(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ============================================================
// 工具：剩余时间
// ============================================================
function timeRemaining(expected: string): string {
  if (!expected) return '-';
  const diff = new Date(expected).getTime() - Date.now();
  if (diff <= 0) return '已超时';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ============================================================
// 模板列表（用于右侧"模板"面板）
// ============================================================
const QUICK_TEMPLATES = [
  { id: 'q-001', name: '胸部 CT 平扫模板', modality: 'CT', bodyPart: '胸部', icon: '🫁' },
  { id: 'q-002', name: '头颅 CT 平扫模板', modality: 'CT', bodyPart: '头颅', icon: '🧠' },
  { id: 'q-003', name: '腹部 CT 模板', modality: 'CT', bodyPart: '腹部', icon: '🫃' },
  { id: 'q-004', name: '冠脉 CTA 模板', modality: 'CT', bodyPart: '心脏', icon: '❤️' },
  { id: 'q-005', name: '乳腺钼靶模板', modality: '乳腺钼靶', bodyPart: '胸部', icon: '🎀' },
  { id: 'q-006', name: '甲状腺超声模板', modality: 'US', bodyPart: '颈部', icon: '🦋' },
  { id: 'q-007', name: '颈椎 MRI 模板', modality: 'MR', bodyPart: '脊柱', icon: '🦴' },
  { id: 'q-008', name: '膝关节 MRI 模板', modality: 'MR', bodyPart: '四肢', icon: '🦵' },
];

// AI 辅助（模拟）
const AI_SUGGESTIONS = [
  { id: 'ai-001', title: '根据患者主诉自动填充', desc: '基于临床病史智能推荐报告内容', icon: Wand2, color: '#7c3aed' },
  { id: 'ai-002', title: '影像所见智能总结', desc: '调用 AI 视觉模型生成初步所见', icon: Brain, color: '#3b82f6' },
  { id: 'ai-003', title: '历史报告对比', desc: '自动检索同患者历次检查并对比', icon: History, color: '#0891b2' },
  { id: 'ai-004', title: '危急值自动识别', desc: '基于关键字 + AI 模型的危急值预警', icon: AlertOctagon, color: '#dc2626' },
  { id: 'ai-005', title: '诊断建议', desc: '基于所见推荐鉴别诊断和进一步检查', icon: Lightbulb, color: '#f59e0b' },
];

// ============================================================
// 主组件
// ============================================================
export default function ReportWriteV2Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 加载报告
  const report = useMemo<RadiologyReport | undefined>(() => {
    if (!id) return extendedReportMock.find(r => r.status === '待分配' || r.status === '已分配') || extendedReportMock[0];
    return extendedReportMock.find(r => r.id === id || r.reportId === id) || extendedReportMock[0];
  }, [id]);

  // Hook：草稿
  const { draft, isDirty, isSaving, save, clear } = useReportDraftV2(report?.id || 'new', report?.examFindings || '');

  // 状态
  const [activeTab, setActiveTab] = useState<'content' | 'structured' | 'measurements'>('content');
  const [rightTab, setRightTab] = useState<'templates' | 'terms' | 'ai' | 'history' | 'phrases' | 'quality'>('templates');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTermSuggest, setShowTermSuggest] = useState(false);
  const [termQuery, setTermQuery] = useState('');

  // 选中的结构化模板
  const [selectedTemplate, setSelectedTemplate] = useState<StructuredFieldTemplate | undefined>(
    report ? findTemplate(report.modality, report.bodyPart) : undefined
  );

  // 选中的历史报告
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Panel resize state
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('reportLeftWidth');
    return saved ? parseInt(saved, 10) : 240;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('reportRightWidth');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);

  // Layout preset
  const [layoutPreset, setLayoutPreset] = useState<'full' | 'concise' | 'focus'>(() => {
    return (localStorage.getItem('reportLayoutPreset') as 'full' | 'concise' | 'focus') || 'full';
  });

  // Apply preset
  useEffect(() => {
    localStorage.setItem('reportLayoutPreset', layoutPreset);
    switch (layoutPreset) {
      case 'full':
        setShowLeftPanel(true);
        setShowRightPanel(true);
        break;
      case 'concise':
        setShowLeftPanel(false);
        setShowRightPanel(true);
        break;
      case 'focus':
        setShowLeftPanel(false);
        setShowRightPanel(false);
        break;
    }
  }, [layoutPreset]);

  // Resize handlers
  const handleMouseDown = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(side);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === 'left') {
        setLeftWidth(Math.max(160, e.clientX));
      } else {
        setRightWidth(Math.max(160, window.innerWidth - e.clientX));
      }
    };
    const handleMouseUp = () => {
      setIsDragging(null);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Save widths to localStorage
  useEffect(() => {
    localStorage.setItem('reportLeftWidth', String(leftWidth));
  }, [leftWidth]);
  useEffect(() => {
    localStorage.setItem('reportRightWidth', String(rightWidth));
  }, [rightWidth]);

  // Word count
  const wordCount = useMemo(() => plainText.replace(/\s/g, '').length, [plainText]);

  // 内容
  const [contentHtml, setContentHtml] = useState(report?.examFindings || '');
  const [plainText, setPlainText] = useState(report?.examFindings || '');
  const [structuredValues, setStructuredValues] = useState<Record<string, any>>({});
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  // 同步草稿
  useEffect(() => {
    if (draft) {
      setContentHtml(draft.content);
      setPlainText(draft.plainText);
      setStructuredValues(draft.structuredValues);
      setMeasurements(draft.measurements);
    }
  }, [draft?.reportId]);

  // 全文快捷键
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          save({ content: contentHtml, plainText, structuredValues, measurements });
        }
        if (key === 'enter') {
          e.preventDefault();
          if (confirm('确认提交报告？提交后将进入初审流程。')) {
            alert('已提交（模拟）');
          }
        }
        if (key === 'm') {
          e.preventDefault();
          setActiveTab('measurements');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [contentHtml, plainText, structuredValues, measurements, save]);

  if (!report) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>报告不存在</div>;
  }

  // 处理结构化字段变化
  const handleStructuredChange = (key: string, value: any) => {
    const newValues = { ...structuredValues, [key]: value };
    setStructuredValues(newValues);
    save({ structuredValues: newValues });
  };

  // 处理测量变化
  const handleMeasurementsChange = (m: Measurement[]) => {
    setMeasurements(m);
    save({ measurements: m });
  };

  // 插入术语片段
  const handleTermSelect = (term: { fullTerm: string; snippet?: string }) => {
    if (term.snippet) {
      setContentHtml(prev => prev + term.snippet);
      setPlainText(prev => prev + term.snippet);
      save({ content: contentHtml + term.snippet, plainText: plainText + term.snippet });
    }
    setShowTermSuggest(false);
    setTermQuery('');
  };

  // 关键字实时检查
  const keywordResult = useMemo(() => {
    const text = plainText;
    const hasError = /未见|无|未发现|没有/.test(text) && /可见|有|发现|存在/.test(text);
    return {
      score: hasError ? 80 : 95,
      errorCount: hasError ? 1 : 0,
      warningCount: 0,
      passed: !hasError,
    };
  }, [plainText]);

  // 模板应用
  const applyTemplate = (tplId: string) => {
    const tpl = STRUCTURED_FIELD_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setSelectedTemplate(tpl);
      // 用模板默认内容填充
      const tplContent = tpl.fields
        .filter(f => f.required && f.dataType === 'text')
        .map(f => `${f.fieldLabel}：${f.placeholder || '请填写'}`)
        .join('\n');
      if (confirm(`应用模板"${tpl.name}"？\n将填充以下结构化字段：${tpl.fields.length} 个`)) {
        setActiveTab('structured');
      }
    }
  };

  // 填充模板正文
  const fillTemplateContent = (tplId: string) => {
    const tpl = QUICK_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    const content = `【${tpl.name}】\n\n检查所见：\n${tpl.modality} 平扫示${tpl.bodyPart}区\n\n诊断意见：\n未见明显异常。\n\n建议：\n随访。`;
    setContentHtml(content);
    setPlainText(content);
    save({ content, plainText: content });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', background: '#f1f5f9' }}>
      <style>{`
        [data-panel] { transition: width 0.2s ease; }
        @media (max-width: 1024px) { [data-panel="left"] { display: none !important; } }
        @media (max-width: 768px) { [data-panel="right"] { display: none !important; } }
      `}</style>
      {/* 顶部工具栏 */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/reports')}
            style={{ padding: 4, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
              报告书写 v2.0 · {report.reportId}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span>{report.patientName} · {report.gender} · {report.age}岁 · {report.patientType}</span>
              <span>·</span>
              <span>{report.examItemName}</span>
              <span>·</span>
              <StatusBadge status={report.status} size="sm" showIcon={false} />
            </div>
          </div>
        </div>

        {/* Layout presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {([
            { key: 'full', label: '完整' },
            { key: 'concise', label: '简洁' },
            { key: 'focus', label: '专注' },
          ] as const).map(p => (
            <button
              key={p.key}
              onClick={() => setLayoutPreset(p.key)}
              style={{
                padding: '2px 8px', border: '1px solid', borderRadius: 4,
                fontSize: 11, cursor: 'pointer',
                background: layoutPreset === p.key ? '#3b82f6' : '#fff',
                color: layoutPreset === p.key ? '#fff' : '#64748b',
                borderColor: layoutPreset === p.key ? '#3b82f6' : '#e2e8f0',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 状态指示 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 6,
            background: isDirty ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${isDirty ? '#fcd34d' : '#bbf7d0'}`,
            fontSize: 11,
          }}>
            {isSaving ? (
              <>
                <RefreshCw size={11} className="spin" color="#0891b2" />
                <span style={{ color: '#0891b2' }}>保存中...</span>
              </>
            ) : isDirty ? (
              <>
                <AlertTriangle size={11} color="#d97706" />
                <span style={{ color: '#d97706' }}>未保存</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={11} color="#10b981" />
                <span style={{ color: '#10b981' }}>已保存 {draft?.lastSavedAt ? formatTime(draft.lastSavedAt).slice(11) : ''}</span>
              </>
            )}
          </div>

          {/* 剩余时间 */}
          {report.expectedFinishTime && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 6,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              fontSize: 11, color: '#1e40af', fontWeight: 600,
            }}>
              <Clock size={11} />
              剩余 {timeRemaining(report.expectedFinishTime)}
            </div>
          )}

          {/* 关键字评分 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 6,
            background: keywordResult.passed ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${keywordResult.passed ? '#bbf7d0' : '#fecaca'}`,
            fontSize: 11,
            color: keywordResult.passed ? '#047857' : '#b91c1c',
            fontWeight: 600,
          }}>
            质控 {keywordResult.score}/100
          </div>

          {/* 操作按钮 */}
          <button
            onClick={() => {
              if (confirm('确认清空所有内容？')) clear();
            }}
            style={{
              padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6,
              background: '#fff', color: '#475569', fontSize: 11, cursor: 'pointer',
            }}
          >
            清空
          </button>
          <button
            onClick={() => save({ content: contentHtml, plainText, structuredValues, measurements })}
            disabled={isSaving}
            style={{
              padding: '4px 12px', border: '1px solid #3b82f6', borderRadius: 6,
              background: isSaving ? '#94a3b8' : '#3b82f6', color: '#fff',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Save size={11} /> 保存 (Ctrl+S)
          </button>
          <button
            onClick={() => {
              if (confirm('确认提交报告？提交后进入初审流程。')) {
                alert('报告已提交（模拟）');
                navigate('/reports');
              }
            }}
            style={{
              padding: '4px 12px', border: 'none', borderRadius: 6,
              background: '#10b981', color: '#fff',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Send size={11} /> 提交 (Ctrl+Enter)
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              padding: 4, border: '1px solid #e2e8f0', borderRadius: 6,
              background: '#fff', color: '#64748b', cursor: 'pointer',
            }}
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* 主体三栏布局 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: 0 }}>
        {/* 左栏：影像/历史 */}
        {showLeftPanel && !isFullscreen && (
          <div data-panel="left" style={{
            width: leftWidth, background: '#fff', borderRight: '1px solid #e2e8f0',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 12px', borderBottom: '1px solid #e2e8f0',
              fontSize: 12, fontWeight: 700, color: '#1e40af',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <ImageIcon size={13} /> 影像缩略图
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  aspectRatio: '1',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: 6,
                  marginBottom: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#475569', fontSize: 11, cursor: 'pointer', position: 'relative',
                  border: '1px solid #334155',
                }}>
                  <span>序列 {i}</span>
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    padding: '0 4px', background: '#0f172a', color: '#94a3b8',
                    borderRadius: 3, fontSize: 9,
                  }}>{i * 12} 帧</div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '8px 12px', borderTop: '1px solid #e2e8f0',
              fontSize: 12, fontWeight: 700, color: '#1e40af',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <History size={13} /> 历史报告
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', padding: 8 }}>
              {extendedReportMock
                .filter(r => r.patientId === report.patientId && r.id !== report.id)
                .slice(0, 3)
                .map(r => (
                  <div key={r.id} style={{
                    padding: 6, marginBottom: 4,
                    background: '#f8fafc', borderRadius: 4,
                    fontSize: 10, color: '#475569', border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.examItemName}</div>
                    <div style={{ marginTop: 2 }}>{r.examDate} · {r.status}</div>
                  </div>
                ))}
              {extendedReportMock.filter(r => r.patientId === report.patientId).length <= 1 && (
                <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', padding: 12 }}>
                  无历史报告
                </div>
              )}
            </div>
          </div>
        )}

        {/* Left resize handle */}
        {showLeftPanel && !isFullscreen && (
          <div
            onMouseDown={handleMouseDown('left')}
            style={{
              width: 4, cursor: 'col-resize', flexShrink: 0, position: 'relative', zIndex: 10,
              background: isDragging === 'left' ? '#3b82f6' : 'transparent',
            }}
            onMouseEnter={e => { if (isDragging !== 'left') e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={e => { if (isDragging !== 'left') e.currentTarget.style.background = 'transparent'; }}
          />
        )}

        {/* 中栏：编辑器 */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', background: '#fff',
          minWidth: 0,
        }}>
          {/* Tab 切换 */}
          <div style={{
            display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc', padding: '0 8px',
          }}>
            {[
              { key: 'content', label: '富文本', icon: <FileText size={13} /> },
              { key: 'structured', label: '结构化字段', icon: <ListChecks size={13} />, badge: 'R1' },
              { key: 'measurements', label: '病灶测量', icon: <Ruler size={13} />, badge: measurements.length > 0 ? String(measurements.length) : undefined },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                style={{
                  padding: '10px 14px', border: 'none', background: 'transparent',
                  color: activeTab === t.key ? '#1e40af' : '#64748b',
                  fontWeight: activeTab === t.key ? 700 : 500,
                  fontSize: 12, cursor: 'pointer',
                  borderBottom: `2px solid ${activeTab === t.key ? '#3b82f6' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {t.icon}{t.label}
                {t.badge && (
                  <span style={{
                    fontSize: 9, padding: '0 4px', borderRadius: 3,
                    background: t.badge === 'R1' ? '#10b981' : '#dc2626',
                    color: '#fff', fontWeight: 700,
                  }}>{t.badge}</span>
                )}
              </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
              <button
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                title="切换左栏"
                style={{ padding: 4, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                title="切换右栏"
                style={{ padding: 4, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>

          {/* Tab 内容 */}
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {activeTab === 'content' && (
              <div style={{ position: 'relative' }}>
                <TipTapEditor
                  content={contentHtml}
                  onChange={(html) => {
                    setContentHtml(html);
                    const temp = document.createElement('div');
                    temp.innerHTML = html;
                    setPlainText(temp.textContent || '');
                  }}
                  placeholder="请输入报告所见及诊断意见..."
                  minHeight={500}
                />
              </div>
            )}

            {activeTab === 'structured' && (
              <div>
                {/* 模板选择器 */}
                <div style={{
                  padding: 10, background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: 8, marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <Info size={14} color="#1e40af" />
                  <div style={{ flex: 1, fontSize: 12, color: '#1e3a8a' }}>
                    当前模板：<strong>{selectedTemplate?.name || '未选择'}</strong>
                    {selectedTemplate && (
                      <span style={{ marginLeft: 8, color: '#64748b' }}>
                        ({selectedTemplate.fields.length} 个字段)
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedTemplate?.id || ''}
                    onChange={e => {
                      const tpl = STRUCTURED_FIELD_TEMPLATES.find(t => t.id === e.target.value);
                      setSelectedTemplate(tpl);
                    }}
                    style={{
                      padding: '4px 8px', border: '1px solid #93c5fd', borderRadius: 4,
                      background: '#fff', fontSize: 12,
                    }}
                  >
                    <option value="">选择模板...</option>
                    {STRUCTURED_FIELD_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {selectedTemplate ? (
                  <StructuredFieldForm
                    template={selectedTemplate}
                    values={structuredValues}
                    onChange={handleStructuredChange}
                  />
                ) : (
                  <div style={{
                    padding: 40, textAlign: 'center', color: '#94a3b8',
                    background: '#f8fafc', borderRadius: 8,
                    border: '1px dashed #cbd5e1',
                  }}>
                    请先选择一个结构化模板
                  </div>
                )}
              </div>
            )}

            {activeTab === 'measurements' && (
              <div>
                <div style={{ marginBottom: 12, padding: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={13} />
                    病灶测量支持 5 种类型：长度(mm) / 面积(mm²) / 体积(cm³) / 角度(°) / 密度(HU)。
                    标记"靶病灶"后可自动汇总 RECIST 1.1 评估。
                  </div>
                </div>
                <MeasurementWidget
                  measurements={measurements}
                  onChange={handleMeasurementsChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right resize handle */}
        {showRightPanel && !isFullscreen && (
          <div
            onMouseDown={handleMouseDown('right')}
            style={{
              width: 4, cursor: 'col-resize', flexShrink: 0, position: 'relative', zIndex: 10,
              background: isDragging === 'right' ? '#3b82f6' : 'transparent',
            }}
            onMouseEnter={e => { if (isDragging !== 'right') e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={e => { if (isDragging !== 'right') e.currentTarget.style.background = 'transparent'; }}
          />
        )}

        {/* 右栏：模板/术语/AI 辅助/历史 */}
        {showRightPanel && !isFullscreen && (
          <div data-panel="right" style={{
            width: rightWidth, background: '#fff', borderLeft: '1px solid #e2e8f0',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {/* Tab 切换 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
              {[
                { key: 'templates', label: '模板', icon: <FileText size={12} /> },
                { key: 'terms', label: '术语', icon: <BookOpen size={12} /> },
                { key: 'phrases', label: '短语', icon: <MessageSquare size={12} /> },
                { key: 'ai', label: 'AI 辅助', icon: <Sparkles size={12} /> },
                { key: 'quality', label: '质控', icon: <Award size={12} /> },
                { key: 'history', label: '历史', icon: <History size={12} /> },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setRightTab(t.key as any)}
                  style={{
                    flex: 1, padding: '8px 4px', border: 'none',
                    background: rightTab === t.key ? '#eff6ff' : 'transparent',
                    color: rightTab === t.key ? '#1e40af' : '#64748b',
                    fontWeight: rightTab === t.key ? 700 : 500,
                    fontSize: 11, cursor: 'pointer',
                    borderBottom: `2px solid ${rightTab === t.key ? '#3b82f6' : 'transparent'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* Tab 内容 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {rightTab === 'templates' && (
                <div style={{ padding: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                    快速模板（点击填充正文）
                  </div>
                  {QUICK_TEMPLATES.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() => fillTemplateContent(tpl.id)}
                      style={{
                        padding: 8, marginBottom: 4,
                        background: '#f8fafc', borderRadius: 6,
                        border: '1px solid #e2e8f0', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                    >
                      <div style={{ fontSize: 18 }}>{tpl.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{tpl.name}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{tpl.modality} · {tpl.bodyPart}</div>
                      </div>
                      <ChevronRight size={12} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}

              {rightTab === 'terms' && (
                <div style={{ padding: 8 }}>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <Search size={12} style={{ position: 'absolute', left: 8, top: 9, color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="搜索医学术语 / 拼音首字母"
                      value={termQuery}
                      onChange={e => {
                        setTermQuery(e.target.value);
                        setShowTermSuggest(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowTermSuggest(termQuery.length > 0)}
                      style={{
                        width: '100%', padding: '6px 8px 6px 26px',
                        border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12,
                        outline: 'none',
                      }}
                    />
                    {showTermSuggest && (
                      <TermSuggestionPanel
                        query={termQuery}
                        onSelect={handleTermSelect}
                        onClose={() => setShowTermSuggest(false)}
                      />
                    )}
                  </div>

                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                    常用术语分类
                  </div>
                  {['胸部', '腹部', '头颅', '脊柱', '四肢', '乳腺', '心脏', '通用'].map(cat => (
                    <div key={cat} style={{
                      padding: '6px 8px', marginBottom: 3,
                      background: '#f8fafc', borderRadius: 4, fontSize: 12, color: '#475569',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span>{cat}</span>
                      <ChevronRight size={11} color="#94a3b8" />
                    </div>
                  ))}

                  <div style={{ marginTop: 16, padding: 8, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>
                      💡 术语库 v1.0.1
                    </div>
                    <div style={{ fontSize: 10, color: '#92400e' }}>
                      当前内置 30+ 常用报告短语。Phase R7 将扩展到 1000+ 条 + 同义词图谱。
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'ai' && (
                <div style={{ padding: 8 }}>
                  <div style={{
                    padding: 10, background: 'linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)',
                    border: '1px solid #c4b5fd', borderRadius: 8, marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={13} /> AI 智能辅助
                    </div>
                    <div style={{ fontSize: 10, color: '#6b21a8' }}>
                      v1.0.1 集成 5 大 AI 能力（模拟）
                    </div>
                  </div>
                  {AI_SUGGESTIONS.map(ai => {
                    const Icon = ai.icon;
                    return (
                      <div key={ai.id} style={{
                        padding: 10, marginBottom: 6,
                        background: '#fff', borderRadius: 8,
                        border: `1px solid ${ai.color}30`,
                        cursor: 'pointer',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: `${ai.color}15`, color: ai.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon size={14} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{ai.title}</div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{ai.desc}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {rightTab === 'phrases' && (
                <div style={{ padding: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={13} /> 常用短语库
                  </div>
                  <PhraseBank
                    reportModality={report.modality}
                    reportBodyPart={report.bodyPart}
                    onSelect={(text: string) => {
                      setContentHtml(prev => prev + `<p>${text}</p>`);
                      setPlainText(prev => prev + text);
                    }}
                  />
                </div>
              )}

              {rightTab === 'quality' && (
                <div style={{ padding: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={13} /> 报告质控评分
                  </div>
                  <ReportQualityScore
                    findings={plainText}
                    conclusion={report.impression || ''}
                    radsCategory={selectedTemplate?.name || ''}
                    hasCritical={report.criticalFinding}
                    verified={report.status === '已审核' || report.status === '已签发' || report.status === '已发布'}
                  />
                </div>
              )}

              {rightTab === 'history' && (
                <div style={{ padding: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                    草稿历史（localStorage）
                  </div>
                  <div style={{
                    padding: 10, background: '#f8fafc', borderRadius: 6,
                    border: '1px solid #e2e8f0', fontSize: 11, color: '#475569',
                  }}>
                    <div>报告 ID：{report.id}</div>
                    <div>当前版本：v{draft?.version || 1}</div>
                    <div>最近保存：{formatTime(draft?.lastSavedAt || '')}</div>
                    <div>自动保存：{draft?.autoSaveEnabled ? '已启用（30s）' : '已关闭'}</div>
                    <div>字数：{plainText.length}</div>
                    <div>结构化字段：{Object.keys(structuredValues).length} 个</div>
                    <div>测量项：{measurements.length} 个</div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('确认清空所有草稿数据？此操作不可恢复。')) clear();
                    }}
                    style={{
                      width: '100%', marginTop: 12,
                      padding: '6px 12px', border: '1px solid #dc2626',
                      borderRadius: 4, background: '#fff', color: '#dc2626',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    清空草稿
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
        fontSize: 11, color: '#94a3b8', flexShrink: 0,
      }}>
        <span>布局: {layoutPreset === 'full' ? '完整' : layoutPreset === 'concise' ? '简洁' : '专注'}</span>
        <span>左栏: {showLeftPanel ? `${leftWidth}px` : '隐藏'} | 右栏: {showRightPanel ? `${rightWidth}px` : '隐藏'}</span>
        <span>字数: {wordCount}</span>
      </div>
    </div>
  );
}
